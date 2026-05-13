import type { EventTemplate } from '../types/game'

/**
 * Цепочка «Первый сотрудник» (Спринт 5e).
 *
 * Сюжетная мотивация найма — раньше игрок просто шёл в Управление → Персонал
 * и нанимал из абстрактного списка, не зная зачем. Теперь:
 *
 *   1) На W5-6 (после mikhail_crisis W3-5, до svetlana_intro W20+) срабатывает
 *      бизнес-специфичное событие «не справились в одиночку» (3 версии:
 *      shop/cafe/salon). Опция «Подумать о найме» запускает чейн first_hire.
 *   2) Через 1-2 недели приходит событие с 4 кандидатами на найм:
 *        • Дальний родственник (25К/мес, eff 0.7 стабильно, energy 9, лоял -3)
 *        • Студент Никита      (35К, eff 0.85 → 1.05, energy 6, лоял 0)
 *            — растёт +0.015/нед, через ~13 недель достигает потолка
 *        • Олег без энтузиазма  (38К, eff 1.0 → 0.9, energy 6, лоял 0)
 *            — падает -0.005/нед, через ~20 недель достигает дна.
 *            ВНИМАНИЕ: под менеджером деградирует быстрее (-0.01/нед) до
 *            пола 0.75, плюс -10% штраф — «давят, работать больше надо»
 *        • Бывший профи         (55К, eff 1.2 стабильно, energy 5, лоял +5)
 *            бизнес-специфичный: повар (cafe), продавец из «Магнита» (shop),
 *            парикмахер с клиентурой (salon)
 *      Плюс опция «Пока никого» — отказ.
 *
 *      Студент и Олег стартуют близко (0.85 vs 1.0) но через 4-5 месяцев
 *      разница 0.20 (1.05 vs 0.9). Студент = инвестиция, Олег = известное
 *      качество которое деградирует.
 *
 *   3) Светлана появляется ОТДЕЛЬНЫМ сюжетным чейном на W20+ (svetlana_intro).
 *      Раньше было W12, но к этой неделе игрок ещё не вышел на стабильный
 *      доход и 60К/мес её зарплаты душили бизнес. На W20 у MID-стратегии
 *      ~250-300К накоплений, найм управленца становится возможным.
 *      Она — управленец-выпускница (position 'manager'), усиливает команду:
 *        • Обычные сотрудники (assistant): +25% к эффективности
 *        • Специалисты (профи Алла/Сергей/Лариса): +40% — она их разгружает
 *      Если её отвергнуть — через 3 недели она объявляется у Анны
 *      (svetlana_to_anna).
 */

const SALARY_NOTE_SUFFIX = ' · ЗП считается за месяц, выплаты каждые 2 недели'

export const SOLO_OVERLOAD_EVENTS: EventTemplate[] = [
  // ── МАГАЗИН: очередь к кассе ────────────────────────────────────────
  {
    id: 'SOLO_OVERLOAD_SHOP',
    title: 'Очередь к одной кассе',
    description:
      'Суббота, у вас точка. У стеллажа женщина с двумя пакетами и ребёнком ждёт уже семь минут — вы пробиваете предыдущему чек, пересчитываете сдачу. За её спиной ещё трое. Слышно: «Да тут вечно так». Один сразу разворачивается и уходит. Это не первый раз, но первый раз вы это заметили.',
    trigger: {
      dayMin: 30,
      dayMax: 42,
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
 * из SOLO_OVERLOAD_EVENTS. Не запускается как chain start.
 *
 * Регистрируется в eventChains.ts через CHAIN_EVENTS.
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
    // Намёки вместо цифр (Спринт 5e): игрок ориентируется по описанию, не по
    // numbers. Эффективность, growthRate, energy/loyalty/reputation — скрыты.
    // Известно только: зарплата (это деньги, нельзя скрыть) и качественный
    // профиль («без опыта», «учится», «без огонька», «класс сразу виден»).
    {
      id: 'hire_relative',
      text: '👨 Дальний родственник: 25 000 ₽/мес — без опыта, придётся всё перепроверять' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -3000,
        loyaltyDelta: -3,
        hireEmployee: {
          position: 'assistant',
          salary: 25000,
          efficiency: 0.7,
          energyCost: 9,
          name: 'Андрей',
        },
      },
    },
    {
      id: 'hire_student',
      text: '👨‍🎓 Студент Никита, 3-й курс: 35 000 ₽/мес — будет учиться по ходу, но схватывает быстро' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -4000,
        loyaltyDelta: 0,
        hireEmployee: {
          position: 'assistant',
          salary: 35000,
          efficiency: 0.85,
          energyCost: 6,
          name: 'Никита',
          growthRate: 0.015,
          growthLimit: 1.05,
        },
      },
    },
    {
      id: 'hire_friend',
      text: '👨 Олег, 39: 38 000 ₽/мес — работает нормально, но без огонька, не любит командование' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -4500,
        loyaltyDelta: 0,
        hireEmployee: {
          position: 'assistant',
          salary: 38000,
          efficiency: 1.0,
          energyCost: 6,
          name: 'Олег',
          growthRate: -0.005,
          growthLimit: 0.9,
          dislikesManager: true,
          growthLimitUnderManager: 0.75,
        },
      },
    },
    {
      id: 'hire_pro_cafe',
      text: '🍳 Сергей, повар из закрывшегося ресторана: 55 000 ₽/мес — 12 лет в общепите, класс виден сразу' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['cafe'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Сергей',
        },
      },
    },
    {
      id: 'hire_pro_shop',
      text: '🏪 Алла, продавец из обанкротившегося «Магнита»: 55 000 ₽/мес — 10 лет на кассе, класс виден сразу' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['shop'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Алла',
        },
      },
    },
    {
      id: 'hire_pro_salon',
      text: '💇 Лариса, парикмахер из закрытого салона: 55 000 ₽/мес — со своей клиентурой, готова к работе' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['beauty-salon'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        clientModifier: 0.10,
        clientModifierDays: 28,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Лариса',
        },
      },
    },
    {
      id: 'refuse_all',
      text: 'Пока никого — справлюсь сам',
      consequences: {
        reputationDelta: -1,
        loyaltyDelta: -2,
      },
    },
  ],
}

/**
 * Светлана-выпускница приходит на собеседование (Спринт 5e).
 *
 * Сюжетный чейн svetlana_intro, запускается автоматически с W20+
 * (раньше было W12 — сдвинуто чтобы игрок успел стабилизировать доход
 * перед наймом дорогого управленца). Если игрок при этом solo —
 * applyEventConsequence автопланирует svetlana_demands_hire через 2
 * недели (она требует обязательного второго найма).
 *
 * Backstory: 22 года, только защитила диплом политеха, во время учёбы
 * три года подрабатывала в районном магазинчике у тёти. Опыта формального
 * мало, но есть talent — приходит с готовым планом на первый месяц.
 *
 * Механически: position 'manager', amplifies команду на +25%
 * (см. employeeManager.getEmployeeCapacityBonus). Сама эффективна (1.3),
 * энергии берёт мало (4 — она организованная и инициативная). 60К₽/мес
 * — выше специалистов (55K), но ниже опытного управленца, потому что
 * формального опыта пока нет. Она сама честно говорит «знаю, что для
 * выпускницы много, но претендую на управление».
 */
export const SVETLANA_INTRO: EventTemplate = {
  id: 'svetlana_intro',
  title: 'Выпускница на собеседовании',
  description:
    'Пятница, восемь вечера, дверь должна быть закрыта. Стук. На пороге девушка, 22 года, кроссовки, рюкзак. «Извините, я по объявлению с хедхантера, оно вроде закрыто, но я подумала — может всё-таки нужен ещё человек?»\n\nСветлана. Только защитила диплом политеха. Во время учёбы три года подрабатывала у тёти в районном магазинчике — закупки, остатки, иногда касса; плюс организовывала их сезонные акции. Серьёзного резюме нет.\n\nИз папки достаёт лист — план на первый месяц у вас, по неделям. Внутри плана три идеи, до которых вы сами не додумались. На вопрос «сколько просите» — 60 тысяч. «Я знаю, что для выпускницы это много, но я претендую на управление, не просто помогать на смене». Не торгуется.',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'svetlana_intro',
    chainStep: 1,
  },
  npcId: 'svetlana',
  options: [
    {
      id: 'hire',
      text: '⭐ Принять — талант не часто стучится. 60 000 ₽/мес — управленец, разгрузит вас и подтянет команду' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -8000,
        loyaltyDelta: 6,
        reputationDelta: 2,
        hireEmployee: {
          position: 'manager',
          salary: 60000,
          efficiency: 1.3,
          energyCost: 4,
          name: 'Светлана',
          linkNpcId: 'svetlana',
        },
      },
      npcRelationshipDelta: 10,
    },
    {
      id: 'pass',
      text: '«Спасибо, мы пока подождём» — слишком молодая, рискованно',
      consequences: {
        reputationDelta: -1,  // в районе быстро узнают, что вы её упустили
      },
      chainFollowUpId: 'svetlana_to_anna',
    },
  ],
}

/**
 * Светлана у конкурента — последствие отказа от её найма на собеседовании.
 * Срабатывает через 3 недели после svetlana_intro если игрок выбрал pass.
 */
/**
 * Светлана настаивает на втором найме (Спринт 5e).
 *
 * Срабатывает через 2 недели после того, как Светлана нанята в solo-команду
 * (см. applyEventConsequence — там auto-schedule если employees.length===0
 * до её прихода). Никаких опций «пропустить» — она настаивает, без второго
 * человека работа не выстроится.
 */
export const SVETLANA_DEMANDS_HIRE: EventTemplate = {
  id: 'svetlana_demands_hire',
  title: 'Светлана настаивает: нужен второй',
  description:
    'Третья неделя со Светланой. После закрытия она садится напротив, без вступлений: «Я разобралась со всеми вашими операциями. Вы знаете, что нас двое на всё — это нерабочая конструкция. Если хотим расти, нам нужен ещё один человек прямо сейчас. Я уже посмотрела трёх. Вот они».\n\nКладёт перед вами три листочка. Каждый — короткое резюме и ожидание по зарплате. Спорить с такой постановкой бесполезно — и сами понимаете, что она права.',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'svetlana_intro',
    chainStep: 3,
  },
  npcId: 'svetlana',
  options: [
    {
      id: 'hire_student_via_svetlana',
      text: '👨‍🎓 Никита, 3-й курс политеха: 35 000 ₽/мес — учится по ходу, но схватывает быстро' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -4000,
        loyaltyDelta: 0,
        hireEmployee: {
          position: 'assistant',
          salary: 35000,
          efficiency: 0.85,
          energyCost: 6,
          name: 'Никита',
          growthRate: 0.015,
          growthLimit: 1.05,
        },
      },
    },
    {
      id: 'hire_oleg_via_svetlana',
      text: '👨 Олег, 39: 38 000 ₽/мес — работает нормально, но без огонька, не любит командование' + SALARY_NOTE_SUFFIX,
      consequences: {
        balanceDelta: -4500,
        loyaltyDelta: 0,
        hireEmployee: {
          position: 'assistant',
          salary: 38000,
          efficiency: 1.0,
          energyCost: 6,
          name: 'Олег',
          growthRate: -0.005,
          growthLimit: 0.9,
          dislikesManager: true,
          growthLimitUnderManager: 0.75,
        },
      },
      // Олег под Светланой — сразу заводим часы до oleg_trouble_1
      chainFollowUpId: 'oleg_trouble_1',
    },
    {
      id: 'hire_pro_via_svetlana_cafe',
      text: '🍳 Сергей, повар: 55 000 ₽/мес — 12 лет в общепите, класс виден сразу' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['cafe'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Сергей',
        },
      },
    },
    {
      id: 'hire_pro_via_svetlana_shop',
      text: '🏪 Алла, продавец: 55 000 ₽/мес — 10 лет на кассе, класс виден сразу' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['shop'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Алла',
        },
      },
    },
    {
      id: 'hire_pro_via_svetlana_salon',
      text: '💇 Лариса, парикмахер: 55 000 ₽/мес — со своей клиентурой' + SALARY_NOTE_SUFFIX,
      requiredBusinessTypes: ['beauty-salon'],
      consequences: {
        balanceDelta: -7000,
        loyaltyDelta: 5,
        reputationDelta: 2,
        clientModifier: 0.10,
        clientModifierDays: 28,
        hireEmployee: {
          position: 'specialist',
          salary: 55000,
          efficiency: 1.2,
          energyCost: 5,
          name: 'Лариса',
        },
      },
    },
  ],
}

/**
 * Олег косячит — первый звонок (Спринт 5e).
 *
 * Срабатывает через 4 недели после прихода Светланы, если Олег в команде.
 * Под её управлением он скисает (см. dislikesManager) и начинает реально
 * портить работу. Игроку даётся выбор: ещё один шанс или расставаться сразу.
 */
export const OLEG_TROUBLE_1: EventTemplate = {
  id: 'oleg_trouble_1',
  title: 'С Олегом всё хуже',
  description:
    'За четыре недели работы со Светланой Олег явно сдулся. Два дня прогулял «по семейным обстоятельствам», запутался с приёмкой поставщика (−5 тыс. убытка), нахамил постоянной клиентке — та оставила отзыв «неприветливые продавцы».\n\nСветлана подходит в среду, спокойно, но без полутонов: «Я не могу за ним переделывать каждый день. Решайте — либо мы с ним пробуем построить разговор последний раз, либо ищем замену».',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'svetlana_intro',
    chainStep: 4,
  },
  npcId: 'svetlana',
  options: [
    {
      id: 'give_time',
      text: 'Дать ему ещё неделю — может, исправится',
      consequences: {
        clientModifier: -0.05,
        clientModifierDays: 14,
        reputationDelta: -1,
      },
      chainFollowUpId: 'oleg_trouble_2',
    },
    {
      id: 'fire_now',
      text: 'Расставаться. Светлана права',
      consequences: {
        balanceDelta: -10000,  // выходное пособие / страх замены
        reputationDelta: -1,
        loyaltyDelta: 2,       // команда видит, что слабых не тащат
        fireEmployee: { name: 'Олег' },
      },
      npcRelationshipDelta: 5,
    },
  ],
}

/**
 * Олег: последняя капля (Спринт 5e).
 *
 * Срабатывает через 1 неделю после oleg_trouble_1 если игрок дал ему время.
 * За эту неделю Олег делает столько, что выбора уже нет — расстаёмся.
 */
export const OLEG_TROUBLE_2: EventTemplate = {
  id: 'oleg_trouble_2',
  title: 'Олег: финальный косяк',
  description:
    'Неделя «последнего шанса» стала финальной. В субботу — самый трафик — Олег не пришёл и не предупредил. В понедельник опоздал на 40 минут, к обеду «вышел перекурить» и не вернулся до конца смены. Касса час стояла без присмотра — мог зайти кто угодно.\n\nСветлана уже не уговаривает. Кладёт перед вами листок с распечатанными статьями трудового кодекса об увольнении за прогулы. «Это окно. Сейчас — или мы сами ставим себя в неудобную позу».',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'svetlana_intro',
    chainStep: 5,
  },
  npcId: 'svetlana',
  options: [
    {
      id: 'part_ways',
      text: 'Расставаться по обоюдному, без скандала',
      consequences: {
        balanceDelta: -15000,
        reputationDelta: -2,
        loyaltyDelta: -1,  // довёл до этого — на команде осадок
        fireEmployee: { name: 'Олег' },
      },
      npcRelationshipDelta: 3,
    },
  ],
}

export const SVETLANA_TO_ANNA: EventTemplate = {
  id: 'svetlana_to_anna',
  title: 'Анна объявила о новой управляющей',
  description:
    'Через три недели — пост в районном чате от Анны. Селфи на фоне её точки, рядом — знакомое лицо. Подпись: «Рада представить новую управляющую — Светлана О., свежая кровь, политех с отличием». 47 реакций. К концу недели у вас стало чуть тише: пара постоянников зашли, кивнули, ничего не купили, ушли. Один написал в ВК: «А правда что у Анны теперь Света? Я туда».',
  trigger: {
    dayMin: 0, dayMax: 9999, randomChance: 1.0, oneTime: true,
    chainId: 'svetlana_intro',
    chainStep: 2,
  },
  npcId: 'svetlana',
  options: [
    {
      id: 'accept_loss',
      text: 'Бывает. Поработаем дальше',
      consequences: {
        reputationDelta: -2,
        clientModifier: -0.08,
        clientModifierDays: 42,
      },
      npcRelationshipDelta: -25,  // 60 → 35 — больше не нейтральна
    },
  ],
}
