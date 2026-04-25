import type { EventTemplate } from '../types/game'

/**
 * Backstory-specific events. Each event fires only if the player picked the
 * matching motivation/personal situation. They make the early-mid game feel
 * lived-in: the past keeps reaching for the protagonist.
 *
 * Each event is `oneTime` and gated to a window of ~10 weeks so they don't
 * collide with mid-game crisis arcs.
 */

export const PERSONAL_BACKSTORY_EVENTS: EventTemplate[] = [
  // ──────────────────────────────────────────────────────────────────
  // Motivation: corp (left a corporate job)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_CORP_OFFER',
    title: 'Бывший начальник зовёт обратно',
    description:
      'Звонок с незнакомого номера. Голос узнаёшь сразу — Сергей Андреевич, твой шеф в той корпорации. «Слушай, у нас открылось руководящее место, под тебя. Зарплата плюс 30%, опцион. Подумай — у тебя там, я слышал, не сахар». Голос участливый. Это плохой знак.',
    trigger: {
      dayMin: 70,  // ~week 10
      dayMax: 140, // ~week 20
      randomChance: 0.8,
      oneTime: true,
      requiredMotivation: 'corp',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'refuse_proudly',
        text: 'Отказаться твёрдо — назад дороги нет',
        consequences: { reputationDelta: 5, loyaltyDelta: 4 },
      },
      {
        id: 'consider',
        text: 'Сказать «подумаю» — всё-таки ставка большая',
        consequences: { reputationDelta: -2, loyaltyDelta: -3 },
      },
      {
        id: 'use_for_leverage',
        text: 'Договориться о консультациях — пусть платят за совет',
        consequences: { balanceDelta: 25000, reputationDelta: 1 },
      },
    ],
  },
  {
    id: 'PERS_CORP_EXCOLLEAGUE',
    title: 'Бывший коллега заходит как клиент',
    description:
      'В обед дверь открывается — Лёша Виноградов, с которым ты сидел за одним столом восемь лет. Подошёл к прилавку, заказывает. Узнал. «Слушай, ну ты даёшь. Я тут случайно мимо. Расскажи, как оно». Можно подружиться заново, можно отделаться вежливостью.',
    trigger: {
      dayMin: 35,
      dayMax: 84,
      randomChance: 0.9,
      oneTime: true,
      requiredMotivation: 'corp',
    },
    options: [
      {
        id: 'open_up',
        text: 'Сесть, рассказать честно — про усталость и про надежды',
        consequences: { loyaltyDelta: 5, reputationDelta: 2 },
      },
      {
        id: 'small_talk',
        text: 'Поддержать вежливо, не открываться',
        consequences: { reputationDelta: 1 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Motivation: contest (won a grant)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_CONTEST_FOLLOWUP',
    title: 'Журналист с конкурса хочет «историю успеха»',
    description:
      'Письмо: «Здравствуйте! Я Елена, веду рубрику победителей нашего конкурса. Можно интервью к годовщине? Лица должны видеть, что грант работает». Ты прикинул цифры. Работает? Скорее, держится. Что говорить?',
    trigger: {
      dayMin: 280, // ~week 40
      dayMax: 350,
      randomChance: 0.7,
      oneTime: true,
      requiredMotivation: 'contest',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'honest',
        text: 'Сказать как есть — про сложности и реальные цифры',
        consequences: { reputationDelta: 8, loyaltyDelta: -2 },
      },
      {
        id: 'polished',
        text: 'Дать «правильную» историю — вы ведь хотите, чтобы конкурс продолжался',
        consequences: { reputationDelta: -3, balanceDelta: 5000 },
      },
      {
        id: 'decline',
        text: 'Отказаться от интервью — нет настроения',
        consequences: { reputationDelta: -1 },
      },
    ],
  },
  {
    id: 'PERS_CONTEST_NEW_APPLICANT',
    title: 'Молодая предпринимательница просит совета',
    description:
      'Пишет в директ: «Здравствуйте! Я подаю заявку на тот же конкурс. Видела ваш профиль среди победителей. Можно вопросы?» Прикладывает свою бизнес-идею. Идея так себе, но видно — вкладывалась душой.',
    trigger: {
      dayMin: 140, // week 20
      dayMax: 245, // week 35
      randomChance: 0.7,
      oneTime: true,
      requiredMotivation: 'contest',
    },
    options: [
      {
        id: 'help_honestly',
        text: 'Ответить подробно, указать на слабые места — пусть готовится',
        consequences: { reputationDelta: 6, energyDelta: -10 },
      },
      {
        id: 'be_nice',
        text: 'Похвалить, написать общие напутствия — не разочаровать',
        consequences: { reputationDelta: 2 },
      },
      {
        id: 'ignore',
        text: 'Не отвечать — нет времени',
        consequences: { reputationDelta: -2, loyaltyDelta: -1 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Motivation: accident ("just happened")
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_ACCIDENT_DOUBT',
    title: 'Старая мысль возвращается',
    description:
      'Дождливый вторник. Утром не хотелось вставать. Шёл в магазин и поймал себя: «Зачем я это всё делаю? Это вообще моё?» Раньше отгонял — сегодня не получилось. Сидишь у кассы, думаешь.',
    trigger: {
      dayMin: 56,  // week 8
      dayMax: 175, // week 25
      randomChance: 0.6,
      oneTime: true,
      requiredMotivation: 'accident',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'stay',
        text: 'Решить: «Раз начал — доведу до результата»',
        consequences: { loyaltyDelta: 6, reputationDelta: 2 },
      },
      {
        id: 'reframe',
        text: 'Принять, что это не «мечта», а просто работа — и это нормально',
        consequences: { energyDelta: 10 },
      },
      {
        id: 'half_in',
        text: 'Снизить интенсивность — работать «на минималках»',
        consequences: { energyDelta: 15, reputationDelta: -4, loyaltyDelta: -3 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Personal: free — life with one obligation: mother
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_FREE_MOTHER_TEST',
    title: 'Мама прислала фото из поликлиники',
    description:
      'В мессенджере — фото листка анализов и подпись «доктор сказал, ничего срочного». Под фото видно дрожание её рук. Можно ехать сейчас, можно позвонить, можно сделать вид, что поверили.',
    trigger: {
      dayMin: 35,  // week 5
      dayMax: 140, // week 20
      randomChance: 0.7,
      oneTime: true,
      requiredPersonal: 'free',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'go_now',
        text: 'Закрыть и приехать в больницу — сегодня (−12 000 ₽ выручки)',
        consequences: { balanceDelta: -12000, energyDelta: -10, loyaltyDelta: 4 },
      },
      {
        id: 'call_long',
        text: 'Позвонить, спросить про каждое слово — давить, пока не скажет правду',
        consequences: { energyDelta: -5, reputationDelta: 1 },
      },
      {
        id: 'pretend_believe',
        text: '«Ну хорошо, что ничего срочного» — потом съезжу',
        consequences: { energyDelta: -8, loyaltyDelta: -3 },
      },
    ],
  },
  {
    id: 'PERS_FREE_DATE',
    title: 'Совпадение в приложении',
    description:
      'Оля, 31, преподаёт английский. Пишет с уважением, отвечает быстро. Зовёт в среду на кофе. Среда — пиковый день. Плюс мысль: «как я объясню про маму, бизнес, что я почти не сплю». Может, это и не время.',
    trigger: {
      dayMin: 70,  // week 10
      dayMax: 175, // week 25
      randomChance: 0.5,
      oneTime: true,
      requiredPersonal: 'free',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'go_close_early',
        text: 'Закрыть на час раньше, поехать как есть (−8 000 ₽)',
        consequences: { balanceDelta: -8000, energyDelta: 15 },
      },
      {
        id: 'reschedule',
        text: 'Предложить субботу, в районе магазина — пусть видит, как живу',
        consequences: { energyDelta: 5 },
      },
      {
        id: 'cancel',
        text: 'Написать «давай через пару месяцев» — не врать, что готов',
        consequences: { energyDelta: -5 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Personal: friend (Dimka — best friend, biggest supporter)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_FRIEND_LOAN_OFFER',
    title: 'Димка предлагает ещё денег',
    description:
      'Звонок поздно вечером. «Слушай, я тут гараж продал. Сто тысяч, мне сейчас не нужны. Возьми без процентов, на полгода». Голос радостный. Он не знает, что вы как раз пытаетесь снять его с поручительства по тому первому кредиту. Брать ещё — это надевать на него вторую верёвку.',
    trigger: {
      dayMin: 42,  // week 6
      dayMax: 175, // week 25
      randomChance: 0.7,
      oneTime: true,
      requiredPersonal: 'friend',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'take_it',
        text: 'Взять, не объясняя (+100 000 ₽; внутри становится тяжелее)',
        consequences: { balanceDelta: 100000, loyaltyDelta: 5, reputationDelta: -3 },
      },
      {
        id: 'tell_truth',
        text: 'Сказать ему про банк — «прости, что молчал. Сейчас брать у тебя я не имею права»',
        consequences: { reputationDelta: 8, loyaltyDelta: -4 },
      },
      {
        id: 'refuse',
        text: 'Отказаться, не объясняя — он не поймёт, но так честнее',
        consequences: { reputationDelta: 2, loyaltyDelta: 4 },
      },
    ],
  },
  {
    id: 'PERS_FRIEND_HELPS',
    title: 'Димка пришёл помочь в выходной',
    description:
      'Без звонка. С кофе. «Я подумал, в субботу у тебя завоз — давай помогу таскать?» Помог три часа, отказался от денег, отказался даже от обеда. На прощание: «Слушай, ты только не пропадай совсем, окей?»',
    trigger: {
      dayMin: 28,  // week 4
      dayMax: 105, // week 15
      randomChance: 0.8,
      oneTime: true,
      requiredPersonal: 'friend',
    },
    options: [
      {
        id: 'thank_properly',
        text: 'Позвать в пятницу на ужин — хороший, не наспех',
        consequences: { balanceDelta: -3000, loyaltyDelta: 5, energyDelta: 8 },
      },
      {
        id: 'note_to_self',
        text: 'Поблагодарить, сделать заметку «ответить позже»',
        consequences: { loyaltyDelta: 1 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // Personal: hometown (back to your childhood district)
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'PERS_HOMETOWN_TEACHER',
    title: 'Татьяна Ивановна просит скидку',
    description:
      'Учительница, у которой ты учился в первом классе. Узнала только сейчас. «Ой, это же ты! Я и не подумала». Робко: «У меня пенсия маленькая, можно я буду брать со скидкой? Я тут рядом живу». Стоит, теребит сумку.',
    trigger: {
      dayMin: 35,  // week 5
      dayMax: 175, // week 25
      randomChance: 0.7,
      oneTime: true,
      requiredPersonal: 'hometown',
    },
    isMoralDilemma: true,
    options: [
      {
        id: 'discount',
        text: 'Дать скидку 30% постоянную — это та учительница',
        consequences: { reputationDelta: 8, balanceDelta: -500 },
      },
      {
        id: 'discount_quiet',
        text: 'Сказать «без скидки нельзя, но иногда подкину бесплатно» — без огласки',
        consequences: { reputationDelta: 4, loyaltyDelta: 3 },
      },
      {
        id: 'standard',
        text: 'Объяснить, что скидок не делаешь — бизнес есть бизнес',
        consequences: { reputationDelta: -6, loyaltyDelta: -2 },
      },
    ],
  },
  {
    id: 'PERS_HOMETOWN_KID',
    title: 'Подросток просит работу',
    description:
      'Парень лет 16, в свитшоте, мнётся у кассы: «Здрасте... мне Татьяна Ивановна сказала, что вы тут... Я в школу хожу через дорогу. Можно я после уроков помогать буду? За небольшие деньги, мне на колледж копить надо». Смотрит в пол.',
    trigger: {
      dayMin: 84,  // week 12
      dayMax: 210, // week 30
      randomChance: 0.6,
      oneTime: true,
      requiredPersonal: 'hometown',
    },
    options: [
      {
        id: 'hire',
        text: 'Взять на 4 часа в день за 8 000 ₽/мес — на колледж и опыт',
        consequences: { balanceDelta: -2000, reputationDelta: 6, loyaltyDelta: 4 },
      },
      {
        id: 'mentor_only',
        text: 'Не брать в штат, но позвать в выходные на бесплатное «обучение»',
        consequences: { reputationDelta: 3, loyaltyDelta: 2 },
      },
      {
        id: 'send_away',
        text: 'Отказать — несовершеннолетний, проблем с трудовой',
        consequences: { reputationDelta: -3 },
      },
    ],
  },
]
