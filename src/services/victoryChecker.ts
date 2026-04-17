import type { GameState, ServiceType } from '../types/game'
import { ECONOMY_CONSTANTS } from '../constants/business'

const ALL_SERVICES: ServiceType[] = ['market', 'bank', 'ofd', 'diadoc', 'fokus', 'elba', 'extern']

export function checkBankruptcy(state: GameState): boolean {
  return state.balance < 0
}

export function checkReputationLoss(state: GameState): boolean {
  return (
    state.reputation === 0 &&
    (state.daysReputationZero ?? 0) >= ECONOMY_CONSTANTS.REPUTATION_ZERO_DAYS_FOR_LOSS
  )
}

export function getAllServicesActive(state: GameState): boolean {
  if (!state.services) return false
  return ALL_SERVICES.every((id) => state.services[id]?.isActive === true)
}

export function getVictoryStatus(state: GameState): Record<string, boolean> {
  const dailyProfit = state.lastDayResult?.netProfit ?? 0

  return {
    dailyProfitReached: dailyProfit >= ECONOMY_CONSTANTS.VICTORY_DAILY_PROFIT,
    balanceReached: state.balance >= ECONOMY_CONSTANTS.VICTORY_BALANCE,
    allServicesConnected: getAllServicesActive(state),
    levelReached: state.level >= ECONOMY_CONSTANTS.VICTORY_LEVEL,
    achievementsReached:
      (state.achievements?.length ?? 0) >= ECONOMY_CONSTANTS.VICTORY_ACHIEVEMENTS,
  }
}

export function checkVictory(state: GameState): boolean {
  const status = getVictoryStatus(state)
  return Object.values(status).every(Boolean)
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
