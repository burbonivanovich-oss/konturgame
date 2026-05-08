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
    blurb: '+18% выручки, устаёте сильнее (−1 энергии/день)',
    // -1/день вместо -2: 7×52 = 364 ед/год вместо 728 — выгорание становится
    // выбором при долгой агрессии, а не неизбежностью на W10.
    revenueMultiplier: 1.18,
    energyDelta: -1,
    reputationDelta: 0,
    loyaltyDelta: 0,
  },
  {
    id: 'calm',
    icon: '🌿',
    title: 'Спокойная неделя',
    blurb: 'Отдых вместо роста: −3% выручки, +2 энергии/день',
    // -3% вместо -5%: спокойная неделя должна быть жизнеспособна
    // как стратегия, а не «всегда хуже всех».
    revenueMultiplier: 0.97,
    energyDelta: 2,
    reputationDelta: 0,
    loyaltyDelta: 0,
  },
  {
    id: 'service',
    icon: '⭐',
    title: 'Качество и сервис',
    blurb: '−2% выручки, +0.8 репутации и +0.5 лояльности в день',
    revenueMultiplier: 0.98,
    energyDelta: 0,
    reputationDelta: 0.8,
    loyaltyDelta: 0.5,
  },
]

export function getWeeklyTacticDef(tactic: WeeklyTactic | null | undefined): WeeklyTacticDef | null {
  if (!tactic) return null
  return WEEKLY_TACTICS.find(t => t.id === tactic) ?? null
}
