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

// Reputation thresholds that affect daily capacity.
// Раньше это были loyalty-пороги; лояльность как скаляр выпилена,
// эффекты переадресованы в репутацию.
export const REPUTATION_CAPACITY_THRESHOLDS = {
  HIGH: 80,
  LOW: 30,
} as const

export const REPUTATION_CAPACITY_MODIFIER = {
  HIGH_BONUS: 0.1,
  LOW_PENALTY: 0.15,
} as const

// Reputation loss per missed (not served) client per day
export const REPUTATION_LOSS_PER_MISSED_CLIENT = 0.2

// ELBA_LOYALTY_PENALTY_REDUCTION удалён вместе с лояльностью — теперь
// смягчение rep-штрафа в weekCalculator зашито инлайн (×0.5).

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

// PAIN_LOSSES константа удалена в Спринт 6 как dead code. painEngine
// возвращает нули (retired в 5d), UI хинты на карточках сервисов
// захардкожены текстом в DesktopKontur.tsx. Никто этот объект не читал.

// Bank: payment ratio when bank service is inactive.
// Спринт 5b: 0.75 → 0.70. Без эквайринга 30% клиентов уходят.
// Это «тяжело без банка», но по-прежнему играбельно. 0.75 был слишком
// мягким — без сервисов выигрывалось как с ними.
export const BANK_PAYMENT_RATIO = {
  WITH_BANK: 1.0,
  WITHOUT_BANK: 0.70,
} as const
