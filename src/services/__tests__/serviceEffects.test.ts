/**
 * Регресс-гарды на «честные» прямые эффекты сервисов (Спринт 7).
 *
 * Эти эффекты раньше были dead config: описание обещало, движок игнорировал.
 * Тесты ловят повторную регрессию — если кто-то снова отвяжет эффект от
 * движка, поведение разойдётся и тест упадёт.
 *
 * Детерминизм: сидим RNG и стабим Math.random, чтобы единственная разница
 * между прогонами была в наличии сервиса, а не в случайных событиях.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { processWeek } from '../weekCalculator'
import { seedRng, createRng } from '../../utils/rng'
import { SERVICES_CONFIG } from '../../constants/business'
import type { GameState, ServiceType, BusinessType } from '../../types/game'

beforeEach(() => {
  seedRng(777)
  const rng = createRng(777)
  vi.spyOn(Math, 'random').mockImplementation(() => rng.randFloat())
})
afterEach(() => { vi.restoreAllMocks() })

function makeServices(activeIds: ServiceType[]): GameState['services'] {
  const services = {} as GameState['services']
  for (const [key, config] of Object.entries(SERVICES_CONFIG)) {
    services[key as ServiceType] = {
      id: config.id, name: config.name, description: config.description,
      annualPrice: config.annualPrice,
      isActive: activeIds.includes(config.id as ServiceType),
      effects: config.effects,
    }
  }
  return services
}

function makeState(businessType: BusinessType, active: ServiceType[]): GameState {
  return {
    businessType, businessTier: 1, currentWeek: 1, dayOfWeek: 0,
    balance: 80000, savedBalance: 0, reputation: 50, entrepreneurEnergy: 100,
    loyalty: 55, stock: [], stockBatches: [], capacity: 35,
    services: makeServices(active), achievements: [], hadLowReputation: false,
    consecutiveNoExpiry: 0, lastDayResult: null, pendingEvent: null,
    pendingEventsQueue: [], triggeredEventIds: [], isGameOver: false, isVictory: false,
    consecutiveOverloadDays: 0, daysReputationZero: 0, daysSinceLastMonthly: 0,
    purchaseOfferedThisDay: false, activeAdCampaigns: [], purchasedUpgrades: [],
    temporaryClientMod: 0, temporaryCheckMod: 0, temporaryModDaysLeft: 0,
    onboardingStage: 4, onboardingCompleted: true, onboardingStepIndex: 0,
    unlockedServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    cashRegisters: [{ type: 'mobile', count: 1, purchaseDay: 1 }],
    enabledCategories: ['basic'], promoCodesRevealed: [], pendingPromoCode: null,
    daysBalanceNegative: 0, competitorEventTriggered: false, bundlePromoShown: false,
    lastDayPainLosses: null, weeklyEnergyRestored: false, weekPhase: 'actions',
    employees: [], qualityLevel: 50, weeksSinceCompetitorEvent: 0, loans: [],
    campaignROI: [], milestoneStatus: { week10: false, week20: false, week30: false },
    purchasedOwnerItems: [], ownerSubscriptions: [], npcs: [], playerBackstory: null,
    activeChainIds: [], completedChainIds: [], pendingChainFollowUps: [], decisionLog: [],
    seenNewspaperWeeks: [], createdAt: Date.now(), lastUpdated: Date.now(),
  } as GameState
}

describe('Диадок: procurementDiscount реально снижает закупки', () => {
  it('shop с Диадоком тратит на закупки не больше, чем без него', () => {
    const without = makeState('shop', ['bank'])
    processWeek(without)
    const withDiadoc = makeState('shop', ['bank', 'diadoc'])
    processWeek(withDiadoc)
    // При идентичном RNG скидка на закупки → итоговый баланс не ниже.
    expect(withDiadoc.balance).toBeGreaterThanOrEqual(without.balance)
  })
})

describe('Эльба: energyReduction реально экономит энергию', () => {
  it('shop с Эльбой к концу недели бодрее, чем без неё', () => {
    const without = makeState('shop', ['bank'])
    processWeek(without)
    const withElba = makeState('shop', ['bank', 'elba'])
    processWeek(withElba)
    expect(withElba.entrepreneurEnergy).toBeGreaterThan(without.entrepreneurEnergy)
  })
})

describe('config-гард: прямые эффекты на месте', () => {
  it('Диадок имеет procurementDiscount, Эльба — energyReduction, Маркет — checkBonus', () => {
    expect(SERVICES_CONFIG.diadoc.effects.procurementDiscount).toBeGreaterThan(0)
    expect(SERVICES_CONFIG.elba.effects.energyReduction).toBeGreaterThan(0)
    expect(SERVICES_CONFIG.market.effects.checkBonus).toBeGreaterThan(0)
  })
})
