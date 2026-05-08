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

  // ── Контур.Банк (36 000 ₽) — расчётный счёт + эквайринг ─────────────
  // Обязательный для эквайринга, но не критичный — без банка можно
  // принимать только наличку, теряя ~30% клиентов.
  {
    id: 'FIRST_BANK',
    title: 'Третья пара уходит без покупки',
    description: 'Молодая пара минут двадцать выбирала, в итоге на кассе: «А картой можно?» — «Только наличные» — «Извините». Уходят. За неделю это уже третий раз. Соседняя кофейня поставила терминал в прошлом месяце, у них теперь очередь.',
    trigger: { dayMin: 21, randomChance: 0.15, noService: 'bank', oneTime: true },
    options: [
      {
        id: 'wait_it_out',
        text: 'Ничего не делать — кому надо, тот заплатит наличкой',
        consequences: { reputationDelta: -1 },
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
  // Обязательный по 54-ФЗ. Без него реальные штрафы.
  {
    id: 'FIRST_OFD',
    title: 'Сосед-предприниматель про штраф',
    description: 'Заходит сосед — у него такая же точка через дорогу. Бледный: «Слушай, мне на той неделе штраф 30 тысяч прилетел. Касса есть, ОФД не подключил. Они теперь по каждому чеку штрафуют». Делает паузу. «Ты сам как, подключил?»',
    trigger: { dayMin: 28, randomChance: 0.18, noService: 'ofd', oneTime: true },
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
  // Опциональный. Без него — лишняя порча и упускание остатков, но
  // прожить можно с тетрадкой.
  {
    id: 'FIRST_MARKET',
    title: 'Опять кончилось то, что покупали',
    description: 'Постоянная клиентка с порога: «Хлеба не привезли?» — а у вас он стоит, просто за стеллажом, не доглядели. «Я могла бы догадаться. У вас вечно так». Уходит. Складские остатки вы ведёте на бумажке, на бумажке же забываете.',
    trigger: { dayMin: 56, randomChance: 0.10, noService: 'market', oneTime: true },
    options: [
      {
        id: 'excel',
        text: 'Завести Excel-таблицу — сам буду заполнять',
        consequences: { energyDelta: -3 },
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
  // Опциональный.
  {
    id: 'FIRST_DIADOC',
    title: 'Налоговая просит первичку за квартал',
    description: 'Запрос из налоговой: предоставить копии всех первичных документов с поставщиками за последние три месяца. Срок — три рабочих дня. Половина накладных у вас на бумаге, разбросана по папкам, часть отдана в копии и не вернулась. Ночь предстоит длинная.',
    trigger: { dayMin: 84, randomChance: 0.10, noService: 'diadoc', oneTime: true },
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
  // Опциональный.
  {
    id: 'FIRST_FOKUS',
    title: 'Поставщик-новичок со скидкой',
    description: 'В WhatsApp написал незнакомый поставщик: «Партия со скидкой 30%, остатки прошлого года, нужно срочно». ИНН прислал, документы выглядят нормально. Проверять руками — это в реестры лезть, вёрстку штудировать, и всё равно неуверенно. А срок — до завтра.',
    trigger: { dayMin: 91, randomChance: 0.10, noService: 'fokus', oneTime: true },
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
  // Опциональный.
  {
    id: 'FIRST_ELBA',
    title: 'Светлана просит расчётный лист',
    description: 'Светлана подходит вечером после смены: «Я тут кредит беру, банк просит расчётку за прошлый месяц. У вас же есть?» Расчётки у вас нет. Зарплата в чёрной тетради, реквизитов нет, печатей нет. Светлана терпеливо ждёт ответа.',
    trigger: { dayMin: 105, randomChance: 0.12, noService: 'elba', oneTime: true },
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

  // ── Контур.Экстерн (48 000 ₽) — отчётность ФНС ──────────────────────
  // Опциональный.
  {
    id: 'FIRST_EXTERN',
    title: 'Декларация на следующей неделе',
    description: 'В чате предпринимателей паника: декларация по УСН до 30-го, штраф за просрочку — 5% от суммы налога за каждый месяц, минимум 1 000 ₽. На сайте ФНС форма требует электронную подпись и не загружается с третьего раза. Бухгалтерская контора в районе берёт 8 000 ₽ за разовую сдачу — но у них тоже очередь.',
    trigger: { dayMin: 119, randomChance: 0.12, noService: 'extern', oneTime: true },
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

  // ─────────────────────────────────────────────────────────────────────
  // Recurring crisis events — после ramp-window (W14+).
  // Не oneTime, могут срабатывать несколько раз. Это «жёсткие напоминания»
  // только для упорно отказывающихся, и редкие.
  // ─────────────────────────────────────────────────────────────────────

  {
    id: 'PAIN_DIADOC',
    title: 'Штраф за «нарушение документооборота»',
    description: 'Камеральная проверка по контрагенту, у которого вы закупались. Налоговая выявила расхождения в первичке: часть оригиналов не нашлась, часть — без подписи. Вешают 18 000 ₽ штрафа.',
    trigger: { dayMin: 105, randomChance: 0.04, noService: 'diadoc', oneTime: false },
    options: [
      {
        id: 'pay',
        text: 'Заплатить штраф (18 000 ₽)',
        consequences: { balanceDelta: -18000, reputationDelta: -1 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Диадок (24 000 ₽) — закрыть на годы',
        consequences: { balanceDelta: -24000, serviceId: 'diadoc' },
        isContourOption: true,
      },
    ],
  },

  {
    id: 'PAIN_FOKUS',
    title: 'Поставщик оказался в реестре недобросовестных',
    description: 'Партия пришла бракованная, поставщик пропал. Через знакомого юриста выясняется: ИП в реестре «фирм-однодневок». Деньги вернуть нереально.',
    trigger: { dayMin: 119, randomChance: 0.04, noService: 'fokus', oneTime: false },
    options: [
      {
        id: 'eat_loss',
        text: 'Списать в потери (25 000 ₽)',
        consequences: { balanceDelta: -25000, reputationDelta: -2 },
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
    title: 'Ошибка в декларации — штраф',
    description: 'Налоговая нашла недоплату по УСН за прошлый квартал. Штраф 15 000 ₽ + пени.',
    trigger: { dayMin: 133, randomChance: 0.04, noService: 'elba', oneTime: false },
    options: [
      {
        id: 'pay_fine',
        text: 'Заплатить (15 000 ₽)',
        consequences: { balanceDelta: -15000 },
      },
      {
        id: 'subscribe',
        text: 'Подключить Контур.Эльба (36 000 ₽) — расчёт автоматом',
        consequences: { balanceDelta: -36000, serviceId: 'elba' },
        isContourOption: true,
      },
    ],
  },

  {
    id: 'PAIN_EXTERN',
    title: 'Блокировка счёта за просрочку отчётности',
    description: 'Утром не проходит платёж поставщику. Звонок в банк: «Счёт ограничен по требованию ФНС». В налоговой: «Отчёт не сдан в срок, разблокируем после сдачи».',
    trigger: { dayMin: 147, randomChance: 0.04, noService: 'extern', oneTime: false },
    options: [
      {
        id: 'rush_courier',
        text: 'Курьер с бумагами в инспекцию (8 000 ₽)',
        consequences: { balanceDelta: -8000, reputationDelta: -2 },
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
