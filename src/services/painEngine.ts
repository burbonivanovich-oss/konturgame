import type { GameState, PainLossRecord } from '../types/game'

export function calculatePainLosses(
  state: GameState,
  revenue: number,
  profit: number,
  totalCategoryRevenue: number,
): PainLossRecord {
  const day = (state.currentWeek * 7 + state.dayOfWeek)
  const hasBank = state.services?.bank?.isActive ?? false
  const hasMarket = state.services?.market?.isActive ?? false
  const hasOfd = state.services?.ofd?.isActive ?? false
  const hasDiadoc = state.services?.diadoc?.isActive ?? false
  const hasFokus = state.services?.fokus?.isActive ?? false
  const hasElba = state.services?.elba?.isActive ?? false
  const hasExtern = state.services?.extern?.isActive ?? false

  // Bank: 40% клиентов не могут платить без безнала
  // Учтено в bankPaymentRatio в dayCalculator, здесь записываем для отображения
  const bank = hasBank ? 0 : Math.round(revenue * 0.4)

  // Market: 8% потери от ошибок ручного учёта
  const market = hasMarket ? 0 : Math.round(totalCategoryRevenue * 0.08)

  // OFD: 10% шанс штрафа = 15% от выручки
  let ofd = 0
  if (!hasOfd && Math.random() < 0.1) {
    ofd = Math.round(revenue * 0.15)
  }

  // Diadoc: каждые 10 дней задержка поставки → 2% от выручки
  const diadoc = !hasDiadoc && day % 10 === 0
    ? Math.round(revenue * 0.02)
    : 0

  // Fokus: каждые 15 дней плохой поставщик → 5-10% баланса
  let fokus = 0
  if (!hasFokus && day % 15 === 0) {
    const riskPct = 0.05 + Math.random() * 0.05
    fokus = Math.round(state.balance * riskPct)
  }

  // Elba: каждые 25 дней штраф за ошибки в декларации → 15% прибыли
  const elba = !hasElba && day % 25 === 0 && profit > 0
    ? Math.round(profit * 0.15)
    : 0

  // Extern: каждые 30 дней блокировка счёта → 2 дня выручки
  const avgDayRevenue = revenue
  const extern = !hasExtern && day % 30 === 0
    ? Math.round(avgDayRevenue * 2)
    : 0

  const total = bank + market + ofd + diadoc + fokus + elba + extern

  return { bank, market, ofd, diadoc, fokus, elba, extern, total }
}

export function getBankPaymentRatio(state: GameState): number {
  return state.services?.bank?.isActive ? 1.0 : 0.6
}
