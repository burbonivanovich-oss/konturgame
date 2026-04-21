import type { GameState, Employee, EmployeePosition } from '../types/game'
import { createEmployee, getTotalEmployeeEfficiency, getTotalEmployeeSalary, getTotalEmployeeEnergyCost } from '../constants/employees'
import { UPGRADES_CONFIG } from '../constants/business'

/**
 * Initialize employees for a new game (start with no employees)
 */
export function initializeEmployees(): Employee[] {
  return []
}

/**
 * Hire a new employee
 */
export function hireEmployee(
  state: GameState,
  position: EmployeePosition,
  efficiencyOverride?: number
): Employee | null {
  // Check if player can afford first month salary
  const baseSalary = getBaseSalaryForPosition(position)
  if (state.balance < baseSalary) {
    return null
  }
  
  // Check energy cost - can player manage this employee?
  const energyCost = getEnergyCostForPosition(position)
  if (state.entrepreneurEnergy < energyCost * 2) {
    // Not enough energy to manage properly
    return null
  }
  
  const currentDay = state.currentWeek * 7 + state.dayOfWeek
  const employee = createEmployee(position, currentDay, efficiencyOverride)
  
  // Deduct first month salary
  state.balance -= baseSalary
  
  state.employees.push(employee)
  return employee
}

/**
 * Fire an employee
 */
export function fireEmployee(state: GameState, employeeId: string): boolean {
  const index = state.employees.findIndex(e => e.id === employeeId)
  if (index === -1) return false
  
  // Severance pay: 50% of monthly salary
  const employee = state.employees[index]
  const severancePay = Math.round(employee.salary * 0.5)
  state.balance -= severancePay
  
  state.employees.splice(index, 1)
  return true
}

/**
 * Get employees by position
 */
export function getEmployeesByPosition(state: GameState, position: EmployeePosition): Employee[] {
  return state.employees.filter(e => e.position === position)
}

/**
 * Get total capacity bonus from employees
 */
export function getEmployeeCapacityBonus(state: GameState): number {
  const totalEfficiency = getTotalEmployeeEfficiency(state.employees)
  // Base capacity + efficiency bonus
  // Each employee adds their efficiency as a multiplier
  if (state.employees.length === 0) return 0
  return totalEfficiency
}

/**
 * Calculate weekly salary cost (1/4 of monthly per week)
 */
export function getWeeklySalaryCost(state: GameState): number {
  const totalMonthly = getTotalEmployeeSalary(state.employees)
  return Math.round(totalMonthly / 4)
}

/**
 * Calculate weekly energy cost for managing employees
 */
export function getWeeklyEnergyCost(state: GameState): number {
  return getTotalEmployeeEnergyCost(state.employees)
}

/**
 * Get base salary for position
 */
export function getBaseSalaryForPosition(position: EmployeePosition): number {
  const salaries: Record<EmployeePosition, number> = {
    cashier: 25000,
    assistant: 30000,
    manager: 45000,
    specialist: 40000,
  }
  return salaries[position]
}

/**
 * Get energy cost for position
 */
export function getEnergyCostForPosition(position: EmployeePosition): number {
  const costs: Record<EmployeePosition, number> = {
    cashier: 5,
    assistant: 7,
    manager: 10,
    specialist: 8,
  }
  return costs[position]
}

/**
 * Check if employee event should trigger (random events)
 */
export function checkEmployeeEvent(state: GameState): { type: string; effect: number } | null {
  if (state.employees.length === 0) return null
  
  // 5% chance per employee per week
  for (const employee of state.employees) {
    if (Math.random() < 0.05) {
      const eventType = Math.random()
      if (eventType < 0.4) {
        // Sick day - employee doesn't come
        return { type: 'sick_day', effect: -employee.efficiency }
      } else if (eventType < 0.7) {
        // Great work - bonus reputation
        return { type: 'great_work', effect: 2 }
      } else {
        // Request raise
        return { type: 'raise_request', effect: employee.salary * 0.1 }
      }
    }
  }
  
  return null
}

/**
 * Get employee count by position
 */
export function getEmployeeCount(state: GameState, position?: EmployeePosition): number {
  if (!position) return state.employees.length
  return state.employees.filter(e => e.position === position).length
}

/**
 * Calculate energy recovery bonus from purchased upgrades
 */
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
