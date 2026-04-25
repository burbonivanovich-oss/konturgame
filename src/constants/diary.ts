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

  // ── Personal: friend (Katya) ───────────────────────────────────────
  {
    id: 'diary_friend_katya_checks_in',
    specificity: 4,
    matches: (s) => hasPersonal(s, 'friend') && s.currentWeek % 8 === 0,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Катя написала вечером — коротко: «Ну как там?» Иногда хочется ответить честно. Написала «нормально». Она поставила сердечко.',
    }),
  },
  {
    id: 'diary_friend_help_offer',
    specificity: 5,
    matches: (s) => hasPersonal(s, 'friend') && s.balance < 30000 && s.currentWeek >= 6,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Катя: «Слышала, сложно сейчас. Если нужны деньги — я найду». Не спросила сколько. Просто написала. Почему-то это и было труднее всего принять.',
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
  // Parent renovation — a small but persistent weight
  {
    id: 'diary_goal_parent_call',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'parent_reno' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Позвонили домой. Папа сказал, в ванной снова капает — «труба немного, несущественно». Положил трубку. Открыл сайт ремонтных бригад. Закрыл. Пока рано. Но не совсем рано.',
    }),
  },
  {
    id: 'diary_goal_parent_estimate',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'parent_reno' && s.currentWeek >= 18 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Прислали смету из бригады — мама сфотографировала и отправила в вотсапе. Смотришь на цифры, прикидываешь. Реально. Если продолжить в том же темпе — реально.',
    }),
  },
  // Katya's deposit — quiet countdown to her fresh start
  {
    id: 'diary_goal_katya_photo',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'katya_deposit' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Катя прислала фото — квартира на Советской, третий этаж, вид во двор. «Вот такая. Хозяйка нормальная». Сохранили в телефон. Считаете недели.',
    }),
  },
  {
    id: 'diary_goal_katya_viewing',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'katya_deposit' && s.currentWeek >= 22 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Съездили с Катей смотреть квартиру — формально она уже решила, просто хотела, чтобы кто-то был рядом. На кухне дочка спросила: «А тут мы будем жить?» Катя ответила: «Посмотрим». Оба понимают, что посмотрит в первую очередь цифра.',
    }),
  },
  // Courtyard — the trees are still there, for now
  {
    id: 'diary_goal_courtyard_walk',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'courtyard_save' && s.currentWeek >= 8 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Прошли через двор вечером. Берёзы стоят, лавочки на месте. Детский голос где-то из-за угла. Всё как обычно — пока. Комиссия соберётся через полтора месяца.',
    }),
  },
  {
    id: 'diary_goal_courtyard_lawyer',
    specificity: 6,
    matches: (s) => s.personalGoal?.id === 'courtyard_save' && s.currentWeek >= 20 && !s.personalGoal.achieved && !s.personalGoal.missed,
    compose: (s) => ({
      header: `Дневник · Неделя ${s.currentWeek}`,
      body: 'Юрист из инициативной группы сказал: «Шансы есть, если подадим полный пакет до пятницы». Я перевела часть суммы. Он сказал спасибо. Я сказала — за дело.',
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
