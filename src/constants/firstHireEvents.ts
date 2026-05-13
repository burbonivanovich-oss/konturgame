import type { EventTemplate } from '../types/game'

/**
 * Цепочка «Первый сотрудник» (Спринт 5e).
 *
 * Сюжетная мотивация найма — раньше игрок просто шёл в Управление → Персонал
 * и нанимал из абстрактного списка, не зная зачем. Теперь:
 *
 *   1) На W5-6 (после mikhail_crisis W3-5, до svetlana_growth W6-9) срабатывает
 *      бизнес-специфичное событие «не справились в одиночку» (3 версии:
 *      shop/cafe/salon). Опция «Подумать о найме» запускает чейн first_hire.
 *   2) Через 1-2 недели приходит событие с 3 кандидатами на найм — разные
 *      по цене, эффективности, потребляемой энергии:
 *        • Дальний родственник (25К/мес, eff 0.7, energy 9) — дёшево, плохо
 *        • Студент (35К, 0.95, 6) — баланс цена/качество
 *        • Светлана (70К, 1.5, 3) — реальный NPC из набора npcs.ts
 *      Плюс опция «Пока никого» — отказ.
 *
 * Все параметры зашиты в hireEmployee-опции (см. EventOption.consequences),
 * создание Employee происходит в applyEventConsequence.
 *
 * Зарплата: считается в месяц, но списывается еженедельно (1/4 от месячной)
 * в weekCalculator.calculateMonthlyExpenses + dailyEmployeeSalary. В тексте
 * опции отмечаем — для прозрачности игроку.
 */

// Базовый текст с напоминанием про cashflow — общий для всех вариантов.
const SALARY_NOTE_SUFFIX = ' · ЗП считается за месяц, выплаты каждые 2 недели'

export const SOLO_OVERLOAD_EVENTS: EventTemplate[] = [
  // ── МАГАЗИН: очередь к кассе ────────────────────────────────────────
  {
    id: 'SOLO_OVERLOAD_SHOP',
    title: 'Очередь к одной кассе',
    description:
      'Суббота, у вас точка. У стеллажа женщина с двумя пакетами и ребёнком ждёт уже семь минут — вы пробиваете предыдущему чек, пересчитываете сдачу. За её спиной ещё трое. Слышно: «Да тут вечно так». Один сразу разворачивается и уходит. Это не первый раз, но первый раз вы это заметили.',
    trigger: {
      dayMin: 30,  // ~W5 — после mikhail_crisis (W3-5), до svetlana_growth (W6-9)
      dayMax: 42,  // ~W6
      randomChance: 1.0,
      oneTime: true,
      businessTypes: ['shop'],
    },
    options: [
      {
        id: 'endure',
        text: 'Терпеть, привыкну',
        consequences: { energyDelta: -8, reputationDelta: -2 },
      },
      {
        id: 'consider_hire',
        text: 'Расспросить знакомых — кого-то нужно искать',
        consequences: { energyDelta: -2 },
        chainFollowUpId: 'first_hire_options',
      },
    ],
  },

  // ── КАФЕ: пиковый обед ──────────────────────────────────────────────
  {
    id: 'SOLO_OVERLOAD_CAFE',
    title: 'Пиковый обед — не справились',
    description:
      'С 12:30 до 13:30 в дверь зашло больше людей, чем кофе-машина успевала варить. Двое уехали без заказа, один написал в Гугл-картах «странное место, никто не подходит». Сами стояли у плиты, у кассы, у эспрессо — везде одновременно. К двум часам у вас тряслись руки. Вечером посчитали — упустили тысяч двадцать выручки.',
    trigger: {
      dayMin: 30,
      dayMax: 42,
      randomChance: 1.0,
      oneTime: true,
      businessTypes: ['cafe'],
    },
    options: [
      {
        id: 'endure',
        text: 'Перестроить меню, чтобы быстрее справляться одному',
        consequences: { energyDelta: -10, checkModifier: -0.05, checkModifierDays: 14 },
      },
      {
        id: 'consider_hire',
        text: 'Так дальше нельзя — искать помощника',
        consequences: { energyDelta: -3 },
        chainFollowUpId: 'first_hire_options',
      },
    ],
  },

  // ── САЛОН: тройная запись ───────────────────────────────────────────
  {
    id: 'SOLO_OVERLOAD_SALON',
    title: 'Три записи в один час',
    description:
      'Поставили в расписание на 14:00 трёх клиенток подряд, забыв что окрашивание не делается за 20 минут. Первая — норм. Вторая ждала 35 минут, ушла обиженная. Третья просто не дождалась. В тот же вечер во вконтакте — отзыв со скриншотом записи: «Не уважают клиентов». Вы прочитали и долго сидели у компа в темноте.',
    trigger: {
      dayMin: 30,
      dayMax: 42,
      randomChance: 1.0,
      oneTime: true,
      businessTypes: ['beauty-salon'],
    },
    options: [
      {
        id: 'endure',
        text: 'Открыть только утренние часы, делать всё в одиночку',
        consequences: { energyDelta: -6, clientModifier: -0.10, clientModifierDays: 14 },
      },
      {
        id: 'consider_hire',
        text: 'Нужен второй мастер — без вариантов',
        consequences: { energyDelta: -3 },
        chainFollowUpId: 'first_hire_options',
      },
    ],
  },
]

/**
 * Чейн-событие выбора первого сотрудника. Триггерится через chainFollowUpId
 * из SOLO_OVERLOAD_EVENTS. Не запускается как chain start — только как
 * следствие выбора игрока на overload-событии.
 *
 * Регистрируется в eventChains.ts через CHAIN_EVENTS, чтобы getChainEvent
 * мог его найти при обработке chainFollowUpId.
 */
export const FIRST_HIRE_OPTIONS: EventTemplate = {
  id: 'first_hire_options',
  title: 'Кандидаты на первое место',
  description:
    'Расспросили знакомых, повесили объявление в районном чате. За четыре дня — четверо. Сидели в кафе напротив, по 30 минут каждый. Сейчас перед вами заметки на салфетке: имя, ожидание по зарплате, что умеет, что не умеет. Брать кого-то — надо. Кого именно — решать вам.',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'first_hire',
    chainStep: 1,
  },
  options: [
    // ── Дальний родственник: дёшево, посредственно ────────────────────
    {
      id: 'hire_relative',
      text: '👨 Дальний родственник: 25 000 ₽/мес, без опыта' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -3000,  // первая выплата авансом
        hireEmployee: {
          position: 'assistant',
          salary: 25000,
          efficiency: 0.7,
          energyCost: 9,  // приходится постоянно перепроверять
          name: 'Андрей',
        },
      },
    },
    // ── Студент: дёшево, средне, схватывает быстро ────────────────────
    {
      id: 'hire_student',
      text: '👨‍🎓 Студент, 3-й курс: 35 000 ₽/мес, подработка 4 ч/день' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -4000,
        hireEmployee: {
          position: 'assistant',
          salary: 35000,
          efficiency: 0.95,
          energyCost: 6,  // быстро учится, мало контроля
          name: 'Никита',
        },
      },
    },
    // ── Светлана: дорого, лучший вариант, реальный NPC ────────────────
    {
      id: 'hire_svetlana',
      text: '⭐ Светлана, 35, опыт продаж: 70 000 ₽/мес, готова брать управление',
      consequences: {
        balanceDelta: -9000,
        hireEmployee: {
          position: 'manager',
          salary: 70000,
          efficiency: 1.5,
          energyCost: 3,  // снимает часть управленческой нагрузки
          name: 'Светлана',
          linkNpcId: 'svetlana',
        },
      },
      npcRelationshipDelta: 5,  // хорошее первое впечатление
    },
    // ── Отказать: остаться solo ───────────────────────────────────────
    {
      id: 'refuse_all',
      text: 'Пока никого — справлюсь сам',
      consequences: { reputationDelta: -1 },
    },
  ],
}
