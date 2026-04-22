import type { EventTemplate } from '../types/game'

// Moral dilemmas: no obviously correct answer. Both options have real costs.
// isMoralDilemma: true marks these for special UI treatment (amber accent).
export const MORAL_DILEMMA_EVENTS: EventTemplate[] = [
  {
    id: 'MORAL_CASH',
    title: 'Просьба постоянного клиента',
    description: 'Алексей — ходит к вам уже два года, никогда не задерживает оплату. Сегодня тихо говорит: "Мне нужно купить на 3 000 ₽, но без чека. У меня следователь смотрит выписки по делу об алиментах. Я тебе доверяю." Вы смотрите на него. Он явно не лжёт.',
    trigger: { dayMin: 28, randomChance: 0.025, oneTime: true },
    isMoralDilemma: true,
    options: [
      {
        id: 'help',
        text: 'Провести без чека — помочь человеку',
        consequences: { loyaltyDelta: 8, reputationDelta: -3 },
      },
      {
        id: 'refuse',
        text: 'Отказать — закон есть закон',
        consequences: { loyaltyDelta: -6, reputationDelta: 2 },
      },
    ],
  },

  {
    id: 'MORAL_CHEAP_SUPPLIER',
    title: 'Слишком дешёвое предложение',
    description: 'Новый поставщик предлагает цены на 22% ниже рынка. Спрашиваете, как такое возможно. После паузы: "Работаем с людьми, которым важна занятость, а не оформление." Вы понимаете что это значит. Контур.Фокус не активирован — официально ничего проверить нельзя.',
    trigger: { dayMin: 25, randomChance: 0.02, oneTime: true, noService: 'fokus' },
    isMoralDilemma: true,
    options: [
      {
        id: 'cheap',
        text: 'Перейти к дешёвому поставщику (сэкономить, закрыть глаза)',
        consequences: { balanceDelta: 9000, reputationDelta: -6 },
      },
      {
        id: 'stay',
        text: 'Остаться с проверенным (потерять прибыль, сохранить совесть)',
        consequences: { reputationDelta: 4 },
      },
      {
        id: 'fokus_check',
        text: 'Проверить через Контур.Фокус перед решением',
        consequences: { balanceDelta: -3000, reputationDelta: 5 },
        requiredService: 'fokus',
        isContourOption: true,
      },
    ],
  },

  {
    id: 'MORAL_STAR_STEALS',
    title: 'Лучший сотрудник ворует',
    description: 'Камера зафиксировала: ваш лучший продавец берёт из кассы по 400–600 ₽ в день. Он даёт треть всей выручки. Если уволить прямо сейчас — три недели просядет поток клиентов. Остальные сотрудники пока не знают. Или знают?',
    trigger: { dayMin: 35, randomChance: 0.02, oneTime: true },
    isMoralDilemma: true,
    options: [
      {
        id: 'fire',
        text: 'Уволить немедленно (честность дороже дохода)',
        consequences: { clientModifier: -0.25, clientModifierDays: 21, reputationDelta: 5 },
      },
      {
        id: 'warn',
        text: 'Поговорить и дать второй шанс (удержать из зарплаты)',
        consequences: { loyaltyDelta: -10, reputationDelta: 2 },
      },
      {
        id: 'keep_silent',
        text: 'Сделать вид, что не заметили (стабильность важнее)',
        consequences: { loyaltyDelta: -18, reputationDelta: -4 },
      },
    ],
  },

  {
    id: 'MORAL_INSPECTOR_HINT',
    title: 'Намёк инспектора',
    description: 'Инспектор закончил проверку, собирает бумаги и негромко говорит: "Можно решить вопрос иначе. 20 000 ₽ — и протокол не составляется. Без квитанций." Он смотрит в сторону. В вашей бухгалтерии действительно есть пара спорных моментов.',
    trigger: { dayMin: 20, randomChance: 0.02, oneTime: true },
    isMoralDilemma: true,
    options: [
      {
        id: 'bribe',
        text: 'Дать взятку (−20 000 ₽, всё забыто)',
        consequences: { balanceDelta: -20000 },
      },
      {
        id: 'refuse_bribe',
        text: 'Отказать и оформить официально (−38 000 ₽ штраф, репутация +8)',
        consequences: { balanceDelta: -38000, reputationDelta: 8 },
      },
    ],
  },

  {
    id: 'MORAL_COMPETITOR_DATA',
    title: 'Чужая база клиентов',
    description: 'Бывший сотрудник конкурента приходит с флешкой: "Здесь 400 контактов клиентов Анны. Продам за 12 000 ₽. Она меня уволила без выплат, мне всё равно." База выглядит настоящей. Использование незаконно, но шанс реальный.',
    trigger: { dayMin: 30, randomChance: 0.02, oneTime: true },
    isMoralDilemma: true,
    options: [
      {
        id: 'buy',
        text: 'Купить базу (−12 000 ₽, +клиенты на 2 недели)',
        consequences: { balanceDelta: -12000, clientModifier: 0.2, clientModifierDays: 14 },
      },
      {
        id: 'refuse',
        text: 'Отказать — это чужие данные',
        consequences: { reputationDelta: 4 },
      },
    ],
  },
]
