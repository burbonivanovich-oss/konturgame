import type { GameState, SynergyBonus } from '../types/game'
import { SYNERGIES_CONFIG } from '../constants/business'

export function getActiveSynergies(state: GameState): SynergyBonus[] {
  return SYNERGIES_CONFIG.filter((synergy) =>
    synergy.requiredServices.every((id) => state.services[id]?.isActive === true),
  )
}

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
  const synergies = getActiveSynergies(state)
  const result: SynergyModifiers = {
    capacityBonus: 0,
    checkBonus: 0,
    reputationBonus: 0,
    loyaltyBonus: 0,
    taxSaving: 0,
    clientBonus: 0,
    revenueBonus: 0,
  }
  for (const synergy of synergies) {
    const e = synergy.effects
    result.capacityBonus += e.capacityBonus ?? 0
    result.checkBonus += e.checkBonus ?? 0
    result.reputationBonus += e.reputationBonus ?? 0
    result.loyaltyBonus += e.loyaltyBonus ?? 0
    result.taxSaving += e.taxSaving ?? 0
    result.clientBonus += e.clientBonus ?? 0
    result.revenueBonus += e.revenueBonus ?? 0
  }
  return result
}
