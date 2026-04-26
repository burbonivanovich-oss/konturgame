import type { GameState, PainLossRecord } from '../types/game'
import { BANK_PAYMENT_RATIO } from '../constants/gameBalance'

// Pain engine zeroed-out (was: invisible daily fines for missing services).
// The "without service X you silently lose money" model was opaque — the
// player saw "−15K from missing Market" in the week summary but never knew
// when/why it triggered. Replaced by:
//   1. Bundle bonus (3+/5+/7 services = visible revenue %)
//   2. Categories that REQUIRE specific services + equipment to unlock
//   3. Direct service effects (Market = +20% capacity, etc.) shown on activation
// Plus discrete events ("внеплановая проверка ФНС") that simulate concrete
// risks of missing OFD/Extern as visible negative consequences.
//
// File kept (and function signature preserved) for save compat and analytics
// wiring. All values return 0 now.

export function calculatePainLosses(
  _state: GameState,
  _revenue: number,
  _profit: number,
  _totalCategoryRevenue: number,
): PainLossRecord {
  return { bank: 0, market: 0, ofd: 0, diadoc: 0, fokus: 0, elba: 0, extern: 0, total: 0 }
}

// This one stays — it's the legitimate "no bank → 40% of clients can't pay
// cashless" math, which is the visible Bank service value (a percentage of
// served clients pays via the bank channel). Kept distinct from pain.
export function getBankPaymentRatio(state: GameState): number {
  return state.services?.bank?.isActive
    ? BANK_PAYMENT_RATIO.WITH_BANK
    : BANK_PAYMENT_RATIO.WITHOUT_BANK
}
