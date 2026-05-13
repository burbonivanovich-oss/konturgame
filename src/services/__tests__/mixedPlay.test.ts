/**
 * Симуляция «обычного игрока на пофиге» — для калибровки личных целей.
 *
 * Цель: понять, сколько денег накапливает к W52 игрок, который:
 *   • НЕ оптимизирует, но и не катастрофически тупит
 *   • Чередует тактики (active → service → calm) циклом
 *   • Постепенно подключает обязательные сервисы (Банк, ОФД, Маркет)
 *   • Покупает 1-2 базовых апгрейда
 *
 * Запуск: npm test -- --run mixedPlay
 *
 * Используется для калибровки personalGoals.ts — текущие 320-400K
 * выглядели слишком легко по сравнению со средним финальным балансом.
 */

import { describe, it } from 'vitest'
import { processWeek } from '../weekCalculator'
import type { GameState, ServiceType, BusinessType, WeeklyTactic } from '../../types/game'
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

function makeGameState(businessType: BusinessType): GameState {
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
    services: makeServices(['bank']),  // Банк бесплатный — подключаем сразу
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
    purchasedUpgrades: [],
    temporaryClientMod: 0,
    temporaryCheckMod: 0,
    temporaryModDaysLeft: 0,
    onboardingStage: 4,
    onboardingCompleted: true,
    onboardingStepIndex: 0,
    unlockedServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    cashRegisters: [{ type: 'mobile', count: 1, purchaseDay: 1 }],
    enabledCategories: businessType === 'shop' ? ['basic'] : businessType === 'cafe' ? ['beverages'] : ['basic-services'],
    promoCodesRevealed: [],
    pendingPromoCode: null,
    daysBalanceNegative: 0,
    competitorEventTriggered: false,
    bundlePromoShown: false,
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

const TACTIC_CYCLE: WeeklyTactic[] = ['aggressive', 'service', 'calm']

// Расписания активации сервисов под разные стратегии.
const SERVICES_MINIMAL: Array<{ week: number; service: ServiceType }> = [
  { week: 2,  service: 'ofd' },
  { week: 12, service: 'market' },
]
const SERVICES_PARTIAL: Array<{ week: number; service: ServiceType }> = [
  { week: 2,  service: 'ofd' },
  { week: 12, service: 'market' },
  { week: 22, service: 'elba' },
  { week: 35, service: 'extern' },
]
const SERVICES_FULL: Array<{ week: number; service: ServiceType }> = [
  { week: 2,  service: 'ofd' },
  { week: 8,  service: 'market' },
  { week: 16, service: 'diadoc' },
  { week: 22, service: 'elba' },
  { week: 28, service: 'fokus' },
  { week: 35, service: 'extern' },
]

// Расписания апгрейдов — какие куплены, когда (неделя). Указано отдельно
// для каждого типа бизнеса.
type UpgradeSchedule = Record<BusinessType, Array<{ week: number; id: string }>>
const UPGRADES_NONE: UpgradeSchedule = { shop: [], cafe: [], 'beauty-salon': [] }
const UPGRADES_PARTIAL: UpgradeSchedule = {
  shop: [
    { week: 6,  id: 'cold-case' },
    { week: 14, id: 'cctv' },
    { week: 24, id: 'pos-terminal' },
  ],
  cafe: [
    { week: 6,  id: 'espresso-machine' },
    { week: 14, id: 'oven' },
    { week: 24, id: 'cooler' },
  ],
  'beauty-salon': [
    { week: 6,  id: 'manicure-station' },
    { week: 14, id: 'uv-lamps' },
    { week: 24, id: 'crm-system' },
  ],
}
const UPGRADES_FULL: UpgradeSchedule = {
  shop: [
    { week: 6,  id: 'cold-case' },
    { week: 10, id: 'cctv' },
    { week: 14, id: 'pos-terminal' },
    { week: 18, id: 'freezer' },
    { week: 22, id: 'hire-cashier' },
    { week: 28, id: 'premium-categories' },
    { week: 34, id: 'hall-expansion' },
    { week: 40, id: 'tobacco-display' },
    { week: 44, id: 'liquor-cabinet' },
  ],
  cafe: [
    { week: 6,  id: 'espresso-machine' },
    { week: 10, id: 'oven' },
    { week: 14, id: 'cooler' },
    { week: 18, id: 'seasonal-menu' },
    { week: 22, id: 'kitchen' },
    { week: 28, id: 'hire-barista' },
    { week: 34, id: 'summer-terrace' },
    { week: 40, id: 'sound-system' },
    { week: 44, id: 'bar-counter' },
  ],
  'beauty-salon': [
    { week: 6,  id: 'manicure-station' },
    { week: 10, id: 'uv-lamps' },
    { week: 14, id: 'crm-system' },
    { week: 18, id: 'massage-chair' },
    { week: 22, id: 'coloring-station' },
    { week: 28, id: 'spa-room' },
    { week: 34, id: 'hire-master' },
    { week: 40, id: 'cosmetics-shelf' },
    { week: 44, id: 'vip-room' },
  ],
}

interface Strategy {
  label: string
  services: Array<{ week: number; service: ServiceType }>
  upgrades: UpgradeSchedule
}

const STRATEGIES: Strategy[] = [
  { label: 'CASUAL: только базовое',          services: SERVICES_MINIMAL, upgrades: UPGRADES_NONE    },
  { label: 'CASUAL + апгрейды',                services: SERVICES_MINIMAL, upgrades: UPGRADES_PARTIAL },
  { label: 'CASUAL + 4 сервиса (без апгр)',    services: SERVICES_PARTIAL, upgrades: UPGRADES_NONE    },
  { label: 'MID: 4 сервиса + апгрейды',        services: SERVICES_PARTIAL, upgrades: UPGRADES_PARTIAL },
  { label: 'PRO: все 7 сервисов, все апгр.',  services: SERVICES_FULL,    upgrades: UPGRADES_FULL    },
]

interface MixedResult {
  strategy: string
  businessType: BusinessType
  weeksReached: number
  ended: 'survived' | 'bankrupt' | 'burnout' | 'victory' | 'reputation' | 'unknown'
  finalBalance: number
  peakBalance: number
  // Балансы на ключевых неделях — для проверки дедлайнов целей
  balanceW20: number
  balanceW30: number
  balanceW35: number
  balanceW40: number
}

function runMixed(businessType: BusinessType, strategy: Strategy): MixedResult {
  const state = makeGameState(businessType)
  let peakBalance = state.balance
  let weeksReached = 0
  let balanceW20 = 0, balanceW30 = 0, balanceW35 = 0, balanceW40 = 0

  for (let w = 0; w < 52; w++) {
    if (state.isGameOver || state.isVictory) break

    // Активация сервисов по расписанию стратегии
    for (const act of strategy.services) {
      if (state.currentWeek === act.week && state.services[act.service]) {
        state.services[act.service].isActive = true
      }
    }
    // Покупка апгрейдов (стоимость пока не вычитаем — это симуляция «как идеально
    // прошло», предполагается что игрок накопил и купил). Реально вычитать стоимость
    // апгрейдов мы тут не моделируем, потому что хотим оценить ПОТЕНЦИАЛ доходности.
    const upgs = strategy.upgrades[businessType] ?? []
    for (const u of upgs) {
      if (state.currentWeek === u.week && !state.purchasedUpgrades.includes(u.id)) {
        state.purchasedUpgrades.push(u.id)
      }
    }

    state.pendingEvent = null
    state.pendingEventsQueue = []
    state.entrepreneurEnergy = Math.min(100, state.entrepreneurEnergy + 42)
    state.weeklyTactic = TACTIC_CYCLE[w % TACTIC_CYCLE.length]

    try {
      processWeek(state)
      weeksReached += 1
      peakBalance = Math.max(peakBalance, state.balance)
      if (state.currentWeek === 21) balanceW20 = state.balance
      if (state.currentWeek === 31) balanceW30 = state.balance
      if (state.currentWeek === 36) balanceW35 = state.balance
      if (state.currentWeek === 41) balanceW40 = state.balance
    } catch {
      break
    }
  }

  let ended: MixedResult['ended'] = 'survived'
  if (state.isVictory) ended = 'victory'
  else if (state.isGameOver) {
    if (state.gameOverReason === 'bankruptcy') ended = 'bankrupt'
    else if (state.gameOverReason === 'burnout') ended = 'burnout'
    else if (state.gameOverReason === 'reputation') ended = 'reputation'
    else if (state.gameOverReason === 'year_end') ended = state.balance > 0 ? 'survived' : 'bankrupt'
    else ended = 'unknown'
  }

  return {
    strategy: strategy.label,
    businessType,
    weeksReached,
    ended,
    finalBalance: state.balance,
    peakBalance,
    balanceW20, balanceW30, balanceW35, balanceW40,
  }
}

describe('Mixed-tactics simulation — для калибровки personalGoals', () => {
  it('сравнивает 5 стратегий × 3 типа бизнеса', () => {
    const businessTypes: BusinessType[] = ['shop', 'cafe', 'beauty-salon']
    const results: MixedResult[] = []

    for (const strategy of STRATEGIES) {
      for (const bt of businessTypes) {
        for (let i = 0; i < 5; i++) {
          results.push(runMixed(bt, strategy))
        }
      }
    }

    // Группируем результаты по стратегии
    console.log('\n══════════════════════════════════════════════════════════════════════════════════════════')
    console.log('  Стратегия                              ·       W20    ·       W30    ·       W35    ·       W52 финал')
    console.log('──────────────────────────────────────────────────────────────────────────────────────────')

    for (const strategy of STRATEGIES) {
      for (const bt of businessTypes) {
        const subset = results.filter(r => r.strategy === strategy.label && r.businessType === bt && r.weeksReached >= 52)
        if (subset.length === 0) {
          const tLabel = bt === 'shop' ? 'Магазин' : bt === 'cafe' ? 'Кафе   ' : 'Салон  '
          console.log(`  ${strategy.label.padEnd(38)} · ${tLabel} · НЕ ВЫЖИЛ`)
          continue
        }
        const avgW20 = Math.round(subset.reduce((s, r) => s + r.balanceW20, 0) / subset.length)
        const avgW30 = Math.round(subset.reduce((s, r) => s + r.balanceW30, 0) / subset.length)
        const avgW35 = Math.round(subset.reduce((s, r) => s + r.balanceW35, 0) / subset.length)
        const avgFinal = Math.round(subset.reduce((s, r) => s + r.finalBalance, 0) / subset.length)
        const tLabel = bt === 'shop' ? 'Магазин' : bt === 'cafe' ? 'Кафе   ' : 'Салон  '
        console.log(
          `  ${strategy.label.padEnd(38)} · ${tLabel} · ${avgW20.toLocaleString('ru-RU').padStart(10)} · ${avgW30.toLocaleString('ru-RU').padStart(10)} · ${avgW35.toLocaleString('ru-RU').padStart(10)} · ${avgFinal.toLocaleString('ru-RU').padStart(12)}`
        )
      }
      console.log('──────────────────────────────────────────────────────────────────────────────────────────')
    }
    console.log('══════════════════════════════════════════════════════════════════════════════════════════\n')
  })
})
