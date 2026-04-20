import type { Employee, EmployeePosition } from '../types/game'

export const EMPLOYEE_NAMES: Record<EmployeePosition, string[]> = {
  cashier: ['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий'],
  assistant: ['Елена', 'Жанна', 'Захар', 'Ирина', 'Константин'],
  manager: ['Людмила', 'Максим', 'Наталья', 'Олег', 'Павел'],
  specialist: ['Роман', 'Светлана', 'Татьяна', 'Ульяна', 'Фёдор'],
}

export const EMPLOYEE_SALARIES: Record<EmployeePosition, number> = {
  cashier: 25000,      // базовая зарплата кассира
  assistant: 30000,    // помощник
  manager: 45000,      // управляющий
  specialist: 40000,   // специалист (например, бариста, парикмахер)
}

export const EMPLOYEE_EFFICIENCY: Record<EmployeePosition, { min: number; max: number }> = {
  cashier: { min: 0.8, max: 1.2 },
  assistant: { min: 0.9, max: 1.3 },
  manager: { min: 1.0, max: 1.5 },
  specialist: { min: 1.1, max: 1.4 },
}

export const EMPLOYEE_ENERGY_COST: Record<EmployeePosition, number> = {
  cashier: 5,        // 5 энергии в неделю на управление
  assistant: 7,
  manager: 10,
  specialist: 8,
}

export function generateEmployeeId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getRandomName(position: EmployeePosition): string {
  const names = EMPLOYEE_NAMES[position]
  return names[Math.floor(Math.random() * names.length)]
}

export function createEmployee(
  position: EmployeePosition,
  hireDay: number,
  efficiencyOverride?: number
): Employee {
  const efficiencyRange = EMPLOYEE_EFFICIENCY[position]
  const efficiency = efficiencyOverride ?? 
    (efficiencyRange.min + Math.random() * (efficiencyRange.max - efficiencyRange.min))
  
  return {
    id: generateEmployeeId(),
    position,
    name: getRandomName(position),
    salary: EMPLOYEE_SALARIES[position],
    efficiency: Math.round(efficiency * 100) / 100,
    hireDay,
    energyCost: EMPLOYEE_ENERGY_COST[position],
  }
}

export function getEmployeesByPosition(employees: Employee[], position: EmployeePosition): Employee[] {
  return employees.filter(e => e.position === position)
}

export function getTotalEmployeeEfficiency(employees: Employee[]): number {
  return employees.reduce((sum, e) => sum + e.efficiency, 0)
}

export function getTotalEmployeeSalary(employees: Employee[]): number {
  return employees.reduce((sum, e) => sum + e.salary, 0)
}

export function getTotalEmployeeEnergyCost(employees: Employee[]): number {
  return employees.reduce((sum, e) => sum + e.energyCost, 0)
}
