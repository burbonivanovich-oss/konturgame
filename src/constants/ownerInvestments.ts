export type OwnerInvestmentId =
  | 'coffee'
  | 'weekend_trip'
  | 'gym'
  | 'massage_course'
  | 'chair'
  | 'laptop'
  | 'delegation'

export type OwnerInvestmentType = 'one-time' | 'permanent' | 'subscription'

export interface OwnerInvestmentConfig {
  id: OwnerInvestmentId
  name: string
  description: string
  icon: string
  cost: number
  type: OwnerInvestmentType
  subscriptionWeeks?: number  // how many weeks subscription lasts
  effect: {
    energyImmediate?: number    // energy added right now
    energyPerWeek?: number      // energy added each week start
    actionCostReduction?: number // reduce every action's energy cost
  }
}

export const OWNER_INVESTMENTS: OwnerInvestmentConfig[] = [
  {
    id: 'coffee',
    name: 'Кофе и сладости',
    description: 'Небольшая радость. Сразу +10 энергии.',
    icon: '☕',
    cost: 500,
    type: 'one-time',
    effect: { energyImmediate: 10 },
  },
  {
    id: 'weekend_trip',
    name: 'Выезд на природу',
    description: 'Полноценный отдых. Сразу восстанавливает энергию до 100.',
    icon: '🌲',
    cost: 8_000,
    type: 'one-time',
    effect: { energyImmediate: 100 },  // capped at max in store
  },
  {
    id: 'gym',
    name: 'Абонемент в зал',
    description: '+15 энергии каждую неделю. Действует 4 недели.',
    icon: '🏋️',
    cost: 5_000,
    type: 'subscription',
    subscriptionWeeks: 4,
    effect: { energyPerWeek: 15 },
  },
  {
    id: 'massage_course',
    name: 'Курс массажа',
    description: '+10 энергии каждую неделю. Действует 4 недели.',
    icon: '💆',
    cost: 3_000,
    type: 'subscription',
    subscriptionWeeks: 4,
    effect: { energyPerWeek: 10 },
  },
  {
    id: 'chair',
    name: 'Эргономичное кресло',
    description: '+10 энергии каждую неделю навсегда.',
    icon: '🪑',
    cost: 12_000,
    type: 'permanent',
    effect: { energyPerWeek: 10 },
  },
  {
    id: 'laptop',
    name: 'Новый ноутбук',
    description: 'Каждое действие стоит на 3 энергии меньше навсегда.',
    icon: '💻',
    cost: 35_000,
    type: 'permanent',
    effect: { actionCostReduction: 3 },
  },
  {
    id: 'delegation',
    name: 'Помощник-ассистент',
    description: '+20 энергии каждую неделю. Подписка на 4 недели.',
    icon: '🤝',
    cost: 8_000,
    type: 'subscription',
    subscriptionWeeks: 4,
    effect: { energyPerWeek: 20 },
  },
]

export const OWNER_INVESTMENTS_MAP = Object.fromEntries(
  OWNER_INVESTMENTS.map(i => [i.id, i])
) as Record<OwnerInvestmentId, OwnerInvestmentConfig>
