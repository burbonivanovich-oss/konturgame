import type { BusinessType } from '../types/game'

export interface BusinessTierConfig {
  level: 1 | 2 | 3
  name: string
  description: string
  icon: string

  // Unlock conditions (only applies to tier 2+; tier 1 is always available)
  unlockWeek: number
  unlockBalance: number
  unlockReputation: number
  unlockQuality?: number      // optional quality gate (cafe & salon)

  // One-time price to upgrade INTO this tier (paid from balance)
  upgradeCost: number

  // Multipliers applied to baseline (tier 1) values everywhere those numbers
  // are read. Tier 1 is always 1.0× to keep the math simple.
  multipliers: {
    clients: number
    check: number
    rent: number
    baseSalary: number
    capacity: number
  }
}

export const BUSINESS_TIERS: Record<BusinessType, BusinessTierConfig[]> = {
  shop: [
    {
      level: 1,
      name: 'Магазин у дома',
      description: 'Точка в спальном районе. Узкий ассортимент, поток постоянных.',
      icon: '🏪',
      unlockWeek: 0,
      unlockBalance: 0,
      unlockReputation: 0,
      upgradeCost: 0,
      multipliers: { clients: 1.0, check: 1.0, rent: 1.0, baseSalary: 1.0, capacity: 1.0 },
    },
    {
      level: 2,
      name: 'Минимаркет',
      description: 'Расширили зал, добавили холодильное оборудование, пересобрали витрины. Теперь сюда заходят за полноценной закупкой.',
      icon: '🛒',
      unlockWeek: 15,
      unlockBalance: 300_000,
      unlockReputation: 60,
      upgradeCost: 200_000,
      multipliers: { clients: 1.5, check: 1.2, rent: 1.4, baseSalary: 1.3, capacity: 1.4 },
    },
    {
      level: 3,
      name: 'Супермаркет',
      description: 'Полноценный сетевой формат: широкий ассортимент, кассы самообслуживания, доставка. Точка известна на весь район.',
      icon: '🏬',
      unlockWeek: 30,
      unlockBalance: 1_000_000,
      unlockReputation: 75,
      upgradeCost: 600_000,
      multipliers: { clients: 2.5, check: 1.4, rent: 2.5, baseSalary: 2.0, capacity: 2.0 },
    },
  ],
  cafe: [
    {
      level: 1,
      name: 'Кафе',
      description: 'Уютная точка с базовым меню. Кофе, готовая еда, десерты.',
      icon: '☕',
      unlockWeek: 0,
      unlockBalance: 0,
      unlockReputation: 0,
      upgradeCost: 0,
      multipliers: { clients: 1.0, check: 1.0, rent: 1.0, baseSalary: 1.0, capacity: 1.0 },
    },
    {
      level: 2,
      name: 'Бистро',
      description: 'Авторская кухня, винная карта, более продуманный интерьер. Гости приходят на ужин, а не за кофе.',
      icon: '🍽️',
      unlockWeek: 12,
      unlockBalance: 250_000,
      unlockReputation: 60,
      unlockQuality: 60,
      upgradeCost: 180_000,
      multipliers: { clients: 1.4, check: 1.5, rent: 1.5, baseSalary: 1.4, capacity: 1.3 },
    },
    {
      level: 3,
      name: 'Ресторан',
      description: 'Полноценный ресторан с шефом и меню от 1500₽ за блюдо. Бронь за неделю, отзывы в гид-журналах.',
      icon: '🍷',
      unlockWeek: 25,
      unlockBalance: 800_000,
      unlockReputation: 75,
      unlockQuality: 75,
      upgradeCost: 500_000,
      multipliers: { clients: 1.8, check: 2.5, rent: 2.5, baseSalary: 2.0, capacity: 1.5 },
    },
  ],
  'beauty-salon': [
    {
      level: 1,
      name: 'Парикмахерская',
      description: 'Мастера на самозанятости, классические услуги. Без излишеств.',
      icon: '✂️',
      unlockWeek: 0,
      unlockBalance: 0,
      unlockReputation: 0,
      upgradeCost: 0,
      multipliers: { clients: 1.0, check: 1.0, rent: 1.0, baseSalary: 1.0, capacity: 1.0 },
    },
    {
      level: 2,
      name: 'Салон красоты',
      description: 'Полноформатный салон с мастерами в штате, окрашиваниями, премиум-марками косметики.',
      icon: '💇',
      unlockWeek: 12,
      unlockBalance: 250_000,
      unlockReputation: 60,
      upgradeCost: 180_000,
      multipliers: { clients: 1.5, check: 1.4, rent: 1.4, baseSalary: 1.4, capacity: 1.3 },
    },
    {
      level: 3,
      name: 'Премиум-салон / SPA',
      description: 'Бьюти-центр со SPA-зоной. Запись за 2 недели, постоянная клиентура из топ-1%.',
      icon: '💎',
      unlockWeek: 25,
      unlockBalance: 800_000,
      unlockReputation: 75,
      upgradeCost: 500_000,
      multipliers: { clients: 2.0, check: 2.0, rent: 2.0, baseSalary: 1.8, capacity: 1.5 },
    },
  ],
}
