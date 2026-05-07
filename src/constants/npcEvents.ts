import type { EventTemplate } from '../types/game'

// Standalone NPC events — texture between arc beats. Fire randomly when
// the NPC is revealed. Goal: keep characters alive without padding the
// arcs themselves. One-shots so they don't repeat across the year.

export const NPC_EVENTS: EventTemplate[] = [

  // ── Михаил (поставщик) ────────────────────────────────────────────────
  {
    id: 'NPC_MIKHAIL_DEAL',
    title: 'Михаил предлагает выгодную партию',
    description: 'Михаил позвонил: «У меня партия зависла, другой покупатель отказался. Со скидкой 18%, но решать сегодня». Звучит честно — он не давит, просто предлагает.',
    trigger: { dayMin: 56, randomChance: 0.04, oneTime: true, requiresNpcRevealed: true },
    npcId: 'mikhail',
    options: [
      {
        id: 'buy',
        text: 'Взять (−25 000 ₽, +чек на 3 недели)',
        consequences: { balanceDelta: -25000, checkModifier: 0.10, checkModifierDays: 21 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'decline',
        text: 'Отказать — сейчас не до этого',
        consequences: {},
        npcRelationshipDelta: -3,
      },
    ],
  },

  // ── Катя (бухгалтер) ──────────────────────────────────────────────────
  {
    id: 'NPC_KATYA_REMINDER',
    title: 'Катя напомнила о сроках',
    description: 'Катя кинула в мессенджер скрин: «У тебя через 5 дней ФНС, ты помнишь? Я могу подготовить — вне договорённости, но я не могу не сказать».',
    trigger: { dayMin: 90, randomChance: 0.04, oneTime: true, requiresNpcRevealed: true },
    npcId: 'katya',
    options: [
      {
        id: 'thank_pay',
        text: 'Поблагодарить, заплатить за услугу (−4 000 ₽)',
        consequences: { balanceDelta: -4000, reputationDelta: 2 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'self_extern',
        text: 'Сам через Контур.Экстерн — разобраться нужно',
        consequences: { reputationDelta: 3 },
        npcRelationshipDelta: 4,
        requiredService: 'extern',
        isContourOption: true,
      },
      {
        id: 'just_thanks',
        text: 'Поблагодарить и сделать самому',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 2,
      },
    ],
  },

  // ── Виктор (конкурент) ────────────────────────────────────────────────
  {
    id: 'NPC_VIKTOR_PROMO',
    title: 'Виктор предлагает совместную акцию',
    description: 'Виктор зашёл с конвертом: «Перед праздниками. Совместный флаер — два бизнеса на одной улице. Пополам по расходам, плюс трафик — обоим». Не подвох, просто экономика.',
    trigger: { dayMin: 84, randomChance: 0.04, oneTime: true, requiresNpcRevealed: true, npcRelationshipMin: 35 },
    npcId: 'viktor',
    options: [
      {
        id: 'join',
        text: 'Согласиться (−5 000 ₽, +12% клиентов на 10 дней)',
        consequences: { balanceDelta: -5000, clientModifier: 0.12, clientModifierDays: 10, reputationDelta: 1 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'decline_polite',
        text: '«Спасибо, но не сейчас»',
        consequences: {},
        npcRelationshipDelta: -4,
      },
    ],
  },

  // ── Денис (друг-инвестор) ─────────────────────────────────────────────
  {
    id: 'NPC_DENIS_TIP',
    title: 'Денис дал совет по бухгалтерии',
    description: 'Денис написал: «Слушай, у меня знакомый налоговик говорит — у вас там в районе сейчас будут проверки по ОФД. Ты подключил? Если нет — можно через мой контакт без очереди».',
    trigger: { dayMin: 70, randomChance: 0.04, oneTime: true, requiresNpcRevealed: true },
    npcId: 'denis',
    options: [
      {
        id: 'use_contact',
        text: 'Воспользоваться контактом (−5 000 ₽, рекомендация)',
        consequences: { balanceDelta: -5000, reputationDelta: 2 },
        npcRelationshipDelta: 6,
      },
      {
        id: 'thanks_self',
        text: '«Спасибо, я сам через Контур решу»',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: 2,
      },
    ],
  },

  // ── Ирина Петровна (мама) ─────────────────────────────────────────────
  {
    id: 'NPC_IRINA_VISIT',
    title: 'Мама заглянула с обедом',
    description: 'Мама пришла в обед, принесла кастрюлю. «Я знаю, ты не ешь нормально. Поешь сейчас, я подожду на лавочке у подъезда». Села у входа, никуда не торопится.',
    trigger: { dayMin: 100, randomChance: 0.05, oneTime: true, requiresNpcRevealed: true },
    npcId: 'irina',
    options: [
      {
        id: 'sit_eat',
        text: 'Сесть и поесть как нормальный человек',
        consequences: { reputationDelta: 1, loyaltyDelta: 2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'eat_run',
        text: 'Поесть на бегу — много дел',
        consequences: {},
        npcRelationshipDelta: -4,
      },
    ],
  },

  // ── Артём (бывший коллега) ────────────────────────────────────────────
  {
    id: 'NPC_ARTEM_PROCESS',
    title: 'Артём предложил систему',
    description: 'Артём принёс распечатку — таблица учёта всего, что можно учитывать. «У меня вечером было время. Если внедрим — на 20% быстрее будем закрывать день. Пробовать?»',
    trigger: { dayMin: 120, randomChance: 0.04, oneTime: true, requiresNpcRevealed: true },
    npcId: 'artem',
    options: [
      {
        id: 'try_it',
        text: 'Внедрить — он знает, о чём говорит',
        consequences: { reputationDelta: 2, loyaltyDelta: 4 },
        npcRelationshipDelta: 10,
      },
      {
        id: 'dismiss',
        text: '«Сейчас не до этого» — отложить',
        consequences: { loyaltyDelta: -2 },
        npcRelationshipDelta: -6,
      },
    ],
  },

  // ── Тамара (постоянная клиентка) ──────────────────────────────────────
  {
    id: 'NPC_TAMARA_GOSSIP',
    title: 'Тамара принесла слух',
    description: 'Тамара заглянула без Насти — значит серьёзно. Оглянулась как будто кто-то подслушивает. «Слышала, у Виктора за углом инспекция была. Не знаю, нашли что-то или нет. Просто чтоб ты знал — вот и всё».',
    trigger: { dayMin: 80, randomChance: 0.05, oneTime: true, requiresNpcRevealed: true },
    npcId: 'tamara',
    options: [
      {
        id: 'thanks_listen',
        text: '«Спасибо, тёть Тамара» — выслушать',
        consequences: { loyaltyDelta: 2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'shrug',
        text: 'Не вникать — слухи это слухи',
        consequences: {},
        npcRelationshipDelta: -2,
      },
    ],
  },

  // ── Гена (дядя со схемами) ────────────────────────────────────────────
  // Гена возвращается с разными темами на протяжении всего года. Каждая
  // одноразовая (oneTime по конкретной теме), но темы разные — крипта,
  // НФТ, бинарные опционы, форекс, инфокурс, метавселенная, MLM. Если
  // вложиться — мизерный шанс (5–12%) на джекпот 500–700 тыс., иначе
  // потеря вложения. Если отказать — Гена через несколько недель
  // приходит со следующей темой и многозначительно ухмыляется: «я же
  // говорил» (даже если предыдущая тоже не выстрелила — это и есть шутка).
  {
    id: 'NPC_GENA_SCHEME_CRYPTO',
    title: 'Гена: «Крипта поднимется к ноябрю»',
    description: 'Дядя Гена пришёл с распечаткой графиков. «Слушай. Я взял у мужика инсайд. Альткоин один — в ноябре в десять раз. Сейчас вход 30 тысяч, возьмёт точно. Не то что криптомат — это серьёзно». Загадочно ухмыляется. В прошлый раз тоже ухмылялся.',
    trigger: { dayMin: 70, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Вложиться (−30 000 ₽, может выстрелить)',
        consequences: { balanceDelta: -30000, randomJackpot: { chance: 0.01, bonus: 600000 } },
        npcRelationshipDelta: 6,
      },
      {
        id: 'refuse',
        text: '«Гена. Я уже видел, как ты ухмылялся. Нет»',
        consequences: {},
        npcRelationshipDelta: -2,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_NFT',
    title: 'Гена: «Мой кореш рисует НФТ»',
    description: 'Гена приходит с телефоном, тыкает в экран. «Вот. Это НФТ. Серия про котов в очках, друг рисует. Мы их выкупаем по 5 тысяч штука — десять штук — и через два месяца на маркетплейсе они уже по 80. Это новая Мона Лиза, я тебе говорю». Кивает многозначительно.',
    trigger: { dayMin: 105, randomChance: 0.5, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Купить десять (−50 000 ₽, может выстрелить)',
        consequences: { balanceDelta: -50000, randomJackpot: { chance: 0.005, bonus: 700000 } },
        npcRelationshipDelta: 7,
      },
      {
        id: 'refuse',
        text: '«Я не понимаю что такое НФТ. И не хочу»',
        consequences: {},
        npcRelationshipDelta: -1,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_BINARY',
    title: 'Гена: «Бинарные опционы, у меня система»',
    description: 'Гена сел напротив, разложил Excel на ноуте. «Я прогнал статистику за полгода. Если ставить только на пары после трёх красных свечей подряд — выигрыш в 70% случаев. Я лично проверил. Дай 20 тысяч на торговый счёт — за месяц будем в плюсе». Excel выглядит убедительно. Но это Гена.',
    trigger: { dayMin: 140, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Закинуть 20 000 ₽ — пусть попробует',
        consequences: { balanceDelta: -20000, randomJackpot: { chance: 0.005, bonus: 500000 } },
        npcRelationshipDelta: 6,
      },
      {
        id: 'refuse',
        text: '«Бинарные опционы — это казино с другим названием. Нет»',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: -2,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_FOREX',
    title: 'Гена: «Форекс через своего человека»',
    description: 'Гена позвонил из Москвы. «Я у одного эксперта на семинаре был. У него стратегия — даёт 3% в неделю. Через подставной счёт — никаких вопросов. 40 тысяч на старт, через год удваиваем. Это не крипта, это серьёзно — институт ВВП». Многозначительно ухмыляется в трубку, ты это слышишь.',
    trigger: { dayMin: 175, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Закинуть 40 000 ₽ — а вдруг',
        consequences: { balanceDelta: -40000, randomJackpot: { chance: 0.01, bonus: 650000 } },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse',
        text: 'Не отвечать в принципе',
        consequences: {},
        npcRelationshipDelta: -1,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_INFOCOURSE',
    title: 'Гена: «Инфокурс по успеху, я уже партнёр»',
    description: 'Гена пришёл в новой кепке. «Я попал в команду одного коуча. Курс называется "Бизнес-Прорыв". Если приведу клиентов — мне 30%. Купи у меня — 25 тысяч — и потом по партнёрке возмёшь свою долю. Это сетевой маркетинг, но для умных». Ухмыляется загадочно. Опять.',
    trigger: { dayMin: 210, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Купить за 25 000 ₽ — кто знает',
        consequences: { balanceDelta: -25000, randomJackpot: { chance: 0.005, bonus: 550000 } },
        npcRelationshipDelta: 6,
      },
      {
        id: 'refuse',
        text: '«Гена. Это пирамида. Иди»',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: -3,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_METAVERSE',
    title: 'Гена: «Земля в метавселенной»',
    description: 'Гена прислал ссылку. «Слушай. В одной метавселенной — продают участки рядом с центром. Скоро туда зайдут бренды. 35 тысяч за виртуальный гектар — через полгода Coca-Cola купит соседний за миллион. Я уже взял два». Прикрепил скриншот с иконкой "🌐". Ухмылка та же.',
    trigger: { dayMin: 245, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Купить виртуальный гектар (−35 000 ₽)',
        consequences: { balanceDelta: -35000, randomJackpot: { chance: 0.005, bonus: 600000 } },
        npcRelationshipDelta: 7,
      },
      {
        id: 'refuse',
        text: '«Я не понимаю как купить землю, которой нет»',
        consequences: {},
        npcRelationshipDelta: -1,
      },
    ],
  },
  {
    id: 'NPC_GENA_SCHEME_MLM',
    title: 'Гена: «Биодобавки на грани медицины»',
    description: 'Гена подсунул баночку с непонятной жидкостью. «Это — улучшенная версия омега-3. Я партнёр у дистрибьютора — нужно купить набор первого уровня за 15 тысяч, и потом приводить трёх клиентов в месяц. Через год выйду на пассивные 80 тысяч». Ухмыляется. Сам пьёт что-то из такой же баночки, но напиток выглядит как лимонад.',
    trigger: { dayMin: 280, randomChance: 0.55, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'invest',
        text: 'Купить набор за 15 000 ₽ — поддержать дядю',
        consequences: { balanceDelta: -15000, randomJackpot: { chance: 0.005, bonus: 500000 } },
        npcRelationshipDelta: 8,
      },
      {
        id: 'refuse',
        text: '«Я не буду продавать БАДы соседям, Гена»',
        consequences: { reputationDelta: 1 },
        npcRelationshipDelta: -3,
      },
    ],
  },
]
