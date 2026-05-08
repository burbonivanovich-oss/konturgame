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
// Дифференцированная стоимость по типу бизнеса:
//   • Кафе (27) — самый выматывающий: горячий цех, длинный день, текучка.
//     Solo+aggressive в общепите выгорает к W11-16.
//   • Магазин (21) — стоячая работа, монотонная нагрузка, поток
//     покупателей. Solo+aggressive без энерго-апгрейдов рискует выгореть
//     к W16-20; POS-терминал, расширение зала и т.д. снимают риск.
//   • Салон (20) — самый «спокойный» ритм, выгорание возможно только
//     при упорной работе solo+aggressive до конца года.
const BASE_ENERGY_COST_BY_BUSINESS: Record<string, number> = {
  shop: 21,
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
