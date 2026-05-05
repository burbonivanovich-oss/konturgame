import type { EventTemplate, NpcId } from '../types/game'

// NPC episodes — story beats triggered by week + prerequisite. Each NPC has
// a sequence of 3 (or 5 for Gena) discrete encounters that fire over the
// course of the game. After all episodes complete, the NPC fades to
// background — no upkeep, no recurring events.
//
// Episode shape extends EventTemplate so the existing pendingEvent renderer
// just works. Extra metadata attached for the trigger picker.

export interface NpcEpisode {
  id: string                 // unique episode id
  npcId: NpcId
  episodeIndex: number       // 1, 2, 3 within the NPC's arc
  triggerWeek: number        // earliest week to fire (jitter +0..2)
  prerequisiteEpisodeId?: string  // must be completed first
  // Optional state guards
  requireMinReputation?: number
  requireMinBalance?: number
  template: EventTemplate
}

// Helper: standard episode-style event template (most fields shared).
function ep(
  id: string,
  npcId: NpcId,
  title: string,
  description: string,
  options: EventTemplate['options'],
  isMoralDilemma = true,
): EventTemplate {
  return {
    id,
    title,
    description,
    npcId,
    isMoralDilemma,
    trigger: { oneTime: true },  // episodes are always one-time
    options,
  }
}

export const NPC_EPISODES: NpcEpisode[] = [
  // ────────────────────────────────────────────────────────────────
  // КАТЯ (бухгалтер) — Эльба + защита от налогов
  // ────────────────────────────────────────────────────────────────
  {
    id: 'katya_meet',
    npcId: 'katya',
    episodeIndex: 1,
    triggerWeek: 6,
    template: ep(
      'katya_meet',
      'katya',
      'Катя — твоя школьная подруга',
      'В кафе случайно столкнулся с Катей. Школьная подруга, работает бухгалтером в небольшой фирме. Предлагает помочь с твоей отчётностью «по знакомству» — ей нужно портфолио, тебе — экономия времени.',
      [
        {
          id: 'accept_free',
          text: 'Принять помощь бесплатно (она просит только портфолио-отзыв)',
          consequences: { reputationDelta: 1 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'pay_fair',
          text: 'Заплатить ей нормально (−5 000 ₽, благодарность)',
          consequences: { balanceDelta: -5000 },
          npcRelationshipDelta: 15,
        },
        {
          id: 'decline',
          text: 'Вежливо отказаться — буду сам разбираться',
          consequences: {},
        },
      ],
    ),
  },
  {
    id: 'katya_deposit',
    npcId: 'katya',
    episodeIndex: 2,
    triggerWeek: 20,
    prerequisiteEpisodeId: 'katya_meet',
    template: ep(
      'katya_deposit',
      'katya',
      'Катя просит одолжить на депозит',
      'Катя нашла квартиру под аренду — 50 000 ₽ депозит, у неё не хватает. Просит занять. «Через 2 месяца верну, обещаю». Выручать или нет — твоё решение.',
      [
        {
          id: 'lend_full',
          text: 'Дать всю сумму (−50 000 ₽, она вернёт через 8 недель)',
          consequences: { balanceDelta: -50000 },
          npcRelationshipDelta: 25,
        },
        {
          id: 'lend_partial',
          text: 'Дать половину (−25 000 ₽, помог как смог)',
          consequences: { balanceDelta: -25000 },
          npcRelationshipDelta: 8,
        },
        {
          id: 'decline',
          text: 'Отказать — у тебя самого с деньгами тяжело',
          consequences: { reputationDelta: -1 },
          npcRelationshipDelta: -15,
        },
      ],
    ),
  },
  {
    id: 'katya_resolution',
    npcId: 'katya',
    episodeIndex: 3,
    triggerWeek: 38,
    prerequisiteEpisodeId: 'katya_deposit',
    template: ep(
      'katya_resolution',
      'katya',
      'Катя возвращает долг и предлагает курс',
      'Катя вернула долг (если ты давал) и предлагает провести для тебя личный курс по бухгалтерии. Раз в неделю, 4 встречи. Ты будешь понимать налоги изнутри.',
      [
        {
          id: 'take_course',
          text: 'Согласиться (−10 000 ₽, +постоянное знание = меньше налоговых рисков)',
          consequences: { balanceDelta: 50000 - 10000, reputationDelta: 3 },  // returns 50K from earlier loan, deducts 10K course
          npcRelationshipDelta: 10,
        },
        {
          id: 'just_thanks',
          text: 'Спасибо, в другой раз — пока некогда',
          consequences: { balanceDelta: 50000 },  // returns 50K
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // ВИКТОР (конкурент)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'viktor_arrival',
    npcId: 'viktor',
    episodeIndex: 1,
    triggerWeek: 9,
    template: ep(
      'viktor_arrival',
      'viktor',
      'Сосед-предприниматель открылся',
      'Через дорогу — баннер «Скоро открытие». Виктор, твой ровесник, открывает магазин того же профиля. Подходит знакомиться: «Не конкуренты, соседи». В первый день у него очередь.',
      [
        {
          id: 'friendly',
          text: 'Доброжелательно — «Удачи! Если что — заходи»',
          consequences: { reputationDelta: 1 },
          npcRelationshipDelta: 15,
        },
        {
          id: 'cold',
          text: 'Холодно — «Посмотрим»',
          consequences: {},
          npcRelationshipDelta: -10,
        },
        {
          id: 'ignore',
          text: 'Промолчать, не подойти',
          consequences: { reputationDelta: -1 },
          npcRelationshipDelta: -5,
        },
      ],
    ),
  },
  {
    id: 'viktor_competition',
    npcId: 'viktor',
    episodeIndex: 2,
    triggerWeek: 24,
    prerequisiteEpisodeId: 'viktor_arrival',
    template: ep(
      'viktor_competition',
      'viktor',
      'Виктор переманивает твоих клиентов',
      'Заметил постоянных клиентов в его магазине. Он специально снизил цены ниже твоей закупки на 2 недели. Жёсткая игра.',
      [
        {
          id: 'price_war',
          text: 'Ответить ценовой войной (−15 000 ₽ на акции, −5 лояльности)',
          consequences: { balanceDelta: -15000, loyaltyDelta: -5 },
          npcRelationshipDelta: -20,
        },
        {
          id: 'quality_focus',
          text: 'Не снижать цены, делать ставку на качество (+5 репутации)',
          consequences: { reputationDelta: 5 },
        },
        {
          id: 'negotiate',
          text: 'Поговорить с ним лично — предложить разделить районы',
          consequences: { reputationDelta: 2 },
          npcRelationshipDelta: 12,
        },
      ],
    ),
  },
  {
    id: 'viktor_resolution',
    npcId: 'viktor',
    episodeIndex: 3,
    triggerWeek: 42,
    prerequisiteEpisodeId: 'viktor_competition',
    template: ep(
      'viktor_resolution',
      'viktor',
      'Виктор закрывается',
      'Виктор не выдержал — закрывает магазин. Предлагает выкупить его остатки + клиентскую базу. Можно поглотить его территорию.',
      [
        {
          id: 'buyout',
          text: 'Выкупить (−40 000 ₽, +постоянный бонус к трафику)',
          consequences: { balanceDelta: -40000, clientModifier: 0.20, clientModifierDays: 9999 },
        },
        {
          id: 'walk_away',
          text: 'Не вмешиваться — пусть закрывается сам',
          consequences: {},
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // ДЕНИС (инвестор)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'denis_offer',
    npcId: 'denis',
    episodeIndex: 1,
    triggerWeek: 11,
    template: ep(
      'denis_offer',
      'denis',
      'Однокурсник Денис вышел на связь',
      'Денис, с которым ты учился, теперь зам в IT-компании. Предлагает беспроцентный заём до 150 000 ₽ — «считай, поддержка друга». Возврат когда сможешь.',
      [
        {
          id: 'take_loan',
          text: 'Взять 100 000 ₽ беспроцентно',
          consequences: { balanceDelta: 100000 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'just_meet',
          text: 'Спасибо, пока не нужно — но рад встрече',
          consequences: {},
          npcRelationshipDelta: 8,
        },
        {
          id: 'cold',
          text: 'Не нуждаюсь',
          consequences: {},
          npcRelationshipDelta: -10,
        },
      ],
    ),
  },
  {
    id: 'denis_share',
    npcId: 'denis',
    episodeIndex: 2,
    triggerWeek: 27,
    prerequisiteEpisodeId: 'denis_offer',
    template: ep(
      'denis_share',
      'denis',
      'Денис предлагает войти в долю',
      'Денис: «Я инвестировал в три бизнеса, твой — самый интересный. Дай 10% доли за 200 000 ₽ вливания и помощь со связями». Серьёзное решение.',
      [
        {
          id: 'accept_share',
          text: 'Согласиться (+200 000 ₽, но −10% дохода permanent)',
          consequences: { balanceDelta: 200000 },
          npcRelationshipDelta: 15,
        },
        {
          id: 'decline',
          text: 'Не отдавать долю — это моё дело',
          consequences: {},
          npcRelationshipDelta: -5,
        },
      ],
    ),
  },
  {
    id: 'denis_endgame',
    npcId: 'denis',
    episodeIndex: 3,
    triggerWeek: 45,
    prerequisiteEpisodeId: 'denis_share',
    template: ep(
      'denis_endgame',
      'denis',
      'Денис предлагает выкуп или продажу',
      'Денис: «Бизнес стоит хороших денег. У тебя два варианта — выкупай мою долю или продай мне всё, я найду менеджера». Поворотный момент.',
      [
        {
          id: 'buy_back',
          text: 'Выкупить долю (−500 000 ₽, бизнес снова твой целиком)',
          consequences: { balanceDelta: -500000, reputationDelta: 5 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'sell_all',
          text: 'Продать ему весь бизнес (+1 000 000 ₽, ачивка «Кэшаут»)',
          consequences: { balanceDelta: 1000000 },
          npcRelationshipDelta: 10,
        },
        {
          id: 'stay_partners',
          text: 'Оставить как есть — мы партнёры',
          consequences: {},
          npcRelationshipDelta: 0,
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // ИРИНА ПЕТРОВНА (наставница)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'irina_intro',
    npcId: 'irina',
    episodeIndex: 1,
    triggerWeek: 12,
    template: ep(
      'irina_intro',
      'irina',
      'Ирина Петровна заглянула в гости',
      'Мама твоей подруги, Ирина Петровна, ведёт салон 20 лет. Услышала про твой бизнес, заходит «посмотреть как у молодых». Профессионально оценивает, даёт честные комментарии.',
      [
        {
          id: 'listen',
          text: 'Внимательно слушать (+5 репутации — она расскажет в кругу)',
          consequences: { reputationDelta: 5 },
          npcRelationshipDelta: 12,
        },
        {
          id: 'defensive',
          text: 'Защищаться — у меня всё под контролем',
          consequences: {},
          npcRelationshipDelta: -8,
        },
      ],
    ),
  },
  {
    id: 'irina_teaching',
    npcId: 'irina',
    episodeIndex: 2,
    triggerWeek: 25,
    prerequisiteEpisodeId: 'irina_intro',
    template: ep(
      'irina_teaching',
      'irina',
      'Ирина Петровна разбирает твою лояльность',
      'Ирина: «Постоянных клиентов у тебя мало. Это о работе с ними, не о ценах. Хочешь покажу как?» Урок 1 на 1 — ценный, но требует времени.',
      [
        {
          id: 'study',
          text: 'Согласиться, провести с ней день (+10 лояльности, −10 энергии)',
          consequences: { loyaltyDelta: 10, energyDelta: -10 },
          npcRelationshipDelta: 10,
        },
        {
          id: 'thank_skip',
          text: 'Спасибо, как-нибудь сам разберусь',
          consequences: {},
        },
      ],
    ),
  },
  {
    id: 'irina_circle',
    npcId: 'irina',
    episodeIndex: 3,
    triggerWeek: 40,
    prerequisiteEpisodeId: 'irina_teaching',
    template: ep(
      'irina_circle',
      'irina',
      'Ирина Петровна привела свой круг',
      'Ирина: «Я рассказала о тебе подругам. Они хотят попробовать твой бизнес — это хорошие, постоянные люди».',
      [
        {
          id: 'welcome',
          text: 'Принять достойно (+8 репутации permanent)',
          consequences: { reputationDelta: 8, loyaltyDelta: 5 },
          npcRelationshipDelta: 8,
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // АРТЁМ (бывший коллега)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'artyom_seek_job',
    npcId: 'artyom',
    episodeIndex: 1,
    triggerWeek: 10,
    template: ep(
      'artyom_seek_job',
      'artyom',
      'Артёма уволили — ищет работу',
      'Артём, твой бывший коллега: «Меня сократили. Я готов работать у тебя, без понтов. Знаю процессы, умею организовать. Только зарплату как у нормального».',
      [
        {
          id: 'hire_full',
          text: 'Нанять с полной зарплатой (+50 000 ₽/мес, но он удваивает эффективность команды)',
          consequences: {},
          npcRelationshipDelta: 20,
        },
        {
          id: 'hire_discount',
          text: 'Нанять, но за половину пока (договор временный)',
          consequences: {},
          npcRelationshipDelta: -5,
        },
        {
          id: 'cant_help',
          text: 'Не могу сейчас — самому тяжело',
          consequences: {},
          npcRelationshipDelta: -10,
        },
      ],
    ),
  },
  {
    id: 'artyom_conflict',
    npcId: 'artyom',
    episodeIndex: 2,
    triggerWeek: 25,
    prerequisiteEpisodeId: 'artyom_seek_job',
    template: ep(
      'artyom_conflict',
      'artyom',
      'Конфликт в команде из-за Артёма',
      'Артём слишком нагружает других сотрудников. Кассирша подала заявление: «Или он, или я». Решай.',
      [
        {
          id: 'keep_artyom',
          text: 'Оставить Артёма, кассирша уходит (−10 лояльности)',
          consequences: { loyaltyDelta: -10 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'keep_cashier',
          text: 'Уволить Артёма (он обижается)',
          consequences: { loyaltyDelta: 5 },
          npcRelationshipDelta: -25,
        },
        {
          id: 'mediate',
          text: 'Поговорить с обоими (−5 энергии, оба остаются)',
          consequences: { energyDelta: -5, loyaltyDelta: 3 },
          npcRelationshipDelta: 5,
        },
      ],
    ),
  },
  {
    id: 'artyom_career',
    npcId: 'artyom',
    episodeIndex: 3,
    triggerWeek: 42,
    prerequisiteEpisodeId: 'artyom_conflict',
    template: ep(
      'artyom_career',
      'artyom',
      'Артём открывает свой бизнес',
      'Артём: «Спасибо за всё, но я открываю своё. Если хочешь — могу остаться партнёром по нашим делам». Уход или партнёрство?',
      [
        {
          id: 'partner',
          text: 'Стать партнёрами (+связи в его новой фирме, +3 репутации)',
          consequences: { reputationDelta: 3 },
          npcRelationshipDelta: 10,
        },
        {
          id: 'goodbye',
          text: 'Тепло попрощаться',
          consequences: { reputationDelta: 1 },
          npcRelationshipDelta: 0,
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // МИХАИЛ СЕРГЕЕВИЧ (поставщик)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'mikhail_meet',
    npcId: 'mikhail',
    episodeIndex: 1,
    triggerWeek: 7,
    template: ep(
      'mikhail_meet',
      'mikhail',
      'Михаил Сергеевич — поставщик старой школы',
      'Михаил Сергеевич, поставщик в вашем районе уже 30 лет. Услышал о тебе через соседей. Предлагает поставлять качественнее и на 10% дешевле — «своим скидка».',
      [
        {
          id: 'accept',
          text: 'Согласиться, начать работать вместе',
          consequences: { reputationDelta: 2 },
          npcRelationshipDelta: 15,
        },
        {
          id: 'check_first',
          text: 'Хочу сначала проверить качество',
          consequences: {},
          npcRelationshipDelta: 5,
        },
        {
          id: 'decline',
          text: 'У меня уже есть поставщик',
          consequences: {},
          npcRelationshipDelta: -8,
        },
      ],
    ),
  },
  {
    id: 'mikhail_son',
    npcId: 'mikhail',
    episodeIndex: 2,
    triggerWeek: 26,
    prerequisiteEpisodeId: 'mikhail_meet',
    template: ep(
      'mikhail_son',
      'mikhail',
      'Сын Михаила перенимает бизнес',
      'Михаил: «Сын приходит после меня. Он другой — хочет всё через интернет, маркетинг. Поможешь ему встроиться или останешься со мной?»',
      [
        {
          id: 'help_son',
          text: 'Помочь сыну с цифровизацией',
          consequences: { reputationDelta: 3 },
          npcRelationshipDelta: 12,
        },
        {
          id: 'stay_loyal',
          text: 'Останусь с тобой, Михаил Сергеевич',
          consequences: {},
          npcRelationshipDelta: 18,
        },
        {
          id: 'switch_supplier',
          text: 'Я подумываю о другом поставщике вообще',
          consequences: {},
          npcRelationshipDelta: -25,
        },
      ],
    ),
  },
  {
    id: 'mikhail_pension',
    npcId: 'mikhail',
    episodeIndex: 3,
    triggerWeek: 43,
    prerequisiteEpisodeId: 'mikhail_son',
    template: ep(
      'mikhail_pension',
      'mikhail',
      'Михаил уходит на пенсию',
      'Михаил Сергеевич: «Я ухожу. Хочу оставить тебе — выбирай: рецепт нашего традиционного товара (новая категория) или контакты лучших поставщиков (постоянная скидка −20%)».',
      [
        {
          id: 'recipe',
          text: 'Рецепт — открыть эксклюзивную категорию',
          consequences: { reputationDelta: 5 },
        },
        {
          id: 'contacts',
          text: 'Контакты — постоянная скидка на закупки',
          consequences: { reputationDelta: 3 },
        },
        {
          id: 'just_thanks',
          text: 'Просто попрощаться',
          consequences: { reputationDelta: 2 },
          npcRelationshipDelta: 5,
        },
      ],
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // БАБУШКА ТАМАРА (drama, narrative-only — без mechanic)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'tamara_first',
    npcId: 'tamara',
    episodeIndex: 1,
    triggerWeek: 8,
    template: ep(
      'tamara_first',
      'tamara',
      'Бабушка Тамара заговорила',
      'Тамара Семёновна заходит каждую неделю за хлебом. Сегодня впервые задержалась поговорить: «Муж недавно умер. У вас тут хорошо, я как будто к нему хожу».',
      [
        {
          id: 'listen_warmly',
          text: 'Послушать, налить чая (+1 репутации)',
          consequences: { reputationDelta: 1 },
          npcRelationshipDelta: 10,
        },
        {
          id: 'polite_brief',
          text: 'Вежливо кивнуть и заняться делами',
          consequences: {},
          npcRelationshipDelta: 0,
        },
      ],
      false,  // не moral dilemma — просто эпизод
    ),
  },
  {
    id: 'tamara_illness',
    npcId: 'tamara',
    episodeIndex: 2,
    triggerWeek: 28,
    prerequisiteEpisodeId: 'tamara_first',
    template: ep(
      'tamara_illness',
      'tamara',
      'Тамары не было месяц',
      'Соседка-старушка зашла: «Тамара Семёновна заболела, лежит. Спрашивает про вас». Тратить день на визит или нет?',
      [
        {
          id: 'visit',
          text: 'Сходить навестить (−1 день энергии)',
          consequences: { energyDelta: -8, reputationDelta: 2 },
          npcRelationshipDelta: 15,
        },
        {
          id: 'send_gift',
          text: 'Отправить с соседкой передачку (−2 000 ₽)',
          consequences: { balanceDelta: -2000 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'busy',
          text: 'Сейчас не до этого',
          consequences: {},
          npcRelationshipDelta: -5,
        },
      ],
    ),
  },
  {
    id: 'tamara_resolution',
    npcId: 'tamara',
    episodeIndex: 3,
    triggerWeek: 44,
    prerequisiteEpisodeId: 'tamara_illness',
    template: ep(
      'tamara_resolution',
      'tamara',
      'Что стало с Тамарой',
      'Соседка зашла — рассказывает что с Тамарой Семёновной. Если ты её навещал — она поправилась и снова приходит. Если нет — её не стало месяц назад.',
      [
        {
          id: 'accept',
          text: '...',
          consequences: { reputationDelta: 2 },
        },
      ],
      false,
    ),
  },

  // ────────────────────────────────────────────────────────────────
  // ГЕНА (схемер) — comic relief, 5 эпизодов
  // ────────────────────────────────────────────────────────────────
  {
    id: 'gena_crypto',
    npcId: 'gena',
    episodeIndex: 1,
    triggerWeek: 9,
    template: ep(
      'gena_crypto',
      'gena',
      'Гена с крипто-фермой',
      'У дверей — парень в спортивках: «Брат, я Гена, у меня ТЕМА: крипто-ферма прямо в подвале! Вложишь 30К — через месяц 60К». Глаза горят.',
      [
        {
          id: 'invest',
          text: 'Вложить 30 000 ₽ (риск 90% потери, 10% удвоение)',
          consequences: { balanceDelta: -30000 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'soft_decline',
          text: 'Гена, я подумаю',
          consequences: {},
          npcRelationshipDelta: 0,
        },
        {
          id: 'hard_decline',
          text: 'Иди отсюда со своей фермой',
          consequences: {},
          npcRelationshipDelta: -10,
        },
      ],
      false,
    ),
  },
  {
    id: 'gena_nft',
    npcId: 'gena',
    episodeIndex: 2,
    triggerWeek: 17,
    prerequisiteEpisodeId: 'gena_crypto',
    template: ep(
      'gena_nft',
      'gena',
      'Гена опять. Теперь с NFT',
      'Гена: «Брат, забудь про крипту. NFT — вот это ракета! Я делаю NFT-коллекцию для бизнесов, твой логотип на блокчейне. Только 15К».',
      [
        {
          id: 'invest',
          text: 'Ладно, на смех потомкам (−15 000 ₽)',
          consequences: { balanceDelta: -15000 },
          npcRelationshipDelta: 5,
        },
        {
          id: 'decline',
          text: 'Спасибо, не сегодня',
          consequences: {},
        },
      ],
      false,
    ),
  },
  {
    id: 'gena_mlm',
    npcId: 'gena',
    episodeIndex: 3,
    triggerWeek: 25,
    prerequisiteEpisodeId: 'gena_nft',
    template: ep(
      'gena_mlm',
      'gena',
      'Гена в MLM',
      'Гена в новых очках: «Я теперь в международной сети! Если приведёшь 5 человек — будешь моим суб-партнёром, 1 000 000 ₽ в месяц гарантированно».',
      [
        {
          id: 'humor',
          text: 'Гена, ты сейчас сам себя слышишь? (отказ)',
          consequences: { energyDelta: 3 },
          npcRelationshipDelta: 0,
        },
        {
          id: 'invest',
          text: '«Стартовый набор» 20 000 ₽',
          consequences: { balanceDelta: -20000 },
          npcRelationshipDelta: 5,
        },
      ],
      false,
    ),
  },
  {
    id: 'gena_course',
    npcId: 'gena',
    episodeIndex: 4,
    triggerWeek: 34,
    prerequisiteEpisodeId: 'gena_mlm',
    template: ep(
      'gena_course',
      'gena',
      'Гена-коуч',
      'Гена в офисном костюме: «Я теперь бизнес-коуч! Запишем с тобой курс — ты делишься опытом, я монтирую, делим деньги пополам».',
      [
        {
          id: 'record',
          text: 'Записать (−1 день энергии, может выстрелит — 50/50)',
          consequences: { energyDelta: -10 },
          npcRelationshipDelta: 8,
        },
        {
          id: 'decline',
          text: 'Гена, серьёзно — нет',
          consequences: {},
        },
      ],
      false,
    ),
  },
  {
    id: 'gena_payoff',
    npcId: 'gena',
    episodeIndex: 5,
    triggerWeek: 46,
    prerequisiteEpisodeId: 'gena_course',
    template: ep(
      'gena_payoff',
      'gena',
      'Один из проектов Гены ВЫСТРЕЛИЛ',
      'Гена прибежал в магазин — он реально открыл свою компанию, продал часть Сбербанку. Если ты вкладывался во что-то его — выплата. Если нет — он смеётся: «А я же говорил». И уходит.',
      [
        {
          id: 'accept',
          text: '...',
          consequences: { reputationDelta: 1 },
        },
      ],
      false,
    ),
  },
]

// Lookup helper
export function getEpisode(id: string): NpcEpisode | undefined {
  return NPC_EPISODES.find(e => e.id === id)
}

// All episodes for a given NPC, ordered by index
export function getNpcArc(npcId: NpcId): NpcEpisode[] {
  return NPC_EPISODES
    .filter(e => e.npcId === npcId)
    .sort((a, b) => a.episodeIndex - b.episodeIndex)
}
