import { describe, it, expect, vi } from 'vitest'
import { checkDayBlocked, processDay } from '../dayCalculator'
import { addStock } from '../stockManager'
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
    seenMicroEventIds: [],
    pendingMicroEvent: null,
    weeklyEnergyRestored: false,
    suppliers: [],
    activeSupplierId: null,
    employees: [],
    qualityLevel: 50,
    weeksSinceCompetitorEvent: 0,
    loans: [],
    campaignROI: [],
    milestoneStatus: { week10: false, week20: false, week30: false },
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  }
}

describe('checkDayBlocked', () => {
  it('not blocked when onboarding complete (cafe)', () => {
    const state = makeState({ businessType: 'cafe', onboardingCompleted: true })
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(false)
  })

  it('blocked when pending event exists', () => {
    const state = makeState({ onboardingCompleted: true })
    state.pendingEvent = {
      id: 'EVT',
      day: 1,
      title: '',
      description: '',
      options: [],
      isResolved: false,
    }
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('событие')
  })

  it('blocked when bank not activated (onboarding stage 0)', () => {
    const state = makeState({ businessType: 'shop', onboardingStage: 0, onboardingCompleted: false })
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('Банк')
  })

  it('not blocked when onboarding complete (shop)', () => {
    const state = makeState({ businessType: 'shop', onboardingCompleted: true })
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(false)
  })

  it('not blocked when onboarding complete (beauty-salon)', () => {
    const state = makeState({ businessType: 'beauty-salon', onboardingCompleted: true })
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(false)
  })
})

describe('processDay', () => {
  it('throws when game is over', () => {
    const state = makeState({ isGameOver: true })
    expect(() => processDay(state)).toThrow()
  })

  it('throws when game is won', () => {
    const state = makeState({ isVictory: true })
    expect(() => processDay(state)).toThrow()
  })

  it('advances currentWeek by 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // prevent events
    const state = makeState({ businessType: 'beauty-salon' })
    processDay(state)
    expect(state.currentWeek).toBe(2)
    vi.restoreAllMocks()
  })

  it('calculates revenue and updates balance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'beauty-salon', balance: 60000 })
    const result = processDay(state)
    expect(result.revenue).toBeGreaterThan(0)
    expect(state.balance).not.toBe(60000)
    vi.restoreAllMocks()
  })

  it('stores lastDayResult', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'beauty-salon' })
    const result = processDay(state)
    expect(state.lastDayResult).toBe(result)
    vi.restoreAllMocks()
  })

  it('does not consume raw stock batches for assortment-based shop', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'shop' })
    addStock(state, 200, 5)
    processDay(state)
    // Shop uses assortment system, raw stock batches are not consumed via FIFO
    expect(state.stockBatches.reduce((s, b) => s + b.quantity, 0)).toBe(200)
    vi.restoreAllMocks()
  })

  it('sets isGameOver when balance stays negative for 3 consecutive days', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    // Pre-set daysBalanceNegative: 2 so one more negative-balance day triggers bankruptcy
    const poorState = makeState({
      businessType: 'beauty-salon',
      balance: 1,
      daysSinceLastMonthly: 30,
      daysBalanceNegative: 2,
    })
    processDay(poorState)
    // Monthly expenses (115000) exceed balance (1), goes negative → daysBalanceNegative = 3 → game over
    expect(poorState.isGameOver).toBe(true)
    expect(poorState.gameOverReason).toBe('bankruptcy')
    vi.restoreAllMocks()
  })

  it('increments experience after each day', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'beauty-salon', experience: 0 })
    processDay(state)
    expect(state.experience).toBeGreaterThan(0)
    vi.restoreAllMocks()
  })

  it('triggers monthly expenses on day 30+', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({
      businessType: 'beauty-salon',
      balance: 100000,
      daysSinceLastMonthly: 30,
    })
    const result = processDay(state)
    expect(result.monthlyExpense).toBeGreaterThan(0)
    vi.restoreAllMocks()
  })

  it('resets daysSinceLastMonthly after monthly expenses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({
      businessType: 'beauty-salon',
      balance: 100000,
      daysSinceLastMonthly: 30,
    })
    processDay(state)
    expect(state.daysSinceLastMonthly).toBe(0)
    vi.restoreAllMocks()
  })

  it('decrements ad campaign daysRemaining', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({
      businessType: 'beauty-salon',
      activeAdCampaigns: [
        {
          id: 'promo',
          name: 'Промо',
          duration: 10,
          cost: 3000,
          clientEffect: 0.25,
          checkEffect: -0.2,
          daysRemaining: 3,
        },
      ],
    })
    processDay(state)
    expect(state.activeAdCampaigns[0].daysRemaining).toBe(2)
    vi.restoreAllMocks()
  })

  it('removes expired ad campaigns', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({
      businessType: 'beauty-salon',
      activeAdCampaigns: [
        {
          id: 'promo',
          name: 'Промо',
          duration: 10,
          cost: 3000,
          clientEffect: 0.25,
          checkEffect: -0.2,
          daysRemaining: 1,
        },
      ],
    })
    processDay(state)
    expect(state.activeAdCampaigns).toHaveLength(0)
    vi.restoreAllMocks()
  })

  it('day result has all required fields', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'beauty-salon' })
    const result = processDay(state)
    expect(result).toHaveProperty('dayNumber')
    expect(result).toHaveProperty('clients')
    expect(result).toHaveProperty('served')
    expect(result).toHaveProperty('missed')
    expect(result).toHaveProperty('revenue')
    expect(result).toHaveProperty('tax')
    expect(result).toHaveProperty('netProfit')
    expect(result).toHaveProperty('balance')
    expect(result).toHaveProperty('reputationChange')
    expect(result).toHaveProperty('loyaltyChange')
    vi.restoreAllMocks()
  })
})
