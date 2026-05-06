import type { GameState } from '../types/game'
import { getEmployeeCapacityBonus } from './employeeManager'

// Quality system — simplified to two visible effects on the player:
//   1) client modifier (more/fewer customers walk in)
//   2) price premium  (higher/lower average check)
//
// Reputation and loyalty have their own mechanics (events, services,
// missed-customer penalty) and are NOT additionally modified by quality
// here. The previous "getBrandEffect" compound (rep+loy → +clients/+price/
// +revenue at >80) has been removed — three layered multipliers were
// invisible to the player and rewarded perfect play disproportionately.

export function initializeQuality(): number {
  return 50
}

const QUALITY_GRACE_WEEKS = 3  // no negative penalties for the first weeks

export function calculateQualityLevel(state: GameState): number {
  let quality = state.qualityLevel ?? 50

  if (state.employees.length > 0) {
    const empBonus = (getEmployeeCapacityBonus(state) - state.employees.length) * 10
    quality += empBonus
  }
  if (state.services?.fokus?.isActive) {
    quality += state.services.fokus.effects.reputationBonus ?? 0
  }
  if (state.services?.market?.isActive) {
    quality += 5
  }
  const hasQualityUpgrades = state.purchasedUpgrades?.some(id =>
    id.includes('quality') || id.includes('premium') || id.includes('interior')
  )
  if (hasQualityUpgrades) {
    quality += 10
  }

  return Math.max(0, Math.min(100, Math.round(quality)))
}

// Single curve, two outputs. Below 40 hurts both clients and prices;
// above 70 lifts both. 40-70 is neutral.
export function getQualityClientModifier(state: GameState): number {
  const q = calculateQualityLevel(state)
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS && q < 40) return 0
  if (q < 40) return -0.20
  if (q >= 80) return 0.20
  if (q >= 70) return 0.10
  return 0
}

export function getQualityPricePremium(state: GameState): number {
  const q = calculateQualityLevel(state)
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS && q < 40) return 0
  if (q < 40) return -0.10
  if (q >= 80) return 0.10
  if (q >= 70) return 0.05
  return 0
}

// Seasonality modifier (was in qualityModifier.ts; moved for consolidation)
export function getSeasonalityModifier(currentWeek: number, seasonality: Record<string, number>): number {
  const monthOfYear = (((currentWeek - 1) % 52) / 4.33)
  const month = Math.floor(monthOfYear) + 1
  return seasonality[month.toString()] ?? 0
}

export function updateQualityWeekly(state: GameState): void {
  const currentQuality = state.qualityLevel ?? 50
  let newQuality = currentQuality

  if (state.employees.length > 0) {
    const avgEfficiency = getEmployeeCapacityBonus(state) / state.employees.length
    if (avgEfficiency > 1.2) {
      newQuality += 1
    } else if (avgEfficiency < 0.9) {
      newQuality -= 1
    }
  }

  state.qualityLevel = Math.max(0, Math.min(100, newQuality))
}

export function checkQualityEvent(state: GameState): { type: string; effect: number } | null {
  const quality = calculateQualityLevel(state)
  if (quality >= 85 && Math.random() < 0.1) return { type: 'positive_review', effect: 5 }
  if (quality <= 25 && Math.random() < 0.15) return { type: 'customer_complaint', effect: -5 }
  return null
}
