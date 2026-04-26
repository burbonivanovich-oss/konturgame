import { describe, it, expect } from 'vitest'
import {
  getSeasonalModifier,
  getReputationModifier,
  calculateClients,
  calculateCapacity,
  calculateAverageCheck,
  calculateRevenue,
  calculateDailySubscriptions,
  calculateMonthlyExpenses,
  buildModifiers,
} from '../economyEngine'
import type { GameState, Modifiers } from '../../types/game'

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

function makeModifiers(overrides: Partial<Modifiers> = {}): Modifiers {
  return {
    seasonal: 0,
    advertising: 0,
    reputation: 1.0,
    event: 0,
    capacityBonus: 0,
    checkBonus: 0,
    advertisingCheckPenalty: 0,
    ...overrides,
  }
}

describe('getSeasonalModifier', () => {
  it('shop: day 1 (month 1) returns 0', () => {
    expect(getSeasonalModifier('shop', 1)).toBe(0)
  })

  it('shop: day 181 (month 7) returns 0.05', () => {
    expect(getSeasonalModifier('shop', 181)).toBe(0.05)
  })

  it('cafe: day 1 (month 1) returns -0.15', () => {
    expect(getSeasonalModifier('cafe', 1)).toBe(-0.15)
  })

  it('cafe: day 151 (month 6) returns 0.22', () => {
    expect(getSeasonalModifier('cafe', 151)).toBe(0.22)
  })

  it('beauty-salon: day 61 (month 3) returns 0.12', () => {
    expect(getSeasonalModifier('beauty-salon', 61)).toBe(0.12)
  })

  it('unknown business type returns 0', () => {
    expect(getSeasonalModifier('unknown', 1)).toBe(0)
  })
})

describe('getReputationModifier', () => {
  it('reputation 0-20 returns 0.5', () => {
    expect(getReputationModifier(0)).toBe(0.5)
    expect(getReputationModifier(20)).toBe(0.5)
  })

  it('reputation 21-40 returns 0.7', () => {
    expect(getReputationModifier(21)).toBe(0.7)
    expect(getReputationModifier(40)).toBe(0.7)
  })

  it('reputation 41-60 returns 0.9', () => {
    expect(getReputationModifier(41)).toBe(0.9)
    expect(getReputationModifier(60)).toBe(0.9)
  })

  it('reputation 61-80 returns 1.0', () => {
    expect(getReputationModifier(61)).toBe(1.0)
    expect(getReputationModifier(80)).toBe(1.0)
  })

  it('reputation 81-100 returns 1.1', () => {
    expect(getReputationModifier(81)).toBe(1.1)
    expect(getReputationModifier(100)).toBe(1.1)
  })
})

describe('calculateClients', () => {
  it('base case: no modifiers at reputation 1.0', () => {
    const mods = makeModifiers()
    expect(calculateClients(80, mods)).toBe(80)
  })

  it('applies seasonal modifier', () => {
    const mods = makeModifiers({ seasonal: 0.05 })
    expect(calculateClients(80, mods)).toBe(Math.round(80 * 1.05 * 1.0))
  })

  it('applies reputation modifier', () => {
    const mods = makeModifiers({ reputation: 0.5 })
    expect(calculateClients(80, mods)).toBe(Math.round(80 * 1.0 * 0.5))
  })

  it('never returns negative clients', () => {
    const mods = makeModifiers({ seasonal: -2, reputation: 0.5 })
    expect(calculateClients(80, mods)).toBe(0)
  })

  it('combines all modifiers', () => {
    const mods = makeModifiers({ seasonal: 0.1, advertising: 0.1, reputation: 0.9, event: 0.05 })
    const expected = Math.round(80 * (1 + 0.1 + 0.1 + 0.05) * 0.9)
    expect(calculateClients(80, mods)).toBe(expected)
  })
})

describe('calculateCapacity', () => {
  // Shop base capacity from BUSINESS_CONFIGS = 35
  const BASE = 35

  it('base capacity for shop without services', () => {
    const state = makeState()
    expect(calculateCapacity(state)).toBe(BASE)
  })

  it('adds market bonus', () => {
    const state = makeState({
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 48000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    expect(calculateCapacity(state)).toBe(Math.round(BASE * 1.2))
  })

  it('adds loyalty > 80 bonus', () => {
    const state = makeState({ loyalty: 85 })
    expect(calculateCapacity(state)).toBe(Math.round(BASE * 1.1))
  })

  it('applies loyalty < 30 penalty', () => {
    const state = makeState({ loyalty: 20 })
    expect(calculateCapacity(state)).toBe(Math.round(BASE * 0.85))
  })

  it('adds hall-expansion upgrade', () => {
    const state = makeState({ purchasedUpgrades: ['hall-expansion'] })
    expect(calculateCapacity(state)).toBe(Math.round(BASE * (1 + 0.4)))
  })
})

describe('calculateAverageCheck', () => {
  it('base check without modifiers', () => {
    const mods = makeModifiers()
    expect(calculateAverageCheck(300, mods)).toBe(300)
  })

  it('applies check bonus', () => {
    const mods = makeModifiers({ checkBonus: 0.15 })
    expect(calculateAverageCheck(300, mods)).toBe(Math.round(300 * 1.15))
  })

  it('applies advertising penalty', () => {
    const mods = makeModifiers({ advertisingCheckPenalty: -0.2 })
    expect(calculateAverageCheck(300, mods)).toBe(Math.round(300 * 0.8))
  })

  it('never goes below 1', () => {
    const mods = makeModifiers({ advertisingCheckPenalty: -2 })
    expect(calculateAverageCheck(300, mods)).toBe(1)
  })
})

describe('calculateRevenue', () => {
  it('served * avgCheck', () => {
    expect(calculateRevenue(50, 300)).toBe(15000)
  })

  it('zero served = zero revenue', () => {
    expect(calculateRevenue(0, 300)).toBe(0)
  })
})

describe('calculateDailySubscriptions', () => {
  it('returns 0 with no services', () => {
    const state = makeState()
    expect(calculateDailySubscriptions(state)).toBe(0)
  })

  it('calculates daily cost for one active service', () => {
    const state = makeState({
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 24000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    expect(calculateDailySubscriptions(state)).toBeCloseTo(24000 / 365)
  })

  it('ignores inactive services', () => {
    const state = makeState({
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 24000, isActive: false, effects: {} },
      } as GameState['services'],
    })
    expect(calculateDailySubscriptions(state)).toBe(0)
  })
})

describe('calculateMonthlyExpenses', () => {
  it('returns rent + salary for shop with no upgrades', () => {
    const state = makeState()
    // shop: 50000 rent + 40000 salary = 90000 (subscriptions excluded — charged daily)
    expect(calculateMonthlyExpenses(state)).toBe(90000)
  })

  it('adds hall-expansion rent increase', () => {
    const state = makeState({ purchasedUpgrades: ['hall-expansion'] })
    expect(calculateMonthlyExpenses(state)).toBe(90000 + 15000)
  })

  it('adds hire-admin salary increase', () => {
    const state = makeState({ purchasedUpgrades: ['hire-admin'] })
    expect(calculateMonthlyExpenses(state)).toBe(90000 + 5000)
  })

  it('does NOT include active service subscriptions (charged daily instead)', () => {
    const state = makeState({
      services: {
        bank: { id: 'bank', name: '', description: '', annualPrice: 36000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    expect(calculateMonthlyExpenses(state)).toBe(90000)
  })
})

describe('buildModifiers', () => {
  it('builds modifiers from state', () => {
    const state = makeState({ reputation: 50 })
    const mods = buildModifiers(state)
    expect(mods.reputation).toBe(0.9) // reputation 50 → 0.9
    expect(mods.seasonal).toBeDefined()
    expect(mods.advertising).toBe(0)
    expect(mods.event).toBe(0)
  })

  it('includes market check bonus when market is active', () => {
    const state = makeState({
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 24000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    const mods = buildModifiers(state)
    expect(mods.checkBonus).toBeGreaterThan(0)
  })
})
