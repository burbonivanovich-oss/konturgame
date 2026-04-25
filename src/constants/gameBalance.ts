/**
 * Centralized game balance constants — values previously hardcoded across
 * weekCalculator, economyEngine, and painEngine. Adjusting these tunes the
 * difficulty curve without touching service code.
 */

// Entrepreneur energy: thresholds at which low-energy revenue penalties kick in
export const ENERGY_THRESHOLDS = {
  CRITICAL: 30,
  TIRED: 60,
} as const

export const ENERGY_REVENUE_MULTIPLIER = {
  CRITICAL: 0.8,
  TIRED: 0.9,
  NORMAL: 1.0,
} as const

// Loyalty thresholds that affect daily capacity
export const LOYALTY_CAPACITY_THRESHOLDS = {
  HIGH: 80,
  LOW: 30,
} as const

export const LOYALTY_CAPACITY_MODIFIER = {
  HIGH_BONUS: 0.1,
  LOW_PENALTY: 0.15,
} as const

// Reputation loss per missed (not served) client per day
export const REPUTATION_LOSS_PER_MISSED_CLIENT = 0.2

// Register breakdown penalty as a fraction of daily revenue
export const REGISTER_BREAKDOWN_PENALTY_RATE = 0.15

// Elba softens the overload-loyalty penalty by this factor (0.5 = half)
export const ELBA_LOYALTY_PENALTY_REDUCTION = 0.5

// Competitor event cadence: weeks between attempts grows with player progress
export const COMPETITOR_CYCLE = {
  BASE_INTERVAL_WEEKS: 5,
  WEEK_DIVISOR: 10,
} as const

// "Saved by Контур" widget — value attributed to active services per week
export const SERVICE_SAVINGS_RATES = {
  MARKET_REVENUE_PROTECTION: 0.08,
  ELBA_PROFIT_PROTECTION: 0.15,
  ELBA_WEEKLY_CHANCE: 7 / 25,
  EXTERN_REVENUE_DAYS: 2,
  EXTERN_WEEKLY_CHANCE: 7 / 31,
} as const

// Daily losses applied when a service is missing AND its onboarding has been
// unlocked. These are the "pain" the player feels for skipping a service.
//
// Calibration philosophy (v5.5): services should make life EASIER, not be
// mandatory taxes. Bank and OFD remain "real-life mandatory" — Bank via
// payment ratio (40% can't pay cash), OFD by frequent fines (online-cash-
// register law). The other five (Market / Diadoc / Fokus / Elba / Extern)
// are softened so that a careful player can survive without them, just at
// noticeable cost.
export const PAIN_LOSSES = {
  MARKET: {
    // Manual inventory accounting still leaks revenue, but at half the
    // previous rate (8% → 4%). Service ROI now ~10 weeks instead of 4.
    revenueRate: 0.04,
  },
  OFD: {
    // Mandatory by law — kept punishing.
    dailyChance: 0.10,
    revenueRate: 0.15,
  },
  DIADOC: {
    // Was already small; nudged down further.
    dailyChance: 0.08,
    revenueRate: 0.02,
  },
  FOKUS: {
    // Bad-supplier risk: rarer (1/22 vs 1/17) and smaller hits (3-6% vs 5-10%).
    dailyChance: 1 / 22,
    minBalanceRate: 0.03,
    maxBalanceRate: 0.06,
  },
  ELBA: {
    // Tax-mistake fines: rarer (1/30 vs 1/25), 10% of profit vs 15%.
    dailyChance: 1 / 30,
    profitRate: 0.10,
  },
  EXTERN: {
    // Account block: was a 25%-of-balance one-shot kill. Now 1 day of
    // revenue capped at 10% of balance — still painful, no longer fatal.
    dailyChance: 1 / 35,
    revenueDaysOfDamage: 1,
    maxBalancePct: 0.10,
  },
} as const

// Bank: payment ratio when bank service is inactive (40% of clients can't pay cashless)
export const BANK_PAYMENT_RATIO = {
  WITH_BANK: 1.0,
  WITHOUT_BANK: 0.6,
} as const
