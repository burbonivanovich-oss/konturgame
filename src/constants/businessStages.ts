import type { BusinessStage } from '../types/game'

export interface StageConfig {
  label: string
  maxEmployees: number
  weeksMin: number
  levelMin: number
  description: string
}

export const STAGE_CONFIG: Record<BusinessStage, StageConfig> = {
  startup:  { label: 'Стартап',        maxEmployees: 1,  weeksMin: 1,  levelMin: 1, description: 'Только начинаете. Можно нанять 1 сотрудника.' },
  small:    { label: 'Малый бизнес',   maxEmployees: 3,  weeksMin: 9,  levelMin: 3, description: 'Первые клиенты. Команда до 3 человек.' },
  growing:  { label: 'Развивающийся',  maxEmployees: 5,  weeksMin: 21, levelMin: 5, description: 'Устойчивый рост. Команда до 5 человек.' },
  medium:   { label: 'Средний бизнес', maxEmployees: 8,  weeksMin: 41, levelMin: 7, description: 'Зрелый бизнес. Команда до 8 человек.' },
  large:    { label: 'Крупный бизнес', maxEmployees: 12, weeksMin: 60, levelMin: 9, description: 'Лидер рынка. Команда до 12 человек.' },
}

export function getBusinessStage(currentWeek: number, level: number): BusinessStage {
  if (currentWeek >= 60 && level >= 9) return 'large'
  if (currentWeek >= 41 && level >= 7) return 'medium'
  if (currentWeek >= 21 && level >= 5) return 'growing'
  if (currentWeek >= 9  && level >= 3) return 'small'
  return 'startup'
}

export function getNextStage(stage: BusinessStage): BusinessStage | null {
  const order: BusinessStage[] = ['startup', 'small', 'growing', 'medium', 'large']
  const idx = order.indexOf(stage)
  return idx < order.length - 1 ? order[idx + 1] : null
}
