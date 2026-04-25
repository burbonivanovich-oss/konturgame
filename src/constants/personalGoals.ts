import type { BackstoryPersonal, PersonalGoal } from '../types/game'

/**
 * Personal goals tied to the backstory's "personal situation". Each goal is a
 * concrete, warm thing the protagonist promised to themselves — the kind of
 * promise a small-business owner actually makes and quietly carries. The
 * deadline creates time pressure (à la Papers Please / This Is The Police);
 * the specifics ground the money number in a real moment with a real person.
 *
 * Targets and deadlines tuned so that:
 *  - achievable with active service usage and reasonable decisions
 *  - missable if the player coasts on bare survival
 *  - meaningful: at least 2x the starting balance, so it requires real growth
 *
 * Tone: light but not naïve. No tragedy required to feel weight — a missed
 * birthday, a smaller wedding, an empty courtyard already do the work.
 */
export const PERSONAL_GOAL_TEMPLATES: Record<BackstoryPersonal, Omit<PersonalGoal, 'achieved' | 'missed'>> = {
  free: {
    id: 'mother_car',
    shortLabel: 'Машина для мамы',
    description:
      'Маме в ноябре 60 лет. Всю жизнь — маршрутки и метро. Дважды за год сказала «хорошо бы свою, хоть какую-нибудь». Сами решили: подарите хорошую подержанную, с растаможкой и страховкой — 500 000 ₽. До недели 38, чтобы успеть к дню рождения.',
    targetAmount: 500_000,
    deadlineWeek: 38,
  },
  friend: {
    id: 'dimka_wedding',
    shortLabel: 'Свадьба Димки',
    description:
      'Димка позвал свидетелем — они с Иркой пять лет ждали. Бюджет считали-считали, не сходится на 600 000 ₽: зал, фотограф, банкет на 80 человек. Вы пообещали закрыть разницу, не назвав цифру. Свадьба в начале ноября — неделя 45.',
    targetAmount: 600_000,
    deadlineWeek: 45,
  },
  hometown: {
    id: 'kids_coach',
    shortLabel: 'Тренер для дворовой команды',
    description:
      'В вашем дворе пацаны играют в футбол. Старый тренер ушёл — зарплата мизер, нашёл получше. Без него команда рассыпется, ребята разойдутся по подъездам. Нужно 400 000 ₽ на год тренеру и форму к началу сезона — неделя 38.',
    targetAmount: 400_000,
    deadlineWeek: 38,
  },
}

export function createPersonalGoal(personal: BackstoryPersonal): PersonalGoal {
  const template = PERSONAL_GOAL_TEMPLATES[personal]
  return {
    ...template,
    achieved: false,
    missed: false,
  }
}
