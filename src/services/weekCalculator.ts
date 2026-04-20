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

export function checkWeekBlocked(state: GameState): { blocked: boolean; reason?: string } {
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

// Simplified week calculation: accumulate 7 daily cycles
export function processWeek(state: GameState): DayResult {
  if (state.isGameOver || state.isVictory) {
    throw new Error('Игра уже завершена')
  }

  const config = BUSINESS_CONFIGS[state.businessType]

  // Accumulate results for the week
  let weekRevenue = 0
  let weekExpenses = 0
  let weekNetProfit = 0
  let weekRepChange = 0
  let weekLoyaltyChange = 0
  let totalDaysWithoutExpiry = 0

  // Process each day of the week (7 iterations)
  for (let dayNum = 0; dayNum < 7; dayNum++) {
    const modifiers = buildModifiers(state)
    const synergyMods = calculateSynergyModifiers(state)

    // 1. Check expiry
    const { loss: expiredLoss } = checkExpiry(state)

    // 2. Competitor event on week 3 (one-time)
    if (state.currentWeek === ECONOMY_CONSTANTS.COMPETITOR_EVENT_WEEK && !state.competitorEventTriggered) {
      state.competitorEventTriggered = true
      if ((state.temporaryModDaysLeft ?? 0) === 0) {
        state.temporaryClientMod = -ECONOMY_CONSTANTS.COMPETITOR_TRAFFIC_STEAL_PCT
        state.temporaryModDaysLeft = ECONOMY_CONSTANTS.COMPETITOR_EFFECT_WEEKS * 7
      }
    }

    // 3. Calculate daily metrics
    const totalClients = calculateClients(config.baseClients, modifiers)
    const capacity = calculateCapacity(state)
    let served = Math.min(totalClients, capacity)
    if (config.hasStock && !config.usesAssortment) {
      const availableStock = getTotalStock(state)
      served = Math.min(served, availableStock)
    }
    const missed = totalClients - served

    // 4. Bank payment ratio
    const bankPaymentRatio = getBankPaymentRatio(state)
    const effectiveServed = Math.floor(served * bankPaymentRatio)

    // 5. Average check
    const avgCheck = calculateAverageCheck(config.avgCheck, modifiers)

    // 6. Revenue (daily)
    let dailyRevenue: number
    let categoryFines: Record<string, number> = {}
    let totalDailyCategoryCost = 0

    if (config.usesAssortment && (state.enabledCategories?.length ?? 0) > 0) {
      const catResult = calculateCategoryRevenue(state)
      const baseRevenue = Math.round(catResult.totalRevenue * bankPaymentRatio)
      dailyRevenue = Math.round(baseRevenue * (1 + synergyMods.revenueBonus))
      totalDailyCategoryCost = catResult.totalDailyCost
      for (const [catId, data] of Object.entries(catResult.breakdown)) {
        if (data.fine > 0) categoryFines[catId] = data.fine
      }
    } else {
      const baseRevenue = calculateRevenue(effectiveServed, avgCheck)
      dailyRevenue = Math.round(baseRevenue * (1 + synergyMods.revenueBonus))
    }

    // 7. Register penalty
    const registerThroughput = getTotalThroughput(state.cashRegisters, state)
    const registerPenalty = registerThroughput > 0
      ? calculateRegisterPenalty(served, registerThroughput, dailyRevenue)
      : 0

    const registerBroke = checkRegisterBreakdown(state.cashRegisters)
    const breakdownPenalty = registerBroke ? Math.round(dailyRevenue * 0.15) : 0

    const dayRevenue = Math.max(0, dailyRevenue - registerPenalty - breakdownPenalty)

    // 8. Stock and costs
    let purchaseCost = 0
    if (config.hasStock && !config.usesAssortment && served > 0) {
      const result = consumeStock(state, served)
      purchaseCost = result.cost
    }
    purchaseCost += totalDailyCategoryCost

    const totalCategoryFines = Object.values(categoryFines).reduce((s, v) => s + v, 0)

    // 9. Taxes
    const taxSaving =
      (state.services?.extern?.isActive ? (state.services.extern.effects.taxSaving ?? 0) : 0) +
      synergyMods.taxSaving
    const effectiveTaxRate = Math.max(0, ECONOMY_CONSTANTS.TAX_RATE - taxSaving)
    const dayTax = Math.round(dayRevenue * effectiveTaxRate)

    // 10. Daily subscriptions (1/30 of monthly)
    const subscriptionCost = calculateDailySubscriptions(state)

    // 11. Fixed daily costs
    const totalRegisters = state.cashRegisters?.reduce((s, r) => s + r.count, 0) ?? 0
    const dailyUtilities = ECONOMY_CONSTANTS.DAILY_UTILITIES
    const dailyRegisterMaintenance = totalRegisters * ECONOMY_CONSTANTS.DAILY_REGISTER_MAINTENANCE
    const dailyFixedCosts = dailyUtilities + dailyRegisterMaintenance

    // 12. Monthly expenses (every week 4, approximate every 28 days)
    let monthlyExpense = 0
    const daysSinceMonthly = state.daysSinceLastMonthly ?? 0
    if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7) {
      monthlyExpense = calculateMonthlyExpenses(state)
    }

    // 13. Daily profit
    const dayExpenses = dayTax + subscriptionCost + purchaseCost + monthlyExpense + expiredLoss +
      dailyFixedCosts + totalCategoryFines
    let dayNetProfit = dayRevenue - dayExpenses

    // 14. Pain losses
    const pain = calculatePainLosses(state, dayRevenue, dayNetProfit, dayRevenue)
    const additionalPainLoss = pain.market + pain.ofd + pain.diadoc + pain.fokus + pain.elba + pain.extern
    dayNetProfit -= additionalPainLoss

    // 15. Reputation change
    const repFromMissed = -(missed * 0.2)
    const fokusRepBonus = state.services?.fokus?.isActive
      ? (state.services.fokus.effects.reputationBonus ?? 0)
      : 0
    const dayRepChange = Math.round(repFromMissed + fokusRepBonus + synergyMods.reputationBonus)

    // 16. Loyalty change
    const elbaActive = state.services?.elba?.isActive ?? false
    let dayLoyaltyChange = 0
    const load = capacity > 0 ? served / capacity : 0
    if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
      const newOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
      if (newOverloadDays >= ECONOMY_CONSTANTS.OVERLOAD_DAYS_FOR_LOYALTY_PENALTY) {
        const penalty = elbaActive
          ? -(ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY * 0.5)
          : -ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY
        dayLoyaltyChange = Math.round(penalty)
      }
    }
    const elbaLoyaltyBonus = elbaActive ? (state.services.elba.effects.loyaltyBonus ?? 0) : 0
    dayLoyaltyChange += elbaLoyaltyBonus + synergyMods.loyaltyBonus

    // 17. Accumulate week results
    weekRevenue += dayRevenue
    weekExpenses += dayExpenses + additionalPainLoss
    weekNetProfit += dayNetProfit
    weekRepChange += dayRepChange
    weekLoyaltyChange += dayLoyaltyChange

    if (expiredLoss === 0) {
      totalDaysWithoutExpiry += 1
    }

    // 18. Decrement temporary modifiers
    if ((state.temporaryModDaysLeft ?? 0) > 0) {
      state.temporaryModDaysLeft -= 1
      if (state.temporaryModDaysLeft === 0) {
        state.temporaryClientMod = 0
        state.temporaryCheckMod = 0
      }
    }

    // 19. Update monthly counter
    if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7) {
      state.daysSinceLastMonthly = 0
    } else {
      state.daysSinceLastMonthly = daysSinceMonthly + 1
    }
  } // End of week loop

  // Apply week results to state
  const newBalance = state.balance + weekNetProfit
  const newReputation = Math.max(0, Math.min(100, state.reputation + weekRepChange))
  const newLoyalty = Math.max(0, Math.min(100, state.loyalty + weekLoyaltyChange))

  // Check if entrepreneur energy reached 0 (end of week)
  if (state.entrepreneurEnergy <= 0) {
    state.isGameOver = true
    state.gameOverReason = 'burnout'
  }

  // Advance to next week
  state.currentWeek += 1
  state.dayOfWeek = 0
  state.weeklyEnergyRestored = false
  state.balance = newBalance
  state.reputation = newReputation
  state.loyalty = newLoyalty
  state.purchaseOfferedThisDay = false
  state.lastUpdated = Date.now()

  // Create result
  const result: DayResult = {
    dayNumber: state.currentWeek - 1,  // Report previous week
    clients: Math.round(weekRevenue / (300 * 0.7)), // Estimate from revenue
    served: 0,  // Not tracked in week mode
    missed: 0,
    revenue: weekRevenue,
    expenses: weekExpenses,
    tax: 0,  // Accumulated in week
    subscriptionCost: 0,
    purchaseCost: 0,
    monthlyExpense: 0,
    expiredLoss: 0,
    netProfit: weekNetProfit,
    balance: newBalance,
    reputationChange: weekRepChange,
    loyaltyChange: weekLoyaltyChange,
    stockAfter: getTotalStock(state),
    painLossBankMissed: 0,
    painLossMarketInventory: 0,
    painLossOfdFine: 0,
    painLossDiadocDelay: 0,
    painLossFokusBadSupplier: 0,
    painLossElbaFine: 0,
    painLossExternBlock: 0,
    registerOverflowPenalty: 0,
    categoryFines: {},
  }

  // Update counters
  if (newBalance < 0) {
    state.daysBalanceNegative = (state.daysBalanceNegative ?? 0) + 1
  } else {
    state.daysBalanceNegative = 0
  }

  // Track achievement helpers
  if (newReputation <= 20) {
    state.hadLowReputation = true
  }
  if (totalDaysWithoutExpiry >= 6) {  // 6+ days of 7 without expiry
    state.consecutiveNoExpiry = (state.consecutiveNoExpiry ?? 0) + 1
  } else {
    state.consecutiveNoExpiry = 0
  }

  // Decrement ad campaigns by 7 days
  if (state.activeAdCampaigns?.length) {
    state.activeAdCampaigns = state.activeAdCampaigns
      .map((c) => ({ ...c, daysRemaining: Math.max(0, c.daysRemaining - 7) }))
      .filter((c) => c.daysRemaining > 0)
  }

  // Gain experience (7 days + profit bonus)
  state.experience += ECONOMY_CONSTANTS.EXPERIENCE_PER_WEEK
  if (weekNetProfit > 0) {
    state.experience += Math.floor(weekNetProfit / 10000) * ECONOMY_CONSTANTS.EXPERIENCE_PER_10K_PROFIT
  }
  state.level = getLevelForExperience(state.experience)

  // Update reputation-zero counter
  updateGameOverCounters(state)

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

  // Advance onboarding stage if needed
  advanceOnboardingIfNeeded(state)

  // Generate new event(s) at end of week
  if (!state.isGameOver && !state.isVictory && !state.pendingEvent) {
    const firstEvent = generateEvent(state.currentWeek * 7, state)
    if (firstEvent) {
      state.pendingEvent = firstEvent
      // Crisis weeks (every ~9 weeks)
      if (state.currentWeek % 9 === 0) {
        const usedIds = new Set([firstEvent.id])
        const queue: typeof firstEvent[] = []
        for (let attempt = 0; attempt < 10 && queue.length < 2; attempt++) {
          const extra = generateEvent(state.currentWeek * 7, state)
          if (extra && !usedIds.has(extra.id)) {
            usedIds.add(extra.id)
            queue.push(extra)
          }
        }
        state.pendingEventsQueue = queue
      }
    }
  }

  state.lastDayResult = result
  return result
}
