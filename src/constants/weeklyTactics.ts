import type { WeeklyTactic } from '../types/game'

export interface WeeklyTacticDef {
  id: WeeklyTactic
  icon: string
  title: string
  blurb: string
  // Per-day modifiers, applied inside the day loop in weekCalculator.
  revenueMultiplier: number
  energyDelta: number
  reputationDelta: number
  loyaltyDelta: number
}

export const WEEKLY_TACTICS: WeeklyTacticDef[] = [
  {
    id: 'aggressive',
    icon: '🔥',
    title: 'Активная неделя',
    blurb: '+20% выручки, но устаёшь сильнее (−2 энергии/день)',
    revenueMultiplier: 1.20,
    energyDelta: -2,
    reputationDelta: 0,
    loyaltyDelta: 0,
  },
  {
    id: 'calm',
    icon: '🌿',
    title: 'Спокойная неделя',
    blurb: 'Отдых вместо роста: −5% выручки, +2 энергии/день',
    revenueMultiplier: 0.95,
    energyDelta: 2,
    reputationDelta: 0,
    loyaltyDelta: 0,
  },
  {
    id: 'service',
    icon: '⭐',
    title: 'Качество и сервис',
    blurb: '−3% выручки, +0.8 репутации и +0.5 лояльности в день',
    revenueMultiplier: 0.97,
    energyDelta: 0,
    reputationDelta: 0.8,
    loyaltyDelta: 0.5,
  },
]

export function getWeeklyTacticDef(tactic: WeeklyTactic | null | undefined): WeeklyTacticDef | null {
  if (!tactic) return null
  return WEEKLY_TACTICS.find(t => t.id === tactic) ?? null
}
