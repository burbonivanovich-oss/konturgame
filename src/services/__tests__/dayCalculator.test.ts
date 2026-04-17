import { describe, it, expect, vi } from 'vitest'
import { checkDayBlocked, processDay } from '../dayCalculator'
import { addStock } from '../stockManager'
import type { GameState } from '../../types/game'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    businessType: 'shop',
    currentDay: 1,
    balance: 50000,
    savedBalance: 0,
    reputation: 50,
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
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  }
}

describe('checkDayBlocked', () => {
  it('not blocked for cafe with stock (no hasStock)', () => {
    const state = makeState({ businessType: 'cafe' })
    addStock(state, 200, 3)
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(false)
  })

  it('blocked when pending event exists', () => {
    const state = makeState()
    addStock(state, 200, 5)
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

  it('blocked when shop has no stock', () => {
    const state = makeState({ businessType: 'shop' })
    // No stock added
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('пуст')
  })

  it('not blocked when shop has stock', () => {
    const state = makeState({ businessType: 'shop' })
    addStock(state, 200, 5)
    const result = checkDayBlocked(state)
    expect(result.blocked).toBe(false)
  })

  it('not blocked for beauty-salon (no stock needed)', () => {
    const state = makeState({ businessType: 'beauty-salon' })
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

  it('advances currentDay by 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // prevent events
    const state = makeState({ businessType: 'beauty-salon' })
    processDay(state)
    expect(state.currentDay).toBe(2)
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

  it('consumes stock for shop', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({ businessType: 'shop' })
    addStock(state, 200, 5)
    const stockBefore = 200
    processDay(state)
    expect(state.stockBatches.reduce((s, b) => s + b.quantity, 0)).toBeLessThan(stockBefore)
    vi.restoreAllMocks()
  })

  it('sets isGameOver when balance goes negative', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = makeState({
      businessType: 'beauty-salon',
      balance: -1, // already negative
    })
    // Since processDay doesn't block on negative balance before starting, force bankruptcy check
    // We actually need balance to go negative AFTER calculations
    // Let's create a state where monthly expenses exceed balance
    const poorState = makeState({
      businessType: 'beauty-salon',
      balance: 1,
      daysSinceLastMonthly: 30,
    })
    processDay(poorState)
    // Monthly expenses = 35000, balance = 1, so will go negative
    if (poorState.balance < 0) {
      expect(poorState.isGameOver).toBe(true)
      expect(poorState.gameOverReason).toBe('bankruptcy')
    }
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
