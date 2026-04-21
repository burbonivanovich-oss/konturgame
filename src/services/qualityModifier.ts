import type { GameState } from '../types/game'

/**
 * Get client modifier based on quality level
 * - Quality < 40%: -30% clients (terrible reputation)
 * - Quality 40-70%: -10% clients (mediocre)
 * - Quality 70-100%: +20% clients (good reputation & recommendations)
 * - Quality > 80%: additional +15% price premium
 */
export function getQualityClientModifier(qualityLevel: number): number {
  if (qualityLevel < 40) return -0.3
  if (qualityLevel < 70) return -0.1
  return 0.2
}

/**
 * Get price modifier from high quality
 * - Quality > 80%: can charge +15% premium
 */
export function getQualityPriceModifier(qualityLevel: number): number {
  if (qualityLevel > 80) return 0.15
  return 0
}

/**
 * Get season modifier based on week of year
 * Uses the seasonality config for the business
 */
export function getSeasonalityModifier(currentWeek: number, seasonality: Record<string, number>): number {
  const monthOfYear = ((currentWeek % 52) / 4.33) // ~4.33 weeks per month, convert week to month
  const month = Math.floor(monthOfYear) + 1 // 1-12
  const monthKey = month.toString()

  return seasonality[monthKey] ?? 0
}

/**
 * Get brand effect modifier
 * High reputation + High loyalty = "Legendary brand" effect
 * - Reputation > 80% AND Loyalty > 80%: +40% clients, +30% revenue, +10% price
 * - Reputation > 80% BUT Loyalty < 40%: "Known but not trusted" = no bonuses
 */
export function getBrandEffect(reputation: number, loyalty: number): {
  clientMod: number
  revenueMod: number
  priceMod: number
  isBrand: boolean
} {
  const isHighReputation = reputation > 80
  const isHighLoyalty = loyalty > 80
  const isLowLoyalty = loyalty < 40

  if (isHighReputation && isHighLoyalty) {
    return {
      clientMod: 0.4,
      revenueMod: 0.3,
      priceMod: 0.1,
      isBrand: true,
    }
  }

  if (isHighReputation && isLowLoyalty) {
    // "Known but not trusted" - no bonuses
    return {
      clientMod: 0,
      revenueMod: 0,
      priceMod: 0,
      isBrand: false,
    }
  }

  return {
    clientMod: 0,
    revenueMod: 0,
    priceMod: 0,
    isBrand: false,
  }
}
