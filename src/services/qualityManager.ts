import type { GameState } from '../types/game'
import { getQualityModifier } from './supplierManager'
import { getEmployeeCapacityBonus } from './employeeManager'

/**
 * Initialize quality level for a new game
 */
export function initializeQuality(): number {
  return 50  // Start at average quality
}

/**
 * Calculate quality level based on all factors
 */
export function calculateQualityLevel(state: GameState): number {
  let quality = state.qualityLevel ?? 50
  
  // Factor 1: Supplier quality modifier (+/- 20 points)
  const supplierMod = getQualityModifier(state) * 100
  quality += supplierMod
  
  // Factor 2: Employee efficiency bonus
  if (state.employees.length > 0) {
    const empBonus = (getEmployeeCapacityBonus(state) - state.employees.length) * 10
    quality += empBonus
  }
  
  // Factor 3: Service bonuses
  if (state.services?.fokus?.isActive) {
    quality += state.services.fokus.effects.reputationBonus ?? 0
  }
  if (state.services?.market?.isActive) {
    quality += 5  // Market helps with inventory quality
  }
  
  // Factor 4: Upgrades
  const hasQualityUpgrades = state.purchasedUpgrades?.some(id => 
    id.includes('quality') || id.includes('premium') || id.includes('interior')
  )
  if (hasQualityUpgrades) {
    quality += 10
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(quality)))
}

const QUALITY_GRACE_WEEKS = 3  // no penalties while business is getting started

/**
 * Get reputation bonus/penalty based on quality
 */
export function getQualityReputationBonus(state: GameState): number {
  const quality = calculateQualityLevel(state)

  if (quality >= 80) return 2
  if (quality >= 60) return 1
  // No penalties during the grace period
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -2
  if (quality <= 45) return -1
  return 0
}

/**
 * Get loyalty bonus/penalty based on quality
 */
export function getQualityLoyaltyBonus(state: GameState): number {
  const quality = calculateQualityLevel(state)

  if (quality >= 80) return 3
  if (quality >= 60) return 1
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -3
  if (quality <= 45) return -1
  return 0
}

/**
 * Get price premium based on quality (customers pay more for quality)
 */
export function getQualityPricePremium(state: GameState): number {
  const quality = calculateQualityLevel(state)

  if (quality >= 80) return 0.15
  if (quality >= 60) return 0.08
  if ((state.currentWeek ?? 0) <= QUALITY_GRACE_WEEKS) return 0
  if (quality <= 30) return -0.15
  if (quality <= 45) return -0.08
  return 0
}

/**
 * Update quality based on weekly events
 */
export function updateQualityWeekly(state: GameState): void {
  const currentQuality = state.qualityLevel ?? 50
  
  // Natural decay towards baseline (50) if no active management
  let newQuality = currentQuality
  
  // If using premium supplier, quality slowly increases
  const supplierMod = getQualityModifier(state)
  if (supplierMod > 0) {
    newQuality += 1
  } else if (supplierMod < 0) {
    newQuality -= 1
  }
  
  // Employee impact
  if (state.employees.length > 0) {
    const avgEfficiency = getEmployeeCapacityBonus(state) / state.employees.length
    if (avgEfficiency > 1.2) {
      newQuality += 1
    } else if (avgEfficiency < 0.9) {
      newQuality -= 1
    }
  }
  
  // Clamp and update
  state.qualityLevel = Math.max(0, Math.min(100, newQuality))
}

/**
 * Quality-based event triggers
 */
export function checkQualityEvent(state: GameState): { type: string; effect: number } | null {
  const quality = calculateQualityLevel(state)
  
  // Very high quality: positive review event
  if (quality >= 85 && Math.random() < 0.1) {
    return { type: 'positive_review', effect: 5 }
  }
  
  // Very low quality: complaint event
  if (quality <= 25 && Math.random() < 0.15) {
    return { type: 'customer_complaint', effect: -5 }
  }
  
  return null
}
