import type { BusinessStage } from '../types/game'

/** Business tier enum — 1/2/3, как в GameState.businessTier. Локальный
 *  alias чтобы не плодить export в общем types/game. */
type BusinessTier = 1 | 2 | 3

export interface StageConfig {
  label: string
  maxEmployees: number
  weeksMin: number
  /** Минимальный businessTier (1-3) для перехода в эту стадию.
   *  Раньше использовался player level (1-15) — система уровней удалена,
   *  тиры покрывают ту же функцию: tier 1 ≈ startup/small, tier 2 ≈ growing/medium, tier 3 ≈ large. */
  tierMin: BusinessTier
  description: string
}

export const STAGE_CONFIG: Record<BusinessStage, StageConfig> = {
  startup:  { label: 'Стартап',        maxEmployees: 1,  weeksMin: 1,  tierMin: 1, description: 'Только начинаете. Можно нанять 1 сотрудника.' },
  small:    { label: 'Малый бизнес',   maxEmployees: 3,  weeksMin: 9,  tierMin: 1, description: 'Первые клиенты. Команда до 3 человек.' },
  growing:  { label: 'Развивающийся',  maxEmployees: 5,  weeksMin: 21, tierMin: 2, description: 'Устойчивый рост. Команда до 5 человек.' },
  medium:   { label: 'Средний бизнес', maxEmployees: 8,  weeksMin: 41, tierMin: 2, description: 'Зрелый бизнес. Команда до 8 человек.' },
  large:    { label: 'Крупный бизнес', maxEmployees: 12, weeksMin: 60, tierMin: 3, description: 'Лидер рынка. Команда до 12 человек.' },
}

export function getBusinessStage(currentWeek: number, businessTier: BusinessTier = 1): BusinessStage {
  if (currentWeek >= 60 && businessTier >= 3) return 'large'
  if (currentWeek >= 41 && businessTier >= 2) return 'medium'
  if (currentWeek >= 21 && businessTier >= 2) return 'growing'
  if (currentWeek >= 9) return 'small'
  return 'startup'
}

export function getNextStage(stage: BusinessStage): BusinessStage | null {
  const order: BusinessStage[] = ['startup', 'small', 'growing', 'medium', 'large']
  const idx = order.indexOf(stage)
  return idx < order.length - 1 ? order[idx + 1] : null
}
