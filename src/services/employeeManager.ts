import type { GameState, Employee } from '../types/game'
import { getTotalEmployeeEfficiency, getTotalEmployeeSalary, getTotalEmployeeEnergyCost } from '../constants/employees'
import { UPGRADES_CONFIG } from '../constants/business'

export function initializeEmployees(): Employee[] {
  return []
}

// Спринт 5e: менеджер (position 'manager') усиливает команду.
// Двухуровневый буст — управленец особенно хорошо раскрывает специалистов
// (опытных профи), потому что разгружает их от рутины и админа. Обычные
// помощники (assistant) тоже получают буст, но скромнее.
// Это делает «профи + Светлана» особо сильной комбинацией:
//   Алла/Сергей/Лариса eff 1.2 → 1.2 × 1.40 = 1.68
//   Студент Никита     eff 0.85→1.05 → ×1.25 = 1.06→1.31
const MANAGER_BOOST_DEFAULT = 0.25
const MANAGER_BOOST_SPECIALIST = 0.40

export function hasManager(state: GameState): boolean {
  return state.employees.some(e => e.position === 'manager')
}

// Штраф для тех, кто плохо переносит управленца (например, Олег без
// энтузиазма): -10% к их эффективности когда в команде есть менеджер.
const MANAGER_DISLIKE_PENALTY = 0.10

export function getEmployeeCapacityBonus(state: GameState): number {
  if (state.employees.length === 0) return 0
  if (!hasManager(state)) {
    return getTotalEmployeeEfficiency(state.employees)
  }
  let total = 0
  for (const emp of state.employees) {
    if (emp.position === 'manager') {
      total += emp.efficiency
    } else if (emp.dislikesManager) {
      // Олег: «начальство — это лишний контроль и больше работы»
      total += emp.efficiency * (1 - MANAGER_DISLIKE_PENALTY)
    } else if (emp.position === 'specialist') {
      total += emp.efficiency * (1 + MANAGER_BOOST_SPECIALIST)
    } else {
      total += emp.efficiency * (1 + MANAGER_BOOST_DEFAULT)
    }
  }
  return total
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

// Спринт 5e: динамика эффективности — раз в неделю каждый сотрудник с
// growthRate сдвигается к своему growthLimit. Студент учится (растёт от 0.85
// к 1.05), Олег халтурит (падает с 1.0 к 0.9). Стабильные сотрудники
// (родственник, профи, Светлана) не имеют growthRate — их eff неизменна.
export function updateEmployeeGrowth(state: GameState): void {
  if (!state.employees || state.employees.length === 0) return
  const managerPresent = hasManager(state)
  for (const emp of state.employees) {
    if (!emp.growthRate) continue
    // Олег под менеджером — отрицательный growthRate удваивается, и
    // используется более низкий пол (growthLimitUnderManager)
    let rate = emp.growthRate
    let limit = emp.growthLimit
    if (emp.dislikesManager && managerPresent) {
      if (rate < 0) rate *= 2
      if (emp.growthLimitUnderManager !== undefined) {
        limit = emp.growthLimitUnderManager
      }
    }
    const next = emp.efficiency + rate
    if (limit !== undefined) {
      emp.efficiency = rate > 0
        ? Math.min(limit, next)
        : Math.max(limit, next)
    } else {
      emp.efficiency = next
    }
    emp.efficiency = Math.max(0.5, Math.min(1.6, emp.efficiency))
  }
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
