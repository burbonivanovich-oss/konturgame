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
        text: 'Согласиться (−5 энергии/неделю на 5 недель)',
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

]

// After Phase C the rest of the cast moved to single-NPC arcs
// (npcArcs.ts) which fire deterministically by week range. We keep
// the multi-step chain mechanism only for Михаил's crisis (which has
// branching follow-ups) and the late-game `legacy` chain (gated by
// reputation, not by a specific NPC).
export const CHAIN_IDS = [
  'mikhail_crisis', 'legacy',
] as const
export type ChainId = typeof CHAIN_IDS[number]

// Which week each chain's first event can trigger
export const CHAIN_TRIGGER_WEEKS: Record<ChainId, number> = {
  mikhail_crisis: 3,
  legacy: 15,
}

// Delay in weeks before the follow-up fires after the triggering choice
export const CHAIN_FOLLOWUP_DELAY: Record<string, number> = {
  mikhail_crisis_2a: 3,
  mikhail_crisis_2b: 2,
  mikhail_crisis_2c: 1,
  legacy_2a: 5,
  legacy_2b: 8,
}

export function getChainEvent(id: string): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.id === id)
}

// Returns the first-step event for a chain
export function getChainStartEvent(chainId: ChainId): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.trigger.chainId === chainId && e.trigger.chainStep === 1)
}
