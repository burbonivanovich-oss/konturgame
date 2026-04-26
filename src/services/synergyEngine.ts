import type { GameState, SynergyBonus, ServiceType } from '../types/game'

// Bundle tiers replace the old 7-synergy combo system. Player sees ONE
// number: "5 active services → +35% revenue bundle bonus" instead of
// tracking which combos give which micro-percent. Each tier strictly
// cumulative on revenue only — no capacity/loyalty/tax sub-effects to
// hide in invisible math.
export const BUNDLE_TIERS = [
  { minServices: 3, revenueBonus: 0.10, label: 'Базовый бандл' },
  { minServices: 5, revenueBonus: 0.20, label: 'Расширенный бандл' },
  { minServices: 7, revenueBonus: 0.30, label: 'Полный стек Контура' },
]

export function countActiveServices(state: GameState): number {
  if (!state.services) return 0
  return Object.values(state.services).filter(s => s?.isActive).length
}

export function getActiveBundleTier(state: GameState): typeof BUNDLE_TIERS[number] | null {
  const count = countActiveServices(state)
  let active: typeof BUNDLE_TIERS[number] | null = null
  for (const tier of BUNDLE_TIERS) {
    if (count >= tier.minServices) active = tier
  }
  return active
}

// Legacy shape kept so existing callers don't have to change. All fields
// except revenueBonus are zero — the bundle is revenue-only.
interface SynergyModifiers {
  capacityBonus: number
  checkBonus: number
  reputationBonus: number
  loyaltyBonus: number
  taxSaving: number
  clientBonus: number
  revenueBonus: number
}

export function calculateSynergyModifiers(state: GameState): SynergyModifiers {
  const tier = getActiveBundleTier(state)
  return {
    capacityBonus: 0,
    checkBonus: 0,
    reputationBonus: 0,
    loyaltyBonus: 0,
    taxSaving: 0,
    clientBonus: 0,
    revenueBonus: tier?.revenueBonus ?? 0,
  }
}

// Kept for UI compatibility — returns the single active bundle as a
// pseudo-synergy so existing rendering still works.
export function getActiveSynergies(state: GameState): SynergyBonus[] {
  const tier = getActiveBundleTier(state)
  if (!tier) return []
  const allServices: ServiceType[] = ['bank', 'ofd', 'market', 'diadoc', 'fokus', 'elba', 'extern']
  return [{
    id: `bundle_${tier.minServices}`,
    name: tier.label,
    description: `${tier.minServices}+ активных сервисов: +${Math.round(tier.revenueBonus * 100)}% к выручке`,
    requiredServices: allServices.slice(0, tier.minServices),
    effects: { revenueBonus: tier.revenueBonus },
  }]
}
