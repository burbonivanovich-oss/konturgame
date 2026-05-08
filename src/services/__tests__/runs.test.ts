/**
 * Симуляция 18 партий с разными стратегиями.
 *
 * Запуск: npm test -- --run runs.test
 *
 * Не unit-тест с assertions, а **информационный прогон**: каждая партия
 * запускает processWeek в цикле до 52 недель или до game over, собирает
 * метрики и печатает сводку. Помогает понять, насколько игра играбельна
 * в текущем состоянии после всех изменений Спринтов 1-4.
 */

import { describe, it } from 'vitest'
import { processWeek } from '../weekCalculator'
import type { GameState, ServiceType, BusinessType, WeeklyTactic } from '../../types/game'
import { SERVICES_CONFIG } from '../../constants/business'

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

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

function makeGameState(
  businessType: BusinessType,
  services: ServiceType[],
  upgrades: string[] = [],
  categories: string[] = ['basic'],
): GameState {
  return {
    businessType,
    businessTier: 1,
    currentWeek: 1,
    dayOfWeek: 0,
    balance: 80000 - 8000,
    savedBalance: 0,
    reputation: 50,
    entrepreneurEnergy: 100,
    loyalty: 55,
    stock: [],
    stockBatches: [],
    capacity: 35,
    services: makeServices(services),
    achievements: [],
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
    purchasedUpgrades: upgrades,
    temporaryClientMod: 0,
    temporaryCheckMod: 0,
    temporaryModDaysLeft: 0,
    onboardingStage: 4,
    onboardingCompleted: true,
    onboardingStepIndex: 0,
    unlockedServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    cashRegisters: [{ type: 'mobile', count: 1, purchaseDay: 1 }],
    enabledCategories: categories,
    promoCodesRevealed: [],
    pendingPromoCode: null,
    daysBalanceNegative: 0,
    competitorEventTriggered: false,
    lastDayPainLosses: null,
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
  }
}

interface RunResult {
  name: string
  businessType: BusinessType
  weeksReached: number
  ended: 'survived' | 'bankrupt' | 'reputation' | 'burnout' | 'victory' | 'unknown'
  finalBalance: number
  peakBalance: number
  minBalance: number
  finalRep: number
  finalLoyalty: number
  finalQuality: number
  totalEvents: number
  threwError: boolean
}

function runSimulation(
  name: string,
  initialState: GameState,
  tactic: WeeklyTactic | null,
  weeks = 52,
): RunResult {
  const state = initialState
  let peakBalance = state.balance
  let minBalance = state.balance
  let weeksReached = 0
  let totalEvents = 0
  let threwError = false

  for (let w = 0; w < weeks; w++) {
    if (state.isGameOver || state.isVictory) break
    state.pendingEvent = null
    state.pendingEventsQueue = []
    state.entrepreneurEnergy = Math.min(100, state.entrepreneurEnergy + 40)
    state.weeklyTactic = tactic

    try {
      processWeek(state)
      weeksReached += 1
      peakBalance = Math.max(peakBalance, state.balance)
      minBalance = Math.min(minBalance, state.balance)
      if (state.pendingEvent || (state.pendingEventsQueue?.length ?? 0) > 0) totalEvents += 1
    } catch (e) {
      threwError = true
      break
    }
  }

  let ended: RunResult['ended'] = 'survived'
  if (state.isVictory) ended = 'victory'
  else if (state.isGameOver) {
    if (state.gameOverReason === 'bankruptcy') ended = 'bankrupt'
    else if (state.gameOverReason === 'reputation') ended = 'reputation'
    else if (state.gameOverReason === 'burnout') ended = 'burnout'
    else ended = 'unknown'
  }

  return {
    name,
    businessType: state.businessType,
    weeksReached,
    ended,
    finalBalance: state.balance,
    peakBalance,
    minBalance,
    finalRep: state.reputation,
    finalLoyalty: state.loyalty,
    finalQuality: state.qualityLevel ?? 50,
    totalEvents,
    threwError,
  }
}

// ───────────────────────────────────────────────────────────────────
// 18 strategies × 3 business types
// ───────────────────────────────────────────────────────────────────

const SCENARIOS: Array<() => { name: string; state: GameState; tactic: WeeklyTactic | null }> = [
  // ── SHOP ──────────────────────────────────────────────────────
  () => ({
    name: 'Магазин · только Банк · спокойно',
    state: makeGameState('shop', ['bank'], [], ['basic']),
    tactic: 'calm',
  }),
  () => ({
    name: 'Магазин · Банк+ОФД · агрессивно',
    state: makeGameState('shop', ['bank', 'ofd'], [], ['basic']),
    tactic: 'aggressive',
  }),
  () => ({
    name: 'Магазин · Банк+Маркет+ОФД · качество',
    state: makeGameState('shop', ['bank', 'market', 'ofd'], ['cold-case'], ['basic', 'dairy']),
    tactic: 'service',
  }),
  () => ({
    name: 'Магазин · все 7 сервисов · агрессивно',
    state: makeGameState(
      'shop',
      ['bank', 'market', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'],
      ['cold-case', 'freezer', 'tobacco-display'],
      ['basic', 'dairy', 'meat', 'tobacco'],
    ),
    tactic: 'aggressive',
  }),
  () => ({
    name: 'Магазин · без сервисов вообще · качество',
    state: makeGameState('shop', [], [], ['basic']),
    tactic: 'service',
  }),
  () => ({
    name: 'Магазин · Эльба+Экстерн · спокойно',
    state: makeGameState('shop', ['elba', 'extern'], [], ['basic']),
    tactic: 'calm',
  }),

  // ── CAFE ──────────────────────────────────────────────────────
  () => ({
    name: 'Кафе · только Банк · спокойно',
    state: makeGameState('cafe', ['bank'], [], ['beverages']),
    tactic: 'calm',
  }),
  () => ({
    name: 'Кафе · Банк+Маркет · агрессивно',
    state: makeGameState('cafe', ['bank', 'market'], ['oven'], ['beverages', 'desserts']),
    tactic: 'aggressive',
  }),
  () => ({
    name: 'Кафе · Банк+Маркет+ОФД · качество',
    state: makeGameState('cafe', ['bank', 'market', 'ofd'], ['oven', 'kitchen'], ['beverages', 'desserts', 'ready-food']),
    tactic: 'service',
  }),
  () => ({
    name: 'Кафе · все 7 сервисов · агрессивно',
    state: makeGameState(
      'cafe',
      ['bank', 'market', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'],
      ['oven', 'kitchen', 'espresso-machine'],
      ['beverages', 'ready-food', 'desserts'],
    ),
    tactic: 'aggressive',
  }),
  () => ({
    name: 'Кафе · только Эльба · спокойно',
    state: makeGameState('cafe', ['elba'], [], ['beverages']),
    tactic: 'calm',
  }),
  () => ({
    name: 'Кафе · Банк+ОФД · качество',
    state: makeGameState('cafe', ['bank', 'ofd'], [], ['beverages', 'desserts']),
    tactic: 'service',
  }),

  // ── BEAUTY SALON ─────────────────────────────────────────────
  () => ({
    name: 'Салон · только Банк · спокойно',
    state: makeGameState('beauty-salon', ['bank'], [], ['basic-services']),
    tactic: 'calm',
  }),
  () => ({
    name: 'Салон · Банк+Эльба · агрессивно',
    state: makeGameState('beauty-salon', ['bank', 'elba'], [], ['basic-services', 'spa']),
    tactic: 'aggressive',
  }),
  () => ({
    name: 'Салон · Банк+Маркет+Эльба · качество',
    state: makeGameState('beauty-salon', ['bank', 'market', 'elba'], ['spa-room'], ['basic-services', 'spa']),
    tactic: 'service',
  }),
  () => ({
    name: 'Салон · все 7 сервисов · качество',
    state: makeGameState(
      'beauty-salon',
      ['bank', 'market', 'ofd', 'diadoc', 'fokus', 'elba', 'extern'],
      ['spa-room', 'coloring-station'],
      ['basic-services', 'spa', 'premium-services', 'cosmetics'],
    ),
    tactic: 'service',
  }),
  () => ({
    name: 'Салон · без сервисов · спокойно',
    state: makeGameState('beauty-salon', [], [], ['basic-services']),
    tactic: 'calm',
  }),
  () => ({
    name: 'Салон · Эльба+Фокус · агрессивно',
    state: makeGameState('beauty-salon', ['elba', 'fokus'], [], ['basic-services', 'spa']),
    tactic: 'aggressive',
  }),
]

// ───────────────────────────────────────────────────────────────────
// Run + report
// ───────────────────────────────────────────────────────────────────

describe('18 партий — отчёт о текущей играбельности', () => {
  it('запускает все стратегии и печатает сводку', () => {
    const results: RunResult[] = []
    for (const make of SCENARIOS) {
      const { name, state, tactic } = make()
      results.push(runSimulation(name, state, tactic, 52))
    }

    // Print full table
    console.log('\n')
    console.log('═'.repeat(108))
    console.log('  ПАРТИЯ                                                  ИТОГ      W   БАЛАНС     РЕП  ЛОЯЛ  КАЧ')
    console.log('─'.repeat(108))
    for (const r of results) {
      const endedLabel = ({
        survived: '✓ выжил',
        bankrupt: '✗ банкрот',
        reputation: '✗ реп',
        burnout: '✗ выгор',
        victory: '🏆 победа',
        unknown: '? game over',
      } as const)[r.ended]
      const balanceStr = r.finalBalance.toLocaleString('ru-RU').padStart(9)
      const namePadded = r.name.padEnd(54)
      const endedPadded = endedLabel.padEnd(10)
      console.log(
        `  ${namePadded}  ${endedPadded}  ${String(r.weeksReached).padStart(2)}  ${balanceStr}  ${String(r.finalRep).padStart(3)}  ${String(r.finalLoyalty).padStart(4)}  ${String(r.finalQuality).padStart(3)}`
      )
    }
    console.log('═'.repeat(108))

    // Summary
    const total = results.length
    const victories = results.filter(r => r.ended === 'victory').length
    const survived = results.filter(r => r.ended === 'survived').length
    const bankrupt = results.filter(r => r.ended === 'bankrupt').length
    const repFails = results.filter(r => r.ended === 'reputation').length
    const burnouts = results.filter(r => r.ended === 'burnout').length
    const errors = results.filter(r => r.threwError).length
    const avgWeeks = Math.round(results.reduce((s, r) => s + r.weeksReached, 0) / total)
    const avgFinal = Math.round(results.reduce((s, r) => s + r.finalBalance, 0) / total)

    console.log('\nИТОГИ:')
    console.log(`  Партий:                ${total}`)
    console.log(`  Победы:                ${victories} (${Math.round((victories / total) * 100)}%)`)
    console.log(`  Выжившие до W52:       ${survived} (${Math.round((survived / total) * 100)}%)`)
    console.log(`  Банкротства:           ${bankrupt} (${Math.round((bankrupt / total) * 100)}%)`)
    console.log(`  Падение репутации:     ${repFails}`)
    console.log(`  Выгорания:             ${burnouts}`)
    console.log(`  Ошибки исполнения:     ${errors}`)
    console.log(`  Средний дошёл до W:    ${avgWeeks}`)
    console.log(`  Средний финальный ₽:   ${avgFinal.toLocaleString('ru-RU')}`)
    console.log()

    // Breakdown by business type
    console.log('ПО ТИПУ БИЗНЕСА:')
    const types: BusinessType[] = ['shop', 'cafe', 'beauty-salon']
    for (const t of types) {
      const subset = results.filter(r => r.businessType === t)
      if (subset.length === 0) continue
      const subAvgWeeks = Math.round(subset.reduce((s, r) => s + r.weeksReached, 0) / subset.length)
      const subVictories = subset.filter(r => r.ended === 'victory').length
      const subBankrupts = subset.filter(r => r.ended === 'bankrupt').length
      const tLabel = t === 'shop' ? 'Магазин' : t === 'cafe' ? 'Кафе' : 'Салон'
      console.log(`  ${tLabel.padEnd(10)} прогонов ${subset.length}  ·  победы ${subVictories}  ·  банкротства ${subBankrupts}  ·  средн. неделя ${subAvgWeeks}`)
    }
    console.log()
  })
})
