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
 * Order matches NPC_DEFINITIONS for stable layout.
 */
export function buildNpcExitLines(npcs: NPC[]): ExitLine[] {
  const lines: ExitLine[] = []

  for (const def of NPC_DEFINITIONS) {
    const npc = npcs.find(n => n.id === def.id)
    if (!npc?.isRevealed) continue
    const r = npc.relationshipLevel
    const text = pickExitLine(def.id, r)
    if (text) lines.push({ npcId: def.id, text })
  }

  return lines
}

function pickExitLine(npcId: string, r: number): string | null {
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

    case 'marina':
      if (r >= 65) return 'Марина вернулась из декрета через год. Сделала вам стратегию на следующий сезон — как обещала. Приходит с дочкой в коляске.'
      if (r >= 40) return 'Марина в декрете. Иногда пишет совет — короткий, по делу. Связь не оборвалась.'
      return 'Марина исчезла после декрета. Поняли только потом, что её обещания и были её способом честно прощаться.'

    case 'viktor':
      if (r >= 60) return 'Виктор работает в центральном офисе. Когда вам понадобилась лицензия на эквайринг — оформил за два дня вместо двух недель. «Земляческое».'
      if (r >= 35) return 'Виктор передал ваш счёт коллеге. Новая менеджер — Оксана. Корректная, но без той лёгкости. Бывает.'
      return 'Виктор ушёл, не попрощавшись. Возможно, был обижен. Возможно, не до того было. Никогда не узнаете.'

    case 'gleb':
      if (r >= 65) return 'Глеб набрал 80 тысяч подписчиков. Ваш бизнес — постоянный герой его контента. Платный контракт, но рамки честные.'
      if (r >= 40) return 'Глеб делает контент по району. Вас упоминает иногда — нейтрально. Это и есть отношения.'
      if (r >= 15) return 'Глеб переключился на скандалы про другие места. У вас — затишье. И слава богу.'
      return 'После того скандала Глеб развернул войну. Снимает раз в месяц новый «разоблачающий» материал. Просмотры есть, конверсии нет — но осадок остаётся.'
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
    case 'mother_car':
      return {
        title: 'У мамы — своя машина',
        text: 'День рождения. Заехали с пакетом, попросили выйти на минутку. У подъезда — Granta, серебристая, с лентой на капоте. Мама сначала не поняла. Потом поняла. «Ну ты дурак, на что мне такое-то». Сидите вдвоём, она держит руль, не зажигает зажигание. Просто держит.',
      }
    case 'dimka_wedding':
      return {
        title: 'Свадьба Димки и Ирки',
        text: 'Загс, кольца у вас в кармане. Банкет — всё, как они хотели: тот зал, тот торт, фотограф, который снимал у них на годовщине. Под конец Димка подходит с шампанским: «Старик. Без тебя бы не было». Чокнулись. Не уточнял, что значит «без тебя». Не нужно.',
      }
    case 'kids_coach':
      return {
        title: 'Команда сохранилась',
        text: 'Сентябрь. На дворовом поле первая тренировка. Десяток пацанов в новой форме — Серёга, Тимоха, Витёк, остальных пока не знаете. Тренер кричит «не бойся!» одному из них. Постояли у сетки минуту. Уходите — никто не заметил, и это нормально.',
      }
  }
}

function missedClosure(
  goal: PersonalGoal,
  _backstory: PlayerBackstory | null,
): GoalClosure {
  switch (goal.id) {
    case 'mother_car':
      return {
        title: 'Подарили мультиварку',
        text: 'День рождения. Мультиварка хорошая, дорогая — мама довольна, обнимает. «Как раз мечтала». Знаете, что не мечтала. Знаете и то, что в следующий день рождения мама ещё раз вскользь скажет про маршрутки. К следующему — точно успеете. Точно.',
      }
    case 'dimka_wedding':
      return {
        title: 'Свадьба у тёщи',
        text: 'У тёщи дома — двадцать человек, тётя Зина с пирогом, никаких залов. Димка улыбается всем, но иногда — глаза в сторону. Подходит с водкой: «Старик, не парься, главное — поженились». Чокнулись. Вы оба знаете, как хотели. И оба молчите.',
      }
    case 'kids_coach':
      return {
        title: 'Поле опустело',
        text: 'Сентябрь. На стадионе — никого. Сетка местами провисла. Прошли мимо вечером, заметили: в углу мяч, забытый. Один из мальчишек — Витёк, кажется — пробежал через двор домой. Один. Раньше их тут было больше.',
      }
  }
}
