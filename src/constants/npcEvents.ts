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
    description: 'Тамара заглянула, оглянулась как будто кто-то подслушивает. «Слышала, у Виктора за углом инспекция была. Не знаю, нашли что-то или нет. Просто чтоб ты знал — вот и всё».',
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
  {
    id: 'NPC_GENA_NETWORK',
    title: 'Дядя Гена прислал «нужного человека»',
    description: 'Гена позвонил: «У меня товарищ — может списывать кассовые чеки задним числом. Не дорого». Не предлагает, просто упоминает. Знает, что ты откажешь — но всё равно говорит.',
    trigger: { dayMin: 120, randomChance: 0.05, oneTime: true, requiresNpcRevealed: true },
    npcId: 'gena',
    options: [
      {
        id: 'firm_no',
        text: '«Гена. Нет. Никогда»',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: -2,
      },
      {
        id: 'humour',
        text: 'Посмеяться — Гена и есть Гена',
        consequences: {},
        npcRelationshipDelta: 4,
      },
    ],
  },
]
