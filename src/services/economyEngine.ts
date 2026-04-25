import type { GameState, Modifiers } from '../types/game'
import { BUSINESS_CONFIGS, MONTHLY_EXPENSES, UPGRADES_CONFIG, CAMPAIGN_DIMINISHING_FACTORS, SERVICES_CONFIG } from '../constants/business'
import { LOYALTY_CAPACITY_THRESHOLDS, LOYALTY_CAPACITY_MODIFIER } from '../constants/gameBalance'
import { calculateSynergyModifiers } from './synergyEngine'

function getPurchasedUpgradeConfigs(state: GameState) {
  if (!state.purchasedUpgrades?.length) return []
  const all = UPGRADES_CONFIG[state.businessType] ?? []
  return all.filter(u => state.purchasedUpgrades.includes(u.id))
}

export function getSeasonalModifier(businessType: string, dayNumber: number): number {
  const config = BUSINESS_CONFIGS[businessType as keyof typeof BUSINESS_CONFIGS]
  if (!config) return 0
  // Guard against dayNumber = 0; use Math.max(1, ...) to avoid invalid month calculation
  const month = ((Math.ceil(Math.max(1, dayNumber) / 30) - 1) % 12) + 1
  return config.seasonality[String(month)] ?? 0
}

export function getReputationModifier(reputation: number): number {
  if (reputation <= 20) return 0.5
  if (reputation <= 40) return 0.7
  if (reputation <= 60) return 0.9
  if (reputation <= 80) return 1.0
  return 1.1
}

export function calculateClients(baseClients: number, modifiers: Modifiers): number {
  const totalMod = 1 + modifiers.seasonal + modifiers.advertising + modifiers.event
  const clients = Math.round(baseClients * totalMod * modifiers.reputation)
  return Math.max(0, clients)
}

export function calculateCapacity(state: GameState): number {
  const config = BUSINESS_CONFIGS[state.businessType]
  const baseCapacity = config.capacity

  let capacityMod = 1.0
  if (state.services?.market?.isActive) {
    capacityMod += SERVICES_CONFIG.market.effects.capacityBonus ?? 0
  }
  if (state.loyalty > LOYALTY_CAPACITY_THRESHOLDS.HIGH) {
    capacityMod += LOYALTY_CAPACITY_MODIFIER.HIGH_BONUS
  }
  if (state.loyalty < LOYALTY_CAPACITY_THRESHOLDS.LOW) {
    capacityMod -= LOYALTY_CAPACITY_MODIFIER.LOW_PENALTY
  }

  const upgradeBonus = getCapacityUpgradesBonus(state)
  const synergyBonus = calculateSynergyModifiers(state).capacityBonus
  return Math.round(baseCapacity * (capacityMod + upgradeBonus + synergyBonus))
}

export function getCapacityUpgradesBonus(state: GameState): number {
  return getPurchasedUpgradeConfigs(state).reduce((sum, u) => sum + (u.capacityBonus ?? 0), 0)
}

export function getCheckUpgradesBonus(state: GameState): number {
  return getPurchasedUpgradeConfigs(state).reduce((sum, u) => sum + (u.checkBonus ?? 0), 0)
}

export function getClientUpgradesBonus(state: GameState): number {
  return getPurchasedUpgradeConfigs(state).reduce((sum, u) => sum + (u.clientBonus ?? 0), 0)
}

export function getLoyaltyUpgradesBonus(state: GameState): number {
  return getPurchasedUpgradeConfigs(state).reduce((sum, u) => sum + (u.loyaltyBonus ?? 0), 0)
}

export function calculateAverageCheck(baseCheck: number, modifiers: Modifiers): number {
  const totalCheckMod = 1.0 + modifiers.checkBonus + modifiers.advertisingCheckPenalty
  return Math.max(1, Math.round(baseCheck * totalCheckMod))
}

export function calculateRevenue(served: number, avgCheck: number): number {
  return served * avgCheck
}

export function calculateActiveAdModifiers(state: GameState): { clientMod: number; checkMod: number } {
  if (!state.activeAdCampaigns?.length) return { clientMod: 0, checkMod: 0 }

  // Only campaigns that are active and past their delay
  const active = state.activeAdCampaigns.filter(c =>
    c.daysRemaining > 0 && state.currentWeek >= (c.startWeek ?? state.currentWeek)
  )
  if (!active.length) return { clientMod: 0, checkMod: 0 }

  // Sort best client-effect first so diminishing returns penalise weaker campaigns
  const sorted = [...active].sort((a, b) => b.clientEffect - a.clientEffect)

  let clientMod = 0
  let checkMod = 0
  sorted.forEach((campaign, i) => {
    const factor = CAMPAIGN_DIMINISHING_FACTORS[i] ?? 0.2
    clientMod += campaign.clientEffect * factor
    checkMod += campaign.checkEffect * factor
  })
  return { clientMod, checkMod }
}

export function calculateDailySubscriptions(state: GameState): number {
  if (!state.services) return 0
  let total = 0
  for (const key of Object.keys(state.services)) {
    const service = state.services[key as keyof typeof state.services]
    if (service?.isActive) {
      total += service.annualPrice
    }
  }
  return total / 365  // Дневная стоимость от годовой подписки
}

export function calculateMonthlyExpenses(state: GameState): number {
  const base = MONTHLY_EXPENSES[state.businessType]
  let rent = base.rent
  let salary = base.baseSalary

  for (const u of getPurchasedUpgradeConfigs(state)) {
    rent += u.monthlyRentIncrease ?? 0
    salary += u.monthlySalaryIncrease ?? 0
  }

  // Subscriptions are already charged daily via calculateDailySubscriptions — do NOT add them here
  return rent + salary
}

export function buildModifiers(state: GameState): Modifiers {
  const adMods = calculateActiveAdModifiers(state)
  const synergyMods = calculateSynergyModifiers(state)

  // Service client bonuses (diadoc + fokus) + synergy client bonuses + upgrade client bonuses
  const serviceClientBonus =
    (state.services?.diadoc?.isActive ? (state.services.diadoc.effects.clientBonus ?? 0) : 0) +
    (state.services?.fokus?.isActive ? (state.services.fokus.effects.clientBonus ?? 0) : 0) +
    synergyMods.clientBonus +
    getClientUpgradesBonus(state)

  // Check bonus: market + fokus + synergy
  const serviceCheckBonus =
    (state.services?.market?.isActive ? 0.15 : 0) +
    (state.services?.fokus?.isActive ? (state.services.fokus.effects.checkBonus ?? 0) : 0) +
    synergyMods.checkBonus

  return {
    seasonal: getSeasonalModifier(state.businessType, (state.currentWeek * 7 + state.dayOfWeek)),
    advertising: adMods.clientMod + serviceClientBonus,
    reputation: getReputationModifier(state.reputation),
    event: state.temporaryClientMod ?? 0,
    capacityBonus: 0,
    checkBonus: getCheckUpgradesBonus(state) + serviceCheckBonus + (state.temporaryCheckMod ?? 0),
    advertisingCheckPenalty: adMods.checkMod,
  }
}
