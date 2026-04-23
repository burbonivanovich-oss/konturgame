import type { GameState, Event, EventTemplate } from '../types/game'
import { MORAL_DILEMMA_EVENTS } from '../constants/moralDilemmas'
import { getChainEvent, CHAIN_FOLLOWUP_DELAY } from '../constants/eventChains'
import { RECURRING_CUSTOMER_EVENTS } from '../constants/recurringCustomers'
import { NPC_EVENTS } from '../constants/npcEvents'

export const EVENTS_DATABASE: EventTemplate[] = [
  {
    id: 'TAX01',
    title: 'Налоговая проверка — серьёзные нарушения',
    description: 'ФНС выявила грубые нарушения в отчётности за прошлые периоды. Требование об уплате недоимки и штрафа. Без системы отчётности разобраться почти нереально.',
    npcId: 'petrov',
    trigger: { dayMin: 10, randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'self',
        text: 'Разобраться самому (−80 000 ₽ штраф + нервы)',
        consequences: { balanceDelta: -80000, reputationDelta: -10 },
      },
      {
        id: 'lawyer',
        text: 'Нанять налогового юриста (−40 000 ₽)',
        consequences: { balanceDelta: -40000, reputationDelta: -3 },
      },
      {
        id: 'extern',
        text: 'Урегулировать через Контур.Экстерн (−5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 0 },
        requiredService: 'extern',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'BLOGGER01',
    title: 'Популярный блогер',
    description: 'Местный блогер упомянул ваш бизнес в своём посте. Поток клиентов резко вырос!',
    npcId: 'gleb',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'accept',
        text: 'Принять всех клиентов',
        consequences: { clientModifier: 0.3, clientModifierDays: 7, reputationDelta: 5 },
      },
    ],
  },
  {
    id: 'SUPPLY01',
    title: 'Полный срыв поставки в сезон',
    description: 'Поставщик бесследно исчез вместе с предоплатой. Склад пуст, заказы сорваны, клиенты уходят к конкуренту. Без цифрового учёта найти замену — дни потерь.',
    npcId: 'mikhail',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'wait',
        text: 'Судорожно искать нового поставщика (−35 000 ₽ + −30% клиентов на 3 дня)',
        consequences: { balanceDelta: -35000, clientModifier: -0.3, clientModifierDays: 3 },
      },
      {
        id: 'market-find',
        text: 'Найти проверенного через Контур.Маркет (−2 000 ₽)',
        consequences: { balanceDelta: -2000 },
        requiredService: 'market',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'HOLIDAY01',
    title: 'Праздничный ажиотаж',
    description: 'Приближается праздник. Клиентов стало значительно больше.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'normal',
        text: 'Работать в стандартном режиме',
        consequences: { clientModifier: 0.2, clientModifierDays: 5 },
      },
    ],
  },
  {
    id: 'STAFF01',
    title: 'Бунт персонала — угроза коллективного ухода',
    description: 'Три ключевых сотрудника выставили ультиматум: повышение зарплаты на 40% или уходят всей командой. Без нормального учёта рабочего времени до этого и дошло.',
    npcId: 'svetlana',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'ignore',
        text: 'Дать уйти. Нанять новых (−25 000 ₽ + лояльность −30)',
        consequences: { balanceDelta: -25000, loyaltyDelta: -30 },
      },
      {
        id: 'bonus',
        text: 'Пойти на уступки (−12 000 ₽ доп. расходы, лояльность +5)',
        consequences: { balanceDelta: -12000, loyaltyDelta: 5 },
      },
      {
        id: 'elba-manage',
        text: 'Оптимизировать графики через Контур.Эльба (лояльность +10)',
        consequences: { loyaltyDelta: 10 },
        requiredService: 'elba',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'COMPETITOR01',
    title: 'Новый конкурент',
    description: 'Рядом открылся конкурент. Часть клиентов переключается на него.',
    npcId: 'anna',
    trigger: { randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'promo',
        text: 'Запустить акцию (-3 000 ₽)',
        consequences: { balanceDelta: -3000, clientModifier: 0.1, clientModifierDays: 10 },
      },
      {
        id: 'quality',
        text: 'Сделать ставку на качество',
        consequences: { reputationDelta: 5, checkModifier: 0.1, checkModifierDays: 10 },
      },
    ],
  },
  {
    id: 'EQUIPMENT01',
    title: 'Поломка оборудования',
    description: 'Вышло из строя ключевое оборудование. Требуется срочный ремонт.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'full-repair',
        text: 'Полноценный ремонт (-15 000 ₽)',
        consequences: { balanceDelta: -15000 },
      },
      {
        id: 'cheap-repair',
        text: 'Быстрый ремонт (-7 000 ₽, временные потери клиентов)',
        consequences: { balanceDelta: -7000, clientModifier: -0.1, clientModifierDays: 3 },
      },
    ],
  },
  {
    id: 'AUDIT01',
    title: 'Поставщик оказался мошенником',
    description: 'Вы работали с поставщиком три месяца — и только сейчас выяснилось, что он в реестре недобросовестных. Крупная предоплата пропала, товар оказался бракованным. Ваша репутация под ударом.',
    npcId: 'mikhail',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'trust',
        text: 'Разбираться через суд (−55 000 ₽ + репутация −10)',
        consequences: { balanceDelta: -55000, reputationDelta: -10 },
      },
      {
        id: 'fokus-check',
        text: 'Контур.Фокус выявил риск заранее (−3 000 ₽ за проверку)',
        consequences: { balanceDelta: -3000 },
        requiredService: 'fokus',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'REVIEW01',
    title: 'Негативный отзыв',
    description: 'Клиент оставил плохой отзыв в интернете. Репутация под угрозой.',
    trigger: { randomChance: 0.05, reputationMax: 70 },
    options: [
      {
        id: 'respond',
        text: 'Публично ответить',
        consequences: { reputationDelta: -3 },
      },
      {
        id: 'resolve',
        text: 'Решить проблему клиента (-5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 5 },
      },
    ],
  },
  {
    id: 'CASH01',
    title: 'Кассовый разрыв — нужны деньги сегодня',
    description: 'Платёж поставщику завтра, а на счету пусто. Банки требуют недели на рассмотрение. Микрофинансовые организации дают деньги сразу, но процент убийственный.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'loan',
        text: 'МФО — 30% годовых (получить +20 000 ₽, но −6 000 ₽ комиссия)',
        consequences: { balanceDelta: 14000 },
      },
      {
        id: 'bank-loan',
        text: 'Контур.Банк — 5% годовых (+20 000 ₽, −1 000 ₽ комиссия)',
        consequences: { balanceDelta: 19000 },
        requiredService: 'bank',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'LOYAL01',
    title: 'Постоянный клиент',
    description: 'Довольный постоянный клиент привёл с собой новых друзей.',
    trigger: { randomChance: 0.04, reputationMin: 60 },
    options: [
      {
        id: 'welcome',
        text: 'Тепло встретить новых клиентов',
        consequences: { reputationDelta: 3, clientModifier: 0.1, clientModifierDays: 5 },
      },
    ],
  },
  {
    id: 'RENT01',
    title: 'Повышение аренды',
    description: 'Арендодатель сообщил о повышении арендной ставки с следующего месяца.',
    trigger: { dayMin: 30, randomChance: 0.03, oneTime: true },
    options: [
      {
        id: 'agree',
        text: 'Согласиться с повышением (-5 000 ₽)',
        consequences: { balanceDelta: -5000 },
      },
      {
        id: 'negotiate',
        text: 'Поторговаться (-2 000 ₽)',
        consequences: { balanceDelta: -2000 },
      },
    ],
  },
  {
    id: 'FIRE01',
    title: 'Пожарная проверка',
    description: 'Пожарная инспекция выявила нарушения в вашем помещении.',
    trigger: { randomChance: 0.02, oneTime: true },
    options: [
      {
        id: 'pay-fine',
        text: 'Оплатить штраф (-10 000 ₽)',
        consequences: { balanceDelta: -10000 },
      },
      {
        id: 'fix',
        text: 'Устранить нарушения (-5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 2 },
      },
    ],
  },
  {
    id: 'DIADOC01',
    title: 'Штраф за нарушение документооборота',
    description: 'Налоговая провела камеральную проверку и нашла нарушения в первичных документах с контрагентами. Всё оформлялось на бумаге — теперь за это штраф. И это не последний.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'manual',
        text: 'Заплатить штраф и переоформить всё вручную (−30 000 ₽)',
        consequences: { balanceDelta: -30000 },
      },
      {
        id: 'diadoc-send',
        text: 'Контур.Диадок закрыл бы этот вопрос автоматически (−0 ₽)',
        consequences: {},
        requiredService: 'diadoc',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'BIRTHDAY01',
    title: 'День рождения бизнеса',
    description: 'Ваш бизнес работает уже 30 дней! Клиенты и партнёры поздравляют.',
    trigger: { dayMin: 30, dayMax: 32, oneTime: true },
    options: [
      {
        id: 'celebrate',
        text: 'Устроить праздник (-3 000 ₽)',
        consequences: { balanceDelta: -3000, reputationDelta: 10, loyaltyDelta: 10 },
      },
      {
        id: 'work',
        text: 'Продолжить в рабочем режиме',
        consequences: { reputationDelta: 3 },
      },
    ],
  },
  {
    id: 'VIRAL01',
    title: 'Вирусное видео',
    description: 'Видео о вашем бизнесе стало вирусным в соцсетях!',
    trigger: { randomChance: 0.02, reputationMin: 70 },
    options: [
      {
        id: 'ride-wave',
        text: 'Использовать момент',
        consequences: { clientModifier: 0.5, clientModifierDays: 14, reputationDelta: 10 },
      },
    ],
  },
  {
    id: 'SANPIN01',
    title: 'Санитарная проверка',
    description: 'СЭС пришла с внеплановой проверкой. Претензий к гигиене.',
    trigger: { randomChance: 0.02, oneTime: false },
    options: [
      {
        id: 'fine',
        text: 'Заплатить штраф (-8 000 ₽)',
        consequences: { balanceDelta: -8000 },
      },
      {
        id: 'fix-now',
        text: 'Немедленно устранить (-4 000 ₽, +репутация)',
        consequences: { balanceDelta: -4000, reputationDelta: 3 },
      },
    ],
  },
  {
    id: 'DISCOUNT01',
    title: 'Выгодное предложение от поставщика',
    description: 'Поставщик предлагает большую партию со скидкой 30%. Выгодная возможность.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'buy',
        text: 'Купить партию (-10 000 ₽)',
        consequences: { balanceDelta: -10000 },
      },
      {
        id: 'skip',
        text: 'Отказаться от предложения',
        consequences: {},
      },
    ],
  },
  {
    id: 'FAMILY01',
    title: 'Выходной с семьей',
    description: 'Семья давно не видела вас. Может быть, стоит провести выходной вместе?',
    trigger: { randomChance: 0.06 },
    options: [
      {
        id: 'family-time',
        text: 'Провести выходной с семьей (-8 000 ₽, +40% энергии)',
        consequences: { balanceDelta: -8000, energyDelta: 40 },
      },
      {
        id: 'work-again',
        text: 'Продолжить работать (-5% репутация)',
        consequences: { reputationDelta: -5 },
      },
    ],
  },
  {
    id: 'VACATION01',
    title: 'Отпуск на неделю',
    description: 'Вы совсем забыли об отдыхе. Недельный отпуск поможет вернуть силы и переосмыслить жизнь.',
    trigger: { dayMin: 30, randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'vacation',
        text: 'Уехать в отпуск (-15 000 ₽, +70% энергии)',
        consequences: { balanceDelta: -15000, energyDelta: 70 },
      },
      {
        id: 'no-vacation',
        text: 'Остаться на месте (-20% энергии)',
        consequences: { energyDelta: -20 },
      },
    ],
  },
  {
    id: 'HEALTH01',
    title: 'Здоровье требует внимания',
    description: 'Вы чувствуете усталость и стресс. Может быть, стоит посетить врача или начать заниматься спортом?',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'doctor',
        text: 'Посетить врача и спортзал (-5 000 ₽, +30% энергии)',
        consequences: { balanceDelta: -5000, energyDelta: 30 },
      },
      {
        id: 'ignore-health',
        text: 'Игнорировать сигналы организма (-15% энергии)',
        consequences: { energyDelta: -15 },
      },
    ],
  },
  {
    id: 'HOBBIES01',
    title: 'Давно не занимались хобби?',
    description: 'Ваше любимое занятие ждёт вас. Может, уделить ему время и отвлечься от забот?',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'hobby-time',
        text: 'Провести вечер с хобби (-3 000 ₽, +25% энергии)',
        consequences: { balanceDelta: -3000, energyDelta: 25 },
      },
      {
        id: 'skip-hobby',
        text: 'Работать дальше',
        consequences: {},
      },
    ],
  },
  {
    id: 'FRIENDS01',
    title: 'Встреча со старыми друзьями',
    description: 'Друзья организуют встречу. Давно вас не видели и очень скучают.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'meet-friends',
        text: 'Встретиться со друзьями (-4 000 ₽, +35% энергии)',
        consequences: { balanceDelta: -4000, energyDelta: 35 },
      },
      {
        id: 'decline',
        text: 'Отказать (остаться в работе)',
        consequences: {},
      },
    ],
  },
  {
    id: 'MEDITATION01',
    title: 'Медитация и внимательность',
    description: 'Стресс накапливается. Может быть, попробовать медитацию или йогу?',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'meditate',
        text: 'Медитировать в течение часа (+20% энергии)',
        consequences: { energyDelta: 20 },
      },
      {
        id: 'no-meditate',
        text: 'Продолжить работу',
        consequences: {},
      },
    ],
  },
  // ФАЗА 3: Конкуренция, поставщики, тренды, сотрудники
  {
    id: 'COMPETITOR_COUNTER',
    title: 'Отвоевание рынка у конкурента',
    description: 'Конкурент отнял ваших клиентов. Пора дать ему отпор!',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'price-war',
        text: 'Снизить цены (-5 000 ₽, вернуть клиентов)',
        consequences: { balanceDelta: -5000, clientModifier: 0.2, clientModifierDays: 7 },
      },
      {
        id: 'quality-push',
        text: 'Улучшить качество (+1 репутация каждый день)',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'ignore',
        text: 'Ничего не делать',
        consequences: {},
      },
    ],
  },
  {
    id: 'SUPPLIER_QUALITY',
    title: 'Проблемы с качеством товара',
    description: 'Поставщик начал присылать товар худшего качества. Клиенты жалуются.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'switch-supplier',
        text: 'Сменить поставщика (найти нового)',
        consequences: { reputationDelta: -3 },
      },
      {
        id: 'negotiate',
        text: 'Договориться о скидке (-2 000 ₽)',
        consequences: { balanceDelta: -2000, loyaltyDelta: 2 },
      },
      {
        id: 'accept',
        text: 'Продолжать работу (-5% лояльность)',
        consequences: { loyaltyDelta: -5 },
      },
    ],
  },
  {
    id: 'TREND_BOOM',
    title: 'Тренд на ваш товар!',
    description: 'Внезапно стало модно то, что вы продаёте! Спрос резко вырос!',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'capitalize',
        text: 'Максимально использовать тренд (+40% выручка на 6 дней)',
        consequences: { checkModifier: 0.4, checkModifierDays: 6 },
      },
      {
        id: 'steady',
        text: 'Работать в обычном режиме (+20% выручка на 4 дня)',
        consequences: { checkModifier: 0.2, checkModifierDays: 4 },
      },
    ],
  },
  {
    id: 'TREND_BUST',
    title: 'Антитренд на ваш товар',
    description: 'Внезапно ваш основной товар вышел из моды. Спрос упал.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'diversify',
        text: 'Быстро перестроить ассортимент (-8 000 ₽, восстановление)',
        consequences: { balanceDelta: -8000, checkModifier: 0.15, checkModifierDays: 5 },
      },
      {
        id: 'wait',
        text: 'Ждать, пока тренд вернётся (-15% клиентов на 7 дней)',
        consequences: { clientModifier: -0.15, clientModifierDays: 7 },
      },
    ],
  },
  {
    id: 'STAR_EMPLOYEE',
    title: 'Звёздный сотрудник получил предложение',
    description: 'Ваш лучший сотрудник получил заманчивое предложение от конкурента. Грозит уход.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'match-offer',
        text: 'Поднять зарплату (-3 000 ₽/месяц, удержать)',
        consequences: { balanceDelta: -3000, loyaltyDelta: 10 },
      },
      {
        id: 'promote',
        text: 'Повысить в должности (+1 репутация)',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'let-go',
        text: 'Отпустить с миром (-10 клиентов от потери таланта)',
        consequences: { clientModifier: -0.15, clientModifierDays: 8 },
      },
    ],
  },
  {
    id: 'STAFF_CONFLICT',
    title: 'Конфликт между сотрудниками',
    description: 'Два ключевых сотрудника не ладят. Обстановка накаляется. Качество работы падает.',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'mediate',
        text: 'Провести медиацию (-2 000 ₽, восстановить атмосферу)',
        consequences: { balanceDelta: -2000, loyaltyDelta: 5 },
      },
      {
        id: 'separate',
        text: 'Перевести одного в другой отдел (смена расписания)',
        consequences: { loyaltyDelta: -3 },
      },
      {
        id: 'ignore-conflict',
        text: 'Игнорировать конфликт (-8% качество)',
        consequences: { reputationDelta: -8 },
      },
    ],
  },
  {
    id: 'STAFF_QUIT',
    title: 'Сотрудник уходит в отставку',
    description: 'Один из сотрудников решил уйти. Нужно срочно найти замену!',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'hire-replacement',
        text: 'Нанять замену вдвое дороже (-более высокая зарплата)',
        consequences: { balanceDelta: -2000 },
      },
      {
        id: 'promote-internal',
        text: 'Повысить внутреннего кандидата (+2 репутация)',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'accept-loss',
        text: 'Остаться в недостатке (-30% пропускная способность)',
        consequences: { checkModifier: -0.3, checkModifierDays: 14 },
      },
    ],
  },
  {
    id: 'STAFF_ACHIEVEMENT',
    title: 'Сотрудник получил награду',
    description: 'Один из ваших сотрудников выиграл профессиональное признание! Моральный подъём в команде!',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'celebrate',
        text: 'Устроить празднование (-1 000 ₽, +7 лояльности)',
        consequences: { balanceDelta: -1000, loyaltyDelta: 7 },
      },
      {
        id: 'bonus',
        text: 'Выплатить премию (-2 000 ₽, +12 лояльности)',
        consequences: { balanceDelta: -2000, loyaltyDelta: 12 },
      },
      {
        id: 'acknowledge',
        text: 'Просто поблагодарить (+3 лояльности)',
        consequences: { loyaltyDelta: 3 },
      },
    ],
  },
  {
    id: 'SUPPLIER_DELIVERY',
    title: 'Задержка поставки от поставщика',
    description: 'Поставщик задержал доставку. Товара не будет несколько дней!',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'find-alternative',
        text: 'Найти альтернативного поставщика (-4 000 ₽, но дороже)',
        consequences: { balanceDelta: -4000 },
      },
      {
        id: 'wait-suffer',
        text: 'Ждать (-20% выручка на 3 дня)',
        consequences: { checkModifier: -0.2, checkModifierDays: 3 },
      },
      {
        id: 'complain',
        text: 'Потребовать компенсацию (-1 000 ₽ скидка)',
        consequences: { balanceDelta: 1000 },
      },
    ],
  },
  {
    id: 'OFD_FINE01',
    title: 'Штраф ФНС за работу без онлайн-кассы',
    description: 'Налоговая инспекция выявила, что вы принимаете оплату без зарегистрированной онлайн-кассы. Штраф — до 100% выручки за период. Контур.ОФД подключил бы онлайн-кассу за 5 минут и застраховал от этого.',
    trigger: { dayMin: 14, randomChance: 0.08, noService: 'ofd', oneTime: true },
    options: [
      {
        id: 'pay-fine',
        text: 'Оплатить штраф ФНС (−60 000 ₽ + репутация −15)',
        consequences: { balanceDelta: -60000, reputationDelta: -15 },
      },
      {
        id: 'dispute',
        text: 'Оспорить через юриста (−30 000 ₽ + репутация −5)',
        consequences: { balanceDelta: -30000, reputationDelta: -5 },
      },
    ],
  },
  {
    id: 'MARKET_STOCKOUT',
    title: 'Внезапный дефицит — склад опустел',
    description: 'Пик сезона, а товара нет. Вы не успели отследить остатки вручную. Клиенты уходят к конкурентам, некоторые уже пишут гневные отзывы. Контур.Маркет предупредил бы за неделю.',
    trigger: { dayMin: 20, randomChance: 0.05, noService: 'market', oneTime: false },
    options: [
      {
        id: 'emergency-buy',
        text: 'Экстренная закупка по завышенной цене (−45 000 ₽ + репутация −5)',
        consequences: { balanceDelta: -45000, reputationDelta: -5 },
      },
      {
        id: 'wait-restock',
        text: 'Ждать обычную поставку (−40% клиентов на 4 дня)',
        consequences: { clientModifier: -0.4, clientModifierDays: 4 },
      },
    ],
  },
]

export function generateEvent(day: number, state: GameState): Event | null {
  const triggered = state.triggeredEventIds ?? []
  const candidates: EventTemplate[] = []

  const allTemplates = [...EVENTS_DATABASE, ...MORAL_DILEMMA_EVENTS, ...RECURRING_CUSTOMER_EVENTS, ...NPC_EVENTS]

  for (const template of allTemplates) {
    if (template.trigger.oneTime && triggered.includes(template.id)) continue
    if (template.trigger.dayMin !== undefined && day < template.trigger.dayMin) continue
    if (template.trigger.dayMax !== undefined && day > template.trigger.dayMax) continue
    if (
      template.trigger.reputationMax !== undefined &&
      state.reputation > template.trigger.reputationMax
    )
      continue
    if (
      template.trigger.reputationMin !== undefined &&
      state.reputation < template.trigger.reputationMin
    )
      continue
    if (
      template.trigger.businessTypes &&
      !template.trigger.businessTypes.includes(state.businessType)
    )
      continue
    // Only fire if the specified service is NOT active (crisis events)
    if (
      template.trigger.noService !== undefined &&
      state.services[template.trigger.noService]?.isActive === true
    )
      continue
    if (
      template.trigger.randomChance !== undefined &&
      Math.random() > template.trigger.randomChance
    )
      continue

    candidates.push(template)
  }

  if (candidates.length === 0) return null

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]

  return templateToEvent(chosen, day, state.currentWeek)
}

export function templateToEvent(template: EventTemplate, day: number, currentWeek: number): Event {
  const deadline = template.decisionDeadlineWeeks !== undefined
    ? currentWeek + template.decisionDeadlineWeeks
    : undefined

  return {
    id: template.id,
    day,
    title: template.title,
    description: template.description,
    options: template.options,
    isResolved: false,
    npcId: template.npcId,
    isMoralDilemma: template.isMoralDilemma,
    decisionDeadlineWeek: deadline,
  }
}

export function applyEventConsequence(
  state: GameState,
  event: Event,
  optionId: string,
): void {
  const option = event.options.find((o) => o.id === optionId)
  if (!option) return

  const c = option.consequences

  if (c.balanceDelta !== undefined) {
    state.balance = state.balance + c.balanceDelta
  }
  if (c.reputationDelta !== undefined) {
    state.reputation = Math.max(0, Math.min(100, state.reputation + c.reputationDelta))
  }
  if (c.loyaltyDelta !== undefined) {
    state.loyalty = Math.max(0, Math.min(100, state.loyalty + c.loyaltyDelta))
  }
  if (c.energyDelta !== undefined) {
    state.entrepreneurEnergy = Math.max(0, Math.min(100, state.entrepreneurEnergy + c.energyDelta))
  }
  if (c.clientModifier !== undefined) {
    state.temporaryClientMod = (state.temporaryClientMod ?? 0) + c.clientModifier
    state.temporaryModDaysLeft = Math.max(
      state.temporaryModDaysLeft ?? 0,
      c.clientModifierDays ?? 1,
    )
  }
  if (c.checkModifier !== undefined) {
    state.temporaryCheckMod = (state.temporaryCheckMod ?? 0) + c.checkModifier
    state.temporaryModDaysLeft = Math.max(
      state.temporaryModDaysLeft ?? 0,
      c.checkModifierDays ?? 1,
    )
  }

  // NPC relationship delta
  if (option.npcRelationshipDelta !== undefined && event.npcId) {
    const npcId = event.npcId
    const delta = option.npcRelationshipDelta
    state.npcs = (state.npcs ?? []).map(npc => {
      if (npc.id !== npcId) return npc
      return {
        ...npc,
        relationshipLevel: Math.max(0, Math.min(100, npc.relationshipLevel + delta)),
        isRevealed: true,
        memory: [
          ...npc.memory.slice(-9),
          { week: state.currentWeek, eventId: event.id, choiceId: optionId, note: option.text.slice(0, 60) },
        ],
      }
    })
  }

  // Chain follow-up scheduling
  if (option.chainFollowUpId) {
    const followUpTemplate = getChainEvent(option.chainFollowUpId)
    if (followUpTemplate) {
      const delay = CHAIN_FOLLOWUP_DELAY[option.chainFollowUpId] ?? 2
      if (!state.pendingChainFollowUps) state.pendingChainFollowUps = []
      state.pendingChainFollowUps.push({
        chainEventId: option.chainFollowUpId,
        triggerWeek: state.currentWeek + delay,
      })
    }
  }

  event.isResolved = true

  if (!state.triggeredEventIds) state.triggeredEventIds = []
  if (!state.triggeredEventIds.includes(event.id)) {
    state.triggeredEventIds.push(event.id)
  }

  state.pendingEvent = null
}
