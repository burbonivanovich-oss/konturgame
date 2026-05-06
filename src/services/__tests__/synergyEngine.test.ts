import { describe, it, expect } from 'vitest'
import { getActiveSynergies, calculateSynergyModifiers, getActiveBundleTier, countActiveServices } from '../synergyEngine'
import type { GameState, ServiceType } from '../../types/game'
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

function makeState(activeServices: ServiceType[] = []): GameState {
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
    services: makeServices(activeServices),
    achievements: [],
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
  }
}

describe('countActiveServices', () => {
  it('returns 0 when none active', () => {
    expect(countActiveServices(makeState([]))).toBe(0)
  })
  it('counts the active set', () => {
    expect(countActiveServices(makeState(['bank', 'ofd', 'market']))).toBe(3)
  })
})

describe('getActiveBundleTier', () => {
  it('null below 3 services', () => {
    expect(getActiveBundleTier(makeState(['bank', 'ofd']))).toBeNull()
  })
  it('basic tier at 3 services', () => {
    const tier = getActiveBundleTier(makeState(['bank', 'ofd', 'market']))
    expect(tier?.minServices).toBe(3)
    expect(tier?.revenueBonus).toBe(0.10)
  })
  it('extended tier at 5 services', () => {
    const tier = getActiveBundleTier(makeState(['bank', 'ofd', 'market', 'diadoc', 'fokus']))
    expect(tier?.minServices).toBe(5)
  })
  it('full stack at 7 services', () => {
    const tier = getActiveBundleTier(makeState(['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern']))
    expect(tier?.minServices).toBe(7)
    expect(tier?.revenueBonus).toBe(0.30)
  })
})

describe('calculateSynergyModifiers', () => {
  it('returns zero revenue bonus below 3 services', () => {
    expect(calculateSynergyModifiers(makeState(['bank', 'ofd'])).revenueBonus).toBe(0)
  })
  it('returns 10% revenue bonus at 3 services', () => {
    expect(calculateSynergyModifiers(makeState(['bank', 'ofd', 'market'])).revenueBonus).toBe(0.10)
  })
  it('returns 30% revenue bonus at 7 services', () => {
    expect(calculateSynergyModifiers(makeState(['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'])).revenueBonus).toBe(0.30)
  })
  it('only revenue is non-zero — bundle is revenue-only', () => {
    const mods = calculateSynergyModifiers(makeState(['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern']))
    expect(mods.reputationBonus).toBe(0)
    expect(mods.clientBonus).toBe(0)
    expect(mods.taxSaving).toBe(0)
    expect(mods.loyaltyBonus).toBe(0)
    expect(mods.capacityBonus).toBe(0)
    expect(mods.checkBonus).toBe(0)
  })
})

describe('getActiveSynergies (legacy shape)', () => {
  it('returns empty list below 3 services', () => {
    expect(getActiveSynergies(makeState(['bank', 'ofd']))).toHaveLength(0)
  })
  it('returns one pseudo-synergy for the active bundle tier', () => {
    const list = getActiveSynergies(makeState(['bank', 'ofd', 'market']))
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('bundle_3')
  })
})
