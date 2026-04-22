import type { EventTemplate } from '../types/game'

export interface NewspaperIssue {
  week: number
  headline: string
  events: EventTemplate[]
}

export const CITY_NEWSPAPER_EVENTS: EventTemplate[] = [
  {
    id: 'NEWS_W10',
    title: '📰 Городская газета: «Малый бизнес набирает обороты»',
    description: 'Районная газета опубликовала статью о новых предпринимателях. Вас упомянули как один из заметных новых бизнесов. Читатели заинтересовались.',
    trigger: { oneTime: true },
    options: [
      {
        id: 'embrace',
        text: 'Поблагодарить редакцию и дать интервью',
        consequences: { reputationDelta: 8, clientModifier: 0.1, clientModifierDays: 7 },
      },
      {
        id: 'modest',
        text: 'Принять как есть — работа сама за себя',
        consequences: { reputationDelta: 3 },
      },
    ],
  },
  {
    id: 'NEWS_W20',
    title: '📰 Городская газета: «Цифровые технологии в малом бизнесе»',
    description: 'Газета рассказывает о предпринимателях, которые внедрили современные цифровые инструменты. Журналист хочет написать и о вас.',
    trigger: { oneTime: true },
    options: [
      {
        id: 'feature',
        text: 'Согласиться на интервью',
        consequences: { reputationDelta: 6, clientModifier: 0.08, clientModifierDays: 10 },
      },
      {
        id: 'decline',
        text: 'Отказаться — не до публичности',
        consequences: { reputationDelta: 1 },
      },
    ],
  },
  {
    id: 'NEWS_W30',
    title: '📰 Городская газета: «Истории выживания: три года на рынке»',
    description: 'Газета публикует серию материалов о стойком малом бизнесе. Ваш бизнес — один из немногих, кто продержался больше полугода. Редакция предлагает колонку.',
    trigger: { oneTime: true },
    options: [
      {
        id: 'column',
        text: 'Написать колонку о своём опыте',
        consequences: { reputationDelta: 10, loyaltyDelta: 5, clientModifier: 0.12, clientModifierDays: 14 },
      },
      {
        id: 'brief',
        text: 'Дать короткий комментарий',
        consequences: { reputationDelta: 5 },
      },
      {
        id: 'pass',
        text: 'Пропустить — некогда',
        consequences: {},
      },
    ],
  },
  {
    id: 'NEWS_W40',
    title: '📰 Городская газета: «Бизнес-история района»',
    description: 'Редакция составляет рейтинг лучших бизнесов района. Ваш бизнес вошёл в шорт-лист. Победитель получит приз от спонсора — деньги для развития.',
    trigger: { oneTime: true },
    options: [
      {
        id: 'compete',
        text: 'Участвовать в голосовании (просить клиентов голосовать)',
        consequences: { balanceDelta: 10000, reputationDelta: 12, clientModifier: 0.15, clientModifierDays: 21 },
      },
      {
        id: 'nominate',
        text: 'Просто принять номинацию',
        consequences: { reputationDelta: 6 },
      },
    ],
  },
  {
    id: 'NEWS_W50',
    title: '📰 Городская газета: «Итоги года: малый бизнес»',
    description: 'В конце года газета публикует итоги: кто выжил, кто вырос. Ваш бизнес — в числе историй успеха. Что вы хотите сказать городу?',
    trigger: { oneTime: true },
    options: [
      {
        id: 'speech',
        text: 'Поблагодарить клиентов и команду',
        consequences: { reputationDelta: 10, loyaltyDelta: 8, energyDelta: 15 },
      },
      {
        id: 'future',
        text: 'Рассказать о планах на следующий год',
        consequences: { reputationDelta: 7, clientModifier: 0.1, clientModifierDays: 14 },
      },
    ],
  },
]

export const NEWSPAPER_TRIGGER_WEEKS: Record<string, number> = {
  NEWS_W10: 10,
  NEWS_W20: 20,
  NEWS_W30: 30,
  NEWS_W40: 40,
  NEWS_W50: 50,
}

export function getNewspaperForWeek(week: number): EventTemplate | null {
  const id = Object.entries(NEWSPAPER_TRIGGER_WEEKS).find(([, w]) => w === week)?.[0]
  if (!id) return null
  return CITY_NEWSPAPER_EVENTS.find(e => e.id === id) ?? null
}
