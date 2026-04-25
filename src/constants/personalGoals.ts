import type { BackstoryPersonal, PersonalGoal } from '../types/game'

/**
 * Personal goals tied to the backstory's "personal situation". Each goal gives
 * the player a concrete reason to grow the business beyond "survive". The
 * deadline creates time pressure (à la Papers Please / This Is The Police);
 * the description grounds the number in something the protagonist cares about.
 *
 * Targets and deadlines are tuned so that:
 *  - achievable with active service usage and decent decisions
 *  - missable if the player coasts on bare survival
 *  - meaningful: at least 2x the starting balance, so it requires growth
 */
export const PERSONAL_GOAL_TEMPLATES: Record<BackstoryPersonal, Omit<PersonalGoal, 'achieved' | 'missed'>> = {
  free: {
    id: 'apartment',
    shortLabel: 'Квартира в новом районе',
    description:
      'Накопить 500 000 ₽ на первый взнос за свою квартиру. До недели 40 — иначе застройщик закроет акцию.',
    targetAmount: 500_000,
    deadlineWeek: 40,
  },
  friend: {
    id: 'second_shop',
    shortLabel: 'Второй филиал с Димкой',
    description:
      'Накопить 600 000 ₽ на запуск второго филиала вместе с Димкой. Он уже арендует помещение — нужно успеть к неделе 45.',
    targetAmount: 600_000,
    deadlineWeek: 45,
  },
  hometown: {
    id: 'school_donation',
    shortLabel: 'Ремонт школы',
    description:
      'Накопить 400 000 ₽ и пожертвовать школе своего района на ремонт спортзала. Учебный год начнётся на неделе 38.',
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
