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
export const PAIN_LOSSES = {
  MARKET: {
    revenueRate: 0.08,
  },
  OFD: {
    dailyChance: 0.10,
    revenueRate: 0.15,
  },
  DIADOC: {
    dailyChance: 0.10,
    revenueRate: 0.02,
  },
  FOKUS: {
    dailyChance: 1 / 17,
    minBalanceRate: 0.05,
    maxBalanceRate: 0.10,
  },
  ELBA: {
    dailyChance: 1 / 25,
    profitRate: 0.15,
  },
  EXTERN: {
    dailyChance: 1 / 31,
    revenueDaysOfDamage: 2,
    maxBalancePct: 0.25,
  },
} as const

// Bank: payment ratio when bank service is inactive (40% of clients can't pay cashless)
export const BANK_PAYMENT_RATIO = {
  WITH_BANK: 1.0,
  WITHOUT_BANK: 0.6,
} as const
