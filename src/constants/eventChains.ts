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
        npcRelationshipDelta: 25,
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
        npcRelationshipDelta: -30,
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
        npcRelationshipDelta: -20,
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
        npcRelationshipDelta: 25,
        chainFollowUpId: 'svetlana_growth_2a',
      },
      {
        id: 'refuse',
        text: 'Отказать ("Это твои инвестиции")',
        consequences: {},
        npcRelationshipDelta: -25,
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
        npcRelationshipDelta: 20,
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
        npcRelationshipDelta: 20,
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
        text: 'Ответить своей акцией (−10 000 ₽, вернуть клиентов)',
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

export const CHAIN_IDS = ['mikhail_crisis', 'svetlana_growth', 'inspector_chain', 'anna_war', 'legacy'] as const
export type ChainId = typeof CHAIN_IDS[number]

// Which week each chain's first event can trigger
export const CHAIN_TRIGGER_WEEKS: Record<ChainId, number> = {
  mikhail_crisis: 3,
  svetlana_growth: 6,
  inspector_chain: 8,
  anna_war: 10,
  legacy: 15,
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
}

export function getChainEvent(id: string): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.id === id)
}

// Returns the first-step event for a chain
export function getChainStartEvent(chainId: ChainId): EventTemplate | undefined {
  return CHAIN_EVENTS.find(e => e.trigger.chainId === chainId && e.trigger.chainStep === 1)
}
