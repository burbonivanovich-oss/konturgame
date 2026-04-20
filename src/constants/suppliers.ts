import type { Supplier, SupplierTier } from '../types/game'

export const SUPPLIERS_CONFIG: Record<string, Omit<Supplier, 'isActive' | 'unlockedDay'>> = {
  // Economy tier suppliers (cheaper, lower quality)
  supplier_economy_1: {
    id: 'supplier_economy_1',
    name: 'Опт-Эконом',
    tier: 'economy',
    qualityModifier: -0.15,
    priceModifier: -0.15,
    reliability: 0.75,
  },
  supplier_economy_2: {
    id: 'supplier_economy_2',
    name: 'Дешёвый Опт',
    tier: 'economy',
    qualityModifier: -0.2,
    priceModifier: -0.12,
    reliability: 0.7,
  },

  // Standard tier suppliers (balanced)
  supplier_standard_1: {
    id: 'supplier_standard_1',
    name: 'Надёжный Поставщик',
    tier: 'standard',
    qualityModifier: 0,
    priceModifier: 0,
    reliability: 0.9,
  },
  supplier_standard_2: {
    id: 'supplier_standard_2',
    name: 'Центр-Поставка',
    tier: 'standard',
    qualityModifier: 0.05,
    priceModifier: 0.08,
    reliability: 0.85,
  },

  // Premium tier suppliers (expensive, high quality)
  supplier_premium_1: {
    id: 'supplier_premium_1',
    name: 'Премиум-Качество',
    tier: 'premium',
    qualityModifier: 0.15,
    priceModifier: 0.2,
    reliability: 0.95,
  },
  supplier_premium_2: {
    id: 'supplier_premium_2',
    name: 'Элит-Поставки',
    tier: 'premium',
    qualityModifier: 0.2,
    priceModifier: 0.25,
    reliability: 0.98,
  },
}

export const INITIAL_SUPPLIER_ID = 'supplier_standard_1'

export function getSuppliersByTier(tier: SupplierTier): Supplier[] {
  return Object.values(SUPPLIERS_CONFIG)
    .filter(s => s.tier === tier)
    .map(s => ({
      ...s,
      isActive: false,
      unlockedDay: 0,
    }))
}

export function getAllSuppliers(): Supplier[] {
  return Object.values(SUPPLIERS_CONFIG).map(s => ({
    ...s,
    isActive: false,
    unlockedDay: 0,
  }))
}

export function getSupplierById(id: string): Supplier | undefined {
  const config = SUPPLIERS_CONFIG[id]
  if (!config) return undefined
  return {
    ...config,
    isActive: false,
    unlockedDay: 0,
  }
}
