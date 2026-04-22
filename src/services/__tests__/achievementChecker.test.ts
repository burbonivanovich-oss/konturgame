import { describe, it, expect } from 'vitest'
import { checkNewAchievements } from '../achievementChecker'
import type { GameState, ServiceType, DayResult } from '../../types/game'
import { SERVICES_CONFIG } from '../../constants/business'

function makeServices(activeIds: ServiceType[] = []): GameState['services'] {
  const services = {} as GameState['services']
  for (const [key, config] of Object.entries(SERVICES_CONFIG)) {
    services[key as ServiceType] = {
      ...config,
      isActive: activeIds.includes(key as ServiceType),
    }
  }
  return services
}

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
    services: makeServices([]),
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
    weekPhase: 'actions' as const,
    purchasedOwnerItems: [],
    ownerSubscriptions: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  }
}

function makeDayResult(overrides: Partial<DayResult> = {}): DayResult {
  return {
    dayNumber: 1,
    clients: 50,
    served: 50,
    missed: 0,
    revenue: 15000,
    expenses: 5000,
    tax: 900,
    subscriptionCost: 0,
    purchaseCost: 4100,
    monthlyExpense: 0,
    expiredLoss: 0,
    netProfit: 10000,
    balance: 60000,
    reputationChange: 0,
    loyaltyChange: 0,
    stockAfter: 10,
    painLossBankMissed: 0,
    painLossMarketInventory: 0,
    painLossOfdFine: 0,
    painLossDiadocDelay: 0,
    painLossFokusBadSupplier: 0,
    painLossElbaFine: 0,
    painLossExternBlock: 0,
    registerOverflowPenalty: 0,
    categoryFines: {},
    ...overrides,
  }
}

describe('checkNewAchievements', () => {
  it('returns empty array when no conditions met', () => {
    // first_day is already in achievements so it won't be returned again
    const state = makeState({ achievements: ['first_day'] })
    expect(checkNewAchievements(state)).toHaveLength(0)
  })

  it('does not return already unlocked achievements', () => {
    const state = makeState({ currentWeek: 5, achievements: ['first_day'] })
    const newAchs = checkNewAchievements(state)
    expect(newAchs).not.toContain('first_day')
  })

  it('grants first_day when currentWeek >= 2', () => {
    const state = makeState({ currentWeek: 2 })
    expect(checkNewAchievements(state)).toContain('first_day')
  })

  it('grants week_done when currentWeek >= 8', () => {
    const state = makeState({ currentWeek: 8 })
    const achs = checkNewAchievements(state)
    expect(achs).toContain('week_done')
    expect(achs).toContain('first_day')
  })

  it('grants month_done at day 31', () => {
    const state = makeState({ currentWeek: 31 })
    expect(checkNewAchievements(state)).toContain('month_done')
  })

  it('grants profitable_day when netProfit > 0', () => {
    const state = makeState({ lastDayResult: makeDayResult({ netProfit: 1 }) })
    expect(checkNewAchievements(state)).toContain('profitable_day')
  })

  it('does not grant profitable_day when netProfit <= 0', () => {
    const state = makeState({ lastDayResult: makeDayResult({ netProfit: 0 }) })
    expect(checkNewAchievements(state)).not.toContain('profitable_day')
  })

  it('grants big_profit when netProfit >= 100000', () => {
    const state = makeState({ lastDayResult: makeDayResult({ netProfit: 100000 }) })
    expect(checkNewAchievements(state)).toContain('big_profit')
  })

  it('grants millionaire at balance 1 000 000', () => {
    const state = makeState({ balance: 1000000 })
    expect(checkNewAchievements(state)).toContain('millionaire')
  })

  it('grants high_rep at reputation 90', () => {
    const state = makeState({ reputation: 90 })
    expect(checkNewAchievements(state)).toContain('high_rep')
  })

  it('grants loyal_staff at loyalty 90', () => {
    const state = makeState({ loyalty: 90 })
    expect(checkNewAchievements(state)).toContain('loyal_staff')
  })

  it('grants perfect_day when missed = 0 and clients > 0', () => {
    const state = makeState({
      lastDayResult: makeDayResult({ missed: 0, clients: 50 }),
    })
    expect(checkNewAchievements(state)).toContain('perfect_day')
  })

  it('does not grant perfect_day when missed > 0', () => {
    const state = makeState({
      lastDayResult: makeDayResult({ missed: 5, clients: 50 }),
    })
    expect(checkNewAchievements(state)).not.toContain('perfect_day')
  })

  it('grants first_service when one service active', () => {
    const state = makeState({ services: makeServices(['market']) })
    expect(checkNewAchievements(state)).toContain('first_service')
  })

  it('grants three_services when 3 services active', () => {
    const state = makeState({ services: makeServices(['market', 'ofd', 'bank']) })
    expect(checkNewAchievements(state)).toContain('three_services')
  })

  it('grants all_services when all 7 active', () => {
    const state = makeState({
      services: makeServices(['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern']),
    })
    expect(checkNewAchievements(state)).toContain('all_services')
  })

  it('grants first_campaign when activeAdCampaigns not empty', () => {
    const state = makeState({
      activeAdCampaigns: [
        {
          id: 'promo',
          name: 'Промо',
          duration: 10,
          cost: 3000,
          clientEffect: 0.25,
          checkEffect: -0.2,
          daysRemaining: 5,
        },
      ],
    })
    expect(checkNewAchievements(state)).toContain('first_campaign')
  })

  it('grants hall_upgrade when upgrade purchased', () => {
    const state = makeState({ purchasedUpgrades: ['hall-expansion'] })
    expect(checkNewAchievements(state)).toContain('hall_upgrade')
  })

  it('grants level_5 at level 5', () => {
    const state = makeState({ level: 5 })
    expect(checkNewAchievements(state)).toContain('level_5')
  })

  it('grants level_10 at level 10', () => {
    const state = makeState({ level: 10 })
    expect(checkNewAchievements(state)).toContain('level_10')
  })

  it('grants event_veteran at 10 triggered events', () => {
    const state = makeState({
      triggeredEventIds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    })
    expect(checkNewAchievements(state)).toContain('event_veteran')
  })

  it('grants resilient when hadLowReputation and rep >= 60', () => {
    const state = makeState({ hadLowReputation: true, reputation: 60 })
    expect(checkNewAchievements(state)).toContain('resilient')
  })

  it('does not grant resilient without low rep history', () => {
    const state = makeState({ hadLowReputation: false, reputation: 90 })
    expect(checkNewAchievements(state)).not.toContain('resilient')
  })

  it('grants stock_master at 10 consecutive no-expiry days', () => {
    const state = makeState({ consecutiveNoExpiry: 10 })
    expect(checkNewAchievements(state)).toContain('stock_master')
  })
})
