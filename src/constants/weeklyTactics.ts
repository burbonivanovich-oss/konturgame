import type { WeeklyTactic } from '../types/game'

export interface WeeklyTacticDef {
  id: WeeklyTactic
  icon: string
  title: string
  blurb: string
  // Per-day modifiers, applied inside the day loop in weekCalculator.
  // loyaltyDelta routes to reputation × 0.5 (после удаления loyalty-скаляра).
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
    // Спринт 6 (Game Designer audit): blurb обновлён под реальные числа.
    // Per-day: revenue ×1.18, energy -1.25, rep -0.2, loyalty -0.15 (→ rep×0.5).
    // Per-week effective: +18% выручки, -9 энергии, -1.475 репутации
    // (rep -1.4 + loyaltyDelta×0.5×7 = -0.075).
    blurb: '+18% выручки за неделю. Цена: −9 энергии, −1.5 репутации. Solo без сотрудников = выгорание к W14-16.',
    revenueMultiplier: 1.18,
    energyDelta: -1.25,
    reputationDelta: -0.2,
    loyaltyDelta: -0.15,
  },
  {
    id: 'calm',
    icon: '🌿',
    title: 'Спокойная неделя',
    // Спринт 6: calm получает небольшой rep-тик (был 0 → +0.5/нед), чтобы
    // не быть строгим подмножеством service. Теперь calm — это «энергия
    // важнее всего, но и репутация чуть-чуть растёт» (постоянники замечают
    // что вы спокойнее). Service остаётся лучшим вариантом для разгона репы.
    blurb: 'Отдых: −3% выручки, +10 энергии и +0.7 репутации за неделю. Лекарство после agg-недели.',
    revenueMultiplier: 0.97,
    energyDelta: 1.5,
    reputationDelta: 0.1,
    loyaltyDelta: 0,
  },
  {
    id: 'service',
    icon: '⭐',
    title: 'Качество и сервис',
    // Per-day: revenue ×1.0, energy +0.3, rep +0.8, loyalty +0.5 (→ rep×0.5).
    // Per-week effective: 0% revenue penalty, +2 энергии, rep +0.8×7 +
    // loyalty×0.5×7 = +5.6 + +1.75 = +7.35 репутации.
    blurb: 'Без штрафа к выручке. +2 энергии, +7 репутации за неделю. Главный режим для накопления.',
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
