import type { GameState, MetaLessonBonus } from '../types/game'

export interface MetaLesson {
  id: string
  icon: string
  name: string
  // What the player did to earn it (past-tense, first-person feel)
  earnedHow: string
  // What it gives the next run (concrete, present-tense)
  bonusText: string
  // Returns true if THIS finished run earned the lesson
  check: (state: GameState) => boolean
  bonus: MetaLessonBonus
}

/**
 * Five starter lessons — small, concrete, earnable in different ways so
 * different play styles unlock different things. Each grants a permanent
 * starting bonus that stacks with other earned lessons.
 *
 * Calibration: total max bonus across all 5 = +50k start, +5 energy,
 * +3 reputation, +5 loyalty. About 60% of starting balance, but spread
 * across runs and only after meaningful achievements.
 */
export const META_LESSONS: MetaLesson[] = [
  {
    id: 'survived_first_month',
    icon: '🌱',
    name: 'Первый месяц прожит',
    earnedHow: 'Дотянули до 5-й недели и не сломались',
    bonusText: 'Стартовый баланс +10 000 ₽',
    check: (s) => s.currentWeek >= 5,
    bonus: { startingBalanceDelta: 10_000 },
  },
  {
    id: 'kept_team_together',
    icon: '🤝',
    name: 'Команду удержали',
    earnedHow: 'Лояльность сотрудников держали выше 70 на момент окончания',
    bonusText: '+5 стартовой лояльности — старая школа управления',
    check: (s) => s.loyalty >= 70,
    bonus: { startingLoyaltyDelta: 5 },
  },
  {
    id: 'achieved_a_goal',
    icon: '🎁',
    name: 'Слово сдержали',
    earnedHow: 'Достигли личной цели в срок — по-настоящему',
    bonusText: 'Стартовый баланс +15 000 ₽ — привычка идти до конца',
    check: (s) => s.personalGoal?.achieved === true,
    bonus: { startingBalanceDelta: 15_000 },
  },
  {
    id: 'kept_reputation',
    icon: '⭐',
    name: 'Репутацию заработали',
    earnedHow: 'Финальная репутация ≥ 75 — район вас знает',
    bonusText: '+3 стартовой репутации — следующий бизнес откроется тише',
    check: (s) => s.reputation >= 75,
    bonus: { startingReputationDelta: 3 },
  },
  {
    id: 'full_year',
    icon: '🏆',
    name: 'Полный год',
    earnedHow: 'Прошли 52 недели — год в бизнесе',
    bonusText: 'Стартовый баланс +20 000 ₽, +5 стартовой энергии',
    check: (s) => s.currentWeek >= 52,
    bonus: { startingBalanceDelta: 20_000, startingEnergyDelta: 5 },
  },
]

export function getMetaLesson(id: string): MetaLesson | undefined {
  return META_LESSONS.find(l => l.id === id)
}
