import type { GameState, DayResult } from '../types/game'
import { BUSINESS_CONFIGS, ECONOMY_CONSTANTS } from '../constants/business'
import {
  buildModifiers,
  calculateClients,
  calculateCapacity,
  calculateAverageCheck,
  calculateRevenue,
  calculateDailySubscriptions,
  calculateMonthlyExpenses,
} from './economyEngine'
import { consumeStock, checkExpiry, getTotalStock } from './stockManager'
import { generateEvent } from './eventGenerator'
import {
  checkBankruptcy,
  checkReputationLoss,
  checkVictory,
  updateGameOverCounters,
  getLevelForExperience,
} from './victoryChecker'
import { calculateSynergyModifiers } from './synergyEngine'
import { checkNewAchievements } from './achievementChecker'
import { checkOnboardingBlocked, advanceOnboardingIfNeeded } from './onboardingEngine'
import { calculatePainLosses, getBankPaymentRatio } from './painEngine'
import { getTotalThroughput, calculateRegisterPenalty, checkRegisterBreakdown } from './cashRegisterEngine'
import { calculateCategoryRevenue } from './assortmentEngine'

export function checkDayBlocked(state: GameState): { blocked: boolean; reason?: string } {
  if (state.pendingEvent) {
    return { blocked: true, reason: 'Сначала решите событие' }
  }

  // Onboarding gates
  const onboardingCheck = checkOnboardingBlocked(state)
  if (onboardingCheck.blocked) {
    return { blocked: true, reason: onboardingCheck.reason }
  }

  const config = BUSINESS_CONFIGS[state.businessType]
  // Only block for empty stock if not using assortment system
  if (config.hasStock && !config.usesAssortment && getTotalStock(state) === 0) {
    return { blocked: true, reason: 'Склад пуст. Сделайте закупку.' }
  }

  return { blocked: false }
}

export function processDay(state: GameState): DayResult {
  if (state.isGameOver || state.isVictory) {
    throw new Error('Игра уже завершена')
  }

  const config = BUSINESS_CONFIGS[state.businessType]
  const modifiers = buildModifiers(state)
  const synergyMods = calculateSynergyModifiers(state)

  // 1. Check expiry before calculations (for stock-based businesses)
  const { loss: expiredLoss } = checkExpiry(state)

  // 2. Competitor event on day 20 (one-time, -15% traffic for 10 days)
  if (state.currentWeek === ECONOMY_CONSTANTS.COMPETITOR_EVENT_WEEK && !state.competitorEventTriggered) {
    state.competitorEventTriggered = true
    // Apply competitor effect as temporary client modifier
    if ((state.temporaryModDaysLeft ?? 0) === 0) {
      state.temporaryClientMod = -ECONOMY_CONSTANTS.COMPETITOR_TRAFFIC_STEAL_PCT
      state.temporaryModDaysLeft = ECONOMY_CONSTANTS.COMPETITOR_EFFECT_WEEKS
    }
  }

  // 3. Calculate total clients
  const totalClients = calculateClients(config.baseClients, modifiers)

  // 4. Calculate capacity
  const capacity = calculateCapacity(state)

  // 5. Served limited by capacity and available stock
  let served = Math.min(totalClients, capacity)
  if (config.hasStock && !config.usesAssortment) {
    const availableStock = getTotalStock(state)
    served = Math.min(served, availableStock)
  }
  const missed = totalClients - served

  // 6. Bank payment ratio — 40% customers can't pay without bank
  const bankPaymentRatio = getBankPaymentRatio(state)
  const effectiveServed = Math.floor(served * bankPaymentRatio)

  // 7. Average check
  const avgCheck = calculateAverageCheck(config.avgCheck, modifiers)

  // 8. Revenue calculation — assortment-based or classic
  let revenue: number
  let categoryFines: Record<string, number> = {}
  let totalDailyCategoryCost = 0
  let totalCategoryRevenue = 0

  if (config.usesAssortment && (state.enabledCategories?.length ?? 0) > 0) {
    const catResult = calculateCategoryRevenue(state)
    totalCategoryRevenue = catResult.totalRevenue
    totalDailyCategoryCost = catResult.totalDailyCost

    // Apply bank ratio and synergy bonus to category revenue
    const baseRevenue = Math.round(totalCategoryRevenue * bankPaymentRatio)
    revenue = Math.round(baseRevenue * (1 + synergyMods.revenueBonus))

    // Collect fines for non-compliant categories
    for (const [catId, data] of Object.entries(catResult.breakdown)) {
      if (data.fine > 0) categoryFines[catId] = data.fine
    }
  } else {
    // Classic revenue: served × avgCheck
    const baseRevenue = calculateRevenue(effectiveServed, avgCheck)
    revenue = Math.round(baseRevenue * (1 + synergyMods.revenueBonus))
    totalCategoryRevenue = revenue
  }

  // 9. Cash register throughput penalty
  const registerThroughput = getTotalThroughput(state.cashRegisters, state)
  const registerOverflowPenalty = registerThroughput > 0
    ? calculateRegisterPenalty(served, registerThroughput, revenue)
    : 0

  // Register breakdown — lose 15% revenue that day
  const registerBroke = checkRegisterBreakdown(state.cashRegisters)
  const breakdownPenalty = registerBroke ? Math.round(revenue * 0.15) : 0

  revenue = Math.max(0, revenue - registerOverflowPenalty - breakdownPenalty)

  // 10. Consume stock (FIFO) for non-assortment businesses
  let purchaseCost = 0
  if (config.hasStock && !config.usesAssortment && served > 0) {
    const result = consumeStock(state, served)
    purchaseCost = result.cost
  }
  // For assortment businesses, daily category costs replace stock purchasing
  purchaseCost += totalDailyCategoryCost

  // 11. Category fines added to expenses
  const totalCategoryFines = Object.values(categoryFines).reduce((s, v) => s + v, 0)

  // 12. Tax (reduced by Extern service and synergy)
  const taxSaving =
    (state.services?.extern?.isActive ? (state.services.extern.effects.taxSaving ?? 0) : 0) +
    synergyMods.taxSaving
  const effectiveTaxRate = Math.max(0, ECONOMY_CONSTANTS.TAX_RATE - taxSaving)
  const tax = Math.round(revenue * effectiveTaxRate)

  // 13. Daily subscription cost
  const subscriptionCost = calculateDailySubscriptions(state)

  // 14. Fixed daily costs
  const totalRegisters = state.cashRegisters?.reduce((s, r) => s + r.count, 0) ?? 0
  const dailyUtilities = ECONOMY_CONSTANTS.DAILY_UTILITIES
  const dailyRegisterMaintenance = totalRegisters * ECONOMY_CONSTANTS.DAILY_REGISTER_MAINTENANCE
  const dailyFixedCosts = dailyUtilities + dailyRegisterMaintenance

  // 15. Monthly expenses every 30 days (rent + salary)
  let monthlyExpense = 0
  const daysSinceMonthly = state.daysSinceLastMonthly ?? 0
  if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS) {
    monthlyExpense = calculateMonthlyExpenses(state)
  }

  // 16. Net profit (before pain losses)
  const expenses = tax + subscriptionCost + purchaseCost + monthlyExpense + expiredLoss +
    dailyFixedCosts + totalCategoryFines
  let netProfit = revenue - expenses

  // 17. Pain losses from missing services
  const pain = calculatePainLosses(state, revenue, netProfit, totalCategoryRevenue)
  // Bank pain is already baked in via bankPaymentRatio, don't double-count
  const additionalPainLoss = pain.market + pain.ofd + pain.diadoc + pain.fokus + pain.elba + pain.extern
  netProfit = netProfit - additionalPainLoss
  const totalExpenses = expenses + additionalPainLoss

  // 18. Reputation change
  const repFromMissed = -(missed * 0.2)
  const fokusRepBonus = state.services?.fokus?.isActive
    ? (state.services.fokus.effects.reputationBonus ?? 0)
    : 0
  const reputationChange = Math.round(repFromMissed + fokusRepBonus + synergyMods.reputationBonus)

  // 19. Loyalty change from overloading
  const elbaActive = state.services?.elba?.isActive ?? false
  let loyaltyChange = 0
  const load = capacity > 0 ? served / capacity : 0
  if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
    const newOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
    if (newOverloadDays >= ECONOMY_CONSTANTS.OVERLOAD_DAYS_FOR_LOYALTY_PENALTY) {
      const penalty = elbaActive
        ? -(ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY * 0.5)
        : -ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY
      loyaltyChange = Math.round(penalty)
    }
  }
  const elbaLoyaltyBonus = elbaActive ? (state.services.elba.effects.loyaltyBonus ?? 0) : 0
  loyaltyChange += elbaLoyaltyBonus + synergyMods.loyaltyBonus

  const newBalance = state.balance + netProfit
  const newReputation = Math.max(0, Math.min(100, state.reputation + reputationChange))
  const newLoyalty = Math.max(0, Math.min(100, state.loyalty + loyaltyChange))

  const result: DayResult = {
    dayNumber: state.currentWeek,
    clients: totalClients,
    served,
    missed,
    revenue,
    expenses: totalExpenses,
    tax,
    subscriptionCost,
    purchaseCost,
    monthlyExpense,
    expiredLoss,
    netProfit,
    balance: newBalance,
    reputationChange,
    loyaltyChange,
    stockAfter: getTotalStock(state),
    // Pain losses
    painLossBankMissed: pain.bank,
    painLossMarketInventory: pain.market,
    painLossOfdFine: pain.ofd,
    painLossDiadocDelay: pain.diadoc,
    painLossFokusBadSupplier: pain.fokus,
    painLossElbaFine: pain.elba,
    painLossExternBlock: pain.extern,
    // Register
    registerOverflowPenalty: registerOverflowPenalty + breakdownPenalty,
    // Categories
    categoryFines,
  }

  // --- Apply results to state ---
  state.balance = newBalance
  state.reputation = newReputation
  state.loyalty = newLoyalty
  state.lastDayResult = result
  state.lastDayPainLosses = pain

  // Update overload counter
  if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
    state.consecutiveOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
  } else {
    state.consecutiveOverloadDays = 0
  }

  // Update daysBalanceNegative
  if (newBalance < 0) {
    state.daysBalanceNegative = (state.daysBalanceNegative ?? 0) + 1
  } else {
    state.daysBalanceNegative = 0
  }

  // Update monthly counter
  if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS) {
    state.daysSinceLastMonthly = 0
  } else {
    state.daysSinceLastMonthly = daysSinceMonthly + 1
  }

  // Decrement temporary event modifiers
  if ((state.temporaryModDaysLeft ?? 0) > 0) {
    state.temporaryModDaysLeft -= 1
    if (state.temporaryModDaysLeft === 0) {
      state.temporaryClientMod = 0
      state.temporaryCheckMod = 0
    }
  }

  // Decrement active ad campaigns
  if (state.activeAdCampaigns?.length) {
    state.activeAdCampaigns = state.activeAdCampaigns
      .map((c) => ({ ...c, daysRemaining: c.daysRemaining - 1 }))
      .filter((c) => c.daysRemaining > 0)
  }

  // Track achievement helper fields
  if (state.reputation <= 20) {
    state.hadLowReputation = true
  }
  if (expiredLoss === 0) {
    state.consecutiveNoExpiry = (state.consecutiveNoExpiry ?? 0) + 1
  } else {
    state.consecutiveNoExpiry = 0
  }

  // Advance game day
  state.currentWeek += 1
  state.purchaseOfferedThisDay = false

  // Update reputation-zero counter
  updateGameOverCounters(state)

  // Gain experience
  state.experience += ECONOMY_CONSTANTS.EXPERIENCE_PER_WEEK
  if (netProfit > 0) {
    state.experience += Math.floor(netProfit / 10000) * ECONOMY_CONSTANTS.EXPERIENCE_PER_10K_PROFIT
  }
  state.level = getLevelForExperience(state.experience)

  // Check game over / victory
  if (checkBankruptcy(state)) {
    state.isGameOver = true
    state.gameOverReason = 'bankruptcy'
  } else if (checkReputationLoss(state)) {
    state.isGameOver = true
    state.gameOverReason = 'reputation'
  } else if (checkVictory(state)) {
    state.isVictory = true
  }

  // Check and grant new achievements
  const newAchievements = checkNewAchievements(state)
  for (const id of newAchievements) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id)
    }
  }

  // Advance onboarding stage if day threshold reached
  advanceOnboardingIfNeeded(state)

  // Generate new event(s) if game is still active
  if (!state.isGameOver && !state.isVictory && !state.pendingEvent) {
    const isCrisisDay = state.currentWeek % 9 === 0
    const firstEvent = generateEvent(state.currentWeek, state)

    if (firstEvent) {
      state.pendingEvent = firstEvent

      if (isCrisisDay) {
        const usedIds = new Set([firstEvent.id])
        const queue: typeof firstEvent[] = []
        for (let attempt = 0; attempt < 10 && queue.length < 2; attempt++) {
          const extra = generateEvent(state.currentWeek, state)
          if (extra && !usedIds.has(extra.id)) {
            usedIds.add(extra.id)
            queue.push(extra)
          }
        }
        state.pendingEventsQueue = queue
      }
    }
  }

  state.lastUpdated = Date.now()

  return result
}
