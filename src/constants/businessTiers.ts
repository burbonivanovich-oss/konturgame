import type { BusinessType } from '../types/game'

export interface BusinessTierConfig {
  level: 1 | 2 | 3
  name: string
  description: string
  icon: string

  // Условия открытия. После рефакторинга тиров — это auto-progression
  // milestone'ы, а не purchase gate. Когда currentWeek ≥ unlockWeek И
  // репутация ≥ unlockReputation, тир переключается автоматически без
  // затрат. Поля unlockBalance / upgradeCost оставлены = 0 в новых
  // конфигах (сохранены в типе для совместимости со старыми сэйвами).
  unlockWeek: number
  unlockBalance: number
  unlockReputation: number

  // Раньше: разовая цена за апгрейд. Сейчас: 0 (auto-progression без затрат).
  upgradeCost: number

  // Мультипликаторы к baseline (T1). Аренда и ЗП НЕ растут — это убирает
  // risk «прыгнул в T2 и не вывёз фикс. косты». Растут только клиенты,
  // чек и capacity — мелкие, плавные шаги, целевое назначение —
  // отметить переход на новый этап жизни бизнеса, а не давать жёсткий
  // экономический скачок.
  multipliers: {
    clients: number
    check: number
    rent: number       // всегда 1.0 — больше не растёт
    baseSalary: number // всегда 1.0 — больше не растёт
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
      unlockWeek: 12,
      unlockBalance: 0,
      unlockReputation: 70,
      upgradeCost: 0,
      multipliers: { clients: 1.2, check: 1.1, rent: 1.0, baseSalary: 1.0, capacity: 1.15 },
    },
    {
      level: 3,
      name: 'Супермаркет',
      description: 'Полноценный сетевой формат: широкий ассортимент, кассы самообслуживания, доставка. Точка известна на весь район.',
      icon: '🏬',
      unlockWeek: 22,
      unlockBalance: 0,
      unlockReputation: 85,
      upgradeCost: 0,
      multipliers: { clients: 1.4, check: 1.25, rent: 1.0, baseSalary: 1.0, capacity: 1.35 },
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
      unlockBalance: 0,
      unlockReputation: 70,
      upgradeCost: 0,
      multipliers: { clients: 1.2, check: 1.15, rent: 1.0, baseSalary: 1.0, capacity: 1.15 },
    },
    {
      level: 3,
      name: 'Ресторан',
      description: 'Полноценный ресторан с шефом и меню от 1500₽ за блюдо. Бронь за неделю, отзывы в гид-журналах.',
      icon: '🍷',
      unlockWeek: 22,
      unlockBalance: 0,
      unlockReputation: 85,
      upgradeCost: 0,
      multipliers: { clients: 1.4, check: 1.30, rent: 1.0, baseSalary: 1.0, capacity: 1.30 },
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
      unlockBalance: 0,
      unlockReputation: 70,
      upgradeCost: 0,
      multipliers: { clients: 1.2, check: 1.2, rent: 1.0, baseSalary: 1.0, capacity: 1.15 },
    },
    {
      level: 3,
      name: 'Премиум-салон / SPA',
      description: 'Бьюти-центр со SPA-зоной. Запись за 2 недели, постоянная клиентура из топ-1%.',
      icon: '💎',
      unlockWeek: 22,
      unlockBalance: 0,
      unlockReputation: 85,
      upgradeCost: 0,
      multipliers: { clients: 1.4, check: 1.45, rent: 1.0, baseSalary: 1.0, capacity: 1.30 },
    },
  ],
}
