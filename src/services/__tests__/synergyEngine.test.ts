import { describe, it, expect } from 'vitest'
import { getActiveSynergies, calculateSynergyModifiers } from '../synergyEngine'
import type { GameState, Service, ServiceType } from '../../types/game'
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
  }
}

describe('getActiveSynergies', () => {
  it('returns no synergies when no services active', () => {
    const state = makeState([])
    expect(getActiveSynergies(state)).toHaveLength(0)
  })

  it('returns market_ofd synergy when both active', () => {
    const state = makeState(['market', 'ofd'])
    const synergies = getActiveSynergies(state)
    const ids = synergies.map((s) => s.id)
    expect(ids).toContain('market_ofd')
  })

  it('does not return synergy if only one service active', () => {
    const state = makeState(['market'])
    const synergies = getActiveSynergies(state)
    expect(synergies.find((s) => s.id === 'market_ofd')).toBeUndefined()
  })

  it('returns market_diadoc synergy when both active', () => {
    const state = makeState(['market', 'diadoc'])
    const ids = getActiveSynergies(state).map((s) => s.id)
    expect(ids).toContain('market_diadoc')
  })

  it('returns full_kontour synergy when all 7 services active', () => {
    const state = makeState(['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'])
    const ids = getActiveSynergies(state).map((s) => s.id)
    expect(ids).toContain('full_kontour')
  })

  it('does not return full_kontour when only 6 active', () => {
    const state = makeState(['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba'])
    const ids = getActiveSynergies(state).map((s) => s.id)
    expect(ids).not.toContain('full_kontour')
  })
})

describe('calculateSynergyModifiers', () => {
  it('returns all zeros when no services active', () => {
    const state = makeState([])
    const mods = calculateSynergyModifiers(state)
    expect(mods.reputationBonus).toBe(0)
    expect(mods.clientBonus).toBe(0)
    expect(mods.revenueBonus).toBe(0)
    expect(mods.taxSaving).toBe(0)
    expect(mods.loyaltyBonus).toBe(0)
    expect(mods.capacityBonus).toBe(0)
  })

  it('adds market+ofd reputation bonus', () => {
    const state = makeState(['market', 'ofd'])
    const mods = calculateSynergyModifiers(state)
    expect(mods.reputationBonus).toBe(2)
  })

  it('adds bank+elba revenue bonus', () => {
    const state = makeState(['bank', 'elba'])
    const mods = calculateSynergyModifiers(state)
    expect(mods.revenueBonus).toBe(0.05)
  })

  it('adds extern+bank tax saving', () => {
    const state = makeState(['extern', 'bank'])
    const mods = calculateSynergyModifiers(state)
    expect(mods.taxSaving).toBe(0.01)
  })

  it('stacks bonuses from multiple synergies', () => {
    const state = makeState(['market', 'ofd', 'bank', 'elba'])
    const mods = calculateSynergyModifiers(state)
    expect(mods.reputationBonus).toBe(2)
    expect(mods.revenueBonus).toBe(0.05)
  })

  it('full kontour adds 15% revenue bonus on top', () => {
    const state = makeState(['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'])
    const mods = calculateSynergyModifiers(state)
    expect(mods.revenueBonus).toBeGreaterThanOrEqual(0.15)
    expect(mods.reputationBonus).toBeGreaterThanOrEqual(1)
  })
})
