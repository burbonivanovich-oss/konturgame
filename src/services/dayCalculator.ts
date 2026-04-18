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

export function checkDayBlocked(state: GameState): { blocked: boolean; reason?: string } {
  if (state.pendingEvent) {
    return { blocked: true, reason: 'Сначала решите событие' }
  }

  const config = BUSINESS_CONFIGS[state.businessType]
  if (config.hasStock && getTotalStock(state) === 0) {
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

  // 1. Check expiry before calculations
  const { loss: expiredLoss } = checkExpiry(state)

  // 2. Calculate total clients
  const totalClients = calculateClients(config.baseClients, modifiers)

  // 3. Calculate capacity
  const capacity = calculateCapacity(state)

  // 4. Served limited by capacity and available stock
  let served = Math.min(totalClients, capacity)
  if (config.hasStock) {
    const availableStock = getTotalStock(state)
    served = Math.min(served, availableStock)
  }
  const missed = totalClients - served

  // 5. Average check
  const avgCheck = calculateAverageCheck(config.avgCheck, modifiers)

  // 6. Revenue (+ synergy revenue bonus)
  const baseRevenue = calculateRevenue(served, avgCheck)
  const revenue = Math.round(baseRevenue * (1 + synergyMods.revenueBonus))

  // 7. Consume stock via FIFO
  let purchaseCost = 0
  if (config.hasStock && served > 0) {
    const result = consumeStock(state, served)
    purchaseCost = result.cost
  }

  // 8. Tax (reduced by Extern service and synergy)
  const taxSaving =
    (state.services?.extern?.isActive ? (state.services.extern.effects.taxSaving ?? 0) : 0) +
    synergyMods.taxSaving
  const effectiveTaxRate = Math.max(0, ECONOMY_CONSTANTS.TAX_RATE - taxSaving)
  const tax = revenue * effectiveTaxRate

  // 9. Daily subscription cost
  const subscriptionCost = calculateDailySubscriptions(state)

  // 10. Monthly expenses every 30 days
  let monthlyExpense = 0
  const daysSinceMonthly = state.daysSinceLastMonthly ?? 0
  if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_DAYS) {
    monthlyExpense = calculateMonthlyExpenses(state)
  }

  // 11. Net profit
  const expenses = tax + subscriptionCost + purchaseCost + monthlyExpense + expiredLoss
  const netProfit = revenue - expenses

  // 12. Reputation change
  const repFromMissed = -(missed * 0.2)
  // market+ofd synergy (+2 rep) is handled via synergyMods.reputationBonus
  const fokusRepBonus = state.services?.fokus?.isActive
    ? (state.services.fokus.effects.reputationBonus ?? 0)
    : 0
  const reputationChange = Math.round(repFromMissed + fokusRepBonus + synergyMods.reputationBonus)

  // 13. Loyalty change from overloading
  const elbaActive = state.services?.elba?.isActive ?? false
  let loyaltyChange = 0
  const load = capacity > 0 ? served / capacity : 0
  if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
    const newOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
    if (newOverloadDays >= ECONOMY_CONSTANTS.OVERLOAD_DAYS_FOR_LOYALTY_PENALTY) {
      // Elba halves the overload loyalty penalty
      const penalty = elbaActive
        ? -(ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY * 0.5)
        : -ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY
      loyaltyChange = Math.round(penalty)
    }
  }
  // Elba base loyalty bonus + synergy loyalty bonus
  const elbaLoyaltyBonus = elbaActive ? (state.services.elba.effects.loyaltyBonus ?? 0) : 0
  loyaltyChange += elbaLoyaltyBonus + synergyMods.loyaltyBonus

  const newBalance = state.balance + netProfit
  const newReputation = Math.max(0, Math.min(100, state.reputation + reputationChange))
  const newLoyalty = Math.max(0, Math.min(100, state.loyalty + loyaltyChange))

  const result: DayResult = {
    dayNumber: state.currentDay,
    clients: totalClients,
    served,
    missed,
    revenue,
    expenses,
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
  }

  // --- Apply results to state ---
  state.balance = newBalance
  state.reputation = newReputation
  state.loyalty = newLoyalty
  state.lastDayResult = result

  // Update overload counter
  if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
    state.consecutiveOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
  } else {
    state.consecutiveOverloadDays = 0
  }

  // Update monthly counter (fix: reset to 0, not 1)
  if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_DAYS) {
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
  state.currentDay += 1
  state.purchaseOfferedThisDay = false

  // Update reputation-zero counter
  updateGameOverCounters(state)

  // Gain experience
  state.experience += ECONOMY_CONSTANTS.EXPERIENCE_PER_DAY
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

  // Generate new event(s) if game is still active
  if (!state.isGameOver && !state.isVictory && !state.pendingEvent) {
    const isCrisisDay = state.currentDay % 9 === 0
    const firstEvent = generateEvent(state.currentDay, state)

    if (firstEvent) {
      state.pendingEvent = firstEvent

      if (isCrisisDay) {
        const usedIds = new Set([firstEvent.id])
        const queue: typeof firstEvent[] = []
        for (let attempt = 0; attempt < 10 && queue.length < 2; attempt++) {
          const extra = generateEvent(state.currentDay, state)
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
