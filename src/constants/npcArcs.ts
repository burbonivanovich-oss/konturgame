import type { EventTemplate } from '../types/game'

/**
 * NPC arc events — second and third beats for each of the 7 NPCs, gated by
 * the NPC's revealed status and relationship level. The goal is to move NPCs
 * from "modifier with portrait" to "co-protagonist with arc".
 *
 * Pattern per NPC:
 *  - One escalation event (mid-game, fires only at high relationship)
 *  - One fork event (late-game, two NPC-meaningful outcomes)
 *
 * Each event is `oneTime` and references events the player would remember,
 * so the relationship feels accumulative rather than episodic.
 */

export const NPC_ARC_EVENTS: EventTemplate[] = [

  // ──────────────────────────────────────────────────────────────────
  // Михаил Власов — поставщик
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_MIKHAIL_FAVOR',
    title: 'Михаил просит об услуге',
    description:
      'Михаил приходит без партии, без прайса. Садится молча, потом: «Слушай. Дочка в институт поступила в Питере, общежитие дали без отопления. Нужно 40 тысяч до конца месяца — потом верну. Я бы не просил, ты сам понимаешь». Смотрит на свои руки. Ему стыдно.',
    trigger: {
      dayMin: 105, // ~week 15
      dayMax: 245, // ~week 35
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 65,
    },
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
        id: 'lend_partial',
        text: 'Дать 15 000 ₽ — больше не могу',
        consequences: { balanceDelta: -15000, loyaltyDelta: 1 },
        npcRelationshipDelta: 4,
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
      'Собрался серьёзный разговор. «Слушай, я закругляюсь. Сын зовёт в Краснодар, к внукам. Дело передаю парню одному — Денис, толковый, но молодой. Я его попросил с тебя начать. Не подведи нас обоих, ладно?» Жмёт руку. Это последняя поставка от него.',
    trigger: {
      dayMin: 245, // ~week 35
      dayMax: 364, // end of year
      randomChance: 0.7,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 70,
    },
    npcId: 'mikhail',
    options: [
      {
        id: 'embrace',
        text: 'Принять Дениса как Михаила — давать шанс',
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
        text: 'Параллельно поискать другого поставщика — на всякий случай',
        consequences: {},
        npcRelationshipDelta: -3,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Светлана Орлова — лучший продавец
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_SVETLANA_POACHED',
    title: 'Анна предлагает Светлане работу',
    description:
      'Светлана подходит, бледная: «Мне нужно вам сказать. Анна вчера предложила мне у неё работать. Зарплата на 7 000 больше, плюс процент от оборота. Я не сказала да. Но и не сказала нет. Я думала — буду честной». Смотрит, ждёт ответа.',
    trigger: {
      dayMin: 140, // ~week 20
      dayMax: 280, // ~week 40
      randomChance: 0.6,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 55,
    },
    npcId: 'svetlana',
    isMoralDilemma: true,
    options: [
      {
        id: 'match_offer',
        text: 'Поднять зарплату на 7 000 ₽ — нельзя её терять',
        consequences: { balanceDelta: -7000, loyaltyDelta: 6 },
        npcRelationshipDelta: 14,
      },
      {
        id: 'partner_share',
        text: 'Предложить долю с прибыли — пусть растёт со мной',
        consequences: { balanceDelta: -3000, loyaltyDelta: 8, reputationDelta: 2 },
        npcRelationshipDelta: 18,
      },
      {
        id: 'thank_release',
        text: '«Я благодарен за честность. Решай сама — я пойму».',
        consequences: { reputationDelta: 3 },
        npcRelationshipDelta: 4,
        // High-risk: 50% she leaves anyway. Captured in events as flavor.
      },
      {
        id: 'guilt_trip',
        text: 'Намекнуть, что после всего, что я для неё сделал — это предательство',
        consequences: { loyaltyDelta: -10 },
        npcRelationshipDelta: -20,
      },
    ],
  },
  {
    id: 'NPC_SVETLANA_DREAM',
    title: 'Светлана делится мечтой',
    description:
      'После закрытия задержалась. Помогает с инкассацией, потом — вдруг: «Я хочу свой проект через год. Маленький, может онлайн-магазин. Можно с вами буду советоваться? Я не уйду — просто параллельно». Глаза горят. Это не просьба, это доверие.',
    trigger: {
      dayMin: 210, // ~week 30
      dayMax: 350,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 75,
    },
    npcId: 'svetlana',
    options: [
      {
        id: 'mentor',
        text: 'Согласиться, делиться опытом — её рост это и ваш рост',
        consequences: { reputationDelta: 5, loyaltyDelta: 5 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'invest',
        text: 'Предложить вложить 30 000 ₽ как ангел-инвестор',
        consequences: { balanceDelta: -30000, reputationDelta: 6, loyaltyDelta: 6 },
        npcRelationshipDelta: 16,
      },
      {
        id: 'cautious',
        text: '«Сначала год отработай уверенно — потом обсудим»',
        consequences: { loyaltyDelta: -2 },
        npcRelationshipDelta: -4,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Инспектор Петров
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_PETROV_AFTER_HOURS',
    title: 'Петров заходит после смены',
    description:
      'Около восьми вечера в гражданке — без формы, в куртке. «Я тут мимо проходил. Можно чай?» Сидит молча, греет руки о кружку. Потом: «Знаете, за двадцать лет работы — вы один из немногих, к кому ездить не неприятно. Это редко». Допивает, уходит. Оставил визитку с личным номером.',
    trigger: {
      dayMin: 175, // ~week 25
      dayMax: 350,
      randomChance: 0.4,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 70,
    },
    npcId: 'petrov',
    options: [
      {
        id: 'reciprocate',
        text: 'Позвонить через неделю — узнать, как дела',
        consequences: { reputationDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'distance',
        text: 'Поблагодарить, но дистанцию сохранить — он всё-таки инспектор',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: -2,
      },
    ],
  },
  {
    id: 'NPC_PETROV_GREY_AREA',
    title: 'Петров на распутье',
    description:
      'Звонок: «Слушайте, есть запрос сверху — найти у вас нарушения "для статистики квартала". У вас всё чисто, я подтверждал. Но если они пришлют второго инспектора — найдут что-нибудь. Так бывает. Я могу сказать, что нашёл мелочь — штраф 8 000, и вас оставят в покое». Голос напряжённый.',
    trigger: {
      dayMin: 245,
      dayMax: 350,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 75,
    },
    npcId: 'petrov',
    isMoralDilemma: true,
    options: [
      {
        id: 'accept',
        text: '«Спасибо. Так и сделаем» (−8 000 ₽)',
        consequences: { balanceDelta: -8000, reputationDelta: -2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse_clean',
        text: '«Я ничего не нарушал — пусть присылают второго»',
        consequences: { reputationDelta: 5 },
        npcRelationshipDelta: -4,
      },
      {
        id: 'extern_check',
        text: 'Через Контур.Экстерн подать заранее идеальный отчёт — нечего им искать',
        consequences: { reputationDelta: 8 },
        npcRelationshipDelta: 6,
        requiredService: 'extern',
        isContourOption: true,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Анна Козлова — конкурент
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_ANNA_TRUCE',
    title: 'Анна предлагает не воевать',
    description:
      'Анна заходит в нерабочее время. Без листовок, без проектов. «Слушай. Я устала. Мы оба тратим бюджеты на войну, которая никому не помогает. Может, разделим ниши? Я ухожу из твоей категории, ты — из моей. Подадим друг другу руки и работаем». Достаёт лист с предложением.',
    trigger: {
      dayMin: 175,
      dayMax: 315,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 35,
    },
    npcId: 'anna',
    isMoralDilemma: true,
    options: [
      {
        id: 'accept_truce',
        text: 'Согласиться — устал воевать',
        consequences: { reputationDelta: 4, loyaltyDelta: 2 },
        npcRelationshipDelta: 20,
      },
      {
        id: 'counter',
        text: 'Контр-предложение: «Лучше открыто конкурируем, но без подлянок»',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse_war',
        text: '«Не доверяю — будем работать как работали»',
        consequences: {},
        npcRelationshipDelta: -10,
      },
    ],
  },
  {
    id: 'NPC_ANNA_CRISIS',
    title: 'Анна в беде',
    description:
      'Слухи по району: у Анны налоговая блокировка счёта, поставщик грозит подать в суд. Утром встречаешь её у входа — без обычного боевого вида. «Я тут... одолжишь 30 тысяч на неделю? Спасу бизнес — отдам с процентами. Если ты скажешь «нет» — не обижусь». Тишина.',
    trigger: {
      dayMin: 210,
      dayMax: 350,
      randomChance: 0.4,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMax: 60, // event for low-trust state
    },
    npcId: 'anna',
    isMoralDilemma: true,
    options: [
      {
        id: 'lend_kindness',
        text: 'Дать 30 000 ₽ — конкурент, но человек',
        consequences: { balanceDelta: -30000, reputationDelta: 6 },
        npcRelationshipDelta: 25,
      },
      {
        id: 'lend_terms',
        text: 'Дать 30 000 ₽, но в обмен на отказ от агрессивных акций на месяц',
        consequences: { balanceDelta: -30000, clientModifier: 0.05, clientModifierDays: 30 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'walk_away',
        text: '«Нет. Это не моя проблема» (она запомнит)',
        consequences: { reputationDelta: -2 },
        npcRelationshipDelta: -8,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Марина Воронова — маркетолог
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_MARINA_AUDIT',
    title: 'Марина показывает результаты',
    description:
      'После первой кампании Марина приходит с отчётом. «Смотрите — клики выросли на 28%, но конверсия в реальные продажи всего 4%. Я бы сказала, что бюджет лучше переложить в карту лояльности. Это не выгодно мне — но честно». Кладёт распечатку на стол.',
    trigger: {
      dayMin: 84, // ~week 12
      dayMax: 245,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 50,
    },
    npcId: 'marina',
    options: [
      {
        id: 'trust',
        text: 'Принять её рекомендацию — переложить бюджет',
        consequences: { balanceDelta: -8000, loyaltyDelta: 6, reputationDelta: 2 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'continue_ads',
        text: 'Продолжить рекламу — клики растут, чек придёт позже',
        consequences: { balanceDelta: -15000, clientModifier: 0.08, clientModifierDays: 14 },
        npcRelationshipDelta: -3,
      },
    ],
  },
  {
    id: 'NPC_MARINA_LEAVES',
    title: 'Марина уходит в декрет',
    description:
      'Марина заходит с лёгкой улыбкой и опущенными плечами. «Я ухожу в декрет через две недели. Хочется передать вас в надёжные руки — но в нашей сфере это редкость. Если хотите, я подготовлю на квартал стратегию вперёд, пока есть силы. Бесплатно — по знакомству». Действительно от души.',
    trigger: {
      dayMin: 210,
      dayMax: 350,
      randomChance: 0.6,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 65,
    },
    npcId: 'marina',
    options: [
      {
        id: 'accept_strategy',
        text: 'Принять стратегию, отблагодарить деньгами (−10 000 ₽ — она же в декрет)',
        consequences: { balanceDelta: -10000, clientModifier: 0.06, clientModifierDays: 60, reputationDelta: 3 },
        npcRelationshipDelta: 15,
      },
      {
        id: 'wish_well',
        text: 'Поблагодарить, но стратегию написать самому — у вас уже есть опыт',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 4,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Виктор Семёнов — менеджер банка
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_VIKTOR_PROMOTION',
    title: 'Виктор уходит на повышение',
    description:
      'Звонок из банка: «Я перевожусь в управление, в центральный офис. Хотел сам сказать. Я попросил, чтобы ваш счёт перевели в премиум-категорию — у вас обороты выросли. Это моё прощание. И — продолжайте, пожалуйста». Чуть теплее, чем обычно.',
    trigger: {
      dayMin: 175,
      dayMax: 315,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 60,
    },
    npcId: 'viktor',
    options: [
      {
        id: 'thank_call',
        text: 'Позвонить, поблагодарить лично, поздравить',
        consequences: { reputationDelta: 3 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'just_reply',
        text: 'Поблагодарить в ответ по звонку — и забыть',
        consequences: {},
        npcRelationshipDelta: 1,
      },
    ],
  },
  {
    id: 'NPC_VIKTOR_OFFER',
    title: 'Виктор предлагает кредитную линию',
    description:
      'Виктор заходит без пиджака, по-домашнему: «Я тут посмотрел вашу динамику. Могу одобрить кредитную линию 200 000 ₽ под 7% годовых — это лучше рынка. Без обеспечения. Это и для банка хорошо, и для вас. Подумайте — без давления». Кладёт буклет.',
    trigger: {
      dayMin: 140,
      dayMax: 280,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 55,
    },
    npcId: 'viktor',
    options: [
      {
        id: 'take_full',
        text: 'Взять линию — будет подушка на чёрный день (+200 000 ₽)',
        consequences: { balanceDelta: 200000 },
        npcRelationshipDelta: 8,
        // Note: not a loan in the loans system; treated as one-time injection
        // for narrative simplicity. Player keeps the cash.
      },
      {
        id: 'partial',
        text: 'Взять 50 000 ₽ — точечно, без излишеств',
        consequences: { balanceDelta: 50000 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'refuse_debt',
        text: 'Отказаться — без долгов спокойнее',
        consequences: { loyaltyDelta: 2 },
        npcRelationshipDelta: -3,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Глеб Котов — блогер
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'NPC_GLEB_COLLAB',
    title: 'Глеб предлагает рекламу',
    description:
      'Глеб приходит с телефоном на штативе. «Слушайте, у меня уже 22 тысячи подписок. Сделаю про вас — честный обзор, не реклама. 8 000 ₽, плюс если придут клиенты — мы оба в плюсе». Кивает на камеру.',
    trigger: {
      dayMin: 84,
      dayMax: 245,
      randomChance: 0.5,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMin: 40,
    },
    npcId: 'gleb',
    options: [
      {
        id: 'pay',
        text: 'Согласиться (−8 000 ₽)',
        consequences: { balanceDelta: -8000, clientModifier: 0.15, clientModifierDays: 14 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'barter',
        text: 'Предложить бартер — он берёт у вас бесплатно месяц, а взамен делает обзор',
        consequences: { balanceDelta: -3000, clientModifier: 0.10, clientModifierDays: 14, loyaltyDelta: 1 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'refuse',
        text: 'Отказать — реклама у блогеров — лотерея',
        consequences: {},
        npcRelationshipDelta: -4,
      },
    ],
  },
  {
    id: 'NPC_GLEB_SCANDAL',
    title: 'Глеб ищет скандал',
    description:
      'Глеб заходит с серьёзным лицом. «Ходят слухи, что у одного бизнеса в районе грязные методы. Если это правда у вас — лучше скажите сами, я смягчу. Если нет — дайте мне на кого-то ещё указать, я сделаю материал, и в плюсе оба будем». Это шантаж, замаскированный под "журналистику".',
    trigger: {
      dayMin: 175,
      dayMax: 315,
      randomChance: 0.4,
      oneTime: true,
      requiresNpcRevealed: true,
      npcRelationshipMax: 50, // fires for low-trust Gleb
    },
    npcId: 'gleb',
    isMoralDilemma: true,
    options: [
      {
        id: 'pay_off',
        text: 'Заплатить 15 000 ₽ — пусть уйдёт',
        consequences: { balanceDelta: -15000, reputationDelta: -3 },
        npcRelationshipDelta: 5,
      },
      {
        id: 'point_finger',
        text: 'Указать на конкурента — у Анны точно есть, что копать',
        consequences: { reputationDelta: -8 },
        npcRelationshipDelta: 12,
      },
      {
        id: 'go_public',
        text: 'Записать разговор и выложить как доказательство шантажа',
        consequences: { reputationDelta: 8 },
        npcRelationshipDelta: -25,
      },
    ],
  },
]
