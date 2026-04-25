import type { BusinessType, GameState, ProductCategory } from '../types/game'

export const PRODUCT_CATEGORIES: Record<BusinessType, ProductCategory[]> = {
  shop: [
    {
      id: 'basic',
      name: 'Бакалея',
      description: 'Крупы, консервы, макароны. Простой старт без требований.',
      margin: 0.15,
      dailyCost: 4675,
      baseRevenue: 5500,
      requiredServices: [],
      icon: '🏪',
    },
    {
      id: 'dairy',
      name: 'Молочная продукция',
      description: 'Маркированный товар. Требует Маркет для учёта Честного знака.',
      margin: 0.2,
      dailyCost: 4000,
      baseRevenue: 5000,
      requiredServices: ['market', 'ofd'],
      icon: '🥛',
    },
    {
      id: 'meat',
      name: 'Мясо и рыба',
      description: 'Ветеринарные сертификаты + Меркурий. Высокая маржа.',
      margin: 0.3,
      dailyCost: 4900,
      baseRevenue: 7000,
      requiredServices: ['market', 'ofd'],
      requiresVetCert: true,
      icon: '🥩',
    },
    {
      id: 'alcohol',
      name: 'Алкоголь',
      description: 'Лицензия + ЕГАИС + ОФД + Экстерн. Самая высокая маржа.',
      margin: 0.4,
      dailyCost: 6000,
      baseRevenue: 10000,
      requiredServices: ['ofd', 'extern'],
      requiresEgais: true,
      icon: '🍷',
    },
    {
      id: 'tobacco',
      name: 'Табак и вейп',
      description: 'Маркированная продукция. Стабильный спрос.',
      margin: 0.35,
      dailyCost: 3575,
      baseRevenue: 5500,
      requiredServices: ['market', 'ofd'],
      icon: '🚬',
    },
  ],
  cafe: [
    {
      id: 'beverages',
      name: 'Напитки',
      description: 'Кофе, чай, соки. Быстрый оборот, хорошая маржа.',
      margin: 0.65,
      dailyCost: 1750,
      baseRevenue: 5000,
      requiredServices: [],
      icon: '☕',
    },
    {
      id: 'ready-food',
      name: 'Готовая еда',
      description: 'Блюда по техкартам. Маркет снижает себестоимость на 10%.',
      margin: 0.5,
      dailyCost: 3500,
      baseRevenue: 7000,
      requiredServices: ['market'],
      icon: '🍽️',
    },
    {
      id: 'desserts',
      name: 'Десерты и выпечка',
      description: 'Высокий средний чек. Маркировка не нужна.',
      margin: 0.55,
      dailyCost: 2025,
      baseRevenue: 4500,
      requiredServices: [],
      icon: '🧁',
    },
    {
      id: 'alcohol-cafe',
      name: 'Барная карта',
      description: 'Пиво, вино, коктейли. Лицензия + ОФД + Экстерн.',
      margin: 0.45,
      dailyCost: 4400,
      baseRevenue: 8000,
      requiredServices: ['ofd', 'extern'],
      requiresEgais: true,
      icon: '🍹',
    },
  ],
  'beauty-salon': [
    {
      id: 'basic-services',
      name: 'Базовые услуги',
      description: 'Стрижки, укладки, маникюр. Основной доход.',
      margin: 0.7,
      dailyCost: 1800,
      baseRevenue: 6000,
      requiredServices: [],
      icon: '✂️',
    },
    {
      id: 'premium-services',
      name: 'Премиум-услуги',
      description: 'Окрашивание, ламинирование. Маркет помогает с учётом материалов.',
      margin: 0.6,
      dailyCost: 3600,
      baseRevenue: 9000,
      requiredServices: ['market'],
      icon: '💎',
    },
    {
      id: 'cosmetics',
      name: 'Продажа косметики',
      description: 'Маркированная продукция. Дополнительный доход.',
      margin: 0.3,
      dailyCost: 2800,
      baseRevenue: 4000,
      requiredServices: ['market', 'ofd'],
      icon: '💄',
    },
    {
      id: 'spa',
      name: 'SPA-процедуры',
      description: 'Массаж, обёртывания. Высокий чек, стабильный спрос.',
      margin: 0.65,
      dailyCost: 2450,
      baseRevenue: 7000,
      requiredServices: [],
      icon: '🧖',
    },
  ],
}

export interface CategoryRevenueResult {
  totalRevenue: number
  totalDailyCost: number
  breakdown: Record<string, { revenue: number; cost: number; fine: number; allowed: boolean }>
}

export function isCategoryAllowed(category: ProductCategory, state: GameState): boolean {
  return category.requiredServices.every((sId) => state.services?.[sId]?.isActive === true)
}

export function calculateCategoryRevenue(state: GameState): CategoryRevenueResult {
  const categories = PRODUCT_CATEGORIES[state.businessType] ?? []
  const enabledIds = state.enabledCategories ?? []

  let totalRevenue = 0
  let totalDailyCost = 0
  const breakdown: CategoryRevenueResult['breakdown'] = {}

  for (const cat of categories) {
    if (!enabledIds.includes(cat.id)) continue

    const allowed = isCategoryAllowed(cat, state)
    const cost = cat.dailyCost
    const fine = allowed ? 0 : Math.round(cat.baseRevenue * 0.1)
    const revenue = allowed ? cat.baseRevenue : Math.round(cat.baseRevenue * 0.5)

    breakdown[cat.id] = { revenue, cost, fine, allowed }
    totalRevenue += revenue
    totalDailyCost += cost
  }

  return { totalRevenue, totalDailyCost, breakdown }
}

export function getDefaultCategories(businessType: BusinessType): string[] {
  const cats = PRODUCT_CATEGORIES[businessType]
  if (!cats || cats.length === 0) return []
  // Enable all categories that require no services by default
  return cats.filter(c => c.requiredServices.length === 0).map(c => c.id)
}
