import type { GameState, Supplier, SupplierTier } from '../types/game'
import { SUPPLIERS_CONFIG, INITIAL_SUPPLIER_ID } from '../constants/suppliers'

/**
 * Initialize suppliers for a new game
 */
export function initializeSuppliers(): Supplier[] {
  return Object.values(SUPPLIERS_CONFIG).map(s => ({
    ...s,
    isActive: s.id === INITIAL_SUPPLIER_ID,
    unlockedDay: 1,
  }))
}

/**
 * Get active supplier from game state
 */
export function getActiveSupplier(state: GameState): Supplier | null {
  if (!state.activeSupplierId) return null
  return state.suppliers.find(s => s.id === state.activeSupplierId) || null
}

/**
 * Change active supplier
 */
export function switchSupplier(state: GameState, supplierId: string): boolean {
  const supplier = state.suppliers.find(s => s.id === supplierId)
  if (!supplier) return false
  
  // Deactivate all suppliers
  state.suppliers.forEach(s => {
    s.isActive = false
  })
  
  // Activate selected supplier
  supplier.isActive = true
  state.activeSupplierId = supplierId
  
  return true
}

/**
 * Get price modifier from active supplier
 */
export function getPriceModifier(state: GameState): number {
  const supplier = getActiveSupplier(state)
  return supplier?.priceModifier ?? 0
}

/**
 * Get quality modifier from active supplier
 */
export function getQualityModifier(state: GameState): number {
  const supplier = getActiveSupplier(state)
  return supplier?.qualityModifier ?? 0
}

/**
 * Check if delivery is on-time based on supplier reliability
 */
export function checkDeliverySuccess(state: GameState): boolean {
  const supplier = getActiveSupplier(state)
  if (!supplier) return true // Default supplier always delivers
  
  return Math.random() < supplier.reliability
}

/**
 * Unlock new suppliers based on week/reputation
 */
export function unlockSuppliersIfNeeded(state: GameState): void {
  const currentDay = state.currentWeek * 7 + state.dayOfWeek
  
  // Unlock economy suppliers at start
  // Unlock standard suppliers at week 2
  if (state.currentWeek >= 2) {
    state.suppliers.forEach(s => {
      if (s.tier === 'standard' && s.unlockedDay === 0) {
        s.unlockedDay = currentDay
      }
    })
  }
  
  // Unlock premium suppliers at week 4 or reputation 60+
  if (state.currentWeek >= 4 || state.reputation >= 60) {
    state.suppliers.forEach(s => {
      if (s.tier === 'premium' && s.unlockedDay === 0) {
        s.unlockedDay = currentDay
      }
    })
  }
}

/**
 * Get available suppliers (unlocked)
 */
export function getAvailableSuppliers(state: GameState): Supplier[] {
  return state.suppliers.filter(s => s.unlockedDay > 0)
}

/**
 * Get suppliers by tier
 */
export function getSuppliersByTier(state: GameState, tier: SupplierTier): Supplier[] {
  return state.suppliers.filter(s => s.tier === tier && s.unlockedDay > 0)
}

/**
 * Calculate stock cost with supplier modifier
 */
export function calculateStockCost(baseCost: number, state: GameState): number {
  const modifier = getPriceModifier(state)
  return Math.round(baseCost * (1 + modifier))
}

/**
 * Event: Supplier issues (late delivery, quality problems)
 */
export function triggerSupplierEvent(state: GameState): { type: string; effect: number } | null {
  const supplier = getActiveSupplier(state)
  if (!supplier) return null
  
  // Check for late delivery
  if (!checkDeliverySuccess(state)) {
    return { type: 'late_delivery', effect: -0.3 } // 30% less stock received
  }
  
  return null
}
