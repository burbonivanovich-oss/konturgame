import type { EventTemplate } from '../types/game'

/**
 * NPC arcs (Phase C). Eight characters, each gets a 3-episode arc:
 *
 *   Episode 1 — meet/intro (weeks 5-10): one-shot reveal event,
 *               not gated by relationship. Establishes who they are.
 *   Episode 2 — test/conflict (weeks 20-25): a meaningful choice with
 *               real consequences. Gated by relationship from episode 1.
 *   Episode 3 — resolve (weeks 35-45): closure. Outcome reflected in
 *               buildNpcExitLines.
 *
 * After episode 3 the character moves to background — no more arc events,
 * just passive flavour from npcManager. Goal: NPCs feel finite and real,
 * not procedural relationship machines.
 */

export const NPC_ARC_EVENTS: EventTemplate[] = [

  // ──────────────────────────────────────────────────────────────────
  // KATYA — подруга-бухгалтер
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_KATYA_MEET',
    title: 'Катя приехала с пирогом',
    description:
      'Катя зашла без предупреждения, с яблочным пирогом на тарелке. «Я тут увидела пост — ты бизнес открыл? Отчёты сама делаешь? Господи, не делай этого. Я тебе бесплатно первую квартальную сделаю — и забудь. И не благодари, я просто не могу смотреть на это».',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'katya',
    options: [
      {
        id: 'accept_help',
        text: 'Принять помощь — она в этом разбирается лучше',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'thank_buy',
        text: 'Поблагодарить, но настоять на оплате (−2 000 ₽)',
        consequences: { balanceDelta: -2000, reputationDelta: 1 },
        npcRelationshipDelta: 8,
      },
    ],
  },
  {
    id: 'NPC_KATYA_TEST',
    title: 'Катя нашла серую схему',
    description:
      'Катя позвонила в субботу: «Слушай, я тут смотрела документы. Если оформить часть выручки через ИП твоей мамы — сэкономишь 80 000 в год на налогах. Технически законно, но если налоговая копнёт — будут вопросы. Решай сам, я просто говорю как есть».',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'katya',
    isMoralDilemma: true,
    options: [
      {
        id: 'use_scheme',
        text: '«Давай попробуем» (+80 000 ₽, репутация ниже если попадёшься)',
        consequences: { balanceDelta: 80000, reputationDelta: -4 },
        npcRelationshipDelta: 4,
      },
      {
        id: 'refuse_clean',
        text: '«Спасибо, но мне нужно спать спокойно»',
        consequences: { reputationDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'extern_check',
        text: 'Через Контур.Экстерн проверить, нет ли способа проще',
        consequences: { reputationDelta: 6 },
        npcRelationshipDelta: 12,
        requiredService: 'extern',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'NPC_KATYA_RESOLVE',
    title: 'Катя зовёт в партнёры',
    description:
      'Катя приходит вечером, ставит чайник без спроса. «Слушай. Я ухожу из своей конторы. Хочу делать бутиковую бухгалтерию для таких, как ты. Ты — мой первый клиент по плану. Платно. Но я хочу твой совет: стоит ли вообще?» Ждёт честного ответа.',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 50 },
    npcId: 'katya',
    options: [
      {
        id: 'encourage',
        text: '«Иди, я с тобой» — стать первым клиентом',
        consequences: { balanceDelta: -12000, reputationDelta: 4, loyaltyDelta: 3 },
        npcRelationshipDelta: 16,
      },
      {
        id: 'caution',
        text: '«Подожди полгода — слишком рискованно сейчас»',
        consequences: {},
        npcRelationshipDelta: -4,
      },
      {
        id: 'invest',
        text: 'Вложить 30 000 ₽ как бизнес-ангел',
        consequences: { balanceDelta: -30000, reputationDelta: 6, loyaltyDelta: 4 },
        npcRelationshipDelta: 20,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // VIKTOR — сосед-конкурент
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_VIKTOR_MEET',
    title: 'Виктор зашёл познакомиться',
    description:
      'Через неделю после того как ты повесил вывеску, через дорогу открылся такой же бизнес. Хозяин зашёл сам — представился: «Виктор. Я через дорогу. Будем соседи. Конкурируем — нормально, но без подлянок, ладно?» Пожал руку. Уверенно, но без агрессии.',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'viktor',
    options: [
      {
        id: 'friendly',
        text: 'Тепло принять — соседи же',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'guarded',
        text: 'Пожать руку, но без эмоций — посмотрим как себя поведёт',
        consequences: {},
        npcRelationshipDelta: 0,
      },
      {
        id: 'cold',
        text: '«Удачи» — и закрыл дверь. Конкурент есть конкурент',
        consequences: {},
        npcRelationshipDelta: -8,
      },
    ],
  },
  {
    id: 'NPC_VIKTOR_TEST',
    title: 'Виктор демпингует',
    description:
      'Виктор повесил баннер: «Цены ниже на 20%». Знаешь, что в минус торгует — но клиенты пошли к нему. Можешь демпинговать в ответ, можешь договориться, можешь работать как работал.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'viktor',
    isMoralDilemma: true,
    options: [
      {
        id: 'price_war',
        text: 'Демпинговать в ответ (−10% к чеку на 14 дней)',
        consequences: { checkModifier: -0.10, checkModifierDays: 14, clientModifier: 0.08, clientModifierDays: 14 },
        npcRelationshipDelta: -15,
      },
      {
        id: 'talk_truce',
        text: 'Зайти к нему, предложить не убивать друг друга',
        consequences: { reputationDelta: 3 },
        npcRelationshipDelta: 14,
      },
      {
        id: 'quality_focus',
        text: 'Не реагировать — сфокусироваться на качестве',
        consequences: { reputationDelta: 4, loyaltyDelta: 3 },
        npcRelationshipDelta: 4,
      },
    ],
  },
  {
    id: 'NPC_VIKTOR_RESOLVE',
    title: 'Виктор закрывается',
    description:
      'Виктор зашёл с папкой документов. «Слушай. Я закрываюсь. Не вытащил. Аренду перекинули, поставщик кинул, жена ушла — много всего». Молчит. «Если возьмёшь моё оборудование за полцены — мне это поможет. И я просто хотел, чтобы ты знал — ты выиграл честно».',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'viktor',
    options: [
      {
        id: 'buy_gear',
        text: 'Купить оборудование (−40 000 ₽, +15% к пропускной)',
        consequences: { balanceDelta: -40000, clientModifier: 0.10, clientModifierDays: 60, reputationDelta: 3 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'help_anyway',
        text: 'Дать 20 000 ₽ просто так — на старт где-то ещё',
        consequences: { balanceDelta: -20000, reputationDelta: 8, loyaltyDelta: 2 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'walk_away',
        text: '«Сожалею» — и ничего не сделать',
        consequences: { reputationDelta: -2 },
        npcRelationshipDelta: -8,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // DENIS — школьный друг-инвестор
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_DENIS_MEET',
    title: 'Денис позвонил из Лондона',
    description:
      'Звонок ночью: «Стас? Денис, помнишь меня? Мы в десятом классе спорили про бизнес. Я через знакомых увидел, что ты открылся. Слушай, я тут на одном проекте поднял прилично — могу дать тебе 100 тысяч под 0% на полгода. Просто чтобы ты был чуть свободнее. Дружба плюс ставка на будущее».',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'denis',
    options: [
      {
        id: 'accept_full',
        text: 'Принять 100 000 ₽ без процентов',
        consequences: { balanceDelta: 100000 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'accept_small',
        text: 'Взять 30 000 ₽ — больше неудобно',
        consequences: { balanceDelta: 30000 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse_pride',
        text: 'Отказаться — деньги портят дружбу',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 4,
      },
    ],
  },
  {
    id: 'NPC_DENIS_TEST',
    title: 'Денис просит долю',
    description:
      'Денис прилетел на пару дней. Сидит, пьёт чай, улыбается: «Слушай. Помнишь те 100 тысяч? Я не за процентами. Я за долей. 15% — и я возвращаю плюс ещё подкину на расширение. Это не друг говорит, это инвестор. Подумай».',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 40 },
    npcId: 'denis',
    isMoralDilemma: true,
    options: [
      {
        id: 'give_share',
        text: 'Дать 15% — друг с долей лучше, чем кредитор',
        consequences: { balanceDelta: 50000, reputationDelta: 1 },
        npcRelationshipDelta: 14,
      },
      {
        id: 'pay_back',
        text: 'Вернуть 100 000 ₽ полностью — и закрыть тему',
        consequences: { balanceDelta: -100000, reputationDelta: 3 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'negotiate',
        text: '«Долю не дам — давай 8% годовых»',
        consequences: {},
        npcRelationshipDelta: -4,
      },
    ],
  },
  {
    id: 'NPC_DENIS_RESOLVE',
    title: 'Денис зовёт в проект',
    description:
      'Звонок: «Я открываю новый проект — сеть точек. Мне нужен человек, который умеет держать локацию. Хочу тебя. Зарплата х3 от того, что ты сейчас имеешь. Но это значит закрыть твоё дело и выйти из него. Подумай неделю. Это серьёзный разговор».',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 60 },
    npcId: 'denis',
    isMoralDilemma: true,
    options: [
      {
        id: 'stay_owner',
        text: '«Я остаюсь у себя. Спасибо, друг»',
        consequences: { reputationDelta: 4, loyaltyDelta: 3 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'side_consult',
        text: 'Стать его консультантом, не уходя со своего (+100 000 ₽ разовый)',
        consequences: { balanceDelta: 100000, reputationDelta: 1 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'consider_seriously',
        text: 'Согласиться обсудить детали — может это и есть выход',
        consequences: { balanceDelta: 50000 },
        npcRelationshipDelta: 8,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // IRINA — мама-наставница
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_IRINA_MEET',
    title: 'Мама зашла оценить',
    description:
      'Мама пришла без звонка, в воскресенье. Молча обошла всё помещение, потрогала прилавок, посмотрела ценники. Села. «Ты всё чисто делаешь, я вижу. Только улыбайся клиентам почаще. Иначе они тебе всё равно не простят, что ты не такой как все». Долго пила чай, потом ушла. Не похвалила и не отругала.',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'irina',
    options: [
      {
        id: 'take_advice',
        text: 'Запомнить — она знает, о чём говорит',
        consequences: { loyaltyDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'shrug_off',
        text: '«Мам, у меня современный бизнес» — и забыть',
        consequences: { loyaltyDelta: -2 },
        npcRelationshipDelta: -6,
      },
    ],
  },
  {
    id: 'NPC_IRINA_TEST',
    title: 'Мама в больнице',
    description:
      'Звонок от соседки: маму увезли в больницу. Не критично, но капельницы и обследования. Нужно быть рядом неделю — забирать, кормить, возить. Бизнес работает один, без тебя. Это не выбор, это вопрос как.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'irina',
    isMoralDilemma: true,
    options: [
      {
        id: 'all_in',
        text: 'Закрыть на неделю — мама важнее (−7 дней выручки)',
        consequences: { balanceDelta: -25000, reputationDelta: 3 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'split',
        text: 'Бизнес работает с помощником, ты по вечерам',
        consequences: { balanceDelta: -10000, loyaltyDelta: -2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'keep_going',
        text: 'Заплатить сиделке — продолжить как обычно',
        consequences: { balanceDelta: -15000 },
        npcRelationshipDelta: -10,
      },
    ],
  },
  {
    id: 'NPC_IRINA_RESOLVE',
    title: 'Мама хочет помочь',
    description:
      'Мама пришла с тетрадкой. Записала всё: как считать остатки, как разговаривать с трудным клиентом, как заварить рассольник на 30 порций. «Я могу два раза в неделю помогать тебе с залом. Бесплатно. Я скучаю по делу. Только не отказывайся из вежливости».',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 65 },
    npcId: 'irina',
    options: [
      {
        id: 'accept_warm',
        text: 'Согласиться — это и для неё важно',
        consequences: { reputationDelta: 5, loyaltyDelta: 5 },
        npcRelationshipDelta: 16,
      },
      {
        id: 'offer_pay',
        text: 'Согласиться, но платить ей зарплату как сотруднику (−15 000 ₽/мес)',
        consequences: { balanceDelta: -15000, reputationDelta: 3, loyaltyDelta: 3 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'spare_her',
        text: '«Мам, отдыхай. Я справляюсь» — и сами не верите',
        consequences: { loyaltyDelta: -3 },
        npcRelationshipDelta: -8,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // ARTEM — бывший коллега
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_ARTEM_MEET',
    title: 'Артём зашёл с резюме',
    description:
      'Артём — твой коллега из прошлой жизни. Принёс кофе и резюме на бумаге. «Слушай, я устал от своего корпората. Может, я к тебе? Зарплата меньше — мне всё равно. Делать буду много. Я знаю, как ты работаешь, и хочу так же». Серьёзный, не подшучивает.',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'artem',
    options: [
      {
        id: 'hire_now',
        text: 'Нанять (−45 000 ₽/мес, мощный сотрудник)',
        consequences: { balanceDelta: -45000, loyaltyDelta: 5, clientModifier: 0.05, clientModifierDays: 60 },
        npcRelationshipDelta: 14,
      },
      {
        id: 'hire_later',
        text: '«Через пару месяцев точно. Сейчас рано»',
        consequences: {},
        npcRelationshipDelta: 4,
      },
      {
        id: 'refuse_friend',
        text: 'Отказать — не работаю с друзьями',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: -8,
      },
    ],
  },
  {
    id: 'NPC_ARTEM_TEST',
    title: 'Артём ошибся на 50 000',
    description:
      'Артём подошёл бледный: «Я ошибся в инвентаризации. Списал партию как порчу — оказалось, она была на складе. 50 тысяч убытка. Это моя ошибка, я готов компенсировать из зарплаты». Стоит, ждёт реакции. Видно, что не спал.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'artem',
    isMoralDilemma: true,
    options: [
      {
        id: 'cover',
        text: '«Это и моя ошибка тоже. Спишем на опыт»',
        consequences: { reputationDelta: 3, loyaltyDelta: 6 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'split_loss',
        text: 'Поделить убыток пополам (вычесть 25 000 ₽ из его зарплаты)',
        consequences: { balanceDelta: 25000 },
        npcRelationshipDelta: 4,
      },
      {
        id: 'fire',
        text: 'Уволить — нельзя терять 50 000 на одной ошибке',
        consequences: { loyaltyDelta: -5 },
        npcRelationshipDelta: -25,
      },
    ],
  },
  {
    id: 'NPC_ARTEM_RESOLVE',
    title: 'Артём становится партнёром',
    description:
      'Артём приходит с заранее распечатанным предложением. «Я хочу долю. 10%. Не как сотрудник — как сооснователь. Я тут уже не зарплату хочу, я хочу строить. Если нет — я тебя пойму, но мне надо двигаться». Кладёт лист и уходит до завтра.',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 60 },
    npcId: 'artem',
    options: [
      {
        id: 'partner_full',
        text: 'Дать 10% — он этого заслужил',
        consequences: { reputationDelta: 5, loyaltyDelta: 8 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'raise_keep',
        text: 'Поднять зарплату на 20 000 ₽, но без доли',
        consequences: { balanceDelta: -20000, loyaltyDelta: 2 },
        npcRelationshipDelta: 4,
      },
      {
        id: 'reject_offer',
        text: 'Отказать — единоличный бизнес важнее',
        consequences: {},
        npcRelationshipDelta: -18,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // MIKHAIL — поставщик-старичок
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_MIKHAIL_MEET',
    title: 'Михаил привёз партию сам',
    description:
      'Михаил привёз первую партию лично. Не отдал водителю — приехал сам. «Хотел познакомиться. Я работаю с маленькими. Большие — это не моё. Если будет качество не то — звони лично, не через диспетчерскую. Договорились?» Жмёт руку крепко.',
    trigger: { dayMin: 35, dayMax: 70, randomChance: 1.0, oneTime: true },
    npcId: 'mikhail',
    options: [
      {
        id: 'warm',
        text: 'Поблагодарить, согласиться по-человечески',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'business_only',
        text: 'Договариваться по-деловому — без сантиментов',
        consequences: {},
        npcRelationshipDelta: 2,
      },
    ],
  },
  {
    id: 'NPC_MIKHAIL_TEST',
    title: 'Михаил просит об услуге',
    description:
      'Михаил приходит без партии, без прайса. «Слушай. Дочка в институт поступила в Питере, общежитие дали без отопления. Нужно 40 тысяч до конца месяца — потом верну. Я бы не просил, ты сам понимаешь». Смотрит на свои руки. Ему стыдно.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 50 },
    npcId: 'mikhail',
    isMoralDilemma: true,
    options: [
      {
        id: 'lend_full',
        text: 'Дать 40 000 ₽ без расписки — это Михаил',
        consequences: { balanceDelta: -40000, loyaltyDelta: 3 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'lend_paper',
        text: 'Дать 40 000 ₽ с распиской — по-человечески, но строго',
        consequences: { balanceDelta: -40000 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse',
        text: 'Отказать — у самого впритык',
        consequences: {},
        npcRelationshipDelta: -12,
      },
    ],
  },
  {
    id: 'NPC_MIKHAIL_RETIRES',
    title: 'Михаил уходит на пенсию',
    description:
      'Серьёзный разговор. «Слушай, я закругляюсь. Сын зовёт в Краснодар, к внукам. Дело передаю парню одному — толковый, но молодой. Я его попросил с тебя начать. Не подведи нас обоих, ладно?» Жмёт руку. Это последняя поставка от него.',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 55 },
    npcId: 'mikhail',
    options: [
      {
        id: 'embrace',
        text: 'Принять преемника как Михаила',
        consequences: { reputationDelta: 4, loyaltyDelta: 3 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'gift',
        text: 'Сделать Михаилу прощальный подарок (−8 000 ₽)',
        consequences: { balanceDelta: -8000, reputationDelta: 6, loyaltyDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'try_other',
        text: 'Параллельно поискать другого — на всякий случай',
        consequences: {},
        npcRelationshipDelta: -3,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // TAMARA — постоянная клиентка-якорь
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_TAMARA_MEET',
    title: 'Тамара представилась',
    description:
      'На пятый день к тебе зашла маленькая, в платочке, бабушка. Купила буханку хлеба. У кассы остановилась: «Меня Тамара зовут. Я тут до вас 30 лет хожу — здесь раньше были «Овощи». Если что-то непонятно — спрашивай. Я район как пальцы свои знаю». Улыбнулась и ушла.',
    trigger: { dayMin: 21, dayMax: 49, randomChance: 1.0, oneTime: true },
    npcId: 'tamara',
    options: [
      {
        id: 'warm_greet',
        text: 'Тепло поговорить, представиться',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'polite_busy',
        text: 'Вежливо, но коротко — много дел',
        consequences: {},
        npcRelationshipDelta: 0,
      },
    ],
  },
  {
    id: 'NPC_TAMARA_TEST',
    title: 'Тамара пропала на неделю',
    description:
      'Тамара не приходит уже шесть дней. Спрашиваешь у соседки — лежит дома, плохо себя чувствует, никого не зовёт. Можно зайти. Можно не лезть. Это её жизнь.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 50 },
    npcId: 'tamara',
    options: [
      {
        id: 'visit',
        text: 'Зайти с продуктами (−1 500 ₽)',
        consequences: { balanceDelta: -1500, reputationDelta: 5, loyaltyDelta: 3 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'send_box',
        text: 'Передать набор через соседку (−800 ₽)',
        consequences: { balanceDelta: -800, reputationDelta: 2, loyaltyDelta: 1 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'leave_alone',
        text: 'Не лезть — она не просила',
        consequences: { loyaltyDelta: -2 },
        npcRelationshipDelta: -6,
      },
    ],
  },
  {
    id: 'NPC_TAMARA_RESOLVE',
    title: 'Тамара переезжает к дочери',
    description:
      'Тамара пришла с пакетом — последний раз. «Дочка забирает к себе. Я сюда — попрощаться. Знаешь, я тут полжизни прожила. Ваш магазин — последний. Не бросай его, ладно? Многим нужен такой как ты». Положила на прилавок старый деревянный календарь.',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 50 },
    npcId: 'tamara',
    options: [
      {
        id: 'farewell_gift',
        text: 'Сделать продуктовый набор в дорогу (−2 500 ₽)',
        consequences: { balanceDelta: -2500, reputationDelta: 5, loyaltyDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'warm_hug',
        text: 'Просто обнять и пожелать здоровья',
        consequences: { reputationDelta: 3, loyaltyDelta: 3 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'busy_polite',
        text: '«Удачи» — и обратно к работе',
        consequences: { loyaltyDelta: -3 },
        npcRelationshipDelta: -10,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // GENA — дядя со схемами (комический рефрен)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_GENA_MEET',
    title: 'Дядя Гена с гениальной идеей',
    description:
      'Дядя Гена нашёл тебя на третий день. «Слушай, у меня тема. Криптомат в углу твоего магазина — обороты вырастут в три раза, я тебе говорю. Я уже договорился с поставщиком, нужно 50 тысяч, я их к концу месяца верну с двойной». Глаза горят. Тема, естественно, лажа.',
    trigger: { dayMin: 21, dayMax: 49, randomChance: 1.0, oneTime: true },
    npcId: 'gena',
    options: [
      {
        id: 'firm_no',
        text: 'Твёрдо сказать «нет» — но без ругани',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'curious',
        text: 'Послушать схему до конца — может что-то полезное',
        consequences: {},
        npcRelationshipDelta: 4,
      },
      {
        id: 'gift_him',
        text: 'Дать ему 5 000 ₽ «на проект» — лишь бы отстал',
        consequences: { balanceDelta: -5000, loyaltyDelta: -1 },
        npcRelationshipDelta: 8,
      },
    ],
  },
  {
    id: 'NPC_GENA_TEST',
    title: 'Гена приехал с сюрпризом',
    description:
      'Гена приехал с чужим прицепом, на котором — 200 коробок с надписями «маска для лица №7». «Я по бартеру взял. У тебя место на складе есть, постоят неделю — я их перепродам в Челябинск». Уверенный как никогда. Если согласишься — занят будешь склад минимум на месяц.',
    trigger: { dayMin: 140, dayMax: 175, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    isMoralDilemma: true,
    options: [
      {
        id: 'host_boxes',
        text: '«Ладно, на неделю» (склад занят, −5% к пропускной на 30 дней)',
        consequences: { clientModifier: -0.05, clientModifierDays: 30 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'firm_refuse',
        text: '«Нет. Это не клуб для маминой родни»',
        consequences: { loyaltyDelta: 1 },
        npcRelationshipDelta: -10,
      },
      {
        id: 'send_to_garage',
        text: 'Помочь договориться с гаражом соседа (−3 000 ₽)',
        consequences: { balanceDelta: -3000, reputationDelta: 1 },
        npcRelationshipDelta: 8,
      },
    ],
  },
  {
    id: 'NPC_GENA_RESOLVE',
    title: 'Гена влип',
    description:
      'Гена приехал ночью. Без шуток, серьёзно. «Стас. Я попал. На 80 тысяч. Если не отдам послезавтра — будут проблемы. Не от полиции — от других людей. Я знаю, что я тебя достал. Но мне больше не к кому». Тишина. Это первый раз, когда он не улыбается.',
    trigger: { dayMin: 245, dayMax: 315, randomChance: 1.0, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    isMoralDilemma: true,
    options: [
      {
        id: 'help_full',
        text: 'Дать 80 000 ₽ — это семья',
        consequences: { balanceDelta: -80000, reputationDelta: 4 },
        npcRelationshipDelta: 22,
      },
      {
        id: 'help_partial',
        text: 'Дать 30 000 ₽ — больше реально не могу',
        consequences: { balanceDelta: -30000, reputationDelta: 1 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'final_refuse',
        text: '«Гена. Нет. Это твои выборы — твои последствия»',
        consequences: { reputationDelta: -2, loyaltyDelta: 1 },
        npcRelationshipDelta: -25,
      },
    ],
  },
]
