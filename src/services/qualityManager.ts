import type { GameState } from '../types/game'
import { getEmployeeCapacityBonus } from './employeeManager'

// Quality system — consolidated from qualityManager + qualityModifier.
// One number 0-100 representing how well the business runs (kept in
// state.qualityLevel). All quality- and brand-related effects live here.

export function initializeQuality(): number {
  return 50  // average baseline
}

const QUALITY_GRACE_WEEKS = 3  // no penalties while business is getting started

// Quality is computed from inputs (services, employees, upgrades) on demand.
// state.qualityLevel is the persistent baseline that drifts weekly via
// updateQualityWeekly; the daily computed value adds context-specific bonuses.
export function calculateQualityLevel(state: GameState): number {
  let quality = state.qualityLevel ?? 50

  // Employee efficiency bonus (efficient team raises quality)
  if (state.employees.length > 0) {
    const empBonus = (getEmployeeCapacityBonus(state) - state.employees.length) * 10
    quality += empBonus
  }

  // Service bonuses
  if (state.services?.fokus?.isActive) {
    quality += state.services.fokus.effects.reputationBonus ?? 0
  }
  if (state.services?.market?.isActive) {
    quality += 5  // Market helps with inventory quality
  }

  // Upgrades that explicitly target quality
  const hasQualityUpgrades = state.purchasedUpgrades?.some(id =>
    id.includes('quality') || id.includes('premium') || id.includes('interior')
  )
  if (hasQualityUpgrades) {
    quality += 10
  }

  return Math.max(0, Math.min(100, Math.round(quality)))
}

export function getQualityReputationBonus(state: GameState): number {
  const quality = calculateQualityLevel(state)
  if (quality >= 80) return 2
  if (quality >= 60) return 1
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -2
  if (quality <= 45) return -1
  return 0
}

export function getQualityLoyaltyBonus(state: GameState): number {
  const quality = calculateQualityLevel(state)
  if (quality >= 80) return 1
  if (quality >= 60) return 0.5
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -2
  if (quality <= 45) return -1
  return 0
}

export function getQualityPricePremium(state: GameState): number {
  const quality = calculateQualityLevel(state)
  if (quality >= 80) return 0.15
  if (quality >= 60) return 0.08
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -0.15
  if (quality <= 45) return -0.08
  return 0
}

// Client-side modifier from quality level (formerly in qualityModifier.ts)
export function getQualityClientModifier(qualityLevel: number): number {
  if (qualityLevel < 40) return -0.3
  if (qualityLevel < 70) return -0.1
  return 0.2
}

// Brand effect — combined rep+loy bonus. Was a hidden compound multiplier
// (rep>80 AND loy>80 → +40% clients +30% revenue +10% price = ×2 at top).
// Simplified to a smooth function of the average and capped at moderate
// numbers so it stops compounding into "everything goes infinite for the
// best player". Single visible field per UI.
export function getBrandEffect(reputation: number, loyalty: number): {
  clientMod: number
  revenueMod: number
  priceMod: number
  isBrand: boolean
} {
  const avg = (reputation + loyalty) / 2
  if (avg >= 80) {
    return { clientMod: 0.20, revenueMod: 0.05, priceMod: 0.05, isBrand: true }
  }
  if (avg >= 60) {
    return { clientMod: 0.10, revenueMod: 0, priceMod: 0.02, isBrand: false }
  }
  return { clientMod: 0, revenueMod: 0, priceMod: 0, isBrand: false }
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

  // Employee impact
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
