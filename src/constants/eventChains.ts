import type { EventTemplate } from '../types/game'

// Chain event templates — triggered by chain system, not random selection.
// chainId + chainStep identify the event's position in its narrative arc.
// chainFollowUpId on each option tells the engine which event fires next.

export const CHAIN_EVENTS: EventTemplate[] = [

  // ── CHAIN 1: Михаил в кризисе (mikhail_crisis) ─────────────────────────────
  // Trigger: week 3–5. Михаил просит предоплату — у него семейные проблемы.
  {
    id: 'mikhail_crisis_1',
    title: 'Михаил просит о помощи',
    description: 'Михаил Власов, ваш поставщик, пришёл лично. Выглядит уставшим. "Слушайте, у меня ситуация... жена в больнице, операция срочная. Мне нужна предоплата за следующую партию — прямо сейчас, 30 000 ₽. Я вам всё отдам через три недели, вы же меня знаете."',
    trigger: { dayMin: 21, dayMax: 35, randomChance: 1.0, oneTime: true, chainId: 'mikhail_crisis', chainStep: 1 },
    npcId: 'mikhail',
    decisionDeadlineWeeks: 2,
    options: [
      {
        id: 'help',
        text: 'Дать 30 000 ₽ (помочь Михаилу)',
        consequences: { balanceDelta: -30000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'mikhail_crisis_2a',
      },
      {
        id: 'partial',
        text: 'Дать 15 000 ₽ (частично помочь)',
        consequences: { balanceDelta: -15000 },
        npcRelationshipDelta: 8,
        chainFollowUpId: 'mikhail_crisis_2b',
      },
      {
        id: 'refuse',
        text: 'Отказать (бизнес есть бизнес)',
        consequences: {},
        npcRelationshipDelta: -15,
        chainFollowUpId: 'mikhail_crisis_2c',
      },
    ],
  },

  {
    id: 'mikhail_crisis_2a',
    title: 'Михаил вернул долг',
    description: 'Михаил появился ровно через три недели. Положил на стол 30 000 ₽ и конверт. "Спасибо. Жена уже дома. Я вам должен — вот скидка 12% на следующие два месяца и кое-что важное: ваш конкурент Анна переманивает моего коллегу-поставщика. Будьте осторожны с поставками в ноябре."',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'mikhail_crisis', chainStep: 2 },
    npcId: 'mikhail',
    options: [
      {
        id: 'accept',
        text: 'Принять деньги и информацию',
        consequences: { balanceDelta: 30000, checkModifier: 0.12, checkModifierDays: 56 },
        npcRelationshipDelta: 10,
      },
    ],
  },

  {
    id: 'mikhail_crisis_2b',
    title: 'Михаил исчез без предупреждения',
    description: 'Следующая партия не пришла. Телефон не отвечает. Через неделю узнаёте: Михаил взял деньги ещё у двух поставщиков и исчез. Склад пуст. Придётся срочно искать нового поставщика по завышенным ценам.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'mikhail_crisis', chainStep: 2 },
    npcId: 'mikhail',
    options: [
      {
        id: 'find_new',
        text: 'Срочно найти нового поставщика (−20 000 ₽ за переплату)',
        consequences: { balanceDelta: -20000, clientModifier: -0.2, clientModifierDays: 10 },
        npcRelationshipDelta: -15,
      },
    ],
  },

  {
    id: 'mikhail_crisis_2c',
    title: 'Михаил ушёл к конкуренту',
    description: 'Вам звонит незнакомый человек: "Вы отказали Михаилу. Я его двоюродный брат, помог ему. Теперь он работает с Анной Козловой. Она предложила ему лучшие условия." Михаил поставляет конкуренту по ценам ниже ваших.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'mikhail_crisis', chainStep: 2 },
    npcId: 'mikhail',
    options: [
      {
        id: 'accept',
        text: 'Принять ситуацию и найти нового поставщика',
        consequences: { balanceDelta: -8000, clientModifier: -0.1, clientModifierDays: 7 },
      },
    ],
  },

  // ── CHAIN 2: Рост Светланы (svetlana_growth) ────────────────────────────────
  // Trigger: week 6–9. Светлана хочет учиться — инвестируй или потеряй.
  {
    id: 'svetlana_growth_1',
    title: 'Светлана хочет учиться',
    description: 'Светлана Орлова — ваш лучший продавец — попросила поговорить. "Я нашла курсы по управлению продажами, 15 000 ₽. Если вы оплатите, я останусь здесь и применю всё у вас. Если нет — мне сделали предложение в другом месте. Решайте."',
    trigger: { dayMin: 42, dayMax: 63, randomChance: 1.0, oneTime: true, chainId: 'svetlana_growth', chainStep: 1 },
    npcId: 'svetlana',
    decisionDeadlineWeeks: 1,
    options: [
      {
        id: 'invest',
        text: 'Оплатить курсы (−15 000 ₽)',
        consequences: { balanceDelta: -15000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'svetlana_growth_2a',
      },
      {
        id: 'refuse',
        text: 'Отказать ("Это твои инвестиции")',
        consequences: {},
        npcRelationshipDelta: -15,
        chainFollowUpId: 'svetlana_growth_2b',
      },
    ],
  },

  {
    id: 'svetlana_growth_2a',
    title: 'Светлана вернулась с результатами',
    description: 'Три недели спустя Светлана вышла на работу другим человеком. Перестроила выкладку, обучила двух коллег, привела троих постоянных клиентов от подруг. "Я никуда не ухожу. Хочу вырасти здесь — и помочь вам вырасти тоже."',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'svetlana_growth', chainStep: 2 },
    npcId: 'svetlana',
    options: [
      {
        id: 'great',
        text: 'Поблагодарить и дать ей больше ответственности',
        consequences: { clientModifier: 0.08, clientModifierDays: 42, loyaltyDelta: 12 },
        npcRelationshipDelta: 10,
      },
    ],
  },

  {
    id: 'svetlana_growth_2b',
    title: 'Светлана ушла',
    description: 'Светлана пришла утром, собрала вещи и ушла. Молча. Через неделю вы видите её в новом кафе напротив. Оно открылось только что — там написано "Анна Козлова, управляющий". Ваши клиенты замечают, что обслуживание стало хуже.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'svetlana_growth', chainStep: 2 },
    npcId: 'svetlana',
    options: [
      {
        id: 'accept',
        text: 'Начать поиск нового сотрудника',
        consequences: { clientModifier: -0.15, clientModifierDays: 21, loyaltyDelta: -8 },
        npcRelationshipDelta: -15,
      },
    ],
  },

  // ── CHAIN 3: Инспектор Петров (inspector_chain) ──────────────────────────────
  // First visit week 8–10, second visit week 18–20.
  {
    id: 'inspector_chain_1',
    title: 'Первая проверка — Инспектор Петров',
    description: 'В дверь постучали. Мужчина лет 50 в строгом костюме представился: "Петров, налоговая инспекция. Плановая проверка документов за последние три месяца." Он методично изучает ваши бумаги. Через час поднимает взгляд.',
    trigger: { dayMin: 56, dayMax: 70, randomChance: 1.0, oneTime: true, chainId: 'inspector_chain', chainStep: 1 },
    npcId: 'petrov',
    options: [
      {
        id: 'clean',
        text: 'Документы в порядке — всё предоставить',
        consequences: { reputationDelta: 3 },
        npcRelationshipDelta: 15,
      },
      {
        id: 'minor',
        text: 'Есть мелкие нарушения — заплатить штраф (−8 000 ₽)',
        consequences: { balanceDelta: -8000, reputationDelta: -2 },
        npcRelationshipDelta: -5,
      },
      {
        id: 'extern_help',
        text: 'Показать отчётность через Контур.Экстерн — всё корректно',
        consequences: { reputationDelta: 5 },
        npcRelationshipDelta: 15,
        requiredService: 'extern',
        isContourOption: true,
      },
    ],
  },

  {
    id: 'inspector_chain_2_good',
    title: 'Петров пришёл снова',
    description: 'Петров узнаёт вас и кивает. "Я помню — у вас был порядок в прошлый раз. Посмотрим, как сейчас." Он проверяет быстро и почти формально. В конце говорит тихо: "Скоро будут проверки по вашему кварталу. Советую до конца месяца привести документы в порядок." Уходит.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'inspector_chain', chainStep: 2 },
    npcId: 'petrov',
    options: [
      {
        id: 'thanks',
        text: 'Поблагодарить и подготовиться',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 8,
      },
    ],
  },

  {
    id: 'inspector_chain_2_bad',
    title: 'Петров пришёл снова — и помнит',
    description: 'Петров заходит и сразу замечает вас. "В прошлый раз здесь были нарушения. Буду проверять тщательно." Он изучает каждый документ. Находит несколько расхождений. "Штраф 35 000 ₽. Следующая проверка через месяц."',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'inspector_chain', chainStep: 2 },
    npcId: 'petrov',
    options: [
      {
        id: 'pay',
        text: 'Оплатить штраф и исправить всё (−35 000 ₽)',
        consequences: { balanceDelta: -35000 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'extern_now',
        text: 'Подключить Контур.Экстерн — снизить штраф до 5 000 ₽',
        consequences: { balanceDelta: -5000 },
        npcRelationshipDelta: 12,
        isContourOption: true,
      },
    ],
  },

  // ── CHAIN 4: Война с Анной (anna_war) ────────────────────────────────────────
  // Week 10: Анна предлагает «договориться». Week 18+: итоги.
  {
    id: 'anna_war_1',
    title: 'Анна предлагает перемирие',
    description: 'Анна Козлова, ваш конкурент, зашла лично. Без предупреждения. "Мы оба теряем деньги на этой войне. Предлагаю: я не демпингую, вы не переманиваете моих людей. Взаимный нейтралитет." Смотрит прямо. Непонятно — честно или нет.',
    trigger: { dayMin: 70, dayMax: 84, randomChance: 1.0, oneTime: true, chainId: 'anna_war', chainStep: 1 },
    npcId: 'anna',
    options: [
      {
        id: 'agree',
        text: 'Принять предложение (перемирие)',
        consequences: { clientModifier: 0.05, clientModifierDays: 28 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'anna_war_2a',
      },
      {
        id: 'refuse',
        text: 'Отказать (продолжать конкуренцию)',
        consequences: {},
        npcRelationshipDelta: -10,
        chainFollowUpId: 'anna_war_2b',
      },
    ],
  },

  {
    id: 'anna_war_2a',
    title: 'Анна нарушила договорённость',
    description: 'Анна запустила скидку 40% на весь ассортимент и развесила объявления прямо у вашей двери. Ваши постоянные клиенты уходят к ней. Потом узнаёте: она сделала то же самое с другими партнёрами — всегда нарушает договорённости, когда это выгодно.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'anna_war', chainStep: 2 },
    npcId: 'anna',
    options: [
      {
        id: 'fight_back',
        text: 'Ответить своей акцией (−10 000 ₽)',
        consequences: { balanceDelta: -10000, clientModifier: 0.1, clientModifierDays: 14 },
        npcRelationshipDelta: -15,
      },
      {
        id: 'ignore',
        text: 'Сделать ставку на качество и лояльность',
        consequences: { reputationDelta: 5, loyaltyDelta: 8 },
      },
    ],
  },

  {
    id: 'anna_war_2b',
    title: 'Анна переманила поставщика',
    description: 'Ваш запасной поставщик сообщает: "Извините, я теперь работаю эксклюзивно с другим партнёром. Меня сделали предложение, от которого я не смог отказаться." Судя по всему — это Анна. Придётся переплачивать за сырьё 3 месяца.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'anna_war', chainStep: 2 },
    npcId: 'anna',
    options: [
      {
        id: 'find_supplier',
        text: 'Найти альтернативного поставщика (−15 000 ₽)',
        consequences: { balanceDelta: -15000, checkModifier: -0.08, checkModifierDays: 42 },
        npcRelationshipDelta: -5,
      },
      {
        id: 'fokus_check',
        text: 'Проверить всех поставщиков через Контур.Фокус',
        consequences: { balanceDelta: -3000, reputationDelta: 3 },
        isContourOption: true,
        requiredService: 'fokus',
      },
    ],
  },

  // ── CHAIN 5: Наследие (legacy) ────────────────────────────────────────────────
  // Trigger: week 15+, only if reputation >= 70. Приглашение стать наставником.
  {
    id: 'legacy_1',
    title: 'Бизнес-клуб заметил вас',
    description: 'Председатель местного предпринимательского клуба звонит лично: "Мы следим за вашим развитием. Есть молодой человек — Андрей, 24 года, хочет открыть бизнес. Нам нужен наставник с опытом. Раз в неделю, 2 часа. Это бесплатно, но ваше имя услышат в городе."',
    trigger: { dayMin: 105, dayMax: 140, reputationMin: 70, randomChance: 1.0, oneTime: true, chainId: 'legacy', chainStep: 1 },
    options: [
      {
        id: 'agree',
        text: 'Согласиться',
        consequences: { energyDelta: -5 },
        chainFollowUpId: 'legacy_2a',
      },
      {
        id: 'refuse',
        text: 'Отказаться (нет времени)',
        consequences: {},
        chainFollowUpId: 'legacy_2b',
      },
    ],
  },

  {
    id: 'legacy_2a',
    title: 'Андрей открыл своё дело',
    description: 'Пять недель наставничества позади. Андрей открыл небольшое дело в соседнем квартале — не конкурент вам, другой профиль. Он упоминает вас в каждом посте. Его подписчики знают ваш бизнес как "место, где учат правильно делать". Репутация в городе растёт.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'legacy', chainStep: 2 },
    options: [
      {
        id: 'celebrate',
        text: 'Порадоваться за него',
        consequences: { reputationDelta: 12, clientModifier: 0.07, clientModifierDays: 35 },
      },
    ],
  },

  {
    id: 'legacy_2b',
    title: 'Упущенная возможность',
    description: 'Через два месяца вы видите в местной газете: "Молодой предприниматель Андрей открыл кафе при поддержке московского ментора." Фото, история успеха, цитаты. Ваше имя нигде не упоминается. Шанс был — вы его не взяли.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'legacy', chainStep: 2 },
    options: [
      {
        id: 'accept',
        text: 'Принять это и двигаться дальше',
        consequences: { reputationDelta: -2 },
      },
    ],
  },

  // ── CHAIN 6: Марина и рекламная кампания (marina_promo) ────────────────────
  // Trigger: week 5–8. Маркетолог предлагает продвижение.
  {
    id: 'marina_promo_1',
    title: 'Марина Воронова с предложением',
    description: 'Женщина лет тридцати, с ноутбуком и уверенной улыбкой, представляется: "Марина Воронова, маркетинг и digital. Я изучила ваш бизнес — есть потенциал. За 20 000 ₽ в месяц я запущу рекламу в соцсетях, сделаю контент и приведу новых клиентов. Два месяца — и вы увидите результат."',
    trigger: { dayMin: 35, dayMax: 56, randomChance: 1.0, oneTime: true, chainId: 'marina_promo', chainStep: 1 },
    npcId: 'marina',
    decisionDeadlineWeeks: 1,
    options: [
      {
        id: 'hire',
        text: 'Нанять Марину (−20 000 ₽)',
        consequences: { balanceDelta: -20000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'marina_promo_2a',
      },
      {
        id: 'hire_with_market',
        text: 'Нанять + дать доступ к аналитике Контур.Маркета',
        consequences: { balanceDelta: -20000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'marina_promo_2b',
        requiredService: 'market',
        isContourOption: true,
      },
      {
        id: 'refuse',
        text: 'Отказать — обойдёмся своими силами',
        consequences: {},
        npcRelationshipDelta: -5,
      },
    ],
  },

  {
    id: 'marina_promo_2a',
    title: 'Кампания Марины — результаты',
    description: 'Марина прислала отчёт: охваты выросли, несколько новых клиентов пришли по рекламе. "Без глубокой аналитики по вашей аудитории сложно было целиться точно, но в целом — плюс." Она права: эффект есть, но мог быть больше.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'marina_promo', chainStep: 2 },
    npcId: 'marina',
    options: [
      {
        id: 'accept',
        text: 'Принять результаты и продолжить работу',
        consequences: { clientModifier: 0.08, clientModifierDays: 30, reputationDelta: 2 },
        npcRelationshipDelta: 5,
      },
    ],
  },

  {
    id: 'marina_promo_2b',
    title: 'Кампания Марины — отличные результаты',
    description: 'Марина сияет: "С данными по аудитории из Контур.Маркета я смогла точно настроить таргетинг. Конверсия в три раза выше, чем обычно." Новые лица в очереди, несколько отзывов в соцсетях — люди говорят, что нашли вас через рекламу.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'marina_promo', chainStep: 2 },
    npcId: 'marina',
    options: [
      {
        id: 'celebrate',
        text: 'Поблагодарить и обсудить следующий этап',
        consequences: { clientModifier: 0.15, clientModifierDays: 45, reputationDelta: 5, loyaltyDelta: 4 },
        npcRelationshipDelta: 12,
      },
    ],
  },

  // ── CHAIN 7: Виктор и кредитная линия (viktor_loan) ────────────────────────
  // Trigger: week 12–16. Банк предлагает кредит на развитие.
  {
    id: 'viktor_loan_1',
    title: 'Виктор Семёнов из банка',
    description: 'Звонит вежливый голос: "Виктор Семёнов, местное отделение банка. Мы видим ваш бизнес — стабильный, перспективный. Хочу лично познакомиться и предложить кредитную линию до 200 000 ₽ на развитие. Встретимся?" На встрече он раскладывает по-деловому: стандартная ставка 18% годовых.',
    trigger: { dayMin: 84, dayMax: 112, randomChance: 1.0, oneTime: true, chainId: 'viktor_loan', chainStep: 1 },
    npcId: 'viktor',
    decisionDeadlineWeeks: 2,
    options: [
      {
        id: 'take_loan',
        text: 'Взять кредит 100 000 ₽ под 18% годовых',
        consequences: { balanceDelta: 100000 },
        npcRelationshipDelta: 10,
        chainFollowUpId: 'viktor_loan_2a',
      },
      {
        id: 'kontour_bank',
        text: 'Оформить через Контур.Банк — ставка 5%',
        consequences: { balanceDelta: 100000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'viktor_loan_2b',
        requiredService: 'bank',
        isContourOption: true,
      },
      {
        id: 'refuse',
        text: 'Отказаться — не хочу кредитов',
        consequences: {},
        npcRelationshipDelta: -5,
        chainFollowUpId: 'viktor_loan_2c',
      },
    ],
  },

  {
    id: 'viktor_loan_2a',
    title: 'Кредит работает — но давит',
    description: 'Деньги пошли в дело: закупки, реклама, небольшой ремонт. Бизнес чуть подрос. Но каждый месяц — выплата с процентами. Виктор звонит: "Как дела? Если нужна реструктуризация — обращайтесь." В его голосе звучит профессиональная забота.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'viktor_loan', chainStep: 2 },
    npcId: 'viktor',
    options: [
      {
        id: 'manage',
        text: 'Платить по графику — справляемся',
        consequences: { balanceDelta: -18000, clientModifier: 0.06, clientModifierDays: 28 },
        npcRelationshipDelta: 5,
      },
    ],
  },

  {
    id: 'viktor_loan_2b',
    title: 'Кредит через Контур.Банк — выгодно',
    description: 'Пять процентов годовых — это почти вдвое меньше, чем предлагал Виктор напрямую. Деньги пошли на расширение: новый стеллаж, запас, небольшая акция. Виктор при встрече говорит с уважением: "Грамотно выбрали инструмент. Такие клиенты нам нравятся."',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'viktor_loan', chainStep: 2 },
    npcId: 'viktor',
    options: [
      {
        id: 'great',
        text: 'Спокойно развиваться с выгодными условиями',
        consequences: { balanceDelta: -5000, clientModifier: 0.1, clientModifierDays: 35, reputationDelta: 3 },
        npcRelationshipDelta: 10,
      },
    ],
  },

  {
    id: 'viktor_loan_2c',
    title: 'Без кредита — своим ходом',
    description: 'Через месяц Виктор пишет: "Предложение остаётся в силе — если понадобится." Вы обошлись без займа. Это потребовало осторожности: пришлось отложить несколько закупок и урезать рекламный бюджет. Зато никаких долгов.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'viktor_loan', chainStep: 2 },
    npcId: 'viktor',
    options: [
      {
        id: 'accept',
        text: 'Продолжать работать без кредита',
        consequences: { clientModifier: -0.05, clientModifierDays: 14 },
        npcRelationshipDelta: 3,
      },
    ],
  },

  // ── CHAIN 8: Глеб и обзор (gleb_review) ────────────────────────────────────
  // Trigger: week 4–10. Блогер хочет написать про ваш бизнес.
  {
    id: 'gleb_review_1',
    title: 'Блогер Глеб хочет сделать обзор',
    description: 'Молодой парень с телефоном на подставке снимает что-то у входа. Потом подходит: "Я Глеб Котов, пишу про районный бизнес. 18 тысяч подписчиков. Хочу снять честный обзор вашего места. Можете угостить кофе и дать товар на пробу — или я куплю сам и напишу как есть."',
    trigger: { dayMin: 28, dayMax: 70, randomChance: 1.0, oneTime: true, chainId: 'gleb_review', chainStep: 1 },
    npcId: 'gleb',
    decisionDeadlineWeeks: 1,
    options: [
      {
        id: 'gift',
        text: 'Угостить и дать товар бесплатно (−2 000 ₽)',
        consequences: { balanceDelta: -2000 },
        npcRelationshipDelta: 15,
        chainFollowUpId: 'gleb_review_2a',
      },
      {
        id: 'discount',
        text: 'Предложить скидку 30% (−700 ₽)',
        consequences: { balanceDelta: -700 },
        npcRelationshipDelta: 8,
        chainFollowUpId: 'gleb_review_2b',
      },
      {
        id: 'refuse',
        text: 'Отказать — пусть платит как все',
        consequences: {},
        npcRelationshipDelta: -15,
        chainFollowUpId: 'gleb_review_2c',
      },
    ],
  },

  {
    id: 'gleb_review_2a',
    title: 'Глеб опубликовал отличный обзор',
    description: 'Пост вышел вчера — и уже 340 лайков. Глеб написал тепло и подробно: про атмосферу, про ассортимент, про то, как с ним поговорили как с человеком. В комментариях: "Надо зайти!", "Знаю это место, подтверждаю". Несколько новых лиц уже у вас.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'gleb_review', chainStep: 2 },
    npcId: 'gleb',
    options: [
      {
        id: 'share',
        text: 'Сделать репост и поблагодарить Глеба',
        consequences: { clientModifier: 0.2, clientModifierDays: 14, reputationDelta: 6, loyaltyDelta: 3 },
        npcRelationshipDelta: 8,
      },
    ],
  },

  {
    id: 'gleb_review_2b',
    title: 'Глеб написал нейтральный обзор',
    description: 'Пост вышел. Без восторга, но и без критики: "Обычное место, нормальные цены, можно зайти." 87 лайков, несколько вопросов в комментариях. Глеб в личке: "Если дадите что-то интересное для контента — приду ещё."',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'gleb_review', chainStep: 2 },
    npcId: 'gleb',
    options: [
      {
        id: 'accept',
        text: 'Принять результат — хоть какое-то упоминание',
        consequences: { clientModifier: 0.06, clientModifierDays: 7, reputationDelta: 1 },
        npcRelationshipDelta: 2,
      },
    ],
  },

  {
    id: 'gleb_review_2c',
    title: 'Глеб написал критичный обзор',
    description: 'Пост вышел. Заголовок: "Зашёл в магазин — меня послали." Тон обиженный, но аудитория реагирует активно: 210 лайков, масса комментариев. "Типичное хамство", "поддерживаю малый бизнес, но не такой". Несколько клиентов пишут, что не придут.',
    trigger: { dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true, chainId: 'gleb_review', chainStep: 2 },
    npcId: 'gleb',
    options: [
      {
        id: 'apologize_public',
        text: 'Написать публичный ответ и пригласить Глеба снова (−1 000 ₽)',
        consequences: { balanceDelta: -1000, reputationDelta: -2, loyaltyDelta: -3 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'ignore',
        text: 'Игнорировать — само утихнет',
        consequences: { clientModifier: -0.15, clientModifierDays: 14, reputationDelta: -5 },
        npcRelationshipDelta: -5,
      },
    ],
  },

  // ── CHAIN 9: Бабушка Тамара (tamara_arc) ───────────────────────────────────
  // Пасс на тон, не на механику. 3 эпизода, маленькие дельты,
  // эмоциональный якорь. Без opinion-stack — игрок не выбирает между
  // «помочь» и «потерять 50K», только между «увидеть человека» и «забить».
  {
    id: 'tamara_arc_1',
    title: 'Бабушка Тамара зашла за хлебом',
    description: 'Невысокая женщина в платке, лет за семьдесят, выкладывает на прилавок сдачу — копейка к копейке. Пока считаете, она тихо: «Я тут к вам уже месяц захожу. Знаете, муж осенью умер, я теперь почти не выхожу. А у вас тут — люди. Хорошо у вас». Улыбается в полпальца. Достаёт из сумки печенье — «вам, к чаю». Уходит.',
    trigger: {
      dayMin: 56, // ~week 8
      dayMax: 84, // ~week 12
      randomChance: 1.0,
      oneTime: true,
      chainId: 'tamara_arc',
      chainStep: 1,
    },
    npcId: 'tamara',
    options: [
      {
        id: 'thank_warm',
        text: 'Поблагодарить и сказать, чтоб заходила почаще',
        consequences: {},
        npcRelationshipDelta: 4,
        chainFollowUpId: 'tamara_arc_2',
      },
      {
        id: 'just_nod',
        text: 'Кивнуть и пробить чек — дел много',
        consequences: {},
        npcRelationshipDelta: 0,
        chainFollowUpId: 'tamara_arc_2',
      },
    ],
  },

  {
    id: 'tamara_arc_2',
    title: 'Бабушка Тамара не приходит уже три недели',
    description: 'Только сейчас заметили: бабушки Тамары нет давно. Спросили у соседки, та машет рукой: «Слегла. Воспаление лёгких, тяжело. Дочка из Твери приехала, ходит за ней. Адрес я знаю — если что». Молчит. «Она вас вспоминала, кстати. Говорила — там хорошие люди».',
    trigger: {
      dayMin: 0,
      dayMax: 9999,
      randomChance: 1.0,
      oneTime: true,
      chainId: 'tamara_arc',
      chainStep: 2,
    },
    npcId: 'tamara',
    options: [
      {
        id: 'visit',
        text: 'Закрыть пораньше, заехать с пакетом мандаринов',
        consequences: { energyDelta: -5 },
        npcRelationshipDelta: 8,
        chainFollowUpId: 'tamara_arc_3a',
      },
      {
        id: 'pass',
        text: 'Пожалеть мысленно — но это просто бабушка, не до того',
        consequences: {},
        npcRelationshipDelta: -6,
        chainFollowUpId: 'tamara_arc_3b',
      },
    ],
  },

  {
    id: 'tamara_arc_3a',
    title: 'Бабушка Тамара вернулась',
    description: 'Дверь открывается медленнее обычного. На пороге — Тамара. Похудевшая, в новом платке, с палочкой. «Здравствуйте. Я ненадолго — за хлебом и сказать. Спасибо, что приехали тогда. Дочка говорит — я после вашего визита на поправку и пошла». Долго молчит у прилавка. «Я ещё похожу к вам, ладно?» Уходит, держась за стену.',
    trigger: {
      dayMin: 0,
      dayMax: 9999,
      randomChance: 1.0,
      oneTime: true,
      chainId: 'tamara_arc',
      chainStep: 3,
    },
    npcId: 'tamara',
    options: [
      {
        id: 'see_her_out',
        text: 'Проводить до выхода',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 6,
      },
    ],
  },

  {
    id: 'tamara_arc_3b',
    title: 'Записка от соседки',
    description: 'На прилавке — сложенный вчетверо листок. Соседка занесла утром, не дождалась. «Тамара Ивановна ушла в среду. Тихо, во сне. Дочка просила передать спасибо всем, кто её знал — вы у неё в записях были. Похороны в субботу, в Твери». Внизу — телефон. Печенья сегодня к чаю не будет.',
    trigger: {
      dayMin: 0,
      dayMax: 9999,
      randomChance: 1.0,
      oneTime: true,
      chainId: 'tamara_arc',
      chainStep: 3,
    },
    npcId: 'tamara',
    options: [
      {
        id: 'fold_it',
        text: 'Сложить записку и положить в ящик',
        consequences: {},
        npcRelationshipDelta: 0,
      },
    ],
  },
]

export const CHAIN_IDS = [
  'mikhail_crisis', 'svetlana_growth', 'inspector_chain', 'anna_war', 'legacy',
  'marina_promo', 'viktor_loan', 'gleb_review', 'tamara_arc',
] as const
export type ChainId = typeof CHAIN_IDS[number]

// Which week each chain's first event can trigger
export const CHAIN_TRIGGER_WEEKS: Record<ChainId, number> = {
  mikhail_crisis: 3,
  svetlana_growth: 6,
  inspector_chain: 8,
  anna_war: 10,
  legacy: 15,
  marina_promo: 5,
  viktor_loan: 12,
  gleb_review: 4,
  tamara_arc: 8,
}

// Delay in weeks before the follow-up fires after the triggering choice
export const CHAIN_FOLLOWUP_DELAY: Record<string, number> = {
  mikhail_crisis_2a: 3,
  mikhail_crisis_2b: 2,
  mikhail_crisis_2c: 1,
  svetlana_growth_2a: 3,
  svetlana_growth_2b: 1,
  inspector_chain_2_good: 10,
  inspector_chain_2_bad: 10,
  anna_war_2a: 8,
  anna_war_2b: 5,
  legacy_2a: 5,
  legacy_2b: 8,
  marina_promo_2a: 8,
  marina_promo_2b: 8,
  viktor_loan_2a: 4,
  viktor_loan_2b: 4,
  viktor_loan_2c: 4,
  gleb_review_2a: 1,
  gleb_review_2b: 1,
  gleb_review_2c: 1,
  // Долгие промежутки: между знакомством и болезнью ~17 недель,
  // между развязкой ~15 недель. Эпизоды должны казаться случайными.
  tamara_arc_2: 17,
  tamara_arc_3a: 15,
  tamara_arc_3b: 15,
}

export function getChainEvent(id: string): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.id === id)
}

// Returns the first-step event for a chain
export function getChainStartEvent(chainId: ChainId): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.trigger.chainId === chainId && e.trigger.chainStep === 1)
}
