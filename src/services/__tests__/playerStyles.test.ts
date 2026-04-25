/**
 * Player-style stress test (v5.5).
 *
 * Goal: simulate 6+ different player archetypes for 52 weeks each, capture
 * per-week metrics, and surface vulnerabilities — soft-locks, exploits,
 * dominant strategies, broken thresholds.
 *
 * Run with `npm test playerStyles` to see the report.
 * The test always passes; failures = console-printed observations.
 */
import { describe, it } from 'vitest'
import { processWeek } from '../weekCalculator'
import { applyEventConsequence } from '../eventGenerator'
import type {
  GameState, ServiceType, Event, WeeklyTactic,
} from '../../types/game'
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
    balance: 80000 - 8000, // bought a starter cash register
    savedBalance: 0,
    reputation: 50,
    entrepreneurEnergy: 100,
    loyalty: 50,
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
    onboardingStage: 4,
    onboardingCompleted: true,
    onboardingStepIndex: 0,
    unlockedServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    cashRegisters: [{ type: 'mobile', count: 1, purchaseDay: 1 }],
    enabledCategories: ['basic', 'dairy'],
    promoCodesRevealed: [],
    pendingPromoCode: null,
    daysBalanceNegative: 0,
    competitorEventTriggered: false,
    lastDayPainLosses: null,
    bundlePromoShown: false,
    weeklyEnergyRestored: false,
    weekPhase: 'actions' as const,
    suppliers: [],
    activeSupplierId: null,
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
    weeklyTactic: null,
    chosenEventOptions: {},
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    ...overrides,
  } as GameState
}

// ─────────────────────────────────────────────────────────────────
// Policy types
// ─────────────────────────────────────────────────────────────────
type EventOptionPicker = 'cheapest' | 'first' | 'kontur' | 'random'

interface Policy {
  name: string
  initialServices: ServiceType[]
  // Set of services to activate at certain weeks
  servicePlan?: Array<{ atWeek: number; service: ServiceType }>
  weeklyTactic: WeeklyTactic | null | ((week: number, state: GameState) => WeeklyTactic | null)
  // How to resolve pending events
  eventStrategy: EventOptionPicker
  // Optionally restore energy by some amount each week (sim of owner investments)
  energyRestoreOverride?: number
}

// ─────────────────────────────────────────────────────────────────
// Event resolver: pick one option according to policy strategy
// ─────────────────────────────────────────────────────────────────
function pickEventOption(event: Event, strategy: EventOptionPicker, state: GameState): string {
  if (strategy === 'first') return event.options[0]?.id ?? ''
  if (strategy === 'random') {
    return event.options[Math.floor(Math.random() * event.options.length)]?.id ?? event.options[0].id
  }
  if (strategy === 'kontur') {
    // Prefer Kontur option if it's actually available (service active)
    const kontur = event.options.find(o => {
      if (!o.isContourOption && !o.requiredService) return false
      if (o.requiredService && !state.services[o.requiredService]?.isActive) return false
      return true
    })
    if (kontur) return kontur.id
    // Fallback to cheapest
  }
  // 'cheapest' or kontur fallback: pick option with smallest negative balance impact
  let bestId = event.options[0]?.id ?? ''
  let bestCost = -Infinity
  for (const opt of event.options) {
    if (opt.requiredService && !state.services[opt.requiredService]?.isActive) continue
    const cost = opt.consequences.balanceDelta ?? 0
    // Highest balanceDelta = least cost
    if (cost > bestCost) {
      bestCost = cost
      bestId = opt.id
    }
  }
  return bestId
}

// ─────────────────────────────────────────────────────────────────
// Run one full simulation
// ─────────────────────────────────────────────────────────────────
interface WeekRow {
  week: number
  balance: number
  net: number
  rep: number
  loy: number
  energy: number
  serviceCount: number
  events: number
  painTotal: number
}

interface RunResult {
  policy: Policy
  rows: WeekRow[]
  finalState: GameState
  ended: 'survived' | 'bankruptcy' | 'burnout' | 'reputation' | 'other'
  weeksSurvived: number
}

/**
 * Pick the best categories the player can currently enable, based on which
 * services are active. Mirrors what an attentive shop owner would do.
 */
function recomputeCategories(state: GameState): void {
  if (state.businessType !== 'shop') return
  const cats: string[] = ['basic']
  if (state.services.market?.isActive && state.services.ofd?.isActive) {
    cats.push('dairy', 'meat')
  }
  if (state.services.elba?.isActive) {
    cats.push('alcohol')
  }
  state.enabledCategories = cats
}

/**
 * Top up stock batches each week — emulates the player using purchaseModal.
 * Buys ~1 week of demand at avg cost. Without this the shop has zero stock
 * and revenue drops to zero (stockRatio = stock / weekDemand).
 */
function restockWeekly(state: GameState): void {
  if (state.businessType !== 'shop') return
  // Aim for ~10 days of buffer so a missed restock doesn't sink revenue
  const desiredQuantity = 100
  const currentStock = state.stockBatches.reduce((s, b) => s + b.quantity, 0)
  const buy = Math.max(0, desiredQuantity - currentStock)
  if (buy <= 0) return
  const costPerUnit = 50
  const totalCost = buy * costPerUnit
  if (state.balance < totalCost) return // can't afford restock
  state.balance -= totalCost
  state.stockBatches.push({
    id: `sim-${state.currentWeek}`,
    quantity: buy,
    costPerUnit,
    dayReceived: state.currentWeek * 7,
    expirationDays: 14,
  })
}

function runSimulation(policy: Policy, weeks: number = 52): RunResult {
  // Simulator baseline: an "engaged" player who, by week 3-4, has bought
  // hall-expansion (+capacity), enabled all categories matching their
  // services, and is running one perma-active ad campaign. Without these
  // assumptions the bare-bones sim shows uniform bankruptcy by week 5
  // because no policy can outpace the ~22 500₽/week baseline expense.
  const state = makeGameState({
    services: makeServices(policy.initialServices),
    capacity: 75, // assumes hall-expansion + a small upgrade
    purchasedUpgrades: ['hall-expansion'],
    // Permanent gentle traffic bonus — simulates one constantly-running
    // cheap ad campaign (e.g. flyer drop, neighborhood social post).
    temporaryClientMod: 0.20,
    temporaryCheckMod: 0,
    temporaryModDaysLeft: 9999,
  })
  recomputeCategories(state)
  const rows: WeekRow[] = []

  for (let w = 1; w <= weeks; w++) {
    if (state.isGameOver) break

    // Activate scheduled services for this week
    if (policy.servicePlan) {
      for (const plan of policy.servicePlan) {
        if (plan.atWeek === state.currentWeek) {
          const svc = state.services[plan.service]
          if (svc && !svc.isActive) {
            const cost = svc.annualPrice
            if (state.balance >= cost) {
              svc.isActive = true
              state.balance -= cost
              recomputeCategories(state)
            }
          }
        }
      }
    }

    // Restock — engaged player would top up via purchaseModal each week
    restockWeekly(state)

    // Pick weekly tactic
    state.weeklyTactic = typeof policy.weeklyTactic === 'function'
      ? policy.weeklyTactic(w, state)
      : policy.weeklyTactic

    // Restore energy (mirrors completeResultsPhase)
    state.entrepreneurEnergy = Math.min(
      100,
      state.entrepreneurEnergy + (policy.energyRestoreOverride ?? 40)
    )

    // Resolve any pending event(s) BEFORE processWeek runs
    let eventsThisWeek = 0
    let safety = 5
    while (state.pendingEvent && !state.isGameOver && safety-- > 0) {
      const ev = state.pendingEvent
      const optId = pickEventOption(ev, policy.eventStrategy, state)
      applyEventConsequence(state, ev, optId)
      if (!state.triggeredEventIds.includes(ev.id)) state.triggeredEventIds.push(ev.id)
      state.pendingEvent = state.pendingEventsQueue?.[0] ?? null
      state.pendingEventsQueue = state.pendingEventsQueue?.slice(1) ?? []
      eventsThisWeek++
    }

    let net = 0
    try {
      const result = processWeek(state)
      net = result.netProfit ?? 0
    } catch (e) {
      console.error(`[${policy.name}] crash at week ${w}: ${e}`)
      break
    }

    // Resolve event(s) generated DURING processWeek too
    safety = 5
    while (state.pendingEvent && !state.isGameOver && safety-- > 0) {
      const ev = state.pendingEvent
      const optId = pickEventOption(ev, policy.eventStrategy, state)
      applyEventConsequence(state, ev, optId)
      if (!state.triggeredEventIds.includes(ev.id)) state.triggeredEventIds.push(ev.id)
      state.pendingEvent = state.pendingEventsQueue?.[0] ?? null
      state.pendingEventsQueue = state.pendingEventsQueue?.slice(1) ?? []
      eventsThisWeek++
    }

    rows.push({
      week: state.currentWeek - 1,
      balance: Math.round(state.balance),
      net: Math.round(net),
      rep: state.reputation,
      loy: state.loyalty,
      energy: state.entrepreneurEnergy,
      serviceCount: Object.values(state.services).filter(s => s.isActive).length,
      events: eventsThisWeek,
      painTotal: state.lastWeekPainLosses?.total ?? 0,
    })
  }

  let ended: RunResult['ended'] = 'survived'
  if (state.isGameOver) {
    if (state.gameOverReason === 'bankruptcy') ended = 'bankruptcy'
    else if (state.gameOverReason === 'burnout') ended = 'burnout'
    else if (state.gameOverReason === 'reputation') ended = 'reputation'
    else ended = 'other'
  }

  return {
    policy,
    rows,
    finalState: state,
    ended,
    weeksSurvived: rows.length,
  }
}

// ─────────────────────────────────────────────────────────────────
// Player policies
// ─────────────────────────────────────────────────────────────────
const POLICIES: Policy[] = [
  {
    name: 'OPTIMAL — все сервисы рано, агрессив, контур-выборы',
    initialServices: ['bank', 'ofd'],
    servicePlan: [
      { atWeek: 2, service: 'market' },
      { atWeek: 3, service: 'extern' },
      { atWeek: 4, service: 'elba' },
      { atWeek: 6, service: 'fokus' },
      { atWeek: 8, service: 'diadoc' },
    ],
    weeklyTactic: 'aggressive',
    eventStrategy: 'kontur',
  },
  {
    name: 'MINIMUM — только Bank+OFD, calm, дешёвые выборы',
    initialServices: ['bank', 'ofd'],
    weeklyTactic: 'calm',
    eventStrategy: 'cheapest',
  },
  {
    name: 'NO_TACTIC — Bank+OFD+Market, тактику не выбирает',
    initialServices: ['bank', 'ofd', 'market'],
    weeklyTactic: null,
    eventStrategy: 'cheapest',
  },
  {
    name: 'REPUTATION — service tactic always, кашерные выборы',
    initialServices: ['bank', 'ofd', 'fokus'],
    servicePlan: [{ atWeek: 5, service: 'elba' }],
    weeklyTactic: 'service',
    eventStrategy: 'cheapest',
  },
  {
    name: 'BURNOUT_RISK — aggressive каждую неделю, без отдыха',
    initialServices: ['bank', 'ofd', 'market'],
    weeklyTactic: 'aggressive',
    eventStrategy: 'cheapest',
    energyRestoreOverride: 25, // simulate exhausted owner with no investments
  },
  {
    name: 'CHAOS — random event picks, alternating tactics',
    initialServices: ['bank', 'ofd'],
    servicePlan: [{ atWeek: 4, service: 'market' }],
    weeklyTactic: (w) => (w % 3 === 0 ? 'aggressive' : w % 3 === 1 ? 'calm' : 'service'),
    eventStrategy: 'random',
  },
  {
    name: 'MIN_VIABLE — только Bank, никаких сервисов',
    initialServices: ['bank'],
    weeklyTactic: 'calm',
    eventStrategy: 'cheapest',
  },
]

// ─────────────────────────────────────────────────────────────────
// Vulnerability detector
// ─────────────────────────────────────────────────────────────────
interface Vulnerability {
  policy: string
  type: string
  detail: string
}

function detectVulnerabilities(results: RunResult[]): Vulnerability[] {
  const vulns: Vulnerability[] = []

  for (const r of results) {
    const last = r.rows[r.rows.length - 1]
    if (!last) continue

    // 1. Soft-lock: balance grows monotonically with no events / no risk
    const balances = r.rows.map(x => x.balance)
    const monotone = balances.every((v, i) => i === 0 || v >= balances[i - 1] - 1000)
    if (monotone && balances.length >= 30 && last.balance > 500_000) {
      vulns.push({
        policy: r.policy.name,
        type: 'TRIVIAL_GROWTH',
        detail: `Баланс рос монотонно ${balances.length} недель до ${last.balance.toLocaleString('ru')}₽ — нет реальных угроз`,
      })
    }

    // 2. Over-the-moon: > 5M balance in 52 weeks = exploitable
    if (last.balance > 5_000_000) {
      vulns.push({
        policy: r.policy.name,
        type: 'EXPLOIT_MONEY',
        detail: `Баланс ${last.balance.toLocaleString('ru')}₽ — экономика взломана`,
      })
    }

    // 3. Survival without any optional service
    if (r.policy.initialServices.length === 1 && r.ended === 'survived' && r.weeksSurvived >= 52) {
      vulns.push({
        policy: r.policy.name,
        type: 'TOO_FORGIVING',
        detail: `Минимальный набор сервисов выжил полный год — pain слишком мягкий`,
      })
    }

    // 4. Permanent rep-or-loyalty pinning at extreme
    const repAt100 = r.rows.filter(x => x.rep >= 99).length
    if (repAt100 > r.rows.length / 2) {
      vulns.push({
        policy: r.policy.name,
        type: 'REP_CEILING',
        detail: `Репутация прибита к 100 на ${repAt100}/${r.rows.length} недель — потолок не работает как ограничитель`,
      })
    }
    const loyAt100 = r.rows.filter(x => x.loy >= 99).length
    if (loyAt100 > r.rows.length / 2) {
      vulns.push({
        policy: r.policy.name,
        type: 'LOY_CEILING',
        detail: `Лояльность прибита к 100 на ${loyAt100}/${r.rows.length} недель`,
      })
    }

    // 5. Energy permanently low — would mean burnout in real game
    const lowEnergy = r.rows.filter(x => x.energy < 20).length
    if (lowEnergy > r.rows.length / 3 && r.ended === 'survived') {
      vulns.push({
        policy: r.policy.name,
        type: 'BURNOUT_ESCAPE',
        detail: `Энергия < 20 в ${lowEnergy}/${r.rows.length} недель, но игрок выжил — burnout-механика не кусает`,
      })
    }

    // 6. Pain stays at 0 even without services — pain engine asleep
    const totalPain = r.rows.reduce((s, x) => s + x.painTotal, 0)
    const hasOptionalServiceGap =
      !r.policy.initialServices.includes('market') ||
      !r.policy.initialServices.includes('extern')
    if (hasOptionalServiceGap && totalPain < 10_000 && r.weeksSurvived >= 30) {
      vulns.push({
        policy: r.policy.name,
        type: 'PAIN_TOO_SOFT',
        detail: `Сервисы не куплены, но pain за ${r.weeksSurvived} недель = ${totalPain.toLocaleString('ru')}₽`,
      })
    }

    // 7. Bankruptcy in <5 weeks = unfair start
    if (r.ended === 'bankruptcy' && r.weeksSurvived < 5) {
      vulns.push({
        policy: r.policy.name,
        type: 'EARLY_DEATH',
        detail: `Банкротство на неделе ${r.weeksSurvived} — стартовая полоса слишком жёсткая`,
      })
    }

    // 8. Crisis events never fired
    const triggeredCrisis = r.finalState.triggeredEventIds.filter(id => id.startsWith('CRISIS_'))
    if (last.balance > 400_000 && triggeredCrisis.length === 0 && r.weeksSurvived > 25) {
      vulns.push({
        policy: r.policy.name,
        type: 'CRISIS_DORMANT',
        detail: `Баланс ${last.balance.toLocaleString('ru')}₽ к неделе ${r.weeksSurvived}, ни один CRISIS_* не сработал — пороги/randomChance слишком жёсткие`,
      })
    }
  }

  // 9. Active strategies should outperform passive — flag if not
  const activeResults = results.filter(r => {
    const t = r.policy.weeklyTactic
    return t !== null && typeof t !== 'function'
  })
  const passiveResults = results.filter(r => r.policy.weeklyTactic === null)
  if (passiveResults.length && activeResults.length) {
    const bestPassive = Math.max(...passiveResults.map(r => r.rows[r.rows.length - 1]?.balance ?? 0))
    const bestActive = Math.max(...activeResults.map(r => r.rows[r.rows.length - 1]?.balance ?? 0))
    if (bestPassive > bestActive) {
      vulns.push({
        policy: 'meta',
        type: 'PASSIVE_BEATS_ACTIVE',
        detail: `Лучший пассивный (${bestPassive.toLocaleString('ru')}₽) > лучший активный (${bestActive.toLocaleString('ru')}₽). Тактика недели не вознаграждает игрока за участие.`,
      })
    }
  }

  // 10. Aggressive tactic + low-energy systems = burnout trap
  for (const r of results) {
    if (r.policy.weeklyTactic === 'aggressive' && r.ended === 'burnout') {
      vulns.push({
        policy: r.policy.name,
        type: 'AGGRESSIVE_TRAP',
        detail: `Тактика 'aggressive' (-3 энергии/день) надёжно ведёт в burnout (${r.weeksSurvived} нед.). Без owner investments игрок не может её держать дольше 5-11 недель.`,
      })
    }
  }

  // 11. Crisis events never fired across any run
  const allCrisis = results.flatMap(r =>
    r.finalState.triggeredEventIds.filter(id => id.startsWith('CRISIS_'))
  )
  if (allCrisis.length === 0) {
    vulns.push({
      policy: 'meta',
      type: 'CRISIS_NEVER_FIRES',
      detail: `Ни в одном из ${results.length} прогонов не сработало ни одно CRISIS_* событие. Пороги (balanceMin/weekMin/loyaltyMin) или randomChance слишком жёсткие.`,
    })
  } else {
    const summary = Array.from(new Set(allCrisis)).join(', ')
    console.log(`\nCRISIS events fired across runs: ${summary} (${allCrisis.length} total)`)
  }

  return vulns
}

// ─────────────────────────────────────────────────────────────────
// Pretty-printing
// ─────────────────────────────────────────────────────────────────
function summarize(r: RunResult): void {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`▶ ${r.policy.name}`)
  console.log(`  Итог: ${r.ended.toUpperCase()} на неделе ${r.weeksSurvived}`)
  if (!r.rows.length) return

  // Print every 4th week
  const samples = r.rows.filter((_, i) => i % 4 === 0 || i === r.rows.length - 1)
  console.log('  Wk  Balance     Net      Rep  Loy  Eng  Svcs Ev')
  for (const x of samples) {
    console.log(
      `  ${String(x.week).padStart(2)}` +
      ` ${String(x.balance).padStart(9)}` +
      ` ${String(x.net).padStart(7)}` +
      ` ${String(x.rep).padStart(4)}` +
      ` ${String(x.loy).padStart(4)}` +
      ` ${String(x.energy).padStart(4)}` +
      ` ${String(x.serviceCount).padStart(4)}` +
      ` ${String(x.events).padStart(2)}`
    )
  }

  const last = r.rows[r.rows.length - 1]
  const totalPain = r.rows.reduce((s, x) => s + x.painTotal, 0)
  console.log(`  Финал: balance=${last.balance.toLocaleString('ru')}₽` +
    ` rep=${last.rep} loy=${last.loy}` +
    ` painЗаПрогон=${totalPain.toLocaleString('ru')}₽`)
}

// ─────────────────────────────────────────────────────────────────
describe('Player-style stress test (informational)', () => {
  it('runs all policies and reports vulnerabilities', () => {
    const results = POLICIES.map(p => runSimulation(p, 52))
    results.forEach(summarize)

    const vulns = detectVulnerabilities(results)

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`🔍 ВЫЯВЛЕННЫЕ УЯЗВИМОСТИ (${vulns.length}):`)
    if (!vulns.length) {
      console.log('  Ничего критичного не найдено в этом прогоне.')
    } else {
      for (const v of vulns) {
        console.log(`  [${v.type}] ${v.policy}`)
        console.log(`    ${v.detail}`)
      }
    }
    console.log('')
  })
})
