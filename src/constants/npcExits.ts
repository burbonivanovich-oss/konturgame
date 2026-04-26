import type { NPC, PersonalGoal, PlayerBackstory } from '../types/game'
import { NPC_DEFINITIONS } from './npcs'

/**
 * Final scenes shown in VictoryModal. Two layers:
 *  1. Per-NPC exit lines — what happened to each revealed NPC, gated by
 *     relationship level. Turns the modal from generic "you won" into
 *     a roll of actual people the player remembers.
 *  2. Goal closure — the dream/promise from the start (apartment,
 *     second shop, school) gets resolved with a vivid scene, win or lose.
 */

export interface ExitLine {
  npcId: string
  text: string
}

/**
 * Returns exit lines for all revealed NPCs, picked by relationship level.
 * Order matches NPC_DEFINITIONS for stable layout. `triggeredEventIds` is
 * passed through so episodic NPCs (e.g. Tamara) can select an exit line
 * by which terminal episode fired, rather than by relationship level —
 * useful when the chain spans long enough that decay homogenises the level.
 */
export function buildNpcExitLines(npcs: NPC[], triggeredEventIds: string[] = []): ExitLine[] {
  const lines: ExitLine[] = []

  for (const def of NPC_DEFINITIONS) {
    const npc = npcs.find(n => n.id === def.id)
    if (!npc?.isRevealed) continue
    const r = npc.relationshipLevel
    const text = pickExitLine(def.id, r, triggeredEventIds)
    if (text) lines.push({ npcId: def.id, text })
  }

  return lines
}

function pickExitLine(npcId: string, r: number, triggeredEventIds: string[] = []): string | null {
  switch (npcId) {
    case 'mikhail':
      if (r >= 70) return 'Михаил пишет из Краснодара. Внуки, веранда, рыбалка по выходным. В декабре прислал ящик мандаринов — без повода, «просто чтоб не забывали».'
      if (r >= 40) return 'Михаил передал бизнес ученику. Поставки идут, претензий нет. Поздравляет с новым годом смской — и это всё.'
      return 'Михаил исчез из эфира после того случая. Денис, его преемник, формально вежлив, но вы оба понимаете — мостов больше нет.'

    case 'svetlana':
      if (r >= 75) return 'Светлана через год запустила свой проект. Маленький, на выходных. Вы — её первый инвестор, пусть и в шутку. Она звонит каждую среду — вечером, поговорить.'
      if (r >= 50) return 'Светлана осталась с вами. Стала менеджером. Носит свою бирку с гордостью — и это, пожалуй, дороже денег.'
      if (r >= 25) return 'Светлана ушла к Анне через полгода. На прощание — сухое спасибо. Она была права тогда. Вы не услышали.'
      return 'Светлана уволилась с заявлением «по личным обстоятельствам». Личным было — что вы за полгода ни разу не спросили её имя дочери.'

    case 'petrov':
      if (r >= 75) return 'Петров вышел на пенсию. Заходит иногда — не как инспектор, как сосед. Один раз привёл внучку покупать конфеты. Молчаливо одобряет.'
      if (r >= 45) return 'Петров продолжает приходить на проверки — как часы, формально, без сюрпризов. Это уже отношения. Пусть и сухие.'
      return 'Петров вышел на пенсию. Перед уходом успел оставить вам рекордное количество протоколов. Держал слово.'

    case 'anna':
      if (r >= 75) return 'Анна перестала быть конкурентом — стала собеседницей. Раз в месяц встречаетесь у неё, обсуждаете дела района. Один общий враг — арендодатель.'
      if (r >= 45) return 'Анна закрыла часть линеек, ушла в свою нишу. Войны больше нет. Иногда здороваетесь у входа — короткий кивок.'
      if (r >= 20) return 'Анна закрылась через год после того кризиса. Помещение пустует. Иногда странно тихо без её листовок.'
      return 'Анна выиграла войну, которую вы не хотели вести. Её магазин на месте, ваш — закрыт. Но это другая история.'

    case 'tamara':
      // Pinned to which terminal episode fired, not relationship level —
      // the chain spans 30+ weeks and weekly decay would otherwise blur
      // the visit-vs-pass branches into the same neutral 50.
      if (triggeredEventIds.includes('tamara_arc_3a')) {
        return 'Бабушка Тамара ходит до сих пор — медленнее, с палочкой, но раз в неделю. Иногда забывает кошелёк, тогда расплачивается анекдотом про мужа. Платок у неё всегда чистый.'
      }
      if (triggeredEventIds.includes('tamara_arc_3b')) {
        return 'Бабушку Тамару похоронили в Твери. Её записку вы так и не выбросили — лежит в ящике под кассой, между квитанциями. Иногда натыкаетесь.'
      }
      // First episode fired but no terminal — she vanished from view.
      return 'Бабушка Тамара перестала заходить в какой-то момент. Вы так и не узнали — переехала, заболела, забыла. Просто однажды поняли: её нет уже давно.'

    case 'gena':
      // Three terminal variants from gena_arc_5; relationship level is
      // inconsistent across them so we key off the triggered event.
      if (triggeredEventIds.includes('gena_arc_5_jackpot')) {
        return 'Гена пишет из Дубая. На фотках — балкон, пальма, тарелка с морепродуктами. «Брат, помнишь я говорил? Я всегда говорил». Раз в месяц предлагает новую тему. Вы вежливо игнорируете.'
      }
      if (triggeredEventIds.includes('gena_arc_5_burned')) {
        return 'Гена в районе. Тема теперь — солнечные панели на даче, потом, наверное, что-то про водород. Деньги его не научили ничему. Ваши, к сожалению, тоже.'
      }
      if (triggeredEventIds.includes('gena_arc_5_told_you_so')) {
        return 'Гена больше не заходит. Видимо, обиделся. Иногда мелькает в чате района — там у него уже какая-то новая тема, пишет про неё много восклицательных знаков.'
      }
      // Met him but never reached the finale.
      return 'Гена пропал после третьей или четвёртой темы. Не звонит, не пишет. Может, наконец нашёл того, кто согласился.'
  }
  return null
}

/**
 * Goal closure scene — what happened to the dream. Two outcomes per goal,
 * tinted by motivation backstory for extra texture.
 */
export interface GoalClosure {
  title: string
  text: string
}

export function buildGoalClosure(
  goal: PersonalGoal | null | undefined,
  backstory: PlayerBackstory | null,
  balance: number,
): GoalClosure | null {
  if (!goal) return null

  if (goal.achieved) {
    return achievedClosure(goal, backstory, balance)
  }
  if (goal.missed) {
    return missedClosure(goal, backstory)
  }
  // Goal still alive (game ended before deadline) — neutral note
  return {
    title: 'Цель пока в работе',
    text: `«${goal.shortLabel}» — ещё впереди. Вы остановились, не дойдя. Может, в следующий раз.`,
  }
}

function achievedClosure(
  goal: PersonalGoal,
  _backstory: PlayerBackstory | null,
  _balance: number,
): GoalClosure {
  switch (goal.id) {
    case 'parent_reno':
      return {
        title: 'Ремонт сделан',
        text: 'Позвонили в пятницу вечером — бригада закончила. Мама: «Батарею новую поставили, тепло теперь». Потом долгая пауза. «Ты хороший». Больше ничего не сказала. Вы тоже.',
      }
    case 'katya_deposit':
      return {
        title: 'Катя переехала',
        text: 'В начале ноября прислала фото — дочка на новом полу рисует мелками. И одно сообщение: «Я всё помню. Вернём, обязательно». Ответили: «Не спеши». Добавили смайлик. Всё.',
      }
    case 'courtyard_save':
      return {
        title: 'Сквер устоял',
        text: 'В октябре пришёл ответ из комиссии: застройку заморозили на три года. Вечером в сквере собрались соседи, кто-то принёс термос. Один старик сказал: «Значит, ещё поживём тут». Этого было достаточно.',
      }
  }
}

function missedClosure(
  goal: PersonalGoal,
  _backstory: PlayerBackstory | null,
): GoalClosure {
  switch (goal.id) {
    case 'parent_reno':
      return {
        title: 'Ремонт подождёт',
        text: 'Позвонили с Новым годом — мама сказала, что в ванной снова капает. «Не беспокойся, мы привыкли». Именно это и самое тяжёлое. Пообещали себе — к следующей осени. Точно.',
      }
    case 'katya_deposit':
      return {
        title: 'Катя осталась',
        text: 'Катя осталась в той же квартире. Хозяин снова поднял цену — она молчит, не жалуется. Написала однажды просто «как дела» — вы оба знаете, что не про дела.',
      }
    case 'courtyard_save':
      return {
        title: 'Паркинг построили',
        text: 'Деревья спилили за неделю в августе. Проходили мимо — ограждение, бетономешалка, чужой шум. Старые лавочки в углу — никто не убрал. Пока стоят.',
      }
  }
}
