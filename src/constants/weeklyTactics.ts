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
    blurb: '+18% выручки, но устаёте быстрее и качество страдает: −1.25 энергии, −0.2 репутации, −0.15 лояльности в день',
    // Спринт 5c: повышены ставки. Раньше agg было дешёвой кнопкой «+15%
    // выручки», игроки спамили её без последствий. Теперь:
    //   • -1.25/день = -8.75/нед (было -7.7) — устаёшь чуть быстрее
    //   • -0.2 реп/день = -1.4/нед — «срезаешь углы», клиенты замечают
    //   • -0.15 лояльности/день = -1.05/нед — сотрудники перерабатывают
    // 4 недели подряд agg = -5.6 реп, -4.2 лояльности → видимый штраф,
    // надо переключаться на service (восстановить реп) или calm (энергию).
    //
    // Solo энергетика (без сотрудников и energy-апгрейдов):
    //   • shop (21+15) agg: drain 36+8.75=44.75, restore 42 → -2.75/нед
    //     + микро → выгорание к W14-16 (близко к старому W16).
    //   • cafe (27+15) agg: drain 42+8.75=50.75, restore 42 → -8.75/нед
    //     → выгорание к W10-12.
    //   • salon (20+15) agg: drain 35+8.75=43.75, restore 42 → -1.75/нед
    //     + микро — пограничное, выживает к W52 но впритык.
    revenueMultiplier: 1.18,
    energyDelta: -1.25,
    reputationDelta: -0.2,
    loyaltyDelta: -0.15,
  },
  {
    id: 'calm',
    icon: '🌿',
    title: 'Спокойная неделя',
    blurb: 'Отдых вместо роста: −3% выручки, +2.5 энергии и +0.1 репутации в день',
    // Спринт 5c: calm стал более ценным как лекарство от agg. +2.5/день
    // = +17.5/нед (с базовой restoration 42 → effective +59.5/нед).
    // +0.1 реп/день = +0.7/нед — постоянники чувствуют внимание,
    // частично компенсирует репутационный долг от agg-недель.
    revenueMultiplier: 0.97,
    energyDelta: 2.5,
    reputationDelta: 0.1,
    loyaltyDelta: 0,
  },
  {
    id: 'service',
    icon: '⭐',
    title: 'Качество и сервис',
    blurb: 'Без штрафа к выручке, +0.3 энергии, +0.8 репутации и +0.5 лояльности в день',
    // Спринт 5d: убран штраф -2% к выручке. Раньше service-тактика была
    // «дешёвая жертва» (теряете 2% денег, чтобы получить рост репутации).
    // Теперь это чистый «играю качественно»: выручка не страдает, плюс
    // долгосрочные бонусы. Делает service-тактику привлекательной как
    // основной режим в накопительной игре на цели 1М+, а не только как
    // лекарство после aggressive.
    revenueMultiplier: 1.0,
    energyDelta: 0.3,
    reputationDelta: 0.8,
    loyaltyDelta: 0.5,
  },
]

export function getWeeklyTacticDef(tactic: WeeklyTactic | null | undefined): WeeklyTacticDef | null {
  if (!tactic) return null
  return WEEKLY_TACTICS.find(t => t.id === tactic) ?? null
}
