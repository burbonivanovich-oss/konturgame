import type { GameState, ServiceType } from '../types/game'
import { ECONOMY_CONSTANTS } from '../constants/business'

// Спринт 5e: Экстерн скрыт из UI, combined-победа требует 6 сервисов, не 7.
const ALL_SERVICES: ServiceType[] = ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba']

export function checkBankruptcy(state: GameState): boolean {
  // Bankruptcy after 3 consecutive weeks with negative balance
  return (state.daysBalanceNegative ?? 0) >= ECONOMY_CONSTANTS.WEEKS_BALANCE_NEGATIVE_FOR_GAMEOVER
}

export function checkReputationLoss(state: GameState): boolean {
  return (
    state.reputation === 0 &&
    (state.daysReputationZero ?? 0) >= ECONOMY_CONSTANTS.REPUTATION_ZERO_WEEKS_FOR_LOSS
  )
}

export function getAllServicesActive(state: GameState): boolean {
  if (!state.services) return false
  return ALL_SERVICES.every((id) => state.services[id]?.isActive === true)
}

export function getVictoryStatus(state: GameState): Record<string, boolean> {
  const weeklyProfit = state.lastDayResult?.netProfit ?? 0
  const isYearOne = state.currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR

  return {
    weeklyProfitReached: weeklyProfit >= ECONOMY_CONSTANTS.VICTORY_WEEKLY_PROFIT,
    balanceReached: state.balance >= ECONOMY_CONSTANTS.VICTORY_BALANCE,
    allServicesConnected: getAllServicesActive(state),
    // Раньше: level >= 10. Player level удалён в Спринте 4. Теперь критерий —
    // достичь tier 3 (премиум-формат). Маркер «бизнес вырос», как и должно
    // быть в combined-победе.
    tierReached: (state.businessTier ?? 1) >= 3,
    achievementsReached: (state.achievements?.length ?? 0) >= ECONOMY_CONSTANTS.VICTORY_ACHIEVEMENTS,
    yearOneComplete: isYearOne,  // Survived full year!
  }
}

export function checkVictory(state: GameState): boolean {
  return resolveVictoryType(state) !== null
}

export function updateGameOverCounters(state: GameState): void {
  if (state.reputation === 0) {
    state.daysReputationZero = (state.daysReputationZero ?? 0) + 1
  } else {
    state.daysReputationZero = 0
  }
}

// getLevelForExperience удалена — система player level/experience
// удалена в Спринте 4. Прогрессия теперь только: неделя 1-52 +
// businessTier 1→2→3 + onboardingStage 0→4.

export type VictoryType = 'year_one' | 'combined'

// Спринт 5e: пороги year_one ужесточены — раньше «дожил с balance > 0»
// автоматически делал победителем, что обесценивало достижение.
// Теперь требуется balance > 200К ₽ И reputation > 50 — нормально закончил
// год, не «протянул на нуле». Personal goal (1М) — отдельный трек, который
// игрок видит как «главную ставку».
const YEAR_ONE_MIN_BALANCE = 200000
const YEAR_ONE_MIN_REPUTATION = 50

// Returns HOW the player won, or null if no victory condition is met.
// 'combined' = все 5 не-year условий выполнены до W52 (главный путь к
//              «полной» победе). Требует: 800К ₽, 30К/нед прибыли,
//              6 сервисов, tier 3, 7 достижений.
// 'year_one' = достойно закончил год (>200К balance, >50 reputation).
export function resolveVictoryType(state: GameState): VictoryType | null {
  const status = getVictoryStatus(state)
  const combinedMet = status.weeklyProfitReached
    && status.balanceReached
    && status.allServicesConnected
    && status.tierReached
    && status.achievementsReached
  if (combinedMet) return 'combined'
  if (
    status.yearOneComplete &&
    state.balance >= YEAR_ONE_MIN_BALANCE &&
    state.reputation >= YEAR_ONE_MIN_REPUTATION
  ) return 'year_one'
  return null
}
