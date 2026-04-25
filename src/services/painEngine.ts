import type { GameState, PainLossRecord, ServiceType } from '../types/game'
import { PAIN_LOSSES, BANK_PAYMENT_RATIO } from '../constants/gameBalance'

export function calculatePainLosses(
  state: GameState,
  revenue: number,
  profit: number,
  totalCategoryRevenue: number,
): PainLossRecord {
  const hasMarket = state.services?.market?.isActive ?? false
  const hasOfd = state.services?.ofd?.isActive ?? false
  const hasDiadoc = state.services?.diadoc?.isActive ?? false
  const hasFokus = state.services?.fokus?.isActive ?? false
  const hasElba = state.services?.elba?.isActive ?? false
  const hasExtern = state.services?.extern?.isActive ?? false

  // Only penalise for services the player already knows about (in unlockedServices).
  // A service that hasn't appeared in onboarding yet can't cause "mysterious" losses.
  const unlocked = new Set<ServiceType>(
    state.onboardingCompleted
      ? ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern']
      : (state.unlockedServices ?? []),
  )

  // Bank: 40% клиентов не могут платить без безнала — учтено в bankPaymentRatio
  const bank = 0

  // Market: потери от ошибок ручного учёта
  const market = hasMarket || !unlocked.has('market')
    ? 0
    : Math.round(totalCategoryRevenue * PAIN_LOSSES.MARKET.revenueRate)

  // OFD: шанс штрафа в день
  let ofd = 0
  if (!hasOfd && unlocked.has('ofd') && Math.random() < PAIN_LOSSES.OFD.dailyChance) {
    ofd = Math.round(revenue * PAIN_LOSSES.OFD.revenueRate)
  }

  // Diadoc: шанс задержки поставки
  const diadoc = !hasDiadoc && unlocked.has('diadoc') && Math.random() < PAIN_LOSSES.DIADOC.dailyChance
    ? Math.round(revenue * PAIN_LOSSES.DIADOC.revenueRate)
    : 0

  // Fokus: шанс плохого поставщика — % от баланса
  let fokus = 0
  if (!hasFokus && unlocked.has('fokus') && Math.random() < PAIN_LOSSES.FOKUS.dailyChance) {
    const range = PAIN_LOSSES.FOKUS.maxBalanceRate - PAIN_LOSSES.FOKUS.minBalanceRate
    const riskPct = PAIN_LOSSES.FOKUS.minBalanceRate + Math.random() * range
    fokus = Math.round(state.balance * riskPct)
  }

  // Elba: шанс штрафа за декларацию (только если есть прибыль)
  const elba = !hasElba && unlocked.has('elba') && Math.random() < PAIN_LOSSES.ELBA.dailyChance && profit > 0
    ? Math.round(profit * PAIN_LOSSES.ELBA.profitRate)
    : 0

  // Extern: шанс блокировки счёта — N дней выручки, но не больше X% баланса
  let extern = 0
  if (!hasExtern && unlocked.has('extern') && Math.random() < PAIN_LOSSES.EXTERN.dailyChance) {
    const rawDamage = Math.round(revenue * PAIN_LOSSES.EXTERN.revenueDaysOfDamage)
    extern = Math.min(rawDamage, Math.round(state.balance * PAIN_LOSSES.EXTERN.maxBalancePct))
  }

  const total = bank + market + ofd + diadoc + fokus + elba + extern

  return { bank, market, ofd, diadoc, fokus, elba, extern, total }
}

export function getBankPaymentRatio(state: GameState): number {
  return state.services?.bank?.isActive
    ? BANK_PAYMENT_RATIO.WITH_BANK
    : BANK_PAYMENT_RATIO.WITHOUT_BANK
}
