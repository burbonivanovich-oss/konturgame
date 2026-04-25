import type { BackstoryPersonal, PersonalGoal } from '../types/game'

export const PERSONAL_GOAL_TEMPLATES: Record<BackstoryPersonal, Omit<PersonalGoal, 'achieved' | 'missed'>> = {
  free: {
    id: 'parent_reno',
    shortLabel: 'Ремонт для родителей',
    description:
      'Родители живут в другом городе, в хрущёвке — батарея едва греет, трубы в ванной текут второй год. Говорят «нормально». Вы решили: к осени накопить на нормальный ремонт и сделать — без «как-нибудь». Нужно 400 000 ₽, до недели 36.',
    targetAmount: 400_000,
    deadlineWeek: 36,
  },
  friend: {
    id: 'katya_deposit',
    shortLabel: 'Помочь Кате с квартирой',
    description:
      'Катя — подруга с детского сада — после развода осталась одна с дочкой. Нашла хорошую квартиру, хозяин адекватный, район тихий. Но депозит три месяца наперёд: 380 000 ₽. Попросила помочь. Вы не раздумывали. Срок — неделя 40.',
    targetAmount: 380_000,
    deadlineWeek: 40,
  },
  hometown: {
    id: 'courtyard_save',
    shortLabel: 'Спасти сквер',
    description:
      'Двор из детства — скамейки, берёзы, песочница — хотят снести под парковку. Соседи создали инициативную группу, подают заявку в городскую комиссию. Нужны деньги на юридическое сопровождение: 320 000 ₽ к неделе 34, пока не поздно.',
    targetAmount: 320_000,
    deadlineWeek: 34,
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
