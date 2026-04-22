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
  getLoyaltyUpgradesBonus,
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
import { initializeSuppliers, unlockSuppliersIfNeeded, getQualityModifier, getPriceModifier, calculateStockCost } from './supplierManager'
import { initializeEmployees, getWeeklySalaryCost, getWeeklyEnergyCost, getEmployeeCapacityBonus, getUpgradeEnergyBonus } from './employeeManager'
import { initializeQuality, updateQualityWeekly, getQualityReputationBonus, getQualityLoyaltyBonus, getQualityPricePremium } from './qualityManager'
import { getQualityClientModifier, getQualityPriceModifier, getSeasonalityModifier, getBrandEffect } from './qualityModifier'

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

  // Initialize new systems if not present (for save compatibility)
  if (!state.suppliers || state.suppliers.length === 0) {
    state.suppliers = initializeSuppliers()
    state.activeSupplierId = state.suppliers.find(s => s.isActive)?.id || null
  }
  if (!state.employees) {
    state.employees = initializeEmployees()
  }
  if (state.qualityLevel === undefined) {
    state.qualityLevel = initializeQuality()
  }
  if (state.weeksSinceCompetitorEvent === undefined) {
    state.weeksSinceCompetitorEvent = 0
  }
  if (!state.campaignROI) {
    state.campaignROI = []
  }
  if (!state.milestoneStatus) {
    state.milestoneStatus = { week10: false, week20: false, week30: false }
  }

  // Unlock suppliers based on progression
  unlockSuppliersIfNeeded(state)

  // Accumulate results for the week
  let weekRevenue = 0
  let weekExpenses = 0
  let weekNetProfit = 0
  let weekRepChange = 0
  let weekLoyaltyChange = 0
  let totalDaysWithoutExpiry = 0

  // Calculate weekly employee costs
  const weeklySalaryCost = getWeeklySalaryCost(state)
  const weeklyEnergyCost = getWeeklyEnergyCost(state)
  const employeeCapacityBonus = getEmployeeCapacityBonus(state)
  const loyaltyUpgradesBonus = getLoyaltyUpgradesBonus(state)

  // Process each day of the week (7 iterations)
  for (let dayNum = 0; dayNum < 7; dayNum++) {
    // Track actual day-of-week so pain triggers fire at most once per N-day cycle
    state.dayOfWeek = dayNum
    const modifiers = buildModifiers(state)
    const synergyMods = calculateSynergyModifiers(state)

    // Quality price premium
    const qualityPricePremium = getQualityPricePremium(state)

    // 1. Check expiry
    const { loss: expiredLoss } = checkExpiry(state)

    // 2. Competitor event - now cyclic every 5-8 weeks
    state.weeksSinceCompetitorEvent++
    const competitorInterval = 5 + Math.floor(state.currentWeek / 10)  // Increases with game progress
    if (state.weeksSinceCompetitorEvent >= competitorInterval && !state.competitorEventTriggered) {
      state.competitorEventTriggered = true
      state.weeksSinceCompetitorEvent = 0
      if ((state.temporaryModDaysLeft ?? 0) === 0) {
        state.temporaryClientMod = -ECONOMY_CONSTANTS.COMPETITOR_TRAFFIC_STEAL_PCT
        state.temporaryModDaysLeft = ECONOMY_CONSTANTS.COMPETITOR_EFFECT_WEEKS * 7
      }
    }

    // 3. Calculate daily metrics
    let totalClients = calculateClients(config.baseClients, modifiers)

    // Apply quality modifier (affects client acquisition)
    const qualityClientMod = getQualityClientModifier(state.qualityLevel)
    totalClients = Math.round(totalClients * (1 + qualityClientMod))

    // Apply seasonality modifier
    const seasonalityMod = getSeasonalityModifier(state.currentWeek, config.seasonality)
    totalClients = Math.round(totalClients * (1 + seasonalityMod))

    // Apply brand effect (reputation + loyalty synergy)
    const brandEffect = getBrandEffect(state.reputation, state.loyalty)
    totalClients = Math.round(totalClients * (1 + brandEffect.clientMod))

    // Capacity with employee bonus
    let capacity = calculateCapacity(state)
    if (employeeCapacityBonus > 0) {
      capacity = Math.round(capacity * (1 + employeeCapacityBonus * 0.1))
    }
    
    let served = Math.min(totalClients, capacity)
    if (config.hasStock && !config.usesAssortment) {
      const availableStock = getTotalStock(state)
      served = Math.min(served, availableStock)
    }
    const missed = totalClients - served

    // 4. Bank payment ratio
    const bankPaymentRatio = getBankPaymentRatio(state)
    const effectiveServed = Math.floor(served * bankPaymentRatio)

    // 5. Average check with quality and brand premiums
    let avgCheck = calculateAverageCheck(config.avgCheck, modifiers)

    // Add quality price modifier (quality > 80% = +15% price)
    const qualityPriceMod = getQualityPriceModifier(state.qualityLevel)

    // Add brand effect price modifier
    const totalPriceModifier = qualityPricePremium + qualityPriceMod + brandEffect.priceMod

    avgCheck = Math.round(avgCheck * (1 + totalPriceModifier))

    // 6. Revenue (daily)
    let dailyRevenue: number
    let categoryFines: Record<string, number> = {}
    let totalDailyCategoryCost = 0

    if (config.usesAssortment && (state.enabledCategories?.length ?? 0) > 0) {
      const catResult = calculateCategoryRevenue(state)
      const baseRevenue = Math.round(catResult.totalRevenue * bankPaymentRatio)
      const totalRevenueBonus = synergyMods.revenueBonus + brandEffect.revenueMod
      dailyRevenue = Math.round(baseRevenue * (1 + totalRevenueBonus))
      totalDailyCategoryCost = catResult.totalDailyCost
      for (const [catId, data] of Object.entries(catResult.breakdown)) {
        if (data.fine > 0) categoryFines[catId] = data.fine
      }
    } else {
      const baseRevenue = calculateRevenue(effectiveServed, avgCheck)
      const totalRevenueBonus = synergyMods.revenueBonus + brandEffect.revenueMod
      dailyRevenue = Math.round(baseRevenue * (1 + totalRevenueBonus))
    }

    // 7. Register penalty
    const registerThroughput = getTotalThroughput(state.cashRegisters, state)
    const registerPenalty = registerThroughput > 0
      ? calculateRegisterPenalty(served, registerThroughput, dailyRevenue)
      : 0

    const registerBroke = checkRegisterBreakdown(state.cashRegisters)
    const breakdownPenalty = registerBroke ? Math.round(dailyRevenue * 0.15) : 0

    // Apply energy penalty: low energy = reduced productivity
    let energyModifier = 1
    if (state.entrepreneurEnergy < 30) {
      energyModifier = 0.8  // -20% if critical burnout
    } else if (state.entrepreneurEnergy < 60) {
      energyModifier = 0.9  // -10% if tired
    }

    const dayRevenue = Math.max(0, Math.round((dailyRevenue - registerPenalty - breakdownPenalty) * energyModifier))

    // 8. Stock and costs with supplier modifier
    let purchaseCost = 0
    if (config.hasStock && !config.usesAssortment && served > 0) {
      const result = consumeStock(state, served)
      purchaseCost = calculateStockCost(result.cost, state)
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
      monthlyExpense = calculateMonthlyExpenses(state) + weeklySalaryCost
    }

    // 13. Daily profit
    const dayExpenses = dayTax + subscriptionCost + purchaseCost + monthlyExpense + expiredLoss +
      dailyFixedCosts + totalCategoryFines
    let dayNetProfit = dayRevenue - dayExpenses

    // 14. Pain losses
    const pain = calculatePainLosses(state, dayRevenue, dayNetProfit, dayRevenue)
    const additionalPainLoss = pain.market + pain.ofd + pain.diadoc + pain.fokus + pain.elba + pain.extern
    dayNetProfit -= additionalPainLoss

    // 15. Reputation change with quality bonus
    const repFromMissed = -(missed * 0.2)
    const fokusRepBonus = state.services?.fokus?.isActive
      ? (state.services.fokus.effects.reputationBonus ?? 0)
      : 0
    const qualityRepBonus = getQualityReputationBonus(state)
    const dayRepChange = Math.round(repFromMissed + fokusRepBonus + synergyMods.reputationBonus + qualityRepBonus)

    // 16. Loyalty change with quality bonus
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
    const qualityLoyaltyBonus = getQualityLoyaltyBonus(state)
    dayLoyaltyChange += elbaLoyaltyBonus + synergyMods.loyaltyBonus + qualityLoyaltyBonus + loyaltyUpgradesBonus

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
        // Competitor effect ended — allow the next cycle to trigger
        state.competitorEventTriggered = false
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

  // Update quality weekly
  updateQualityWeekly(state)

  // Deduct weekly employee energy cost, minus upgrade bonuses
  const upgradeEnergyBonus = getUpgradeEnergyBonus(state)
  const actualEnergyCost = Math.max(0, weeklyEnergyCost - upgradeEnergyBonus)
  state.entrepreneurEnergy = Math.max(0, state.entrepreneurEnergy - actualEnergyCost)

  // Check if entrepreneur energy reached 0 (end of week)
  if (state.entrepreneurEnergy <= 0) {
    state.isGameOver = true
    state.gameOverReason = 'burnout'
  }

  // Advance to next week
  state.currentWeek += 1
  state.dayOfWeek = 0
  state.weeklyEnergyRestored = false
  state.seenMicroEventIds = []  // Reset seen events for new week
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

  // Process active loans: deduct weekly interest; repay principal at dueWeek
  if (state.loans?.length) {
    for (const loan of state.loans) {
      if (loan.isRepaid) continue
      const weeklyPayment = Math.round(loan.amount * loan.weeklyInterest)
      state.balance -= weeklyPayment
      loan.totalInterestPaid += weeklyPayment
      if (state.currentWeek >= loan.dueWeek) {
        // Срок истёк — принудительное погашение основного долга
        state.balance -= loan.amount
        loan.isRepaid = true
      }
    }
  }

  // Update counters
  if (state.balance < 0) {
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

  // Decrement ad campaigns by 7 days and track ROI
  if (state.activeAdCampaigns?.length) {
    if (!state.campaignROI) state.campaignROI = []
    for (const campaign of state.activeAdCampaigns) {
      // Incremental revenue: the share of weekly revenue attributable to the campaign's
      // client boost. If campaign adds +X% clients, incremental ≈ weekRevenue * X / (1 + X).
      const clientEffect = Math.max(0, campaign.clientEffect)
      const incrementalRevenue = clientEffect > 0
        ? Math.round(weekRevenue * clientEffect / (1 + clientEffect))
        : 0
      const campaignROI = {
        id: `roi_${campaign.id}_w${state.currentWeek}`,
        campaignId: campaign.id,
        launchedWeek: state.currentWeek,
        costSpent: campaign.cost,
        revenueGenerated: incrementalRevenue,
        clientsAcquired: Math.round(incrementalRevenue / Math.max(1, config.avgCheck)),
        roi: campaign.cost > 0 ? ((incrementalRevenue - campaign.cost) / campaign.cost) * 100 : 0,
      }
      state.campaignROI.push(campaignROI)
    }
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

  // Check milestone achievements
  if (!state.milestoneStatus) {
    state.milestoneStatus = { week10: false, week20: false, week30: false }
  }

  if (state.currentWeek === 10 && !state.milestoneStatus.week10) {
    const achievedMilestone = newBalance >= 100000 || weekNetProfit >= 1000
    if (achievedMilestone) {
      state.milestoneStatus.week10 = true
    }
  }

  if (state.currentWeek === 20 && !state.milestoneStatus.week20) {
    const achievedMilestone = newBalance >= 250000 || weekNetProfit >= 5000
    if (achievedMilestone) {
      state.milestoneStatus.week20 = true
    }
  }

  if (state.currentWeek === 30 && !state.milestoneStatus.week30) {
    const achievedMilestone = newBalance >= 500000 || weekNetProfit >= 10000
    if (achievedMilestone) {
      state.milestoneStatus.week30 = true
    }
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

  // Generate 1-2 events every week (crisis weeks always get 2)
  if (!state.isGameOver && !state.isVictory && !state.pendingEvent) {
    const firstEvent = generateEvent(state.currentWeek * 7, state)
    if (firstEvent) {
      state.pendingEvent = firstEvent
      const isCrisisWeek = state.currentWeek % 9 === 0
      // Crisis weeks always add a 2nd event; normal weeks 50% chance
      const addSecond = isCrisisWeek || Math.random() < 0.5
      if (addSecond) {
        const usedIds = new Set([firstEvent.id])
        const queue: typeof firstEvent[] = []
        for (let attempt = 0; attempt < 10 && queue.length < 1; attempt++) {
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

export function getCampaignStats(state: GameState) {
  if (!state.campaignROI || state.campaignROI.length === 0) {
    return {
      totalCampaigns: 0,
      totalSpent: 0,
      totalRevenue: 0,
      averageROI: 0,
      campaigns: [],
    }
  }

  const totalSpent = state.campaignROI.reduce((sum, c) => sum + c.costSpent, 0)
  const totalRevenue = state.campaignROI.reduce((sum, c) => sum + c.revenueGenerated, 0)
  const averageROI = state.campaignROI.reduce((sum, c) => sum + c.roi, 0) / state.campaignROI.length

  return {
    totalCampaigns: state.campaignROI.length,
    totalSpent,
    totalRevenue,
    averageROI,
    campaigns: state.campaignROI,
  }
}

export function getMilestoneProgress(state: GameState) {
  if (!state.milestoneStatus) {
    return { week10: false, week20: false, week30: false }
  }
  return state.milestoneStatus
}
