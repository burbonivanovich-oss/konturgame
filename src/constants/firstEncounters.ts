import type { EventTemplate } from '../types/game'

/**
 * First-encounter events — one per Контур-сервис. Each fires when the
 * service is NOT active (noService gate) and is oneTime per run, so it's
 * always a "first time you meet this" moment, not recurring nag.
 *
 * Pattern per event:
 *  - Domain pain: a real pain that maps to what the service solves
 *  - Status-quo option: bleed money / rep / energy without the service
 *  - Activation option: «Подключить Контур.Х (Y ₽)» — pays annual price
 *    upfront, activates the service for the rest of the run via the
 *    serviceId consequence (which also auto-unlocks if needed)
 *
 * Pricing in option text mirrors annualPrice from business.ts. Money is
 * the only mechanic shown to the player per the visibility rule.
 */
export const FIRST_ENCOUNTER_EVENTS: EventTemplate[] = [

  // ── Контур.Банк (36 000 ₽) — расчётный счёт + эквайринг ─────────────
  {
    id: 'FIRST_BANK',
    title: 'Третья пара уходит без покупки',
    description: 'Молодая пара минут двадцать выбирала, в итоге на кассе: «А картой можно?» — «Только наличные» — «Извините». Уходят. За неделю это уже третий раз. Соседняя кофейня поставила терминал в прошлом месяце, у них теперь очередь.',
    trigger: { dayMin: 5, randomChance: 0.1, noService: 'bank', oneTime: true },
    options: [
      {
        id: 'wait_it_out',
        text: 'Ничего не делать — кому надо, тот заплатит наличкой',
        consequences: { reputationDelta: -2 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Банк (36 000 ₽)',
        consequences: { balanceDelta: -36000, serviceId: 'bank' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.ОФД (12 000 ₽) — онлайн-касса ────────────────────────────
  {
    id: 'FIRST_OFD',
    title: 'Сосед-предприниматель про штраф',
    description: 'Заходит сосед — у него такая же точка через дорогу. Бледный: «Слушай, мне на той неделе штраф 60 тысяч прилетел. Касса есть, ОФД не подключил. Они теперь по каждому чеку штрафуют, у меня их за месяц набралось». Делает паузу. «Ты сам как, подключил?»',
    trigger: { dayMin: 5, randomChance: 0.12, noService: 'ofd', oneTime: true },
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

  // ── Контур.Маркет (48 000 ₽) — учёт товаров ─────────────────────────
  {
    id: 'FIRST_MARKET',
    title: 'Опять кончилось то, что покупали',
    description: 'Постоянная клиентка с порога: «Хлеба не привезли?» — а у вас он стоит, просто за стеллажом, не доглядели. «Я могла бы догадаться. У вас вечно так». Уходит. Складские остатки вы ведёте на бумажке, на бумажке же забываете.',
    trigger: { dayMin: 15, randomChance: 0.1, noService: 'market', oneTime: true },
    options: [
      {
        id: 'excel',
        text: 'Завести Excel-таблицу — сам буду заполнять',
        consequences: { energyDelta: -5 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Маркет (48 000 ₽)',
        consequences: { balanceDelta: -48000, serviceId: 'market' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Диадок (24 000 ₽) — ЭДО ──────────────────────────────────
  {
    id: 'FIRST_DIADOC',
    title: 'Налоговая просит первичку за квартал',
    description: 'Запрос из налоговой: предоставить копии всех первичных документов с поставщиками за последние три месяца. Срок — три рабочих дня. Половина накладных у вас на бумаге, разбросана по папкам, часть отдана в копии и не вернулась. Ночь предстоит длинная.',
    trigger: { dayMin: 29, randomChance: 0.1, noService: 'diadoc', oneTime: true },
    options: [
      {
        id: 'crawl_through_papers',
        text: 'Перерыть всё, что найду — отдам',
        consequences: { energyDelta: -15, reputationDelta: -2 },
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
  {
    id: 'FIRST_FOKUS',
    title: 'Поставщик-новичок со скидкой',
    description: 'В WhatsApp написал незнакомый поставщик: «Партия со скидкой 30%, остатки прошлого года, нужно срочно». ИНН прислал, документы выглядят нормально. Проверять руками — это в реестры лезть, вёрстку штудировать, и всё равно неуверенно. А срок — до завтра.',
    trigger: { dayMin: 29, randomChance: 0.1, noService: 'fokus', oneTime: true },
    options: [
      {
        id: 'gut_call',
        text: 'Положиться на интуицию — бывает же повезёт',
        consequences: { reputationDelta: -3 },
      },
      {
        id: 'check_manually',
        text: 'Полезть в реестры самому, потерять день',
        consequences: { energyDelta: -10 },
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
  {
    id: 'FIRST_ELBA',
    title: 'Светлана просит расчётный лист',
    description: 'Светлана подходит вечером после смены: «Я тут кредит беру, банк просит расчётку за прошлый месяц. У вас же есть?» Расчётки у вас нет. Зарплата в чёрной тетради, реквизитов нет, печатей нет. Светлана терпеливо ждёт ответа.',
    trigger: { dayMin: 43, randomChance: 0.12, noService: 'elba', oneTime: true },
    options: [
      {
        id: 'manual_paper',
        text: 'Сделать вручную, объяснить почему так',
        consequences: { energyDelta: -8, loyaltyDelta: -3 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Эльба (36 000 ₽) — расчётки автоматом',
        consequences: { balanceDelta: -36000, serviceId: 'elba' },
        isContourOption: true,
      },
    ],
  },

  // ── Контур.Экстерн (48 000 ₽) — отчётность ФНС ──────────────────────
  {
    id: 'FIRST_EXTERN',
    title: 'Декларация на следующей неделе',
    description: 'В чате предпринимателей паника: декларация по УСН до 30-го, штраф за просрочку — 5% от суммы налога за каждый месяц, минимум 1 000 ₽. На сайте ФНС форма требует электронную подпись и не загружается с третьего раза. Бухгалтерская контора в районе берёт 8 000 ₽ за разовую сдачу — но у них тоже очередь.',
    trigger: { dayMin: 43, randomChance: 0.12, noService: 'extern', oneTime: true },
    options: [
      {
        id: 'one_time_accountant',
        text: 'Заплатить разово конторе (8 000 ₽)',
        consequences: { balanceDelta: -8000 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Экстерн (48 000 ₽) — на год вперёд',
        consequences: { balanceDelta: -48000, serviceId: 'extern' },
        isContourOption: true,
      },
    ],
  },
]
