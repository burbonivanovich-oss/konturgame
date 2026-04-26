import type { BusinessType, GameState, ProductCategory } from '../types/game'
import { UPGRADES_CONFIG } from '../constants/business'

export const PRODUCT_CATEGORIES: Record<BusinessType, ProductCategory[]> = {
  shop: [
    {
      id: 'basic',
      name: 'Бакалея',
      description: 'Крупы, консервы, макароны. Базовая категория — есть всегда.',
      margin: 0.35,
      dailyCost: 4550,
      baseRevenue: 7000,
      requiredServices: [],
      icon: '🏪',
    },
    {
      id: 'dairy',
      name: 'Молочная продукция',
      description: 'Маркированный товар. Нужен холодильник + Маркет для Честного знака.',
      margin: 0.25,
      dailyCost: 3750,
      baseRevenue: 5000,
      requiredServices: ['market', 'ofd'],
      requiredUpgradeIds: ['cold-case'],
      icon: '🥛',
    },
    {
      id: 'meat',
      name: 'Мясо и рыба',
      description: 'Высокая маржа. Нужны холодильник + морозильник + Меркурий.',
      margin: 0.3,
      dailyCost: 4900,
      baseRevenue: 7000,
      requiredServices: ['market', 'ofd'],
      requiredUpgradeIds: ['cold-case', 'freezer'],
      requiresVetCert: true,
      icon: '🥩',
    },
    {
      id: 'alcohol',
      name: 'Алкоголь',
      description: 'Самая высокая маржа. Нужен алкошкаф + лицензия (ОФД+Экстерн).',
      margin: 0.4,
      dailyCost: 6000,
      baseRevenue: 10000,
      requiredServices: ['ofd', 'extern'],
      requiredUpgradeIds: ['liquor-cabinet'],
      requiresEgais: true,
      icon: '🍷',
    },
    {
      id: 'tobacco',
      name: 'Табак и вейп',
      description: 'Маркированная продукция в закрытом шкафу.',
      margin: 0.4,
      dailyCost: 3300,
      baseRevenue: 5500,
      requiredServices: ['market', 'ofd'],
      requiredUpgradeIds: ['tobacco-display'],
      icon: '🚬',
    },
  ],
  cafe: [
    {
      id: 'beverages',
      name: 'Напитки',
      description: 'Кофе, чай, соки. Базовая категория. С кофемашиной — выручка ×1.5.',
      margin: 0.65,
      dailyCost: 1750,
      baseRevenue: 5000,
      requiredServices: [],
      icon: '☕',
    },
    {
      id: 'ready-food',
      name: 'Готовая еда',
      description: 'Блюда по техкартам. Нужна кухня + Маркет.',
      margin: 0.5,
      dailyCost: 3500,
      baseRevenue: 7000,
      requiredServices: ['market'],
      requiredUpgradeIds: ['kitchen'],
      icon: '🍽️',
    },
    {
      id: 'desserts',
      name: 'Десерты и выпечка',
      description: 'Высокий средний чек. Нужна печь.',
      margin: 0.55,
      dailyCost: 2025,
      baseRevenue: 4500,
      requiredServices: [],
      requiredUpgradeIds: ['oven'],
      icon: '🧁',
    },
    {
      id: 'alcohol-cafe',
      name: 'Барная карта',
      description: 'Пиво, вино, коктейли. Нужна барная стойка + лицензия (ОФД+Экстерн).',
      margin: 0.45,
      dailyCost: 4400,
      baseRevenue: 8000,
      requiredServices: ['ofd', 'extern'],
      requiredUpgradeIds: ['bar-counter'],
      requiresEgais: true,
      icon: '🍹',
    },
  ],
  'beauty-salon': [
    {
      id: 'basic-services',
      name: 'Базовые услуги',
      description: 'Стрижки, укладки. Базовая категория — кресло, ножницы, фен.',
      margin: 0.6,
      dailyCost: 2400,
      baseRevenue: 6000,
      requiredServices: [],
      icon: '✂️',
    },
    {
      id: 'premium-services',
      name: 'Премиум-услуги',
      description: 'Окрашивание, ламинирование. Нужна окрасочная станция + Маркет.',
      margin: 0.6,
      dailyCost: 3600,
      baseRevenue: 9000,
      requiredServices: ['market'],
      requiredUpgradeIds: ['coloring-station'],
      icon: '💎',
    },
    {
      id: 'cosmetics',
      name: 'Продажа косметики',
      description: 'Маркированная продукция в витрине. Доп. доход.',
      margin: 0.3,
      dailyCost: 2800,
      baseRevenue: 4000,
      requiredServices: ['market', 'ofd'],
      requiredUpgradeIds: ['cosmetics-shelf'],
      icon: '💄',
    },
    {
      id: 'spa',
      name: 'SPA-процедуры',
      description: 'Массаж, обёртывания. Нужна оборудованная SPA-комната.',
      margin: 0.55,
      dailyCost: 3150,
      baseRevenue: 7000,
      requiredServices: [],
      requiredUpgradeIds: ['spa-room'],
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
  const servicesOk = category.requiredServices.every((sId) => state.services?.[sId]?.isActive === true)
  const purchased = new Set(state.purchasedUpgrades ?? [])
  const upgradesOk = (category.requiredUpgradeIds ?? []).every((u) => purchased.has(u))
  return servicesOk && upgradesOk
}

// Returns a human-readable list of what's missing — used in lock UI.
export function getCategoryLockReasons(category: ProductCategory, state: GameState): string[] {
  const reasons: string[] = []
  const SERVICE_NAMES: Record<string, string> = {
    market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
    diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
  }
  for (const sId of category.requiredServices) {
    if (!state.services?.[sId]?.isActive) {
      reasons.push(`Подключить Контур.${SERVICE_NAMES[sId] ?? sId}`)
    }
  }
  const purchased = new Set(state.purchasedUpgrades ?? [])
  const upgrades = UPGRADES_CONFIG[state.businessType] ?? []
  for (const u of category.requiredUpgradeIds ?? []) {
    if (!purchased.has(u)) {
      const cfg = upgrades.find(up => up.id === u)
      reasons.push(`Купить ${cfg?.name ?? u}`)
    }
  }
  return reasons
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
    if (!allowed) {
      // Category enabled but its prerequisites aren't met (e.g. service was
      // toggled off after enabling, or save predates upgrade-gating). Don't
      // charge cost or earn revenue — show as "blocked" in breakdown so UI can
      // surface the lock reason. UI also disables the toggle for unmet items
      // so this is mainly a defence-in-depth guard.
      breakdown[cat.id] = { revenue: 0, cost: 0, fine: 0, allowed: false }
      continue
    }

    const cost = cat.dailyCost
    const revenue = cat.baseRevenue

    breakdown[cat.id] = { revenue, cost, fine: 0, allowed: true }
    totalRevenue += revenue
    totalDailyCost += cost
  }

  return { totalRevenue, totalDailyCost, breakdown }
}

export function getDefaultCategories(businessType: BusinessType): string[] {
  const cats = PRODUCT_CATEGORIES[businessType]
  if (!cats || cats.length === 0) return []
  // Default-enable categories with no dependencies (services AND upgrades both empty).
  // For shop that's "basic"; for cafe and salon every category now requires equipment,
  // so the player starts with nothing enabled and must buy first upgrade — onboarding
  // teaches this via the first tutorial moment.
  return cats
    .filter(c => c.requiredServices.length === 0 && (c.requiredUpgradeIds?.length ?? 0) === 0)
    .map(c => c.id)
}
