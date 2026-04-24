import type { BusinessType, Employee, EmployeePosition } from '../types/game'

export const EMPLOYEE_NAMES: Record<EmployeePosition, string[]> = {
  cashier: ['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий'],
  assistant: ['Елена', 'Жанна', 'Захар', 'Ирина', 'Константин'],
  manager: ['Людмила', 'Максим', 'Наталья', 'Олег', 'Павел'],
  specialist: ['Роман', 'Светлана', 'Татьяна', 'Ульяна', 'Фёдор'],
  supervisor: ['Алексей', 'Вероника', 'Геннадий', 'Дарья', 'Евгений'],
  trainer: ['Зинаида', 'Игорь', 'Юлия', 'Кирилл', 'Лариса'],
}

export const EMPLOYEE_SALARIES: Record<EmployeePosition, number> = {
  cashier: 45000,      // базовая зарплата кассира
  assistant: 50000,    // помощник
  manager: 75000,      // управляющий
  specialist: 70000,   // специалист (например, бариста, парикмахер)
  supervisor: 90000,   // супервайзер/начальник смены
  trainer: 85000,      // тренер/обучающий персонал
}

export const EMPLOYEE_EFFICIENCY: Record<EmployeePosition, { min: number; max: number }> = {
  cashier: { min: 0.8, max: 1.2 },
  assistant: { min: 0.9, max: 1.3 },
  manager: { min: 1.0, max: 1.5 },
  specialist: { min: 1.1, max: 1.4 },
  supervisor: { min: 1.2, max: 1.6 },
  trainer: { min: 1.1, max: 1.5 },
}

export const EMPLOYEE_ENERGY_COST: Record<EmployeePosition, number> = {
  cashier: 5,        // 5 энергии в неделю на управление
  assistant: 7,
  manager: 10,
  specialist: 8,
  supervisor: 6,     // супервайзеры требуют меньше управления
  trainer: 9,        // тренеры требуют больше внимания
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

const GENERIC_LABELS: Record<EmployeePosition, string> = {
  cashier: 'Кассир',
  assistant: 'Помощник',
  manager: 'Управляющий',
  specialist: 'Специалист',
  supervisor: 'Начальник смены',
  trainer: 'Тренер',
}

export const EMPLOYEE_BUSINESS_LABELS: Record<BusinessType, Partial<Record<EmployeePosition, string>>> = {
  shop: {
    cashier: 'Кассир',
    assistant: 'Продавец-консультант',
    manager: 'Управляющий магазином',
    specialist: 'Товаровед',
    supervisor: 'Старший продавец',
    trainer: 'Наставник',
  },
  cafe: {
    cashier: 'Кассир',
    assistant: 'Официант',
    manager: 'Управляющий кафе',
    specialist: 'Бариста',
    supervisor: 'Шеф-повар',
    trainer: 'Наставник',
  },
  'beauty-salon': {
    cashier: 'Администратор',
    assistant: 'Помощник мастера',
    manager: 'Управляющий салоном',
    specialist: 'Мастер',
    supervisor: 'Старший мастер',
    trainer: 'Наставник',
  },
}

export function getEmployeeLabel(position: EmployeePosition, businessType: BusinessType): string {
  return EMPLOYEE_BUSINESS_LABELS[businessType]?.[position] ?? GENERIC_LABELS[position]
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
