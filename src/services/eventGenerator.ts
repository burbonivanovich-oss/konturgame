import type { GameState, Event, EventTemplate } from '../types/game'

export const EVENTS_DATABASE: EventTemplate[] = [
  {
    id: 'TAX01',
    title: 'Налоговая проверка',
    description: 'К вам пришла налоговая инспекция. Нужно разобраться с документами.',
    trigger: { dayMin: 10, randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'self',
        text: 'Разобраться самому',
        consequences: { balanceDelta: -30000, reputationDelta: -5 },
      },
      {
        id: 'lawyer',
        text: 'Нанять юриста (-18 000 ₽)',
        consequences: { balanceDelta: -18000, reputationDelta: -2 },
      },
      {
        id: 'extern',
        text: 'Решить через Контур.Экстерн (-5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 0 },
        requiredService: 'extern',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'BLOGGER01',
    title: 'Популярный блогер',
    description: 'Местный блогер упомянул ваш бизнес в своём посте. Поток клиентов резко вырос!',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'accept',
        text: 'Принять всех клиентов',
        consequences: { clientModifier: 0.3, clientModifierDays: 7, reputationDelta: 5 },
      },
    ],
  },
  {
    id: 'SUPPLY01',
    title: 'Проблема с поставщиком',
    description: 'Поставщик задержал партию товара. Есть риск потерь.',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'wait',
        text: 'Ждать поставщика (-5 000 ₽ штраф)',
        consequences: { balanceDelta: -5000 },
      },
      {
        id: 'market-find',
        text: 'Найти нового через Контур.Маркет (-2 000 ₽)',
        consequences: { balanceDelta: -2000 },
        requiredService: 'market',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'HOLIDAY01',
    title: 'Праздничный ажиотаж',
    description: 'Приближается праздник. Клиентов стало значительно больше.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'normal',
        text: 'Работать в стандартном режиме',
        consequences: { clientModifier: 0.2, clientModifierDays: 5 },
      },
    ],
  },
  {
    id: 'STAFF01',
    title: 'Недовольство персонала',
    description: 'Сотрудники устали от высокой нагрузки. Лояльность падает.',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'ignore',
        text: 'Продолжать работу как прежде',
        consequences: { loyaltyDelta: -15 },
      },
      {
        id: 'bonus',
        text: 'Выплатить премию (-5 000 ₽)',
        consequences: { balanceDelta: -5000, loyaltyDelta: 10 },
      },
      {
        id: 'elba-manage',
        text: 'Оптимизировать графики через Контур.Эльба',
        consequences: { loyaltyDelta: 5 },
        requiredService: 'elba',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'COMPETITOR01',
    title: 'Новый конкурент',
    description: 'Рядом открылся конкурент. Часть клиентов переключается на него.',
    trigger: { randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'promo',
        text: 'Запустить акцию (-3 000 ₽)',
        consequences: { balanceDelta: -3000, clientModifier: 0.1, clientModifierDays: 10 },
      },
      {
        id: 'quality',
        text: 'Сделать ставку на качество',
        consequences: { reputationDelta: 5, checkModifier: 0.1, checkModifierDays: 10 },
      },
    ],
  },
  {
    id: 'EQUIPMENT01',
    title: 'Поломка оборудования',
    description: 'Вышло из строя ключевое оборудование. Требуется срочный ремонт.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'full-repair',
        text: 'Полноценный ремонт (-15 000 ₽)',
        consequences: { balanceDelta: -15000 },
      },
      {
        id: 'cheap-repair',
        text: 'Быстрый ремонт (-7 000 ₽, временные потери клиентов)',
        consequences: { balanceDelta: -7000, clientModifier: -0.1, clientModifierDays: 3 },
      },
    ],
  },
  {
    id: 'AUDIT01',
    title: 'Проверка нового поставщика',
    description: 'Новый поставщик вызвал сомнения. Нужна проверка репутации.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'trust',
        text: 'Довериться поставщику (риск потерь)',
        consequences: { balanceDelta: -10000, reputationDelta: -3 },
      },
      {
        id: 'fokus-check',
        text: 'Проверить через Контур.Фокус (-2 000 ₽)',
        consequences: { balanceDelta: -2000 },
        requiredService: 'fokus',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'REVIEW01',
    title: 'Негативный отзыв',
    description: 'Клиент оставил плохой отзыв в интернете. Репутация под угрозой.',
    trigger: { randomChance: 0.05, reputationMax: 70 },
    options: [
      {
        id: 'respond',
        text: 'Публично ответить',
        consequences: { reputationDelta: -3 },
      },
      {
        id: 'resolve',
        text: 'Решить проблему клиента (-5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 5 },
      },
    ],
  },
  {
    id: 'CASH01',
    title: 'Кассовый разрыв',
    description: 'Деньги на счету заканчиваются. Срочно нужно финансирование.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'loan',
        text: 'Взять кредит (переплата 20%)',
        consequences: { balanceDelta: 20000 },
      },
      {
        id: 'bank-loan',
        text: 'Кредит через Контур.Банк (ставка 5%)',
        consequences: { balanceDelta: 20000 },
        requiredService: 'bank',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'LOYAL01',
    title: 'Постоянный клиент',
    description: 'Довольный постоянный клиент привёл с собой новых друзей.',
    trigger: { randomChance: 0.04, reputationMin: 60 },
    options: [
      {
        id: 'welcome',
        text: 'Тепло встретить новых клиентов',
        consequences: { reputationDelta: 3, clientModifier: 0.1, clientModifierDays: 5 },
      },
    ],
  },
  {
    id: 'RENT01',
    title: 'Повышение аренды',
    description: 'Арендодатель сообщил о повышении арендной ставки с следующего месяца.',
    trigger: { dayMin: 30, randomChance: 0.03, oneTime: true },
    options: [
      {
        id: 'agree',
        text: 'Согласиться с повышением (-5 000 ₽)',
        consequences: { balanceDelta: -5000 },
      },
      {
        id: 'negotiate',
        text: 'Поторговаться (-2 000 ₽)',
        consequences: { balanceDelta: -2000 },
      },
    ],
  },
  {
    id: 'FIRE01',
    title: 'Пожарная проверка',
    description: 'Пожарная инспекция выявила нарушения в вашем помещении.',
    trigger: { randomChance: 0.02, oneTime: true },
    options: [
      {
        id: 'pay-fine',
        text: 'Оплатить штраф (-10 000 ₽)',
        consequences: { balanceDelta: -10000 },
      },
      {
        id: 'fix',
        text: 'Устранить нарушения (-5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 2 },
      },
    ],
  },
  {
    id: 'DIADOC01',
    title: 'Бумажная волокита',
    description: 'Поставщик срочно требует пакет документов для продолжения сотрудничества.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'manual',
        text: 'Оформить вручную (потеря рабочего времени)',
        consequences: { clientModifier: -0.5, clientModifierDays: 1 },
      },
      {
        id: 'diadoc-send',
        text: 'Отправить мгновенно через Контур.Диадок',
        consequences: {},
        requiredService: 'diadoc',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'BIRTHDAY01',
    title: 'День рождения бизнеса',
    description: 'Ваш бизнес работает уже 30 дней! Клиенты и партнёры поздравляют.',
    trigger: { dayMin: 30, dayMax: 32, oneTime: true },
    options: [
      {
        id: 'celebrate',
        text: 'Устроить праздник (-3 000 ₽)',
        consequences: { balanceDelta: -3000, reputationDelta: 10, loyaltyDelta: 10 },
      },
      {
        id: 'work',
        text: 'Продолжить в рабочем режиме',
        consequences: { reputationDelta: 3 },
      },
    ],
  },
  {
    id: 'VIRAL01',
    title: 'Вирусное видео',
    description: 'Видео о вашем бизнесе стало вирусным в соцсетях!',
    trigger: { randomChance: 0.02, reputationMin: 70 },
    options: [
      {
        id: 'ride-wave',
        text: 'Использовать момент',
        consequences: { clientModifier: 0.5, clientModifierDays: 14, reputationDelta: 10 },
      },
    ],
  },
  {
    id: 'SANPIN01',
    title: 'Санитарная проверка',
    description: 'СЭС пришла с внеплановой проверкой. Претензий к гигиене.',
    trigger: { randomChance: 0.02, oneTime: false },
    options: [
      {
        id: 'fine',
        text: 'Заплатить штраф (-8 000 ₽)',
        consequences: { balanceDelta: -8000 },
      },
      {
        id: 'fix-now',
        text: 'Немедленно устранить (-4 000 ₽, +репутация)',
        consequences: { balanceDelta: -4000, reputationDelta: 3 },
      },
    ],
  },
  {
    id: 'DISCOUNT01',
    title: 'Выгодное предложение от поставщика',
    description: 'Поставщик предлагает большую партию со скидкой 30%. Выгодная возможность.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'buy',
        text: 'Купить партию (-10 000 ₽)',
        consequences: { balanceDelta: -10000 },
      },
      {
        id: 'skip',
        text: 'Отказаться от предложения',
        consequences: {},
      },
    ],
  },
]

export function generateEvent(day: number, state: GameState): Event | null {
  const triggered = state.triggeredEventIds ?? []
  const candidates: EventTemplate[] = []

  for (const template of EVENTS_DATABASE) {
    if (template.trigger.oneTime && triggered.includes(template.id)) continue
    if (template.trigger.dayMin !== undefined && day < template.trigger.dayMin) continue
    if (template.trigger.dayMax !== undefined && day > template.trigger.dayMax) continue
    if (
      template.trigger.reputationMax !== undefined &&
      state.reputation > template.trigger.reputationMax
    )
      continue
    if (
      template.trigger.reputationMin !== undefined &&
      state.reputation < template.trigger.reputationMin
    )
      continue
    if (
      template.trigger.businessTypes &&
      !template.trigger.businessTypes.includes(state.businessType)
    )
      continue
    if (
      template.trigger.randomChance !== undefined &&
      Math.random() > template.trigger.randomChance
    )
      continue

    candidates.push(template)
  }

  if (candidates.length === 0) return null

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]

  return {
    id: chosen.id,
    day,
    title: chosen.title,
    description: chosen.description,
    options: chosen.options,
    isResolved: false,
  }
}

export function applyEventConsequence(
  state: GameState,
  event: Event,
  optionId: string,
): void {
  const option = event.options.find((o) => o.id === optionId)
  if (!option) return

  const c = option.consequences

  if (c.balanceDelta !== undefined) {
    state.balance = Math.max(0, state.balance + c.balanceDelta)
  }
  if (c.reputationDelta !== undefined) {
    state.reputation = Math.max(0, Math.min(100, state.reputation + c.reputationDelta))
  }
  if (c.loyaltyDelta !== undefined) {
    state.loyalty = Math.max(0, Math.min(100, state.loyalty + c.loyaltyDelta))
  }
  if (c.clientModifier !== undefined) {
    state.temporaryClientMod = (state.temporaryClientMod ?? 0) + c.clientModifier
    state.temporaryModDaysLeft = Math.max(
      state.temporaryModDaysLeft ?? 0,
      c.clientModifierDays ?? 1,
    )
  }
  if (c.checkModifier !== undefined) {
    state.temporaryCheckMod = (state.temporaryCheckMod ?? 0) + c.checkModifier
    state.temporaryModDaysLeft = Math.max(
      state.temporaryModDaysLeft ?? 0,
      c.checkModifierDays ?? 1,
    )
  }

  event.isResolved = true

  if (!state.triggeredEventIds) state.triggeredEventIds = []
  if (!state.triggeredEventIds.includes(event.id)) {
    state.triggeredEventIds.push(event.id)
  }

  state.pendingEvent = null
}
