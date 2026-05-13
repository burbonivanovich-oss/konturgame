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

// «Обычная» ротация тактик: active → service → calm. Получается ~33% времени
// в каждой. Имитирует игрока, который не задумывается слишком сильно, но и не
// спамит одну кнопку.
const TACTIC_CYCLE: WeeklyTactic[] = ['aggressive', 'service', 'calm']

// Скрипт активации сервисов по неделям — имитирует «как все играют»:
// W2: ОФД (обязательный по 54-ФЗ)
// W12: Маркет (учёт товаров, тоже почти всегда подключают)
// W22: Эльба (бухгалтерия)
// W35: Экстерн (отчётность)
const SERVICE_ACTIVATIONS: Array<{ week: number; service: ServiceType }> = [
  { week: 2,  service: 'ofd' },
  { week: 12, service: 'market' },
  { week: 22, service: 'elba' },
  { week: 35, service: 'extern' },
]

interface MixedResult {
  businessType: BusinessType
  weeksReached: number
  ended: 'survived' | 'bankrupt' | 'burnout' | 'victory' | 'reputation' | 'unknown'
  finalBalance: number
  peakBalance: number
}

function runMixed(businessType: BusinessType): MixedResult {
  const state = makeGameState(businessType)
  let peakBalance = state.balance
  let weeksReached = 0

  for (let w = 0; w < 52; w++) {
    if (state.isGameOver || state.isVictory) break

    // Активация сервисов по расписанию
    for (const act of SERVICE_ACTIVATIONS) {
      if (state.currentWeek === act.week && state.services[act.service]) {
        state.services[act.service].isActive = true
      }
    }

    // Сбрасываем события (имитация «авто-ответа» дефолтной опцией —
    // игрок просто кликает первую кнопку, не читая)
    state.pendingEvent = null
    state.pendingEventsQueue = []

    // Восстановление энергии (как в gameStore.completeResultsPhase)
    state.entrepreneurEnergy = Math.min(100, state.entrepreneurEnergy + 42)

    // Тактика по циклу: меняется каждую неделю
    state.weeklyTactic = TACTIC_CYCLE[w % TACTIC_CYCLE.length]

    try {
      processWeek(state)
      weeksReached += 1
      peakBalance = Math.max(peakBalance, state.balance)
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
    businessType,
    weeksReached,
    ended,
    finalBalance: state.balance,
    peakBalance,
  }
}

describe('Mixed-tactics simulation — для калибровки personalGoals', () => {
  it('запускает «обычного игрока» по каждому бизнесу', () => {
    const businessTypes: BusinessType[] = ['shop', 'cafe', 'beauty-salon']
    const results: MixedResult[] = []

    for (const bt of businessTypes) {
      // 10 прогонов на тип чтобы усреднить случайность (Math.random в цепочках)
      for (let i = 0; i < 10; i++) {
        results.push(runMixed(bt))
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════')
    console.log('  СМЕШАННАЯ ТАКТИКА (active→service→calm, активация сервисов W2/12/22/35)')
    console.log('───────────────────────────────────────────────────────────────────────')
    console.log('  Тип         · итог       · W   · Финал ₽         · Пик ₽')
    console.log('───────────────────────────────────────────────────────────────────────')

    for (const r of results) {
      const tLabel = r.businessType === 'shop' ? 'Магазин' : r.businessType === 'cafe' ? 'Кафе   ' : 'Салон  '
      const label = ({
        survived: '✓ выжил   ',
        bankrupt: '✗ банкрот ',
        burnout:  '✗ выгор   ',
        victory:  '🏆 победа ',
        reputation: '✗ реп     ',
        unknown:  '? unknown ',
      })[r.ended]
      console.log(
        `  ${tLabel}  · ${label} · ${String(r.weeksReached).padStart(2)}  · ${r.finalBalance.toLocaleString('ru-RU').padStart(13)}   · ${r.peakBalance.toLocaleString('ru-RU').padStart(12)}`
      )
    }
    console.log('═══════════════════════════════════════════════════════════════════════')

    // Сводка по типу
    for (const bt of businessTypes) {
      const subset = results.filter(r => r.businessType === bt)
      const reached52 = subset.filter(r => r.weeksReached >= 52)
      const avgFinal = reached52.length > 0
        ? Math.round(reached52.reduce((s, r) => s + r.finalBalance, 0) / reached52.length)
        : 0
      const avgPeak = subset.length > 0
        ? Math.round(subset.reduce((s, r) => s + r.peakBalance, 0) / subset.length)
        : 0
      const tLabel = bt === 'shop' ? 'Магазин' : bt === 'cafe' ? 'Кафе' : 'Салон'
      console.log(`  ${tLabel.padEnd(10)}: дошло до W52 — ${reached52.length}/${subset.length}, средний финал ${avgFinal.toLocaleString('ru-RU')} ₽, средний пик ${avgPeak.toLocaleString('ru-RU')} ₽`)
    }

    // Общая средняя по всем выжившим
    const allReached = results.filter(r => r.weeksReached >= 52)
    const overallAvg = allReached.length > 0
      ? Math.round(allReached.reduce((s, r) => s + r.finalBalance, 0) / allReached.length)
      : 0
    console.log(`\n  ИТОГ: ${allReached.length}/${results.length} дошло до W52, средний финальный баланс ${overallAvg.toLocaleString('ru-RU')} ₽\n`)
  })
})
