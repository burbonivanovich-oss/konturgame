import type { GameState, DayResult } from '../types/game'
import { DAILY_MICRO_EVENTS } from '../constants/dailyMicroEvents'
import { BUSINESS_CONFIGS, ECONOMY_CONSTANTS, CAMPAIGN_DIMINISHING_FACTORS } from '../constants/business'
import { ensureNPCsInitialized, applyNPCPassiveEffects, getInspectorChain2EventId, getGenaFinalEventId } from './npcManager'
import { getChainEvent, getChainStartEvent, CHAIN_TRIGGER_WEEKS, type ChainId } from '../constants/eventChains'
import { templateToEvent, applyEventConsequence, generateCrisisEvent } from './eventGenerator'
import { pickDiaryEntry } from '../constants/diary'
import { getWeeklyTacticDef } from '../constants/weeklyTactics'
import {
  buildModifiers,
  calculateClients,
  calculateCapacity,
  calculateAverageCheck,
  calculateRevenue,
  calculateDailySubscriptions,
  calculateMonthlyExpenses,
  getLoyaltyUpgradesBonus,
  getEffectiveBaseClients,
  getEffectiveAvgCheck,
} from './economyEngine'
import { getTotalStock, checkExpiry } from './stockManager'
import { generateEvent } from './eventGenerator'
import {
  checkBankruptcy,
  checkReputationLoss,
  checkVictory,
  resolveVictoryType,
  updateGameOverCounters,
  getLevelForExperience,
} from './victoryChecker'
import { calculateSynergyModifiers } from './synergyEngine'
import { checkNewAchievements } from './achievementChecker'
import { checkOnboardingBlocked, advanceOnboardingIfNeeded } from './onboardingEngine'
import { calculatePainLosses, getBankPaymentRatio } from './painEngine'
import {
  ENERGY_THRESHOLDS,
  ENERGY_REVENUE_MULTIPLIER,
  REPUTATION_LOSS_PER_MISSED_CLIENT,
  REGISTER_BREAKDOWN_PENALTY_RATE,
  ELBA_LOYALTY_PENALTY_REDUCTION,
  COMPETITOR_CYCLE,
  SERVICE_SAVINGS_RATES,
} from '../constants/gameBalance'
import { getTotalThroughput, calculateRegisterPenalty, checkRegisterBreakdown } from './cashRegisterEngine'
import { calculateCategoryRevenue } from './assortmentEngine'
import { initializeEmployees, getWeeklySalaryCost, getWeeklyEnergyCost, getEmployeeCapacityBonus, getUpgradeEnergyBonus } from './employeeManager'
import { initializeQuality, updateQualityWeekly, getQualityReputationBonus, getQualityLoyaltyBonus, getQualityPricePremium } from './qualityManager'
import { getQualityClientModifier, getBrandEffect } from './qualityModifier'

export function checkWeekBlocked(state: GameState): { blocked: boolean; reason?: string } {
  if (state.pendingEvent) {
    return { blocked: true, reason: 'Сначала решите событие' }
  }

  // Onboarding gates
  const onboardingCheck = checkOnboardingBlocked(state)
  if (onboardingCheck.blocked) {
    return { blocked: true, reason: onboardingCheck.reason }
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

  // Initialize NPC system
  ensureNPCsInitialized(state)

  // Accumulate results for the week
  let weekRevenue = 0
  let weekServed = 0
  let weekMissed = 0
  let weekExpenses = 0
  let weekNetProfit = 0
  let weekRepChange = 0
  let weekLoyaltyChange = 0
  let totalDaysWithoutExpiry = 0
  let weekExpiredLoss = 0
  let weekRegisterOverflow = 0
  const weekPain = { bank: 0, market: 0, ofd: 0, diadoc: 0, fokus: 0, elba: 0, extern: 0, total: 0 }
  let weeklySeasonalSum = 0
  let weeklyEventSum = 0

  // Calculate weekly employee costs
  const weeklySalaryCost = getWeeklySalaryCost(state)
  const weeklyEnergyCost = getWeeklyEnergyCost(state)
  const employeeCapacityBonus = getEmployeeCapacityBonus(state)
  const loyaltyUpgradesBonus = getLoyaltyUpgradesBonus(state)

  // Weekly tactic — multipliers/deltas applied per day in the loop below.
  // null tactic = operational drift penalty (-5%): no focus means small inefficiencies.
  const tactic = getWeeklyTacticDef(state.weeklyTactic)
  const tacticRevenueMul = tactic?.revenueMultiplier ?? 0.95
  const tacticEnergyPerDay = tactic?.energyDelta ?? 0
  const tacticRepPerDay = tactic?.reputationDelta ?? 0
  const tacticLoyaltyPerDay = tactic?.loyaltyDelta ?? 0

  // Process each day of the week (7 iterations)
  for (let dayNum = 0; dayNum < 7; dayNum++) {
    // Track actual day-of-week so pain triggers fire at most once per N-day cycle
    state.dayOfWeek = dayNum
    const modifiers = buildModifiers(state)
    weeklySeasonalSum += modifiers.seasonal
    weeklyEventSum += modifiers.event
    const synergyMods = calculateSynergyModifiers(state)

    // Quality price premium
    const qualityPricePremium = getQualityPricePremium(state)

    // 2. Stock expiry — must run before revenue to account for lost inventory
    const { loss: expiredLoss } = checkExpiry(state)

    // 3. Calculate daily metrics
    let totalClients = calculateClients(getEffectiveBaseClients(state), modifiers)

    // Apply quality modifier (affects client acquisition)
    const qualityClientMod = getQualityClientModifier(state.qualityLevel)
    totalClients = Math.round(totalClients * (1 + qualityClientMod))

    // Apply brand effect (reputation + loyalty synergy)
    const brandEffect = getBrandEffect(state.reputation, state.loyalty)
    totalClients = Math.round(totalClients * (1 + brandEffect.clientMod))

    // Hard reputation penalty: below 30 customers actively avoid you; below 15 it's word of mouth damage
    const repClientMod = state.reputation < 15 ? 0.75 : state.reputation < 30 ? 0.90 : 1.0
    if (repClientMod < 1) {
      totalClients = Math.round(totalClients * repClientMod)
    }

    // Capacity with employee bonus
    let capacity = calculateCapacity(state)
    if (employeeCapacityBonus > 0) {
      capacity = Math.round(capacity * (1 + employeeCapacityBonus * 0.1))
    }

    let served = Math.min(totalClients, capacity)

    // 3b. Register throughput limits served clients (calculated before revenue)
    const registerThroughput = getTotalThroughput(state.cashRegisters, state)
    const registerMissed = registerThroughput > 0
      ? calculateRegisterPenalty(served, registerThroughput)
      : 0
    served = served - registerMissed
    const missed = totalClients - served

    // 4. Bank payment ratio
    const bankPaymentRatio = getBankPaymentRatio(state)
    const effectiveServed = Math.floor(served * bankPaymentRatio)

    // 5. Average check with quality and brand premiums
    let avgCheck = calculateAverageCheck(getEffectiveAvgCheck(state), modifiers)

    // Add quality price premium + brand effect (skip getQualityPriceModifier to avoid double-counting)
    const totalPriceModifier = qualityPricePremium + brandEffect.priceMod

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

    // 6b. Bank acquiring fee (1.5% of revenue — cost of cashless payments)
    if (state.services?.bank?.isActive) {
      const acquiringRate = state.services.bank.effects.acquiringRate ?? 0.015
      dailyRevenue = Math.round(dailyRevenue * (1 - acquiringRate))
    }

    // 7. Register breakdown penalty (random equipment failure, separate from throughput)
    const registerBroke = checkRegisterBreakdown(state.cashRegisters)
    const breakdownPenalty = registerBroke
      ? Math.round(dailyRevenue * REGISTER_BREAKDOWN_PENALTY_RATE)
      : 0

    // Apply energy penalty: low energy = reduced productivity
    let energyModifier: number = ENERGY_REVENUE_MULTIPLIER.NORMAL
    if (state.entrepreneurEnergy < ENERGY_THRESHOLDS.CRITICAL) {
      energyModifier = ENERGY_REVENUE_MULTIPLIER.CRITICAL
    } else if (state.entrepreneurEnergy < ENERGY_THRESHOLDS.TIRED) {
      energyModifier = ENERGY_REVENUE_MULTIPLIER.TIRED
    }

    const dayRevenue = Math.max(0, Math.round((dailyRevenue - breakdownPenalty) * energyModifier * tacticRevenueMul))
    const registerOverflowPenalty = Math.round(registerMissed * avgCheck)

    // 8. Purchase costs (via assortment daily costs)
    const purchaseCost = totalDailyCategoryCost

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

    // 12. Monthly fixed costs (rent + owner's base salary) — spread evenly
    // across the 28-day cycle so the player doesn't get one brutal hit per
    // month. First 28 days are a grace period so a fresh business has time
    // to find its feet (matches the previous lump-sum behaviour where the
    // first bill fired only on day 29).
    const daysAlive = state.daysSinceLastMonthly ?? 0
    const monthlyExpense = daysAlive >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7
      ? Math.round(calculateMonthlyExpenses(state) / (ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7))
      : 0
    state.daysSinceLastMonthly = daysAlive + 1

    // 12b. Employee salary spread across the week (was previously folded into
    // the monthly bill which under-charged it by 75%: the weekly amount only
    // hit once per 28 days instead of every week).
    const dailyEmployeeSalary = Math.round(weeklySalaryCost / 7)

    // 13. Daily profit
    const dayExpenses = dayTax + subscriptionCost + purchaseCost + monthlyExpense +
      dailyEmployeeSalary + expiredLoss + dailyFixedCosts + totalCategoryFines
    let dayNetProfit = dayRevenue - dayExpenses

    // 14. Pain losses
    const pain = calculatePainLosses(state, dayRevenue, dayNetProfit, dayRevenue)
    const additionalPainLoss = pain.market + pain.ofd + pain.diadoc + pain.fokus + pain.elba + pain.extern
    dayNetProfit -= additionalPainLoss
    weekPain.bank += pain.bank
    weekPain.market += pain.market
    weekPain.ofd += pain.ofd
    weekPain.diadoc += pain.diadoc
    weekPain.fokus += pain.fokus
    weekPain.elba += pain.elba
    weekPain.extern += pain.extern
    weekPain.total += pain.total

    // 15. Reputation change with quality bonus
    const repFromMissed = -(missed * REPUTATION_LOSS_PER_MISSED_CLIENT)
    const fokusRepBonus = state.services?.fokus?.isActive
      ? (state.services.fokus.effects.reputationBonus ?? 0)
      : 0
    const qualityRepBonus = getQualityReputationBonus(state)
    const dayRepChange = Math.round(repFromMissed + fokusRepBonus + synergyMods.reputationBonus + qualityRepBonus + tacticRepPerDay)

    // 16. Loyalty change with quality bonus
    const elbaActive = state.services?.elba?.isActive ?? false
    let dayLoyaltyChange = 0
    const load = capacity > 0 ? served / capacity : 0
    if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
      const newOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
      state.consecutiveOverloadDays = newOverloadDays
      if (newOverloadDays >= ECONOMY_CONSTANTS.OVERLOAD_DAYS_FOR_LOYALTY_PENALTY) {
        const penalty = elbaActive
          ? -(ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY * ELBA_LOYALTY_PENALTY_REDUCTION)
          : -ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY
        dayLoyaltyChange = Math.round(penalty)
      }
    } else {
      state.consecutiveOverloadDays = 0
    }
    const elbaLoyaltyBonus = elbaActive ? (state.services.elba.effects.loyaltyBonus ?? 0) : 0
    const qualityLoyaltyBonus = getQualityLoyaltyBonus(state)
    dayLoyaltyChange += elbaLoyaltyBonus + synergyMods.loyaltyBonus + qualityLoyaltyBonus + loyaltyUpgradesBonus + tacticLoyaltyPerDay

    // Loyalty soft-cap decay above 70 — without active maintenance, customer
    // loyalty drifts down. At 70: no decay; at 100: 3/day pull. To plateau
    // at X, the player needs (X - 70) × 0.10 = sustained daily inflow:
    //   • +0/day → drifts to 70
    //   • +1/day → ~80 plateau
    //   • +2/day → ~90
    //   • +3/day → 100 (perfect play: service tactic + max quality + synergies)
    // Loyalty bonuses on upgrades have been removed; loyalty now reflects HOW
    // you play (tactic, choices, quality), not WHAT you bought.
    if (state.loyalty > 70) {
      dayLoyaltyChange -= (state.loyalty - 70) * 0.10
    }

    // 17. Accumulate week results
    weekRevenue += dayRevenue
    weekServed += served
    weekMissed += missed
    weekExpenses += dayExpenses + additionalPainLoss
    weekNetProfit += dayNetProfit
    weekRepChange += dayRepChange
    weekLoyaltyChange += dayLoyaltyChange
    weekExpiredLoss += expiredLoss
    weekRegisterOverflow += registerOverflowPenalty

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

  } // End of week loop

  // 2. Competitor event check (once per week, not 7 times)
  state.weeksSinceCompetitorEvent++
  const competitorInterval =
    COMPETITOR_CYCLE.BASE_INTERVAL_WEEKS +
    Math.floor(state.currentWeek / COMPETITOR_CYCLE.WEEK_DIVISOR)
  if (state.weeksSinceCompetitorEvent >= competitorInterval && !state.competitorEventTriggered) {
    state.competitorEventTriggered = true
    state.weeksSinceCompetitorEvent = 0
    if ((state.temporaryModDaysLeft ?? 0) === 0) {
      state.temporaryClientMod = -ECONOMY_CONSTANTS.COMPETITOR_TRAFFIC_STEAL_PCT
      state.temporaryModDaysLeft = ECONOMY_CONSTANTS.COMPETITOR_EFFECT_WEEKS * 7
    }
  }

  // Apply week results to state
  const newBalance = state.balance + weekNetProfit
  const newReputation = Math.max(0, Math.min(100, state.reputation + weekRepChange))
  const newLoyalty = Math.max(0, Math.min(100, state.loyalty + weekLoyaltyChange))

  // Update quality weekly
  updateQualityWeekly(state)

  // Deduct weekly employee energy cost, minus upgrade bonuses
  const upgradeEnergyBonus = getUpgradeEnergyBonus(state)
  const actualEnergyCost = Math.max(0, weeklyEnergyCost - upgradeEnergyBonus)
  // Apply weekly tactic's per-day energy delta over 7 days (e.g. -3/day = -21/week).
  const tacticEnergyTotal = tacticEnergyPerDay * 7
  state.entrepreneurEnergy = Math.max(
    0,
    Math.min(100, state.entrepreneurEnergy - actualEnergyCost + tacticEnergyTotal)
  )

  // Check if entrepreneur energy reached 0 (end of week).
  // Grace week: first time energy hits 0 we set a warning flag and give one
  // more week to recover (rest, hire employees, buy owner items). Only on the
  // SECOND consecutive zero-energy week do we declare burnout.
  if (state.entrepreneurEnergy <= 0) {
    if (state.burnoutWarningActive) {
      state.isGameOver = true
      state.gameOverReason = 'burnout'
    } else {
      state.burnoutWarningActive = true
    }
  } else {
    state.burnoutWarningActive = false
  }

  // Update state (but don't advance week yet — done at end after all checks)
  state.dayOfWeek = 0
  state.weeklyEnergyRestored = false
  state.balance = newBalance
  state.reputation = newReputation
  state.loyalty = newLoyalty

  // Loyalty sustained bonus: max loyalty generates word-of-mouth every 5 weeks.
  // Rewards players who invest in loyalty rather than just hitting the cap once.
  if (newLoyalty >= 95 && state.currentWeek % 5 === 0 && !state.isGameOver && !state.isVictory) {
    state.temporaryClientMod = (state.temporaryClientMod ?? 0) + 0.10
    state.temporaryModDaysLeft = Math.max(state.temporaryModDaysLeft ?? 0, 14)
    state.reputation = Math.min(100, state.reputation + 2)
    state.lastWeekMicroEvent = {
      icon: '💛',
      title: 'Сарафанное радио',
      effectText: 'Постоянные клиенты советуют вас друзьям — +10% трафика на 2 недели, +2 репутации',
    }
  }
  state.purchaseOfferedThisDay = false
  state.lastUpdated = Date.now()

  // Create result
  const bankPaymentRatioForResult = getBankPaymentRatio(state)
  const result: DayResult = {
    dayNumber: state.currentWeek - 1,  // Report previous week
    clients: weekServed + weekMissed,
    served: weekServed,
    missed: weekMissed,
    lostToBank: bankPaymentRatioForResult < 1
      ? Math.round(weekRevenue / getEffectiveAvgCheck(state) * (1 - bankPaymentRatioForResult) / bankPaymentRatioForResult)
      : 0,
    revenue: weekRevenue,
    expenses: weekExpenses,
    tax: 0,  // Accumulated in week
    subscriptionCost: 0,
    purchaseCost: 0,
    monthlyExpense: 0,
    expiredLoss: weekExpiredLoss,
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
    registerOverflowPenalty: weekRegisterOverflow,
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

  // Update counters (note: despite the name, this counts weeks, not days).
  // On recovery: decrement by 1 rather than resetting to 0. This prevents the
  // exploit where taking a micro-loan for a single positive week resets the
  // entire consecutive-negative counter, enabling infinite bankruptcy avoidance.
  if (state.balance < 0) {
    state.daysBalanceNegative = (state.daysBalanceNegative ?? 0) + 1
  } else if ((state.daysBalanceNegative ?? 0) > 0) {
    state.daysBalanceNegative = (state.daysBalanceNegative ?? 0) - 1
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

  // Decrement ad campaigns and accumulate ROI attribution
  if (state.activeAdCampaigns?.length) {
    if (!state.campaignROI) state.campaignROI = []

    // Only campaigns past their delay contributed to this week's revenue.
    // Same filter/sort as economyEngine.calculateActiveAdModifiers — keeps slot
    // ordering consistent so diminishing factors match what the player saw.
    const contributing = state.activeAdCampaigns.filter(c =>
      c.daysRemaining > 0 && state.currentWeek >= (c.startWeek ?? state.currentWeek)
    )
    const sorted = [...contributing].sort((a, b) => b.clientEffect - a.clientEffect)

    // Per-campaign net revenue impact: (1 + X·f)(1 + Y·f) − 1
    // Captures both client boost and check penalty/bonus.
    const impactById = new Map<string, number>()
    let totalImpact = 0
    sorted.forEach((c, i) => {
      const factor = CAMPAIGN_DIMINISHING_FACTORS[i] ?? 0.2
      const impact = (1 + c.clientEffect * factor) * (1 + c.checkEffect * factor) - 1
      impactById.set(c.id, impact)
      totalImpact += impact
    })

    // Total revenue attributable to all advertising this week.
    // Uses the weekly-average seasonal and event modifiers in the denominator so that
    // ads don't claim credit that belongs to reputation/seasonality/events.
    if (totalImpact !== 0 && totalImpact > -1) {
      const avgSeasonal = weeklySeasonalSum / 7
      const avgEvent = weeklyEventSum / 7
      const totalClientDivisor = Math.max(0.01, 1 + avgSeasonal + totalImpact + avgEvent)
      const totalAdRevenue = weekRevenue * totalImpact / totalClientDivisor
      for (const campaign of state.activeAdCampaigns) {
        const impact = impactById.get(campaign.id) ?? 0
        if (impact === 0) continue
        const share = impact / totalImpact  // same sign → positive contribution, opposite sign → negative
        const incrementalRevenue = Math.round(totalAdRevenue * share)
        campaign.revenueAttributed = (campaign.revenueAttributed ?? 0) + incrementalRevenue
      }
    }

    // Write one final ROI record for campaigns that expire this week, then remove them.
    const updated = state.activeAdCampaigns.map(c => ({
      ...c,
      daysRemaining: Math.max(0, c.daysRemaining - 7),
    }))
    for (const campaign of updated) {
      if (campaign.daysRemaining <= 0) {
        const totalRevenue = campaign.revenueAttributed ?? 0
        state.campaignROI.push({
          id: `roi_${campaign.id}_${campaign.launchedWeek ?? state.currentWeek}`,
          campaignId: campaign.id,
          launchedWeek: campaign.launchedWeek ?? state.currentWeek,
          costSpent: campaign.cost,
          revenueGenerated: totalRevenue,
          clientsAcquired: Math.round(totalRevenue / Math.max(1, getEffectiveAvgCheck(state))),
          roi: campaign.cost > 0 ? ((totalRevenue - campaign.cost) / campaign.cost) * 100 : 0,
        })
      }
    }
    state.activeAdCampaigns = updated.filter(c => c.daysRemaining > 0)
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
    state.victoryType = resolveVictoryType(state)
  }

  // Year-end: at week 52 the run ALWAYS ends. If no win/loss has fired by
  // now, the player neither broke through nor broke down — they just lived
  // the year. That's its own ending ("Год прошёл"), distinct from victory
  // and from bankruptcy. Without this guard, edge cases (balance=0 exactly,
  // reputation=0 but not yet at zero-streak) would let the game limp into
  // week 53+, which contradicts the year-as-finale design.
  if (
    !state.isGameOver &&
    !state.isVictory &&
    state.currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR
  ) {
    state.isGameOver = true
    state.gameOverReason = 'year_end'
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

  // Apply NPC passive effects each week
  applyNPCPassiveEffects(state)

  // Trigger chain events that are due this week
  triggerDueChainEvents(state)

  // Trigger first steps of chains that haven't started yet
  triggerNewChainStarts(state)

  // Auto-resolve expired decision timers (pick first non-Kontour option)
  autoResolveExpiredDecisions(state)

  // Personal goal tracking (v5.0): mark achieved when balance crosses target
  // before deadline; mark missed when deadline passes without achievement.
  // Once flipped, both flags are sticky — the run keeps the outcome.
  if (state.personalGoal && !state.personalGoal.achieved && !state.personalGoal.missed) {
    if (state.balance >= state.personalGoal.targetAmount) {
      state.personalGoal.achieved = true
    } else if (state.currentWeek > state.personalGoal.deadlineWeek) {
      state.personalGoal.missed = true
    }
  }

  // Diary entry (v5.0): replaces the city-newspaper stub. Fires every 5 weeks
  // starting from week 5, picking a state-aware first-person reflection. Tone
  // anchor for the run; no blocking modal, just a card in WeekResults.
  // Cleared on non-fire weeks so the overlay only shows fresh entries.
  if (
    state.currentWeek % 5 === 0 &&
    !(state.diaryEntryWeeks ?? []).includes(state.currentWeek)
  ) {
    const entry = pickDiaryEntry(state)
    if (entry) {
      state.lastDiaryEntry = { header: entry.header, body: entry.body }
      if (!state.diaryEntryWeeks) state.diaryEntryWeeks = []
      state.diaryEntryWeeks.push(state.currentWeek)
      // Apply optional flavor effects (small reputation/loyalty nudges)
      if (entry.reputationDelta) {
        state.reputation = Math.max(0, Math.min(100, state.reputation + entry.reputationDelta))
      }
      if (entry.loyaltyDelta) {
        state.loyalty = Math.max(0, Math.min(100, state.loyalty + entry.loyaltyDelta))
      }
    }
  } else {
    state.lastDiaryEntry = null
  }

  // Pick 1 micro event per week (passive, no modal — shown in WeekResults)
  applyWeeklyMicroEvent(state)

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

  // Crisis events get their own independent roll — they must not compete with the
  // regular event pool or they'd almost never fire when the main pool is crowded.
  if (!state.isGameOver && !state.isVictory) {
    const crisisEvent = generateCrisisEvent(state)
    if (crisisEvent) {
      if (state.pendingEvent === null) {
        state.pendingEvent = crisisEvent
      } else {
        state.pendingEventsQueue = [...(state.pendingEventsQueue ?? []), crisisEvent]
      }
    }
  }

  // Advance week AFTER all checks (events, milestones, etc.) have used current week number
  state.currentWeek += 1

  // Store weekly + cumulative pain losses
  state.lastWeekPainLosses = weekPain
  if (!state.totalPainLosses) {
    state.totalPainLosses = { bank: 0, market: 0, ofd: 0, diadoc: 0, fokus: 0, elba: 0, extern: 0, total: 0 }
  }
  const tp = state.totalPainLosses
  tp.bank += weekPain.bank; tp.market += weekPain.market; tp.ofd += weekPain.ofd
  tp.diadoc += weekPain.diadoc; tp.fokus += weekPain.fokus; tp.elba += weekPain.elba
  tp.extern += weekPain.extern; tp.total += weekPain.total

  // Accumulate savings from active services (direct value, not event-based)
  accumulateServiceSavings(state, weekRevenue, weekNetProfit)

  // Generate next-week cliffhanger teaser
  state.upcomingEventTeaser = generateNextWeekTeaser(state)

  // Clear milestone celebration after it's been generated (UI reads it once)
  // Milestone celebration is set based on newly achieved milestones this week
  state.pendingMilestoneCelebration = null
  if (state.currentWeek === 11 && state.milestoneStatus?.week10) state.pendingMilestoneCelebration = 'week10'
  else if (state.currentWeek === 21 && state.milestoneStatus?.week20) state.pendingMilestoneCelebration = 'week20'
  else if (state.currentWeek === 31 && state.milestoneStatus?.week30) state.pendingMilestoneCelebration = 'week30'

  state.lastDayResult = result
  return result
}

function generateNextWeekTeaser(state: GameState): string | null {
  const nextDay = state.currentWeek * 7

  // Upcoming loan repayment
  if (state.loans?.length) {
    const urgentLoan = state.loans.find(l => !l.isRepaid && l.dueWeek === state.currentWeek + 1)
    if (urgentLoan) {
      return `💸 На следующей неделе истекает срок займа — потребуется вернуть ${urgentLoan.amount.toLocaleString('ru-RU')} ₽`
    }
    const nearLoan = state.loans.find(l => !l.isRepaid && l.dueWeek === state.currentWeek + 2)
    if (nearLoan) {
      return `⏰ Через две недели срок займа. Проверьте запас средств`
    }
  }

  // Risk warnings (probabilistic — no fixed schedule)
  if (!state.services?.fokus?.isActive) {
    return `⚠️ Без Контур.Фокуса есть риск мошенничества со стороны поставщика`
  }
  if (!state.services?.extern?.isActive) {
    return `🔒 Без Контур.Экстерна возможна блокировка счёта налоговой`
  }

  // Seasonal hint
  const nextMonth = Math.ceil(((state.currentWeek + 1) / 52) * 12)
  const config = state.businessType
  if (config === 'cafe' && nextMonth === 6) return `☀️ Лето приближается — сезон роста для кафе`
  if (config === 'cafe' && nextMonth === 12) return `❄️ Зима снизит поток клиентов — подготовьтесь заранее`
  if (config === 'beauty-salon' && nextMonth === 3) return `🌸 Весна — сезонный рост для салона красоты`
  if (config === 'shop' && nextMonth === 7) return `🏖️ Летний сезон даёт небольшой рост — пользуйтесь`

  // Crisis week hint
  if ((state.currentWeek + 1) % 9 === 0) {
    return `🌩️ Следующая неделя может быть напряжённой — ожидается несколько событий сразу`
  }

  // Generic encouragement
  const tips = [
    `📊 Загляните в Финансы — стоит проверить динамику прибыли`,
    `🤝 Хороший момент пересмотреть список поставщиков`,
    `💡 Если репутация выше 70 — это хорошее время для рекламы`,
    null,
    null,
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

function accumulateServiceSavings(state: GameState, weekRevenue: number, weekNetProfit: number): void {
  let savings = 0

  if (state.services?.market?.isActive) {
    savings += Math.round(weekRevenue * SERVICE_SAVINGS_RATES.MARKET_REVENUE_PROTECTION)
  }

  if (state.services?.elba?.isActive && weekNetProfit > 0) {
    savings += Math.round(
      weekNetProfit *
        SERVICE_SAVINGS_RATES.ELBA_PROFIT_PROTECTION *
        SERVICE_SAVINGS_RATES.ELBA_WEEKLY_CHANCE,
    )
  }

  if (state.services?.extern?.isActive) {
    savings += Math.round(
      (weekRevenue / 7) *
        SERVICE_SAVINGS_RATES.EXTERN_REVENUE_DAYS *
        SERVICE_SAVINGS_RATES.EXTERN_WEEKLY_CHANCE,
    )
  }

  if (savings > 0) {
    state.savedBalance = (state.savedBalance ?? 0) + savings
  }
}

function applyWeeklyMicroEvent(state: GameState): void {
  const idx = (state.currentWeek - 1) % DAILY_MICRO_EVENTS.length
  const micro = DAILY_MICRO_EVENTS[idx]
  if (!micro) return

  const option = micro.options[0]
  if (!option) return

  const e = option.effects
  if (e.balanceDelta) state.balance = Math.max(0, state.balance + e.balanceDelta)
  if (e.energyDelta) state.entrepreneurEnergy = Math.max(0, Math.min(100, state.entrepreneurEnergy + e.energyDelta))
  if (e.reputationDelta) state.reputation = Math.max(0, Math.min(100, state.reputation + e.reputationDelta))
  if (e.clientModifierPercent && e.clientModifierDays) {
    state.temporaryClientMod = (state.temporaryClientMod ?? 0) + e.clientModifierPercent
    state.temporaryModDaysLeft = Math.max(state.temporaryModDaysLeft ?? 0, e.clientModifierDays)
  }

  state.lastWeekMicroEvent = { icon: micro.icon, title: micro.title, effectText: option.text }
}

// ── Chain system helpers ─────────────────────────────────────────────────────

function triggerDueChainEvents(state: GameState): void {
  const due = (state.pendingChainFollowUps ?? []).filter(
    f => f.triggerWeek <= state.currentWeek
  )
  if (due.length === 0) return

  for (const followUp of due) {
    // inspector_chain step 2 branches depending on Petrov relationship.
    // gena_arc step 5 branches on whether player ever invested + a 10% RNG roll.
    let eventId = followUp.chainEventId
    if (eventId.startsWith('inspector_chain_2')) {
      eventId = getInspectorChain2EventId(state)
    } else if (eventId === 'gena_arc_5') {
      eventId = getGenaFinalEventId(state)
    }

    const template = getChainEvent(eventId)
    if (!template) continue

    // Skip if already triggered
    if ((state.triggeredEventIds ?? []).includes(template.id)) continue

    const event = templateToEvent(template, state.currentWeek * 7, state.currentWeek)
    if (followUp.contextNote) {
      event.description = `📌 Ранее вы выбрали: «${followUp.contextNote}»\n\n${event.description}`
    }
    queueChainEvent(state, event)
  }

  // Remove consumed follow-ups
  state.pendingChainFollowUps = (state.pendingChainFollowUps ?? []).filter(
    f => f.triggerWeek > state.currentWeek
  )
}

function triggerNewChainStarts(state: GameState): void {
  const triggered = state.triggeredEventIds ?? []
  const active = state.activeChainIds ?? []
  const completed = state.completedChainIds ?? []

  for (const [chainId, minWeek] of Object.entries(CHAIN_TRIGGER_WEEKS) as [ChainId, number][]) {
    if (state.currentWeek < minWeek) continue
    if (active.includes(chainId) || completed.includes(chainId)) continue

    // Special condition for 'legacy' chain: requires reputation >= 70
    if (chainId === 'legacy' && state.reputation < 70) continue

    const startEvent = getChainStartEvent(chainId)
    if (!startEvent) continue
    if (triggered.includes(startEvent.id)) continue

    // Add small random jitter to avoid all chains firing on exact week
    const jitterWeek = minWeek + Math.floor(Math.random() * 3)
    if (state.currentWeek < jitterWeek) continue

    const event = templateToEvent(startEvent, state.currentWeek * 7, state.currentWeek)
    queueChainEvent(state, event)
    if (!active.includes(chainId)) {
      state.activeChainIds = [...active, chainId]
    }
    break  // Only start one new chain per week
  }
}

function autoResolveExpiredDecisions(state: GameState): void {
  if (!state.pendingEvent) return
  const event = state.pendingEvent
  if (!event.decisionDeadlineWeek) return
  if (state.currentWeek <= event.decisionDeadlineWeek) return

  // Deadline passed — pick first non-Kontour option as auto-resolve
  const defaultOption = event.options.find(o => !o.isContourOption) ?? event.options[0]
  if (!defaultOption) return

  applyEventConsequence(state, event, defaultOption.id)
  if (!state.triggeredEventIds.includes(event.id)) {
    state.triggeredEventIds.push(event.id)
  }
  state.pendingEvent = state.pendingEventsQueue?.[0] ?? null
  state.pendingEventsQueue = state.pendingEventsQueue?.slice(1) ?? []
}

function queueChainEvent(state: GameState, event: ReturnType<typeof templateToEvent>): void {
  if (state.pendingEvent === null) {
    state.pendingEvent = event
  } else {
    state.pendingEventsQueue = [...(state.pendingEventsQueue ?? []), event]
  }
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
