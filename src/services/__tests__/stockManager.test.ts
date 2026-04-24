import { describe, it, expect } from 'vitest'
import {
  addStock,
  consumeStock,
  checkExpiry,
  getTotalStock,
  getStockPercentage,
  predictedDemand,
  needsRestock,
} from '../stockManager'
import type { GameState } from '../../types/game'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    businessType: 'shop',
    currentWeek: 1,
    dayOfWeek: 0,
    balance: 50000,
    savedBalance: 0,
    reputation: 50,
    entrepreneurEnergy: 100,
    loyalty: 60,
    stock: [],
    stockBatches: [],
    capacity: 60,
    services: {} as GameState['services'],
    achievements: [],
    level: 1,
    experience: 0,
    lastDayResult: null,
    pendingEvent: null,
    pendingEventsQueue: [],
    triggeredEventIds: [],
    isGameOver: false,
    isVictory: false,
    consecutiveOverloadDays: 0,
    daysReputationZero: 0,
    daysSinceLastMonthly: 0,
    purchaseOfferedThisDay: false,
    activeAdCampaigns: [],
    purchasedUpgrades: [],
    temporaryClientMod: 0,
    temporaryCheckMod: 0,
    temporaryModDaysLeft: 0,
    onboardingStage: 0,
    onboardingCompleted: false,
    onboardingStepIndex: 0,
    unlockedServices: [],
    cashRegisters: [],
    enabledCategories: [],
    promoCodesRevealed: [],
    pendingPromoCode: null,
    daysBalanceNegative: 0,
    competitorEventTriggered: false,
    lastDayPainLosses: null,
    bundlePromoShown: false,
    weeklyEnergyRestored: false,
    suppliers: [],
    activeSupplierId: null,
    employees: [],
    qualityLevel: 50,
    weeksSinceCompetitorEvent: 0,
    loans: [],
    campaignROI: [],
    milestoneStatus: { week10: false, week20: false, week30: false },
    weekPhase: 'actions' as const,
    purchasedOwnerItems: [],
    ownerSubscriptions: [],
    npcs: [],
    playerBackstory: null,
    activeChainIds: [],
    completedChainIds: [],
    pendingChainFollowUps: [],
    decisionLog: [],
    seenNewspaperWeeks: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  }
}

describe('addStock', () => {
  it('adds a batch to empty state', () => {
    const state = makeState()
    addStock(state, 100, 5)
    expect(state.stockBatches).toHaveLength(1)
    expect(state.stockBatches[0].quantity).toBe(100)
    expect(state.stockBatches[0].costPerUnit).toBe(5)
    // dayReceived = currentWeek * 7 + dayOfWeek = 1*7+0 = 7
    expect(state.stockBatches[0].dayReceived).toBe(7)
    expect(state.stockBatches[0].expirationDays).toBe(10) // shop default
  })

  it('assigns correct expiry for cafe', () => {
    const state = makeState({ businessType: 'cafe' })
    addStock(state, 50, 3)
    expect(state.stockBatches[0].expirationDays).toBe(7)
  })

  it('adds multiple batches', () => {
    const state = makeState()
    addStock(state, 100, 5)
    addStock(state, 50, 6)
    expect(state.stockBatches).toHaveLength(2)
  })
})

describe('getTotalStock', () => {
  it('returns 0 for empty state', () => {
    const state = makeState()
    expect(getTotalStock(state)).toBe(0)
  })

  it('sums all batch quantities', () => {
    const state = makeState()
    addStock(state, 100, 5)
    addStock(state, 50, 6)
    expect(getTotalStock(state)).toBe(150)
  })
})

describe('consumeStock (FIFO)', () => {
  it('consumes from oldest batch first', () => {
    const state = makeState()
    addStock(state, 100, 5)
    addStock(state, 50, 10)
    const result = consumeStock(state, 60)
    expect(result.consumed).toBe(60)
    // 60 units at 5₽ each
    expect(result.cost).toBe(300)
    // First batch now has 40, second still 50
    expect(getTotalStock(state)).toBe(90)
  })

  it('spans multiple batches', () => {
    const state = makeState()
    addStock(state, 30, 5)
    addStock(state, 30, 10)
    const result = consumeStock(state, 50)
    expect(result.consumed).toBe(50)
    // 30*5 + 20*10 = 150 + 200 = 350
    expect(result.cost).toBe(350)
    expect(getTotalStock(state)).toBe(10)
  })

  it('consumes less than requested if stock insufficient', () => {
    const state = makeState()
    addStock(state, 20, 5)
    const result = consumeStock(state, 50)
    expect(result.consumed).toBe(20)
    expect(result.cost).toBe(100)
    expect(getTotalStock(state)).toBe(0)
  })

  it('removes empty batches', () => {
    const state = makeState()
    addStock(state, 10, 5)
    consumeStock(state, 10)
    expect(state.stockBatches).toHaveLength(0)
  })
})

describe('checkExpiry', () => {
  it('returns zero loss for fresh stock', () => {
    const state = makeState()
    addStock(state, 100, 5)
    const result = checkExpiry(state)
    expect(result.expired).toBe(0)
    expect(result.loss).toBe(0)
  })

  it('writes off expired stock with 80% loss', () => {
    const state = makeState({ currentWeek: 11 })
    // Add batch received on day 1, expiry 10 days → age = 10, expired
    state.stockBatches = [
      { id: 'b1', quantity: 100, costPerUnit: 5, dayReceived: 1, expirationDays: 10 },
    ]
    const result = checkExpiry(state)
    expect(result.expired).toBe(100)
    expect(result.loss).toBeCloseTo(100 * 5 * 0.8)
    expect(getTotalStock(state)).toBe(0)
  })

  it('reduces loss to 64% with market active', () => {
    const state = makeState({
      currentWeek: 11,
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 24000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    state.stockBatches = [
      { id: 'b1', quantity: 100, costPerUnit: 5, dayReceived: 1, expirationDays: 10 },
    ]
    const result = checkExpiry(state)
    expect(result.loss).toBeCloseTo(100 * 5 * 0.64)
  })

  it('does not expire fresh batches', () => {
    const state = makeState({ currentWeek: 5 })
    // currentWeek=5, dayOfWeek=0 → currentDay=35; dayReceived=30 → age=5 < 10 → fresh
    state.stockBatches = [
      { id: 'b1', quantity: 50, costPerUnit: 5, dayReceived: 30, expirationDays: 10 },
    ]
    const result = checkExpiry(state)
    expect(result.expired).toBe(0)
    expect(getTotalStock(state)).toBe(50)
  })

  it('returns zero for beauty-salon (no stock)', () => {
    const state = makeState({ businessType: 'beauty-salon', currentWeek: 30 })
    state.stockBatches = [
      { id: 'b1', quantity: 50, costPerUnit: 5, dayReceived: 1, expirationDays: 0 },
    ]
    const result = checkExpiry(state)
    expect(result.expired).toBe(0)
    expect(result.loss).toBe(0)
  })
})

describe('getStockPercentage', () => {
  it('returns 0 for empty stock', () => {
    const state = makeState()
    expect(getStockPercentage(state)).toBe(0)
  })

  it('returns 50 for half capacity', () => {
    const state = makeState()
    addStock(state, 100, 5)
    expect(getStockPercentage(state, 200)).toBe(50)
  })

  it('caps at 100', () => {
    const state = makeState()
    addStock(state, 500, 5)
    expect(getStockPercentage(state, 200)).toBe(100)
  })
})

describe('predictedDemand', () => {
  it('shop: baseClients(15) * 2 days = 30', () => {
    const state = makeState()
    expect(predictedDemand(state)).toBe(30)
  })

  it('cafe: baseClients(18) * 2 days = 36', () => {
    const state = makeState({ businessType: 'cafe' })
    expect(predictedDemand(state)).toBe(36)
  })

  it('beauty-salon: 0 (no stock)', () => {
    const state = makeState({ businessType: 'beauty-salon' })
    expect(predictedDemand(state)).toBe(0)
  })
})

describe('needsRestock', () => {
  it('returns true when stock below predicted demand (2 days = 30 units for shop)', () => {
    const state = makeState()
    addStock(state, 20, 5) // 20 < 30 (predicted 2-day demand)
    expect(needsRestock(state)).toBe(true)
  })

  it('returns false when stock covers 2+ days demand', () => {
    const state = makeState()
    addStock(state, 50, 5) // 50 > 30 (sufficient)
    expect(needsRestock(state)).toBe(false)
  })

  it('returns false for beauty-salon (no stock needed)', () => {
    const state = makeState({ businessType: 'beauty-salon' })
    expect(needsRestock(state)).toBe(false)
  })
})
