/**
 * Economy simulation: run multiple 20-week playthroughs and report balance trajectory.
 * Not assertions — this test always passes. Run with `npm test simulation` to see output.
 */
import { describe, it } from 'vitest'
import { processWeek } from '../weekCalculator'
import type { GameState, ServiceType } from '../../types/game'
import { SERVICES_CONFIG } from '../../constants/business'

function makeServices(activeIds: ServiceType[] = []): GameState['services'] {
  const services = {} as GameState['services']
  for (const [key, config] of Object.entries(SERVICES_CONFIG)) {
    services[key as ServiceType] = {
      id: config.id,
      name: config.name,
      description: config.description,
      annualPrice: config.annualPrice,
      isActive: activeIds.includes(config.id as ServiceType),
      effects: config.effects,
    }
  }
  return services
}

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    businessType: 'shop',
    currentWeek: 1,
    dayOfWeek: 0,
    balance: 80000,
    savedBalance: 0,
    reputation: 50,
    entrepreneurEnergy: 100,
    loyalty: 55,
    stock: [],
    stockBatches: [],
    capacity: 35,
    services: makeServices(),
    achievements: [],
    level: 1,
    experience: 0,
    hadLowReputation: false,
    consecutiveNoExpiry: 0,
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
    onboardingStage: 4,      // skip onboarding gates
    onboardingCompleted: true,
    onboardingStepIndex: 0,
    unlockedServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    cashRegisters: [{ type: 'mobile', count: 1, purchaseDay: 1 }],
    enabledCategories: ['basic'],
    promoCodesRevealed: [],
    pendingPromoCode: null,
    daysBalanceNegative: 0,
    competitorEventTriggered: false,
    lastDayPainLosses: null,
    bundlePromoShown: false,
    weeklyEnergyRestored: false,
    weekPhase: 'actions' as const,
    employees: [],
    qualityLevel: 50,
    weeksSinceCompetitorEvent: 0,
    loans: [],
    campaignROI: [],
    milestoneStatus: { week10: false, week20: false, week30: false },
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

interface Scenario {
  name: string
  state: GameState
}

function runScenario(scenario: Scenario, weeks: number): void {
  const state = scenario.state
  const rows: string[] = []

  for (let w = 0; w < weeks; w++) {
    if (state.isGameOver || state.isVictory) break
    // Clear pending event so processWeek doesn't choke
    state.pendingEvent = null
    state.pendingEventsQueue = []
    // Restore energy each week (mirrors completeResultsPhase in the real game)
    state.entrepreneurEnergy = 100

    try {
      const result = processWeek(state)
      const services = Object.values(state.services).filter(s => s.isActive).map(s => s.id.slice(0, 3)).join('')
      rows.push(
        `W${String(state.currentWeek - 1).padStart(2, '0')}` +
        ` bal=${String(Math.round(state.balance)).padStart(8)}` +
        ` net=${String(Math.round(result.netProfit)).padStart(7)}` +
        ` rep=${String(state.reputation).padStart(3)}` +
        ` energy=${String(state.entrepreneurEnergy).padStart(3)}` +
        ` svcs=[${services}]` +
        (state.isGameOver ? ' 💀BANKRUPT' : '')
      )
    } catch (e) {
      rows.push(`W${w + 1}: ERROR ${e}`)
      break
    }
  }

  console.log(`\n=== ${scenario.name} ===`)
  rows.forEach(r => console.log(r))
  if (state.isGameOver) {
    console.log(`💀 Game over at week ${state.currentWeek - 1}: ${state.gameOverReason}`)
  } else {
    console.log(`✅ Survived 20 weeks. Final balance: ${state.balance.toLocaleString('ru')}₽`)
  }
}

describe('Economy Simulation (informational)', () => {
  it('shop: bank only (no expansion)', () => {
    const state = makeGameState({
      businessType: 'shop',
      balance: 80000 - 8000,
      services: makeServices(['bank']),
      enabledCategories: ['basic'],
    })
    runScenario({ name: 'SHOP – bank only, basic category', state }, 20)
  })

  it('shop: bank+ofd+market, all categories from week 1', () => {
    const state = makeGameState({
      businessType: 'shop',
      balance: 80000 - 8000,
      services: makeServices(['bank', 'ofd', 'market']),
      enabledCategories: ['basic', 'dairy', 'meat', 'tobacco'],
      purchasedUpgrades: ['cold-case', 'freezer', 'tobacco-display'],
    })
    runScenario({ name: 'SHOP – bank+ofd+market, all categories', state }, 20)
  })

  it('shop: all services, all categories', () => {
    const state = makeGameState({
      businessType: 'shop',
      balance: 80000 - 8000,
      services: makeServices(['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern']),
      enabledCategories: ['basic', 'dairy', 'meat', 'tobacco', 'alcohol'],
      purchasedUpgrades: ['cold-case', 'freezer', 'tobacco-display', 'liquor-cabinet'],
    })
    runScenario({ name: 'SHOP – all services, all categories', state }, 20)
  })

  it('cafe: bank only, beverages+desserts', () => {
    const state = makeGameState({
      businessType: 'cafe',
      balance: 80000 - 8000,
      services: makeServices(['bank']),
      enabledCategories: ['beverages', 'desserts'],
      purchasedUpgrades: ['oven'],
    })
    runScenario({ name: 'CAFE – bank only, beverages+desserts', state }, 20)
  })

  it('cafe: bank+ofd+market, all categories', () => {
    const state = makeGameState({
      businessType: 'cafe',
      balance: 80000 - 8000,
      services: makeServices(['bank', 'ofd', 'market']),
      enabledCategories: ['beverages', 'ready-food', 'desserts'],
      purchasedUpgrades: ['kitchen', 'oven'],
    })
    runScenario({ name: 'CAFE – bank+ofd+market', state }, 20)
  })

  it('beauty salon: bank only, basic+spa (default)', () => {
    const state = makeGameState({
      businessType: 'beauty-salon',
      balance: 80000 - 8000,
      services: makeServices(['bank']),
      enabledCategories: ['basic-services', 'spa'],
      purchasedUpgrades: ['spa-room'],
    })
    runScenario({ name: 'BEAUTY SALON – bank only, basic+spa', state }, 20)
  })

  it('beauty salon: bank+market, all categories', () => {
    const state = makeGameState({
      businessType: 'beauty-salon',
      balance: 80000 - 8000,
      services: makeServices(['bank', 'ofd', 'market']),
      enabledCategories: ['basic-services', 'spa', 'premium-services', 'cosmetics'],
      purchasedUpgrades: ['spa-room', 'coloring-station', 'cosmetics-shelf'],
    })
    runScenario({ name: 'BEAUTY SALON – bank+ofd+market', state }, 20)
  })
})
