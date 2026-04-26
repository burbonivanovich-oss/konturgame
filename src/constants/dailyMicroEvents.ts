export interface MicroEventOption {
  id: string
  text: string
  effects: {
    balanceDelta?: number
    energyDelta?: number
    clientModifierPercent?: number
    clientModifierDays?: number
    reputationDelta?: number
  }
}

export interface DailyMicroEvent {
  id: string
  dayOfWeek: number  // 0 = Пн, 6 = Вс
  title: string
  description: string
  icon: string
  options: MicroEventOption[]
}

export const DAILY_MICRO_EVENTS: DailyMicroEvent[] = [
  // Понедельник (0)
  {
    id: 'mon_motivation',
    dayOfWeek: 0,
    title: '💪 Мотивация на неделю',
    description: 'Прочитал вдохновляющую историю успеха другого предпринимателя.',
    icon: '💪',
    options: [
      {
        id: 'accept_motivation',
        text: 'Зарядиться энергией',
        effects: { energyDelta: 10, clientModifierPercent: 0.05, clientModifierDays: 7 },
      },
      {
        id: 'ignore_motivation',
        text: 'Сосредоточиться на работе',
        effects: { balanceDelta: 500 },
      },
    ],
  },
  {
    id: 'mon_tired',
    dayOfWeek: 0,
    title: '😴 Плохой сон',
    description: 'Выспался плохо, чувствуешь себя разбитым.',
    icon: '😴',
    options: [
      {
        id: 'rest_at_lunch',
        text: 'Отдохнуть в обед (-500₽)',
        effects: { balanceDelta: -500, energyDelta: 15 },
      },
      {
        id: 'work_through',
        text: 'Работать дальше',
        effects: { energyDelta: -20, balanceDelta: 1000 },
      },
    ],
  },
  {
    id: 'mon_team',
    dayOfWeek: 0,
    title: '👥 Линейка команды',
    description: 'Собрал сотрудников, поговорил о целях на неделю.',
    icon: '👥',
    options: [
      {
        id: 'inspiring_talk',
        text: 'Вдохновляющая речь',
        effects: { reputationDelta: 2, clientModifierPercent: 0.03, clientModifierDays: 3 },
      },
      {
        id: 'skip_meeting',
        text: 'Пропустить встречу',
        effects: { balanceDelta: 300 },
      },
    ],
  },

  // Вторник (1)
  {
    id: 'tue_supplier',
    dayOfWeek: 1,
    title: '📦 Новое предложение поставщика',
    description: 'Поставщик предлагает партию товара со скидкой 15%.',
    icon: '📦',
    options: [
      {
        id: 'buy_stock',
        text: 'Купить партию (-8000₽)',
        effects: { balanceDelta: -8000, clientModifierPercent: 0.08, clientModifierDays: 7 },
      },
      {
        id: 'decline_stock',
        text: 'Отказать',
        effects: { balanceDelta: 0 },
      },
    ],
  },
  {
    id: 'tue_expired',
    dayOfWeek: 1,
    title: '⚠️ Товар просрочился',
    description: 'Обнаружил, что часть товара истекла (не заметили при приёмке).',
    icon: '⚠️',
    options: [
      {
        id: 'write_off',
        text: 'Списать товар (-2500₽)',
        effects: { balanceDelta: -2500 },
      },
      {
        id: 'sell_discounted',
        text: 'Продать со скидкой (-1000₽)',
        effects: { balanceDelta: -1000, reputationDelta: -2 },
      },
    ],
  },
  {
    id: 'tue_delivery',
    dayOfWeek: 1,
    title: '🚚 Задержка доставки',
    description: 'Поставщик задерживает доставку на день.',
    icon: '🚚',
    options: [
      {
        id: 'accept_delay',
        text: 'Согласиться',
        effects: { clientModifierPercent: -0.05, clientModifierDays: 1 },
      },
      {
        id: 'find_alternative',
        text: 'Найти альтернативного поставщика (+2000₽)',
        effects: { balanceDelta: -2000, energyDelta: -10 },
      },
    ],
  },

  // Среда (2)
  {
    id: 'wed_complaint',
    dayOfWeek: 2,
    title: '😠 Жалоба клиента',
    description: 'Клиент вернул товар и требует вернуть деньги. Качество его не устроило.',
    icon: '😠',
    options: [
      {
        id: 'refund',
        text: 'Вернуть деньги (-1000₽)',
        effects: { balanceDelta: -1000, reputationDelta: 3 },
      },
      {
        id: 'refuse',
        text: 'Отказать',
        effects: { reputationDelta: -5, balanceDelta: 1000 },
      },
    ],
  },
  {
    id: 'wed_competitor',
    dayOfWeek: 2,
    title: '⚡ Конкурент открылся рядом',
    description: 'В соседнем помещении открыли похожий магазин.',
    icon: '⚡',
    options: [
      {
        id: 'improve_service',
        text: 'Улучшить сервис (-3000₽)',
        effects: { balanceDelta: -3000, clientModifierPercent: 0.1, clientModifierDays: 14 },
      },
      {
        id: 'accept_loss',
        text: 'Смириться с потерей клиентов',
        effects: { clientModifierPercent: -0.15, clientModifierDays: 7 },
      },
    ],
  },
  {
    id: 'wed_review',
    dayOfWeek: 2,
    title: '⭐ Вирусный отзыв',
    description: 'Один клиент поделился в соцсетях хорошим отзывом. Его друзья пришли к тебе!',
    icon: '⭐',
    options: [
      {
        id: 'thank_client',
        text: 'Поблагодарить и дать скидку (-500₽)',
        effects: { balanceDelta: -500, clientModifierPercent: 0.25, clientModifierDays: 1, reputationDelta: 2 },
      },
      {
        id: 'ignore_review',
        text: 'Просто продолжить работу',
        effects: { clientModifierPercent: 0.15, clientModifierDays: 1 },
      },
    ],
  },

  // Четверг (3)
  {
    id: 'thu_social_idea',
    dayOfWeek: 3,
    title: '📱 Идея для соцсетей',
    description: 'Придумал прикольный контент про твой бизнес.',
    icon: '📱',
    options: [
      {
        id: 'post_social',
        text: 'Опубликовать пост',
        effects: { clientModifierPercent: 0.03, clientModifierDays: 3, energyDelta: -5 },
      },
      {
        id: 'skip_social',
        text: 'Не публиковать',
        effects: { balanceDelta: 200 },
      },
    ],
  },
  {
    id: 'thu_influencer',
    dayOfWeek: 3,
    title: '🌟 Инфлюэнсер город заметил',
    description: 'Инфлюэнсер вашего города захотел у тебя что-то купить.',
    icon: '🌟',
    options: [
      {
        id: 'impress_influencer',
        text: 'Дать скидку и обслужить отлично (-2000₽)',
        effects: { balanceDelta: -2000, clientModifierPercent: 0.2, clientModifierDays: 7, reputationDelta: 3 },
      },
      {
        id: 'normal_service',
        text: 'Обслуживать обычно',
        effects: { balanceDelta: 0 },
      },
    ],
  },
  {
    id: 'thu_banner',
    dayOfWeek: 3,
    title: '🪧 Объявление упало',
    description: 'Из-за сильного ветра объявление на улице оборвалось.',
    icon: '🪧',
    options: [
      {
        id: 'fix_banner',
        text: 'Восстановить объявление (-500₽)',
        effects: { balanceDelta: -500 },
      },
      {
        id: 'leave_it',
        text: 'Оставить как есть',
        effects: { clientModifierPercent: -0.01, clientModifierDays: 7 },
      },
    ],
  },

  // Пятница (4)
  {
    id: 'fri_bonus_order',
    dayOfWeek: 4,
    title: '🤑 Оптовый заказ в конце недели',
    description: 'Старый клиент заказал большую партию в конце недели!',
    icon: '🤑',
    options: [
      {
        id: 'accept_big_order',
        text: 'Принять заказ (+5000₽)',
        effects: { balanceDelta: 5000, energyDelta: -15 },
      },
      {
        id: 'decline_big_order',
        text: 'Отказать',
        effects: { reputationDelta: -2 },
      },
    ],
  },
  {
    id: 'fri_tax_letter',
    dayOfWeek: 4,
    title: '📋 Письмо из налоговой',
    description: 'ФНС отправила письмо про проверку на следующую неделю.',
    icon: '📋',
    options: [
      {
        id: 'prepare_docs',
        text: 'Подготовить документы (-1000₽)',
        effects: { balanceDelta: -1000, energyDelta: -20, reputationDelta: 2 },
      },
      {
        id: 'ignore_letter',
        text: 'Надеяться на лучшее',
        effects: { reputationDelta: -5, balanceDelta: 0 },
      },
    ],
  },
  {
    id: 'fri_payday',
    dayOfWeek: 4,
    title: '💰 Зарплата сотрудникам',
    description: 'Конец недели - нужно платить зарплату персоналу. (Уже учтена в расходах)',
    icon: '💰',
    options: [
      {
        id: 'pay_ontime',
        text: 'Платить вовремя',
        effects: { reputationDelta: 2 },
      },
      {
        id: 'delay_payment',
        text: 'Отложить на несколько дней',
        effects: { reputationDelta: -5, balanceDelta: 0 },
      },
    ],
  },

  // Суббота (5)
  {
    id: 'sat_rest',
    dayOfWeek: 5,
    title: '☀️ День отдыха',
    description: 'Закрыл магазин, отдохнул, зарядился энергией.',
    icon: '☀️',
    options: [
      {
        id: 'full_rest',
        text: 'Полностью отдохнуть',
        effects: { energyDelta: 25, balanceDelta: 0 },
      },
      {
        id: 'work_rest',
        text: 'Работать немного (-энергия, +доход)',
        effects: { energyDelta: 5, balanceDelta: 2000 },
      },
    ],
  },
  {
    id: 'sat_emergency',
    dayOfWeek: 5,
    title: '😓 Срочный вызов',
    description: 'Позвонили - нужно срочно открыть из-за праздника или события.',
    icon: '😓',
    options: [
      {
        id: 'open_emergency',
        text: 'Открыть магазин (+3000₽)',
        effects: { balanceDelta: 3000, energyDelta: -30, reputationDelta: 2 },
      },
      {
        id: 'refuse_emergency',
        text: 'Отказать',
        effects: { reputationDelta: -3 },
      },
    ],
  },
  {
    id: 'sat_reflection',
    dayOfWeek: 5,
    title: '💭 Размышления о неделе',
    description: 'Обдумал неделю. Кое-что пошло не так, но понял, где ошибка.',
    icon: '💭',
    options: [
      {
        id: 'learn_from_mistake',
        text: 'Извлечь уроки',
        effects: { reputationDelta: 2, balanceDelta: 500 },
      },
      {
        id: 'blame_others',
        text: 'Обвинить обстоятельства',
        effects: { reputationDelta: -1, balanceDelta: 0 },
      },
    ],
  },

  // Воскресенье (6)
  {
    id: 'sun_planning',
    dayOfWeek: 6,
    title: '📋 Планирование недели',
    description: 'Спланировал новую неделю, поставил цели и приоритеты.',
    icon: '📋',
    options: [
      {
        id: 'serious_planning',
        text: 'Серьезное планирование',
        effects: { energyDelta: 20, clientModifierPercent: 0.05, clientModifierDays: 7 },
      },
      {
        id: 'casual_planning',
        text: 'Легкое планирование',
        effects: { balanceDelta: 300 },
      },
    ],
  },
  {
    id: 'sun_family',
    dayOfWeek: 6,
    title: '🎉 Семейный праздник',
    description: 'Семья хочет выгулять. Потратишь время на семью, но настроение улучшится.',
    icon: '🎉',
    options: [
      {
        id: 'spend_time_family',
        text: 'Провести время с семьей',
        effects: { energyDelta: 15, reputationDelta: -1, balanceDelta: -500 },
      },
      {
        id: 'skip_family',
        text: 'Работать дальше (+1000₽)',
        effects: { balanceDelta: 1000, energyDelta: -10, reputationDelta: -2 },
      },
    ],
  },
  {
    id: 'sun_anxiety',
    dayOfWeek: 6,
    title: '😰 Предчувствие',
    description: 'Чувствуешь, что на следующей неделе что-то изменится. Волнение.',
    icon: '😰',
    options: [
      {
        id: 'embrace_change',
        text: 'Встретить перемены',
        effects: { energyDelta: 10, clientModifierPercent: 0.05, clientModifierDays: 7 },
      },
      {
        id: 'worry',
        text: 'Волноваться (-энергия)',
        effects: { energyDelta: -15, balanceDelta: 0 },
      },
    ],
  },
]
