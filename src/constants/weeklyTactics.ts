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
    blurb: '+15% выручки, устаёте сильнее (−1.1 энергии/день)',
    // -1.1/день = -7.7/неделю поверх базовой стоимости + микрособытий.
    // С restoration +42 + базами (shop 21, cafe 27, salon 20):
    //   • shop solo (21+15) aggressive: 36+7.7-42 = +1.7/нед, -3 с микро
    //     → выгорание к W16-20 без energy-апгрейдов. POS, расширение
    //     зала, наём кассира снимают риск.
    //   • cafe solo (27+15) aggressive: 42+7.7-42 = +7.7/нед, -10 с микро
    //     → выгорание к W11-15 — общепит выматывает заметно быстрее.
    //   • salon solo (20+15) aggressive: 35+7.7-42 = +0.7/нед, -2 с микро
    //     → пограничное, в основном выживает к W52.
    revenueMultiplier: 1.15,
    energyDelta: -1.1,
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
