import { describe, it, expect } from 'vitest'
import {
  checkBankruptcy,
  checkReputationLoss,
  checkVictory,
  getVictoryStatus,
  getAllServicesActive,
  updateGameOverCounters,
  getLevelForExperience,
} from '../victoryChecker'
import type { GameState, ServiceType } from '../../types/game'

const ALL_SERVICE_IDS: ServiceType[] = ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern']

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

function makeDayResult(overrides: Partial<any> = {}): any {
  return {
    dayNumber: 1,
    clients: 100,
    served: 100,
    missed: 0,
    revenue: 150000,
    expenses: 10000,
    tax: 9000,
    subscriptionCost: 0,
    purchaseCost: 0,
    monthlyExpense: 0,
    expiredLoss: 0,
    netProfit: 100000,
    balance: 150000,
    reputationChange: 0,
    loyaltyChange: 0,
    stockAfter: 0,
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

function makeActiveServices(): GameState['services'] {
  const services = {} as GameState['services']
  for (const id of ALL_SERVICE_IDS) {
    services[id] = { id, name: '', description: '', annualPrice: 24000, isActive: true, effects: {} }
  }
  return services
}

describe('checkBankruptcy', () => {
  it('returns false when balance is positive', () => {
    expect(checkBankruptcy(makeState({ balance: 1000 }))).toBe(false)
  })

  it('returns false when balance is zero', () => {
    expect(checkBankruptcy(makeState({ balance: 0 }))).toBe(false)
  })

  it('returns true when balance is negative for 3+ days', () => {
    expect(checkBankruptcy(makeState({ balance: -1, daysBalanceNegative: 3 }))).toBe(true)
  })
})

describe('checkReputationLoss', () => {
  it('returns false when reputation > 0', () => {
    expect(checkReputationLoss(makeState({ reputation: 10 }))).toBe(false)
  })

  it('returns false when reputation = 0 but fewer than 3 days', () => {
    const state = makeState({ reputation: 0, daysReputationZero: 2 })
    expect(checkReputationLoss(state)).toBe(false)
  })

  it('returns true when reputation = 0 for 6+ days', () => {
    const state = makeState({ reputation: 0, daysReputationZero: 6 })
    expect(checkReputationLoss(state)).toBe(true)
  })
})

describe('getAllServicesActive', () => {
  it('returns false when no services', () => {
    expect(getAllServicesActive(makeState())).toBe(false)
  })

  it('returns false when some services inactive', () => {
    const state = makeState({
      services: {
        market: { id: 'market', name: '', description: '', annualPrice: 24000, isActive: true, effects: {} },
      } as GameState['services'],
    })
    expect(getAllServicesActive(state)).toBe(false)
  })

  it('returns true when all 7 services are active', () => {
    const state = makeState({ services: makeActiveServices() })
    expect(getAllServicesActive(state)).toBe(true)
  })
})

describe('getVictoryStatus', () => {
  it('all conditions false for new game', () => {
    const state = makeState()
    const status = getVictoryStatus(state)
    expect(status.weeklyProfitReached).toBe(false)
    expect(status.balanceReached).toBe(false)
    expect(status.allServicesConnected).toBe(false)
    expect(status.levelReached).toBe(false)
    expect(status.achievementsReached).toBe(false)
  })

  it('balanceReached true when balance >= 1000000', () => {
    const state = makeState({ balance: 1000000 })
    const status = getVictoryStatus(state)
    expect(status.balanceReached).toBe(true)
  })

  it('levelReached true when level >= 10', () => {
    const state = makeState({ level: 10 })
    const status = getVictoryStatus(state)
    expect(status.levelReached).toBe(true)
  })

  it('achievementsReached true when 7+ achievements', () => {
    const state = makeState({
      achievements: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
    })
    const status = getVictoryStatus(state)
    expect(status.achievementsReached).toBe(true)
  })

  it('weeklyProfitReached true when last result netProfit >= 20000', () => {
    const state = makeState({
      lastDayResult: makeDayResult({ netProfit: 20000 }),
    })
    const status = getVictoryStatus(state)
    expect(status.weeklyProfitReached).toBe(true)
  })
})

describe('checkVictory', () => {
  it('returns false for new game', () => {
    expect(checkVictory(makeState())).toBe(false)
  })

  it('returns true when all conditions met', () => {
    const state = makeState({
      balance: 1000000,
      level: 10,
      achievements: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'],
      services: makeActiveServices(),
      lastDayResult: makeDayResult({ netProfit: 100000, balance: 1000000 }),
    })
    expect(checkVictory(state)).toBe(true)
  })
})

describe('updateGameOverCounters', () => {
  it('increments daysReputationZero when reputation is 0', () => {
    const state = makeState({ reputation: 0, daysReputationZero: 1 })
    updateGameOverCounters(state)
    expect(state.daysReputationZero).toBe(2)
  })

  it('resets daysReputationZero when reputation > 0', () => {
    const state = makeState({ reputation: 10, daysReputationZero: 2 })
    updateGameOverCounters(state)
    expect(state.daysReputationZero).toBe(0)
  })
})

describe('getLevelForExperience', () => {
  it('level 1 at 0 experience', () => {
    expect(getLevelForExperience(0)).toBe(1)
  })

  it('level 2 at 100 experience', () => {
    expect(getLevelForExperience(100)).toBe(2)
  })

  it('level 10 at 1000 experience', () => {
    expect(getLevelForExperience(1000)).toBe(10)
  })

  it('max level 10 even at high experience', () => {
    expect(getLevelForExperience(9999)).toBe(10)
  })

  it('level 5 at 500 experience', () => {
    expect(getLevelForExperience(500)).toBe(5)
  })
})
