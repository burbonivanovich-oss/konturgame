import type { GameState, BackstoryPersonal, BackstoryMotivation } from '../types/game'

/**
 * Diary entries — short first-person reflections by the protagonist that
 * appear every ~5 weeks, replacing the flat city-newspaper stub. Each entry
 * is conditional on game state: backstory, current week, balance, energy,
 * service mix, etc. The picker selects the most specific match.
 *
 * Entries are intentionally short (1-3 sentences). They give the player a
 * tonal anchor — life happens around the business, the business is not the
 * whole life. No mechanical reward beyond a tiny reputation/loyalty nudge.
 */

export interface DiaryEntry {
  id: string
  // Higher = more specific. Picker uses highest matching specificity.
  specificity: number
  // Predicate: does this entry fit current state?
  matches: (state: GameState) => boolean
  // Composer: returns the entry text. Can interpolate state.
  compose: (state: GameState) => DiaryComposed
}

export interface DiaryComposed {
  // Short header shown above body (e.g. "Дневник · Неделя 12")
  header: string
  // First-person body, 1-3 sentences
  body: string
  // Optional flavor consequence — small reputation/loyalty bump
  reputationDelta?: number
  loyaltyDelta?: number
}

// Helper predicates
const hasMotivation = (state: GameState, m: BackstoryMotivation) =>
  state.playerBackstory?.motivation === m
const hasPersonal = (state: GameState, p: BackstoryPersonal) =>
  state.playerBackstory?.personal === p
const isOnTrackForGoal = (state: GameState) => {
  const goal = state.personalGoal
  if (!goal || goal.achieved || goal.missed) return false
  const expectedPct = state.currentWeek / goal.deadlineWeek
  const actualPct = state.balance / goal.targetAmount
  return actualPct >= expectedPct * 0.9
}
const isBehindOnGoal = (state: GameState) => {
  const goal = state.personalGoal
  if (!goal || goal.achieved || goal.missed) return false
  const expectedPct = state.currentWeek / goal.deadlineWeek
  const actualPct = state.balance / goal.targetAmount
  return actualPct < expectedPct * 0.7
}

export const DIARY_ENTRIES: DiaryEntry[] = [
  // ── Energy state (universal) ────────────────────────────────────────
  {
    id: 'diary_burnout',
    specificity: 5,
    matches: (s) => s.entrepreneurEnergy < 30,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Сегодня уснул в кресле прямо в зале. Кассир разбудил, неловко. Надо что-то с этим делать — так долго не протянуть.',
      loyaltyDelta: -1,
    }),
  },

  // ── Backstory: corp (left a corporate job) ─────────────────────────
  {
    id: 'diary_corp_old_boss',
    specificity: 4,
    matches: (s) => hasMotivation(s, 'corp') && s.currentWeek >= 8 && s.currentWeek <= 16,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Бывший шеф звонил. Спрашивал, не хочу ли вернуться на руководящую — «у нас место освободилось, под тебя». Положил трубку, посмотрел на свой прилавок. Решил: пока нет.',
      reputationDelta: 1,
    }),
  },
  {
    id: 'diary_corp_no_meetings',
    specificity: 3,
    matches: (s) => hasMotivation(s, 'corp') && s.currentWeek >= 4 && s.currentWeek <= 12,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Сегодня поймал себя на мысли: за всю неделю — ни одного совещания. Восемь лет такого не было. Пусто и хорошо.',
    }),
  },

  // ── Backstory: contest (won a grant) ───────────────────────────────
  {
    id: 'diary_contest_pressure',
    specificity: 4,
    matches: (s) => hasMotivation(s, 'contest') && s.currentWeek >= 6,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Снова попалось то письмо: «Поздравляем с победой». Тогда казалось — лотерейный билет. Теперь — обязательство. Странно, как ответственность приходит вместе с деньгами.',
    }),
  },

  // ── Backstory: accident ("just happened") ──────────────────────────
  {
    id: 'diary_accident_doubt',
    specificity: 4,
    matches: (s) => hasMotivation(s, 'accident') && s.currentWeek >= 10 && s.balance < 50000,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Иногда думаю: что если бы тот разговор не случился? Жил бы спокойно, не считал каждый рубль. Но возвращаться поздно — уже привязался.',
      loyaltyDelta: 1,
    }),
  },

  // ── Personal: free (no obligations) ────────────────────────────────
  {
    id: 'diary_free_evening',
    specificity: 3,
    matches: (s) => hasPersonal(s, 'free') && s.currentWeek >= 5,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Вечером закрыл кассу, пошёл гулять до темноты. Никто не ждёт, никто не звонит. Это и свобода, и пустота — два слова про одно и то же.',
    }),
  },

  // ── Personal: friend (Dimka) ───────────────────────────────────────
  {
    id: 'diary_friend_dimka_calls',
    specificity: 4,
    matches: (s) => hasPersonal(s, 'friend') && s.currentWeek % 8 === 0,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Димка позвонил вечером — третий раз за неделю. «Ну как ты там, держишься?» Иногда хочется сказать «нет, не держусь». Но он расстроится. Сказал: «Норм».',
    }),
  },
  {
    id: 'diary_friend_help_offer',
    specificity: 5,
    matches: (s) => hasPersonal(s, 'friend') && s.balance < 30000 && s.currentWeek >= 6,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Димка: «Слушай, у меня есть тысяч сто свободных. Возьми, потом отдашь». Хотел отказать сразу — но не отказал. Подумаю. Хочется самому, но цифры говорят другое.',
      loyaltyDelta: 1,
    }),
  },

  // ── Personal: hometown ─────────────────────────────────────────────
  {
    id: 'diary_hometown_old_friend',
    specificity: 4,
    matches: (s) => hasPersonal(s, 'hometown') && s.currentWeek >= 6,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Пришла Татьяна Ивановна — учительница начальных классов. Не узнала меня. Я — её. Купила хлеб, ушла. Поймал себя: хочу, чтобы район меня узнал заново.',
      reputationDelta: 2,
    }),
  },
  {
    id: 'diary_hometown_kids_run_in',
    specificity: 3,
    matches: (s) => hasPersonal(s, 'hometown') && s.currentWeek >= 12,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Школьники забежали погреться — на улице −15. Налил им чай, ничего не взял. Что-то такое родное в этом, что аж в горле.',
      reputationDelta: 2,
    }),
  },

  // ── Goal pressure (universal, fires when behind) ───────────────────
  {
    id: 'diary_goal_behind',
    specificity: 5,
    matches: (s) => isBehindOnGoal(s) && s.currentWeek >= 12,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: `Сел вечером, посчитал. До дедлайна — ${s.personalGoal!.deadlineWeek - s.currentWeek} недель, до нужной суммы не дотягиваю по темпу. Цифры не врут. Надо что-то менять, и быстро.`,
    }),
  },
  {
    id: 'diary_goal_on_track',
    specificity: 4,
    matches: (s) => isOnTrackForGoal(s) && s.currentWeek >= 10,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Посмотрел на счёт. Впервые подумал — успею. Не «может быть» и не «если повезёт». Просто — успею. Странное чувство.',
      reputationDelta: 1,
    }),
  },

  // ── Goal close to deadline ─────────────────────────────────────────
  {
    id: 'diary_goal_final_stretch',
    specificity: 6,
    matches: (s) => {
      const g = s.personalGoal
      if (!g || g.achieved || g.missed) return false
      return g.deadlineWeek - s.currentWeek <= 4 && g.deadlineWeek - s.currentWeek > 0
    },
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Меньше месяца до срока. Сплю плохо, считаю на салфетках. Каждый рубль теперь идёт в одну сторону — и от этого ни легче, ни тяжелее. Просто яснее.',
    }),
  },

  // ── Goal-specific reflections (v5.3) ───────────────────────────────
  // Mom's car — small daydreams that won't sit still
  {
    id: 'diary_goal_mother_marshrutka',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'mother_car' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Звонил маме. Сказала, опять простояла полчаса на остановке — маршрутка ушла раньше расписания. «Ничего, не критично». Положил трубку, открыл сайт б/у машин. Закрыл. Открыл. Так каждый вечер.',
    }),
  },
  {
    id: 'diary_goal_mother_test_drive',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'mother_car' && s.currentWeek >= 18 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Зашёл в автосалон — посмотреть Granta вживую. Продавец спросил, для кого. «Маме на день рождения». Он улыбнулся, как человек, который слышал это много раз. Дал тест-драйв. Машина пахнет новым пластиком и чьей-то будущей радостью.',
    }),
  },
  // Dimka's wedding — quiet pre-celebration nerves
  {
    id: 'diary_goal_dimka_envelope',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'dimka_wedding' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Димка прислал приглашение в конверте — настоящем, бумажном. Внутри — фото с Иркой, дата, адрес зала. Прикрепил магнитиком к холодильнику. Каждое утро смотрю и считаю недели до. И сумму, которая нужна.',
    }),
  },
  {
    id: 'diary_goal_dimka_zal',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'dimka_wedding' && s.currentWeek >= 22 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Заехали с Иркой смотреть зал — чисто формально, выбор уже сделан. На выходе она тихо: «Спасибо, что помогаете». Не Димке — Ирке. Вы пожали плечами, мол, «мы не уточняли». Она поняла. Они оба знают, что на бумаге — не сходится.',
    }),
  },
  // Coach for the kids' team — the courtyard watches
  {
    id: 'diary_goal_kids_empty_field',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'kids_coach' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Прошёл вечером через двор. На поле — никого, ворота скрипят. Раньше тут грохот стоял, сейчас тишина. Витёк, тот самый рыжий, сидел на лавочке, пинал бутылку. Кивнули друг другу. Он уже знает, что лето не такое, как было.',
    }),
  },
  {
    id: 'diary_goal_kids_coach_visit',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'kids_coach' && s.currentWeek >= 20 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Заехал к тренеру — Сергей Палычу, бывшему КамАЗовскому. Сказал «как только смогу — вернусь, держите место за нами». Он молча налил чай. «Старик, я подержу до сентября. Но потом мне семью кормить, ты понимаешь». Понимаю.',
    }),
  },

  // ── Generic (fallback) ─────────────────────────────────────────────
  {
    id: 'diary_generic_quiet_week',
    specificity: 1,
    matches: () => true,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Тихая неделя. Касса работает, поставщик не подвёл, никто не пришёл с проверкой. Иногда «ничего не случилось» — лучшая запись в дневнике.',
    }),
  },
  {
    id: 'diary_generic_small_thing',
    specificity: 1,
    matches: () => true,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Постоянная клиентка сегодня сказала: «Без вас тут было бы не то». Ничего особенного, проходная фраза. А весь день потом улыбался.',
      loyaltyDelta: 1,
    }),
  },
]

/**
 * Picks the best-matching diary entry for the current state. Returns null
 * if no entry matches (only the fallback generic ones have specificity 1
 * and match: () => true, so this is a safety net).
 */
export function pickDiaryEntry(state: GameState): DiaryComposed | null {
  const matching = DIARY_ENTRIES.filter(e => e.matches(state))
  if (matching.length === 0) return null
  // Sort by specificity desc, then take from top tier with random tiebreaker
  const maxSpec = Math.max(...matching.map(e => e.specificity))
  const topTier = matching.filter(e => e.specificity === maxSpec)
  const picked = topTier[Math.floor(Math.random() * topTier.length)]
  return picked.compose(state)
}
