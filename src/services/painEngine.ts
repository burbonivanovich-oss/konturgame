import type { GameState, PainLossRecord } from '../types/game'

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

  // Bank: 40% клиентов не могут платить без безнала — учтено в bankPaymentRatio
  const bank = 0

  // Market: 8% потери от ошибок ручного учёта
  const market = hasMarket ? 0 : Math.round(totalCategoryRevenue * 0.08)

  // OFD: ~10% шанс штрафа в день = 15% от выручки
  let ofd = 0
  if (!hasOfd && Math.random() < 0.1) {
    ofd = Math.round(revenue * 0.15)
  }

  // Diadoc: ~10% шанс задержки поставки = 2% выручки (раньше day % 10)
  const diadoc = !hasDiadoc && Math.random() < 0.1
    ? Math.round(revenue * 0.02)
    : 0

  // Fokus: ~6% шанс плохого поставщика = 5-10% баланса (раньше day % 17)
  let fokus = 0
  if (!hasFokus && Math.random() < 1 / 17) {
    const riskPct = 0.05 + Math.random() * 0.05
    fokus = Math.round(state.balance * riskPct)
  }

  // Elba: ~4% шанс штрафа за декларацию = 15% прибыли (раньше day % 25)
  const elba = !hasElba && Math.random() < 1 / 25 && profit > 0
    ? Math.round(profit * 0.15)
    : 0

  // Extern: ~3% шанс блокировки счёта = 2 дня выручки, но не более 25% баланса (раньше day % 31)
  let extern = 0
  if (!hasExtern && Math.random() < 1 / 31) {
    const rawDamage = Math.round(revenue * 2)
    extern = Math.min(rawDamage, Math.round(state.balance * 0.25))
  }

  const total = bank + market + ofd + diadoc + fokus + elba + extern

  return { bank, market, ofd, diadoc, fokus, elba, extern, total }
}

export function getBankPaymentRatio(state: GameState): number {
  return state.services?.bank?.isActive ? 1.0 : 0.6
}
