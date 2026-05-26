import type { EventTemplate } from '../types/game'

/**
 * First-encounter events — one per Контур-сервис. Each fires when the
 * service is NOT active (noService gate) and is oneTime per run.
 *
 * Спринт 5 ребаланс: расписание событий по новой кривой сложности.
 *   • W1-10 — sandbox (только обязательные сервисы знакомят с собой)
 *   • W11-20 — ramp (опциональные сервисы знакомятся аккуратно)
 *   • W21+ — recurring штрафы за упорный отказ
 *
 * Pattern per event:
 *  - Status-quo option: bleed money / rep / energy (мягкое — не критичное)
 *  - Activation option: «Подключить Контур.Х (Y ₽)»
 *  - Опциональные сервисы дают +20-30% к успеху, но без них **можно** жить.
 */
export const FIRST_ENCOUNTER_EVENTS: EventTemplate[] = [

  // ── Контур.Банк (бесплатно) — расчётный счёт + эквайринг ─────────────
  // ОБЯЗАТЕЛЬНЫЙ. Срабатывает с первой недели, randomChance высокий —
  // эквайринг — это базовая гигиена малого бизнеса. Подключение
  // бесплатное, монетизация через комиссию 1% с безнала.
  {
    id: 'FIRST_BANK',
    title: 'Третья пара уходит без покупки',
    description: 'Молодая пара минут двадцать выбирала, в итоге на кассе: «А картой можно?» — «Только наличные» — «Извините». Уходят. За неделю это уже третий раз. Соседняя кофейня поставила терминал в прошлом месяце, у них теперь очередь.',
    trigger: { dayMin: 1, randomChance: 0.5, noService: 'bank', oneTime: true },
    options: [
      {
        id: 'wait_it_out',
        text: 'Ничего не делать — кому надо, тот заплатит наличкой',
        consequences: { reputationDelta: -1 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Банк (бесплатно — комиссия 1% с безнала)',
        consequences: { serviceId: 'bank' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.ОФД (12 000 ₽) — онлайн-касса ────────────────────────────
  // ОБЯЗАТЕЛЬНЫЙ по 54-ФЗ. Срабатывает на W2 — стартовое условие.
  {
    id: 'FIRST_OFD',
    title: 'Сосед-предприниматель про штраф',
    description: 'Заходит сосед — у него такая же точка через дорогу. Бледный: «Слушай, мне на той неделе штраф 30 тысяч прилетел. Касса есть, ОФД не подключил. Они теперь по каждому чеку штрафуют». Делает паузу. «Ты сам как, подключил?»',
    trigger: { dayMin: 8, randomChance: 0.5, noService: 'ofd', oneTime: true },
    options: [
      {
        id: 'maybe_later',
        text: 'Авось пронесёт',
        consequences: {},
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.ОФД (12 000 ₽)',
        consequences: { balanceDelta: -12000, serviceId: 'ofd' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Маркет (24 000 ₽) — учёт товаров ─────────────────────────
  // Опциональный. W12 — первый из растянутого ряда W12 → W17 → W21 → W24.
  {
    id: 'FIRST_MARKET',
    title: 'Опять кончилось то, что покупали',
    description: 'Постоянная клиентка с порога: «Хлеба не привезли?» — а у вас он стоит, просто за стеллажом, не доглядели. «Я могла бы догадаться. У вас вечно так». Уходит. Складские остатки вы ведёте на бумажке, на бумажке же забываете.',
    trigger: { dayMin: 84, randomChance: 0.12, noService: 'market', oneTime: true },
    options: [
      {
        id: 'excel',
        text: 'Завести Excel-таблицу — сам буду заполнять',
        consequences: { energyDelta: -3 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Маркет (24 000 ₽)',
        consequences: { balanceDelta: -24000, serviceId: 'market' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Диадок (24 000 ₽) — ЭДО ──────────────────────────────────
  // Опциональный. W17 — второй в ряду опциональных, не пара с маркетом.
  {
    id: 'FIRST_DIADOC',
    title: 'Налоговая просит первичку за квартал',
    description: 'Запрос из налоговой: предоставить копии всех первичных документов с поставщиками за последние три месяца. Срок — три рабочих дня. Половина накладных у вас на бумаге, разбросана по папкам, часть отдана в копии и не вернулась. Ночь предстоит длинная.',
    trigger: { dayMin: 119, randomChance: 0.12, noService: 'diadoc', oneTime: true },
    options: [
      {
        id: 'crawl_through_papers',
        text: 'Перерыть всё, что найду — отдам',
        consequences: { energyDelta: -8, reputationDelta: -1 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Диадок (24 000 ₽) — впредь всё в системе',
        consequences: { balanceDelta: -24000, serviceId: 'diadoc' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Фокус (24 000 ₽) — проверка контрагентов ─────────────────
  // Опциональный. W21 — третий в ряду.
  {
    id: 'FIRST_FOKUS',
    title: 'Поставщик-новичок со скидкой',
    description: 'В WhatsApp написал незнакомый поставщик: «Партия со скидкой 30%, остатки прошлого года, нужно срочно». ИНН прислал, документы выглядят нормально. Проверять руками — это в реестры лезть, вёрстку штудировать, и всё равно неуверенно. А срок — до завтра.',
    trigger: { dayMin: 147, randomChance: 0.12, noService: 'fokus', oneTime: true },
    options: [
      {
        id: 'gut_call',
        text: 'Положиться на интуицию — бывает же повезёт',
        consequences: { reputationDelta: -2 },
      },
      {
        id: 'check_manually',
        text: 'Полезть в реестры самому, потерять день',
        consequences: { energyDelta: -6 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Фокус (24 000 ₽) — проверка за минуту',
        consequences: { balanceDelta: -24000, serviceId: 'fokus' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Эльба (36 000 ₽) — бухгалтерия ───────────────────────────
  // Опциональный. W24 — четвёртый.
  {
    id: 'FIRST_ELBA',
    title: 'Светлана просит расчётный лист',
    description: 'Светлана подходит вечером после смены: «Я тут кредит беру, банк просит расчётку за прошлый месяц. У вас же есть?» Расчётки у вас нет. Зарплата в чёрной тетради, реквизитов нет, печатей нет. Светлана терпеливо ждёт ответа.',
    trigger: { dayMin: 168, randomChance: 0.12, noService: 'elba', oneTime: true },
    options: [
      {
        id: 'manual_paper',
        text: 'Сделать вручную, объяснить почему так',
        consequences: { energyDelta: -5, loyaltyDelta: -2 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Эльба (36 000 ₽) — расчётки автоматом',
        consequences: { balanceDelta: -36000, serviceId: 'elba' },
        isContourOption: true,
      },
    ],
  },

  // Спринт 5e: FIRST_EXTERN удалён — Экстерн скрыт из списка сервисов
  // (его функционал теперь поглощён Эльбой).

  // ─────────────────────────────────────────────────────────────────────
  // Recurring crisis events — после ramp-window (W14+).
  // Не oneTime, могут срабатывать несколько раз. Это «жёсткие напоминания»
  // только для упорно отказывающихся, и редкие.
  // ─────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────
  // PAIN events (Спринт 6, Economy #6 — probabilistic pain).
  //
  // Daily Pain Engine deductions retired в d7305a7 — был nagging tax-like.
  // Эти события — другой жанр: редкие крисисы со story и выбором. Игрок
  // запоминает «помните как налоговая пришла на W18 и Диадок спас», а не
  // фоновое «теряете 4% выручки каждый день». Сервис ощущается как
  // страховка с конкретным моментом payoff.
  //
  // Окно W14-26 — играет когда игрок только решает, нужен ли сервис.
  // Раньше pain-events фирились W22-28 — слишком поздно, игрок уже без них
  // справлялся. ROI subscription: ~5-8 недель (один-два предотвращённых
  // crisis'а окупают подписку).
  //
  // noService gate: событие фирится ТОЛЬКО когда сервис неактивен. Subscribe
  // option активирует сервис + платит подписку, что дешевле штрафа долгосрочно.
  // ─────────────────────────────────────────────────────────────────────

  {
    id: 'PAIN_DIADOC',
    title: 'Налоговая запросила накладные за квартал',
    description: 'Камеральная проверка по контрагенту, у которого вы закупались. Налоговая прислала запрос: оригиналы первички за квартал, срок — 5 рабочих дней. Половина накладных у вас в папках, часть не нашлась. Если не предоставить — штраф 15 000 ₽ за «нарушение документооборота».',
    trigger: { dayMin: 98, randomChance: 0.06, noService: 'diadoc', oneTime: false, requiresTriggeredEvent: 'FIRST_DIADOC' },
    options: [
      {
        id: 'pay',
        text: 'Заплатить штраф (15 000 ₽) + потерять день на поиски',
        consequences: { balanceDelta: -15000, energyDelta: -8, reputationDelta: -1 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Диадок (24 000 ₽) — все накладные в системе',
        consequences: { balanceDelta: -24000, serviceId: 'diadoc' },
        isContourOption: true,
      },
    ],
  },

  {
    id: 'PAIN_FOKUS',
    title: 'Поставщик-новичок оказался липовым',
    description: 'Заказ от незнакомого ИП, скидка 30%. Партия пришла бракованная, поставщик не отвечает. Юрист из района говорит: ИП в реестре «фирм-однодневок», деньги не вернуть. 12 000 ₽ в минусе, плюс репутация у тех, кто эту партию уже купил.',
    trigger: { dayMin: 98, randomChance: 0.06, noService: 'fokus', oneTime: false, requiresTriggeredEvent: 'FIRST_FOKUS' },
    options: [
      {
        id: 'eat_loss',
        text: 'Списать в потери (12 000 ₽)',
        consequences: { balanceDelta: -12000, reputationDelta: -2 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Фокус (24 000 ₽) — впредь проверка за минуту',
        consequences: { balanceDelta: -24000, serviceId: 'fokus' },
        isContourOption: true,
      },
    ],
  },

  {
    id: 'PAIN_ELBA',
    title: 'Ошибка в декларации УСН — пеня',
    description: 'Налоговая нашла недоплату УСН за прошлый квартал — пропустили вычет. Пеня 10 000 ₽ + ночь работы на пересчёт прошлых документов. «У всех бывает», говорит знакомый бухгалтер по телефону.',
    trigger: { dayMin: 112, randomChance: 0.05, noService: 'elba', oneTime: false, requiresTriggeredEvent: 'FIRST_ELBA' },
    options: [
      {
        id: 'pay_fine',
        text: 'Заплатить пеню (10 000 ₽) + день на пересчёт',
        consequences: { balanceDelta: -10000, energyDelta: -8 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Эльба (36 000 ₽) — расчёт автоматом, ошибок нет',
        consequences: { balanceDelta: -36000, serviceId: 'elba' },
        isContourOption: true,
      },
    ],
  },

  // PAIN_EXTERN удалён вместе с FIRST_EXTERN.
]
