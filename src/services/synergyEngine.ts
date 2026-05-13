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
  taxSaving: number
  clientBonus: number
  revenueBonus: number
}

// loyaltyBonus убран — лояльность как скаляр выпилена. Если в SynergyBonus.effects
// прилетит loyaltyBonus (legacy конфиг), он молча игнорируется.
export function calculateSynergyModifiers(state: GameState): SynergyModifiers {
  const synergies = getActiveSynergies(state)
  const result: SynergyModifiers = {
    capacityBonus: 0,
    checkBonus: 0,
    reputationBonus: 0,
    taxSaving: 0,
    clientBonus: 0,
    revenueBonus: 0,
  }
  for (const synergy of synergies) {
    const e = synergy.effects
    result.capacityBonus += e.capacityBonus ?? 0
    result.checkBonus += e.checkBonus ?? 0
    // Старые loyaltyBonus синергии переадресуем в reputationBonus × 0.5.
    result.reputationBonus += (e.reputationBonus ?? 0) + (e.loyaltyBonus ?? 0) * 0.5
    result.taxSaving += e.taxSaving ?? 0
    result.clientBonus += e.clientBonus ?? 0
    result.revenueBonus += e.revenueBonus ?? 0
  }
  return result
}
