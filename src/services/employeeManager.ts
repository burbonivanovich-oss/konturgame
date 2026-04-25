import type { GameState, Employee } from '../types/game'
import { getTotalEmployeeEfficiency, getTotalEmployeeSalary, getTotalEmployeeEnergyCost } from '../constants/employees'
import { UPGRADES_CONFIG } from '../constants/business'

export function initializeEmployees(): Employee[] {
  return []
}

export function getEmployeeCapacityBonus(state: GameState): number {
  if (state.employees.length === 0) return 0
  return getTotalEmployeeEfficiency(state.employees)
}

// 1/4 of monthly per week
export function getWeeklySalaryCost(state: GameState): number {
  return Math.round(getTotalEmployeeSalary(state.employees) / 4)
}

// Base operational stress + employee management + solo penalty
export function getWeeklyEnergyCost(state: GameState): number {
  const baseCost = 20
  const employeeCost = getTotalEmployeeEnergyCost(state.employees)
  const understaffPenalty = state.employees.length === 0 ? 15 : 0
  return baseCost + employeeCost + understaffPenalty
}

export function getUpgradeEnergyBonus(state: GameState): number {
  if (!state.purchasedUpgrades || state.purchasedUpgrades.length === 0) return 0
  const upgrades = UPGRADES_CONFIG[state.businessType] ?? []
  return upgrades.reduce((total: number, upgrade: any) => {
    if (state.purchasedUpgrades.includes(upgrade.id) && upgrade.energyBonus) {
      return total + upgrade.energyBonus
    }
    return total
  }, 0)
}
