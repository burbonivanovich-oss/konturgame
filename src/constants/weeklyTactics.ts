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
    blurb: '+15% выручки, устаёте сильнее (−1 энергии/день)',
    // -1/день = -7/неделю поверх базовой стоимости (shop/salon 20+15
    // solo = 35, cafe 25+15 = 40) + микрособытий (-3..-5/нед).
    // С restoration +42:
    //   • shop/salon solo: 35+7-42 = 0/нед base, -3..-5/нед с микро
    //     → выгорание реально к W25-35 при упорстве.
    //   • cafe solo: 40+7-42 = -5/нед base, -8..-10/нед с микро
    //     → выгорание раньше — общепит выматывает быстрее.
    revenueMultiplier: 1.15,
    energyDelta: -1,
    reputationDelta: 0,
    loyaltyDelta: 0,
  },
  {
    id: 'calm',
    icon: '🌿',
    title: 'Спокойная неделя',
    blurb: 'Отдых вместо роста: −3% выручки, +2 энергии/день',
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
