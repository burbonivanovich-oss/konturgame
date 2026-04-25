import type { BackstoryPersonal, PersonalGoal } from '../types/game'

/**
 * Personal goals tied to the backstory's "personal situation". Each goal is a
 * concrete, urgent reason that exists outside the business — the kind of thing
 * a small-business owner actually wakes up at 4am over. The deadline creates
 * Papers Please / This Is The Police time pressure; the specifics ground the
 * money number in a real person.
 *
 * Targets and deadlines tuned so that:
 *  - achievable with active service usage and reasonable decisions
 *  - missable if the player coasts on bare survival
 *  - meaningful: at least 2x the starting balance, so it requires real growth
 *
 * Tone notes:
 *  - These are not philanthropic dreams. They're emergencies dressed in
 *    family clothes — the kind of stake that makes "просто выжить" feel
 *    insufficient without being overtly tragic.
 *  - Each goal carries some moral complexity (помочь = и долг, и
 *    самоуспокоение). Closure scenes lean into that, not away from it.
 */
export const PERSONAL_GOAL_TEMPLATES: Record<BackstoryPersonal, Omit<PersonalGoal, 'achieved' | 'missed'>> = {
  free: {
    id: 'mother_surgery',
    shortLabel: 'Операция матери',
    description:
      'Маме нужна операция в платной клинике — врачи говорят, до октября (неделя 38), потом поздно. 500 000 ₽. Сама не просит, ходит в районную, делает вид, что справляется. Вы знаете, что не справляется.',
    targetAmount: 500_000,
    deadlineWeek: 38,
  },
  friend: {
    id: 'dimka_cosign',
    shortLabel: 'Снять Димку с поручительства',
    description:
      'Когда вы открывались, Димка подписал поручительство по вашему стартовому кредиту. Банк прислал требование о досрочном погашении — 600 000 ₽ до недели 45. Если не закроете, начнут списывать с его зарплаты. Он этого не знает.',
    targetAmount: 600_000,
    deadlineWeek: 45,
  },
  hometown: {
    id: 'grandma_flat',
    shortLabel: 'Бабушкина квартира',
    description:
      'Бабушку похоронили в позапрошлом году. Дядя продаёт её квартиру — у вас есть преимущественное право, нужно внести 400 000 ₽ задатка до недели 38. Вы не были у бабушки в последние месяцы. Это не вернёт того, что упустили — но и не пустить туда чужих людей вы тоже не можете.',
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
