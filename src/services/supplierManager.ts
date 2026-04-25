import type { GameState } from '../types/game'

// Supplier system is currently dormant — state.suppliers is empty in practice.
// This single helper survives because qualityManager imports it; with no active
// supplier it always returns 0 (neutral).
export function getQualityModifier(state: GameState): number {
  if (!state.activeSupplierId) return 0
  const supplier = state.suppliers.find(s => s.id === state.activeSupplierId)
  return supplier?.qualityModifier ?? 0
}
