import type { GameState, Event, EventTemplate } from '../types/game'
import { MORAL_DILEMMA_EVENTS } from '../constants/moralDilemmas'
import { PERSONAL_BACKSTORY_EVENTS } from '../constants/personalEvents'
import { NPC_ARC_EVENTS } from '../constants/npcArcs'
import { CRISIS_EVENTS } from '../constants/crisisEvents'
import { getChainEvent, CHAIN_FOLLOWUP_DELAY } from '../constants/eventChains'
import { RECURRING_CUSTOMER_EVENTS } from '../constants/recurringCustomers'
import { NPC_EVENTS } from '../constants/npcEvents'
import { applyRelationshipDeltaToState } from './npcManager'

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
    title: 'Блогер привёл толпу',
    description:
      'Местный блогер упомянул вас в посте — на пороге очередь, какой не было никогда. Половина клиентов — впервые. Команда не справляется. Что делать?',
    npcId: 'gleb',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'all_in',
        text: 'Работать на пределе — каждый клиент важен',
        consequences: { clientModifier: 0.3, clientModifierDays: 7, reputationDelta: 5, energyDelta: -15 },
      },
      {
        id: 'limit_quality',
        text: 'Замедлиться, держать качество — кто-то уйдёт, но без грязи',
        consequences: { clientModifier: 0.15, clientModifierDays: 10, reputationDelta: 8 },
      },
      {
        id: 'hire_temp',
        text: 'Нанять временного помощника на 2 недели (−12 000 ₽)',
        consequences: { balanceDelta: -12000, clientModifier: 0.25, clientModifierDays: 14, reputationDelta: 6 },
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
        text: 'Судорожно искать нового поставщика (−35 000 ₽)',
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
    title: 'Праздник на носу',
    description:
      'До праздника три дня. Конкуренты делают акции, у вас — обычный ассортимент. Можно вложиться в подготовку, можно остаться при своих, можно сделать ставку на премиум.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'discount_push',
        text: 'Скидки и расширенные часы (−6 000 ₽ на закупку)',
        consequences: { balanceDelta: -6000, clientModifier: 0.25, clientModifierDays: 7 },
      },
      {
        id: 'standard',
        text: 'Работать как обычно — без авралов',
        consequences: { clientModifier: 0.1, clientModifierDays: 5 },
      },
      {
        id: 'premium_focus',
        text: 'Делать ставку на чек: дорогие позиции в витрине',
        consequences: { checkModifier: 0.15, checkModifierDays: 10, reputationDelta: 2 },
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
        text: 'Дать уйти. Нанять новых (−25 000 ₽)',
        consequences: { balanceDelta: -25000, loyaltyDelta: -30 },
      },
      {
        id: 'bonus',
        text: 'Пойти на уступки (−12 000 ₽ доп. расходы)',
        consequences: { balanceDelta: -12000, loyaltyDelta: 5 },
      },
      {
        id: 'elba-manage',
        text: 'Оптимизировать графики через Контур.Эльба',
        consequences: { loyaltyDelta: 10 },
        requiredService: 'elba',
        isContourOption: true,
      },
    ],
  },
  {
    id: 'COMPETITOR01',
    title: 'Анна открылась на той же улице',
    description:
      'Через дорогу — баннер «Открытие». Она специально выбрала ваш район. В первый день у неё очередь, ваш зал полупустой. Это начало или конец — зависит от первой реакции.',
    npcId: 'anna',
    trigger: { randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'promo',
        text: 'Запустить агрессивную акцию — отбить трафик (−3 000 ₽)',
        consequences: { balanceDelta: -3000, clientModifier: 0.1, clientModifierDays: 10 },
      },
      {
        id: 'quality',
        text: 'Не реагировать на цену — делать ставку на качество',
        consequences: { reputationDelta: 5, checkModifier: 0.1, checkModifierDays: 10 },
      },
      {
        id: 'visit',
        text: 'Зайти к Анне на открытие, поздравить — установить тон отношений',
        consequences: { reputationDelta: 2 },
        npcRelationshipDelta: 8,
      },
      {
        id: 'wait',
        text: 'Ждать — конкуренция нормально, посмотрим',
        consequences: { clientModifier: -0.05, clientModifierDays: 14 },
      },
    ],
  },
  {
    id: 'EQUIPMENT01',
    title: 'Сломалось ключевое оборудование',
    description:
      'Утром не запустилось — то ли провод, то ли электроника. Сервисный центр предлагает три варианта. У знакомого мастера — четвёртый, но без гарантии.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'full-repair',
        text: 'Сервис официальный, гарантия на год (−15 000 ₽)',
        consequences: { balanceDelta: -15000 },
      },
      {
        id: 'cheap-repair',
        text: 'Сервис эконом, без гарантии — может опять сломаться (−7 000 ₽)',
        consequences: { balanceDelta: -7000, clientModifier: -0.1, clientModifierDays: 3 },
      },
      {
        id: 'friend-master',
        text: 'Знакомый мастер «по дружбе» — без чека, втрое дешевле (−5 000 ₽, риск повтора через месяц)',
        consequences: { balanceDelta: -5000, reputationDelta: -1 },
      },
      {
        id: 'replace',
        text: 'Купить новое, более надёжное (−28 000 ₽)',
        consequences: { balanceDelta: -28000, clientModifier: 0.05, clientModifierDays: 30 },
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
        text: 'Разбираться через суд (−55 000 ₽)',
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
    title: 'Негативный отзыв на 2GIS — много лайков',
    description:
      'Клиентка пишет: «Хамское обслуживание, обманули с ценой». Вы помните этот случай — была ошибка кассира, она вспылила, вы извинились. Сейчас лайков 27. Можно молча, можно публично, можно искать клиента и решать офлайн.',
    trigger: { randomChance: 0.05, reputationMax: 70 },
    options: [
      {
        id: 'respond-defend',
        text: 'Публично ответить, защитить кассира',
        consequences: { reputationDelta: -3 },
      },
      {
        id: 'respond-honest',
        text: 'Публично признать ошибку, извиниться, предложить компенсацию',
        consequences: { reputationDelta: 4 },
      },
      {
        id: 'resolve',
        text: 'Найти клиента в личке, решить офлайн (−5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 5 },
      },
      {
        id: 'ignore',
        text: 'Не реагировать — забудут (риск ухудшения)',
        consequences: { reputationDelta: -1 },
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
    title: 'Постоянный привёл компанию',
    description:
      'Игорь — ходит к вам полгода, всегда тихо. Сегодня пришёл с пятью друзьями: «Ребята, я вам говорил — место огонь». Все смотрят. Можно встретить как обычно, можно сделать что-то особенное — для Игоря и в их глазах.',
    trigger: { randomChance: 0.04, reputationMin: 60 },
    options: [
      {
        id: 'standard',
        text: 'Принять как обычных клиентов — без выделения',
        consequences: { clientModifier: 0.1, clientModifierDays: 5 },
      },
      {
        id: 'thanks_loyalty_card',
        text: 'Подарить Игорю карту лояльности на месяц — публично (−2 500 ₽)',
        consequences: { balanceDelta: -2500, reputationDelta: 5, loyaltyDelta: 4, clientModifier: 0.12, clientModifierDays: 7 },
      },
      {
        id: 'free_round',
        text: 'Угостить всю компанию бесплатно — щедрый жест (−5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 8, clientModifier: 0.18, clientModifierDays: 7 },
      },
    ],
  },
  {
    id: 'RENT01',
    title: 'Арендодатель поднимает ставку',
    description:
      'Письмо от собственника: со следующего месяца аренда +15%. Объясняет «коммуналка, инфляция». Можно согласиться, поторговаться, поугрожать съездом — или начать искать другое помещение всерьёз.',
    trigger: { dayMin: 30, randomChance: 0.03, oneTime: true },
    options: [
      {
        id: 'agree',
        text: 'Согласиться без споров — мир дороже (−5 000 ₽)',
        consequences: { balanceDelta: -5000 },
      },
      {
        id: 'negotiate',
        text: 'Спокойно поторговаться — «давайте +5%» (−2 000 ₽)',
        consequences: { balanceDelta: -2000 },
      },
      {
        id: 'threaten',
        text: 'Угрозой съездом сбить до нуля — но отношения испортятся',
        consequences: { reputationDelta: -2 },
      },
      {
        id: 'search_alt',
        text: 'Параллельно искать новое помещение (−3 000 ₽ риелтор, время на поиск)',
        consequences: { balanceDelta: -3000, energyDelta: -10 },
      },
    ],
  },
  {
    id: 'FIRE01',
    title: 'Пожарный инспектор зашёл «на чай»',
    description:
      'Молодой инспектор, второй год в должности. Прошёл по залу, поморщился у щитка: «Нарушения серьёзные, по уму — закрыть до устранения». Помолчал. «Хотя... всякое бывает. Я могу написать "по результатам устных рекомендаций"». Смотрит выжидающе.',
    trigger: { randomChance: 0.02, oneTime: true },
    isMoralDilemma: true,
    options: [
      {
        id: 'pay-fine',
        text: 'Принять штраф по протоколу (−10 000 ₽)',
        consequences: { balanceDelta: -10000 },
      },
      {
        id: 'fix',
        text: 'Признать, устранить за свой счёт, попросить акт «без штрафа» (−5 000 ₽)',
        consequences: { balanceDelta: -5000, reputationDelta: 2 },
      },
      {
        id: 'bribe',
        text: '«Понимаю, спасибо за понимание» — конверт (−3 000 ₽, нарушения остались)',
        consequences: { balanceDelta: -3000, reputationDelta: -4 },
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
    title: 'Видео залетело в топ',
    description:
      'Кто-то снял ваш бизнес — видео набрало 200 тысяч просмотров за ночь. Половина комментов: «надо съездить!». Половина: «жду подвоха». На пороге уже стоит первая «волна». Окно — пара недель, потом интерес упадёт.',
    trigger: { randomChance: 0.02, reputationMin: 70 },
    options: [
      {
        id: 'ride-wave',
        text: 'Бросить всё на обслуживание ажиотажа',
        consequences: { clientModifier: 0.5, clientModifierDays: 14, reputationDelta: 10, energyDelta: -20 },
      },
      {
        id: 'capitalize',
        text: 'Выпустить «вирусную» лимитированную позицию (−8 000 ₽)',
        consequences: { balanceDelta: -8000, clientModifier: 0.35, clientModifierDays: 14, checkModifier: 0.1, checkModifierDays: 14 },
      },
      {
        id: 'controlled',
        text: 'Не раздувать — пусть будет органично, без перегрева',
        consequences: { clientModifier: 0.25, clientModifierDays: 21, reputationDelta: 5 },
      },
    ],
  },
  {
    id: 'SANPIN01',
    title: 'Санитарная проверка',
    description:
      'Девушка из СЭС в перчатках. Претензии к мелочам — отсутствие журнала уборки, неподписанные ёмкости. По букве — штраф 8 000 ₽. Реально это «лень оформить, а не грязь». Можно обсуждать.',
    trigger: { randomChance: 0.02, oneTime: false },
    options: [
      {
        id: 'fine',
        text: 'Принять протокол, заплатить штраф (−8 000 ₽)',
        consequences: { balanceDelta: -8000 },
      },
      {
        id: 'fix-now',
        text: 'Купить шаблоны, всё оформить за день (−4 000 ₽)',
        consequences: { balanceDelta: -4000, reputationDelta: 3 },
      },
      {
        id: 'systemic',
        text: 'Нанять разовый аудит и сертификат на год (−18 000 ₽)',
        consequences: { balanceDelta: -18000, reputationDelta: 6 },
      },
    ],
  },
  {
    id: 'DISCOUNT01',
    title: 'Поставщик предлагает большую партию со скидкой',
    description:
      'Скидка 30%, объём — на месяц вперёд. Деньги нужно сейчас, склад загрузится, оборотных средств станет меньше. Можно урвать всё, можно по чуть-чуть, можно вообще не лезть.',
    trigger: { randomChance: 0.03 },
    options: [
      {
        id: 'buy',
        text: 'Взять всю партию — деньги связаны на месяц (−10 000 ₽)',
        consequences: { balanceDelta: -10000, checkModifier: 0.05, checkModifierDays: 30 },
      },
      {
        id: 'half',
        text: 'Взять половину — попроще для бюджета (−5 000 ₽)',
        consequences: { balanceDelta: -5000, checkModifier: 0.03, checkModifierDays: 14 },
      },
      {
        id: 'skip',
        text: 'Отказаться — кэш важнее',
        consequences: {},
      },
    ],
  },
  {
    id: 'FAMILY01',
    title: 'Семья давно не видела вас',
    description:
      'Мама в десятый раз спрашивает: «Ты вообще приедешь?» Брат собирает родственников на воскресенье. Все знают, что у вас «новое дело». Но смотрят-то на отсутствие. Можно вырваться полностью, можно частично — каждое решение отзовётся.',
    trigger: { randomChance: 0.06 },
    options: [
      {
        id: 'family-time',
        text: 'Закрыть на воскресенье — поехать (−8 000 ₽)',
        consequences: { balanceDelta: -8000, energyDelta: 40, loyaltyDelta: 1 },
      },
      {
        id: 'short-visit',
        text: 'Заехать на 2 часа после смены — компромисс',
        consequences: { energyDelta: 15 },
      },
      {
        id: 'work-again',
        text: 'Не поехать — работать. Виноваты перед родными',
        consequences: { reputationDelta: -5, energyDelta: -10 },
      },
    ],
  },
  {
    id: 'VACATION01',
    title: 'Тело требует отпуска',
    description:
      'Уже три раза за неделю засыпали в неурочное время. Подруга (или жена/муж) забронировала путёвку «на всякий случай» — Сочи, неделя, можно сдать. Но неделя закрытия — это деньги и риск, что клиенты привыкнут к конкуренту.',
    trigger: { dayMin: 30, randomChance: 0.04, oneTime: true },
    options: [
      {
        id: 'full-vacation',
        text: 'Уехать на неделю — закрыть бизнес (−15 000 ₽)',
        consequences: { balanceDelta: -15000, energyDelta: 70 },
      },
      {
        id: 'staycation',
        text: 'Взять три выходных, остаться в городе — без поездки (−4 000 ₽)',
        consequences: { balanceDelta: -4000, energyDelta: 35 },
      },
      {
        id: 'delegate',
        text: 'Уехать, оставить смену на сотруднике — рисковать качеством (−15 000 ₽)',
        consequences: { balanceDelta: -15000, energyDelta: 60, reputationDelta: -3 },
      },
      {
        id: 'no-vacation',
        text: 'Сдать путёвку, остаться — вы нужны бизнесу',
        consequences: { energyDelta: -20, loyaltyDelta: -2 },
      },
    ],
  },
  {
    id: 'HEALTH01',
    title: 'Тревожный сигнал — голова, давление',
    description:
      'Третий раз за неделю — резкая головная боль, в ушах шум. На приёме в платной клинике укажут «нервное переутомление, рекомендация — спорт + сон». Вопрос: лечить «правильно» или «по-быстрому»?',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'doctor-full',
        text: 'Полное обследование + абонемент в зал на квартал (−12 000 ₽)',
        consequences: { balanceDelta: -12000, energyDelta: 40 },
      },
      {
        id: 'doctor-quick',
        text: 'Только консультация + таблетки (−5 000 ₽)',
        consequences: { balanceDelta: -5000, energyDelta: 25 },
      },
      {
        id: 'self-treat',
        text: 'Купить в аптеке без рецепта — «сам разберусь» (−1 000 ₽)',
        consequences: { balanceDelta: -1000, energyDelta: 10 },
      },
      {
        id: 'ignore-health',
        text: 'Игнорировать — само пройдёт (риск повтора)',
        consequences: { energyDelta: -15 },
      },
    ],
  },
  {
    id: 'HOBBIES01',
    title: 'Старое хобби пылится',
    description:
      'Гитара/велосипед/удочка — нужное подчеркнуть. Лежит без дела с момента, как вы стали «предпринимателем». Однокурсники в чате собираются на выходных. Хочется — но кажется, не время.',
    trigger: { randomChance: 0.05 },
    options: [
      {
        id: 'go-with-others',
        text: 'Поехать с друзьями — настоящее переключение (−4 000 ₽)',
        consequences: { balanceDelta: -4000, energyDelta: 30, loyaltyDelta: 1 },
      },
      {
        id: 'solo-hour',
        text: 'Час дома — наедине с любимым делом (бесплатно)',
        consequences: { energyDelta: 15 },
      },
      {
        id: 'skip-hobby',
        text: 'Не сейчас — работы много',
        consequences: {},
      },
    ],
  },
  {
    id: 'FRIENDS01',
    title: 'Друзья зовут, но не знают, как с вами общаться',
    description:
      'Ваня в чате: «Старик, мы все тебя видим только в сторис рабочих. Приходи, посидим, как раньше». Давно не было таких слов. Но они тоже устают сами — и каждый раз чуть-чуть отдалились.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'meet-friends',
        text: 'Пойти, не оглядываясь на дела (−4 000 ₽)',
        consequences: { balanceDelta: -4000, energyDelta: 35, reputationDelta: 2 },
      },
      {
        id: 'half-meet',
        text: 'Заскочить на час — потом вернуться (−2 000 ₽)',
        consequences: { balanceDelta: -2000, energyDelta: 15 },
      },
      {
        id: 'invite-here',
        text: 'Пригласить их к себе на смену — пусть видят',
        consequences: { energyDelta: 10, reputationDelta: 1 },
      },
      {
        id: 'decline',
        text: 'Отказаться — не до этого',
        consequences: { reputationDelta: -1 },
      },
    ],
  },
  {
    id: 'MEDITATION01',
    title: 'Стресс на пределе — что-то надо менять',
    description:
      'Психолог-тренер из ютуба, абонемент в студию йоги, бумажный дневник, или просто «час молчания утром» — всё работает по-разному. Вопрос — на что вы готовы потратить деньги и привычку.',
    trigger: { randomChance: 0.04 },
    options: [
      {
        id: 'paid-program',
        text: 'Курс с психологом, 8 сессий (−20 000 ₽)',
        consequences: { balanceDelta: -20000, energyDelta: 50 },
      },
      {
        id: 'yoga-pass',
        text: 'Абонемент в студию йоги на месяц (−6 000 ₽)',
        consequences: { balanceDelta: -6000, energyDelta: 25 },
      },
      {
        id: 'free-meditate',
        text: 'Час медитации дома — без вложений',
        consequences: { energyDelta: 15 },
      },
      {
        id: 'no-meditate',
        text: 'Продолжать как есть — потом будет легче',
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
        text: 'Снизить цены (-5 000 ₽)',
        consequences: { balanceDelta: -5000, clientModifier: 0.2, clientModifierDays: 7 },
      },
      {
        id: 'quality-push',
        text: 'Улучшить качество',
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
        text: 'Продолжать работу',
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
        text: 'Максимально использовать тренд',
        consequences: { checkModifier: 0.4, checkModifierDays: 6 },
      },
      {
        id: 'steady',
        text: 'Работать в обычном режиме',
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
        text: 'Быстро перестроить ассортимент (-8 000 ₽)',
        consequences: { balanceDelta: -8000, checkModifier: 0.15, checkModifierDays: 5 },
      },
      {
        id: 'wait',
        text: 'Ждать, пока тренд вернётся',
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
        text: 'Повысить в должности',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'let-go',
        text: 'Отпустить с миром',
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
        text: 'Игнорировать конфликт',
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
        text: 'Нанять замену вдвое дороже (более высокая зарплата)',
        consequences: { balanceDelta: -2000 },
      },
      {
        id: 'promote-internal',
        text: 'Повысить внутреннего кандидата',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'accept-loss',
        text: 'Остаться в недостатке',
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
        text: 'Устроить празднование (-1 000 ₽)',
        consequences: { balanceDelta: -1000, loyaltyDelta: 7 },
      },
      {
        id: 'bonus',
        text: 'Выплатить премию (-2 000 ₽)',
        consequences: { balanceDelta: -2000, loyaltyDelta: 12 },
      },
      {
        id: 'acknowledge',
        text: 'Просто поблагодарить',
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
        text: 'Ждать',
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
        text: 'Оплатить штраф ФНС (−60 000 ₽)',
        consequences: { balanceDelta: -60000, reputationDelta: -15 },
      },
      {
        id: 'dispute',
        text: 'Оспорить через юриста (−30 000 ₽)',
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
        text: 'Экстренная закупка по завышенной цене (−45 000 ₽)',
        consequences: { balanceDelta: -45000, reputationDelta: -5 },
      },
      {
        id: 'wait-restock',
        text: 'Ждать обычную поставку',
        consequences: { clientModifier: -0.4, clientModifierDays: 4 },
      },
    ],
  },
]

export function generateEvent(day: number, state: GameState): Event | null {
  const triggered = state.triggeredEventIds ?? []
  const candidates: EventTemplate[] = []

  const allTemplates = [
    ...EVENTS_DATABASE,
    ...MORAL_DILEMMA_EVENTS,
    ...RECURRING_CUSTOMER_EVENTS,
    ...NPC_EVENTS,
    ...PERSONAL_BACKSTORY_EVENTS,
    ...NPC_ARC_EVENTS,
    // CRISIS_EVENTS excluded: they get their own independent roll via generateCrisisEvent()
  ]

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
    // Backstory gating (v5.0)
    if (
      template.trigger.requiredMotivation !== undefined &&
      state.playerBackstory?.motivation !== template.trigger.requiredMotivation
    )
      continue
    if (
      template.trigger.requiredPersonal !== undefined &&
      state.playerBackstory?.personal !== template.trigger.requiredPersonal
    )
      continue
    // Crisis gating (v5.5): only fire when the player is doing well enough
    // for the event to feel like a setback rather than a death blow.
    if (template.trigger.balanceMin !== undefined && state.balance < template.trigger.balanceMin) continue
    if (template.trigger.weekMin !== undefined && state.currentWeek < template.trigger.weekMin) continue
    if (template.trigger.loyaltyMin !== undefined && state.loyalty < template.trigger.loyaltyMin) continue
    // NPC relationship gating (v5.1)
    if (template.npcId) {
      const npc = (state.npcs ?? []).find(n => n.id === template.npcId)
      if (template.trigger.requiresNpcRevealed && (!npc || !npc.isRevealed)) continue
      if (template.trigger.npcRelationshipMin !== undefined &&
          (!npc || npc.relationshipLevel < template.trigger.npcRelationshipMin)) continue
      if (template.trigger.npcRelationshipMax !== undefined &&
          (!npc || npc.relationshipLevel > template.trigger.npcRelationshipMax)) continue
    }

    candidates.push(template)
  }

  if (candidates.length === 0) return null

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]

  return templateToEvent(chosen, day, state.currentWeek)
}

/**
 * Rolls crisis events independently of the regular event pool.
 * Called once per week from weekCalculator after main event generation.
 */
export function generateCrisisEvent(state: GameState): Event | null {
  const triggered = state.triggeredEventIds ?? []
  const candidates = CRISIS_EVENTS.filter(template => {
    if (template.trigger.oneTime && triggered.includes(template.id)) return false
    if (template.trigger.balanceMin !== undefined && state.balance < template.trigger.balanceMin) return false
    if (template.trigger.weekMin !== undefined && state.currentWeek < template.trigger.weekMin) return false
    if (template.trigger.loyaltyMin !== undefined && state.loyalty < template.trigger.loyaltyMin) return false
    if (template.trigger.reputationMin !== undefined && state.reputation < template.trigger.reputationMin) return false
    if (template.trigger.randomChance !== undefined && Math.random() > template.trigger.randomChance) return false
    return true
  })
  if (candidates.length === 0) return null
  const chosen = candidates[Math.floor(Math.random() * candidates.length)]
  return templateToEvent(chosen, state.currentWeek * 7, state.currentWeek)
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

  // NPC relationship delta — anchors large decisions, converts overflow to XP
  if (option.npcRelationshipDelta !== undefined && event.npcId) {
    applyRelationshipDeltaToState(
      state,
      event.npcId,
      option.npcRelationshipDelta,
      { week: state.currentWeek, eventId: event.id, choiceId: optionId, note: option.text.slice(0, 60) },
    )
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
        contextNote: option.text.slice(0, 80),
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
