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

// Base operational stress + employee management + solo penalty.
// Кафе — самый выматывающий бизнес (горячий цех, длинный день, большая
// текучка): +7 к базовой стоимости — solo+aggressive в общепите
// рискуют выгореть к W12-16 без апгрейдов и сотрудников.
// Магазин и салон — стандартные 20.
const BASE_ENERGY_COST_BY_BUSINESS: Record<string, number> = {
  shop: 20,
  cafe: 27,
  'beauty-salon': 20,
}

export function getWeeklyEnergyCost(state: GameState): number {
  const baseCost = BASE_ENERGY_COST_BY_BUSINESS[state.businessType] ?? 20
  const employeeCost = getTotalEmployeeEnergyCost(state.employees)
  // Solo penalty 15: один на хозяйстве — повышенный риск выгорания при
  // aggressive-тактике, особенно в общепите. Найм первого сотрудника
  // полностью снимает штраф.
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
