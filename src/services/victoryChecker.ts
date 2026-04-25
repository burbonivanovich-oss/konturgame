import type { GameState, ServiceType } from '../types/game'
import { ECONOMY_CONSTANTS } from '../constants/business'

const ALL_SERVICES: ServiceType[] = ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern']

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
    levelReached: state.level >= ECONOMY_CONSTANTS.VICTORY_LEVEL,
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

export function getLevelForExperience(experience: number): number {
  // Levels 1-10: original thresholds preserved (no regression for existing saves).
  // Levels 11-15: extended post-endgame progression to fill the mid-game desert
  // between week 20 (level 10 cap under old system) and week 52 (year end).
  const LEVEL_THRESHOLDS = [
    0, 100, 200, 350, 500, 650, 750, 850, 930, 1000,  // levels 1-10
    1120, 1270, 1450, 1660, 1900,                      // levels 11-15
  ]
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    }
  }
  return Math.min(level, 15)
}

export type VictoryType = 'year_one' | 'combined'

// Returns HOW the player won, or null if no victory condition is met.
// 'combined' = all 5 non-year conditions met before week 52 (harder path).
// 'year_one' = survived the full year with positive balance and reputation.
export function resolveVictoryType(state: GameState): VictoryType | null {
  const status = getVictoryStatus(state)
  const combinedMet = status.weeklyProfitReached
    && status.balanceReached
    && status.allServicesConnected
    && status.levelReached
    && status.achievementsReached
  if (combinedMet) return 'combined'
  if (status.yearOneComplete && state.balance > 0 && state.reputation > 0) return 'year_one'
  return null
}
