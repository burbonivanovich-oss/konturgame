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
  const status = getVictoryStatus(state)
  // Need to survive a year OR meet all other conditions
  if (status.yearOneComplete) {
    return (state.balance > 0 && state.reputation > 0)  // Just surviving year 1 is a win
  }
  return Object.values(status).slice(0, -1).every(Boolean)  // Other conditions
}

export function updateGameOverCounters(state: GameState): void {
  if (state.reputation === 0) {
    state.daysReputationZero = (state.daysReputationZero ?? 0) + 1
  } else {
    state.daysReputationZero = 0
  }
}

export function getLevelForExperience(experience: number): number {
  const LEVEL_THRESHOLDS = [0, 100, 200, 350, 500, 650, 750, 850, 930, 1000]
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    }
  }
  return Math.min(level, 10)
}
