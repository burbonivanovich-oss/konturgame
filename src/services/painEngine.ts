import type { GameState, PainLossRecord } from '../types/game'
import { BANK_PAYMENT_RATIO } from '../constants/gameBalance'

/**
 * Pain Engine retired (step 6 of the year-as-finale refit). The daily
 * drip of «вы потеряли 340 ₽ потому что нет ОФД» pulled the player's
 * attention into background optimisation that nobody enjoyed. The pain
 * is now narrative: a small set of crisis events (OFD_FINE01,
 * MARKET_STOCKOUT, PAIN_DIADOC/FOKUS/ELBA/EXTERN) fires occasionally
 * if a service stays inactive past the first-encounter window. One
 * sharp punishment every now and then beats a continuous trickle.
 *
 * The function still returns the PainLossRecord shape so callers don't
 * break — all fields are zero. The structural bank ratio
 * (getBankPaymentRatio) is kept, since it's just how revenue is
 * computed when no card payments are accepted, not a pain signal.
 */
export function calculatePainLosses(
  _state: GameState,
  _revenue: number,
  _profit: number,
  _totalCategoryRevenue: number,
): PainLossRecord {
  return { bank: 0, market: 0, ofd: 0, diadoc: 0, fokus: 0, elba: 0, extern: 0, total: 0 }
}

export function getBankPaymentRatio(state: GameState): number {
  return state.services?.bank?.isActive
    ? BANK_PAYMENT_RATIO.WITH_BANK
    : BANK_PAYMENT_RATIO.WITHOUT_BANK
}
