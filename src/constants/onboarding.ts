import type { OnboardingStage, OnboardingStageConfig, ServiceType } from '../types/game'

export const SERVICE_UNLOCK_MAP: Record<OnboardingStage, ServiceType[]> = {
  0: ['bank'],  // Week 1: только банк
  1: ['bank', 'ofd'],  // Week 1-2: банк + ОФД (обязательно)
  2: ['bank', 'ofd', 'market'],  // Week 3-4: маркет (если нет убытков)
  3: ['bank', 'ofd', 'market', 'diadoc', 'fokus'],  // Week 5-6: диадок + фокус
  4: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],  // Week 7+: все
}

export const ONBOARDING_STAGES: OnboardingStageConfig[] = [
  {
    stage: 0,
    dayRange: [1, 7],  // Week 1 only
    unlocksServices: ['bank'],
    requiredAction: 'activate_bank',
    steps: [
      {
        id: '0-0',
        title: 'Добро пожаловать!',
        text: 'Поздравляем — вы открываете свой бизнес! Первая неделя критична. Без банка вы теряете 40% клиентов, так как люди платят картами. Откройте счёт в Контур.Банке — это 5 минут.',
      },
      {
        id: '0-1',
        title: 'Контур.Банк',
        text: 'Контур.Банк открывает расчётный счёт онлайн. Никаких очередей, льготное обслуживание. Это ваше спасение.',
        requiresAction: 'activate_bank',
      },
    ],
  },
  {
    stage: 1,
    dayRange: [8, 14],  // Week 2
    unlocksServices: ['bank', 'ofd'],
    requiredAction: 'activate_ofd',
    steps: [
      {
        id: '1-0',
        title: 'Первый день прошёл!',
        text: 'Отлично! Вы приняли первых клиентов. Теперь нужна онлайн-касса — без неё вы не сможете принимать оплату легально и рискуете штрафом от ФНС до 30 000 ₽.',
      },
      {
        id: '1-1',
        title: 'Купите кассу',
        text: 'Перейдите в «Управление» → раздел Кассы. Выберите подходящую модель. Это первое обязательное оборудование.',
        requiresAction: 'buy_register',
      },
      {
        id: '1-2',
        title: 'Контур.ОФД — к кассе обязателен',
        text: 'Каждый чек должен уходить в ФНС онлайн. Без ОФД касса работает незаконно, штраф — до 10 000 ₽ за каждый чек. Подключите прямо сейчас.',
        requiresAction: 'activate_ofd',
      },
    ],
  },
  {
    stage: 2,
    dayRange: [15, 28],  // Weeks 3-4
    unlocksServices: ['bank', 'ofd', 'market'],
    steps: [
      {
        id: '2-0',
        title: 'Боль: потери товара',
        text: 'Две недели вы вели учёт вручную. Вчера потеряли несколько позиций, не записали срок — товар просрочился. Теперь убытки.',
      },
      {
        id: '2-1',
        title: 'Контур.Маркет спасает',
        text: 'Маркет автоматизирует всё: остатки, сроки, маркировку. Снижает потери на 20%. Если продаёте товары — это must have.',
        requiresAction: 'activate_market',
      },
    ],
  },
  {
    stage: 3,
    dayRange: [29, 42],  // Weeks 5-6
    unlocksServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus'],
    steps: [
      {
        id: '3-0',
        title: 'Проблема с поставщиком',
        text: 'Месяц работаете с одним поставщиком. Вдруг он исчезает, документы на бумаге теряются, доставка в хаосе. Нужна цифра.',
      },
      {
        id: '3-1',
        title: 'Диадок и Фокус',
        text: 'Диадок = электронный документооборот, без бумаг и задержек. Фокус = проверка контрагентов на риски. Вместе они спасают от головной боли с закупками.',
        requiresAction: 'activate_diadoc',
      },
    ],
  },
  {
    stage: 4,
    dayRange: [43, 365],  // Weeks 7+ (rest of year)
    unlocksServices: ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern'],
    steps: [
      {
        id: '4-0',
        title: 'Второй месяц: налоги',
        text: 'Пришло время считать налоги и сдавать отчётность. Без правильного учёта штрафы. Персонал тоже требует внимания — они выгорают от перегрузок.',
      },
      {
        id: '4-1',
        title: 'Эльба и Экстерн',
        text: 'Эльба = онлайн-бухгалтерия и управление персоналом. Экстерн = автоматическая сдача отчётов в ФНС. Полный stack для масштабирования.',
        requiresAction: 'activate_elba',
      },
    ],
  },
]

export const ONBOARDING_STAGE_LABELS: Record<OnboardingStage, string> = {
  0: 'Регистрация бизнеса',
  1: 'Первые продажи',
  2: 'Учёт товаров',
  3: 'Работа с поставщиками',
  4: 'Масштаб и отчётность',
}
