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

  // 6. Revenue
  const revenue = calculateRevenue(served, avgCheck)

  // 7. Consume stock via FIFO
  let purchaseCost = 0
  if (config.hasStock && served > 0) {
    const result = consumeStock(state, served)
    purchaseCost = result.cost
  }

  // 8. Tax
  const tax = revenue * ECONOMY_CONSTANTS.TAX_RATE

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

  // 12. Reputation change: penalise missed clients, bonus from Market+OFD synergy
  const repFromMissed = -(missed * 0.2)
  let repBonus = 0
  if (state.services?.market?.isActive && state.services?.ofd?.isActive) {
    repBonus = 2
  }
  const reputationChange = Math.round(repFromMissed + repBonus)

  // 13. Loyalty change from overloading
  let loyaltyChange = 0
  const load = capacity > 0 ? served / capacity : 0
  if (load > ECONOMY_CONSTANTS.OVERLOAD_THRESHOLD) {
    const newOverloadDays = (state.consecutiveOverloadDays ?? 0) + 1
    if (newOverloadDays >= ECONOMY_CONSTANTS.OVERLOAD_DAYS_FOR_LOYALTY_PENALTY) {
      loyaltyChange = -ECONOMY_CONSTANTS.LOYALTY_PENALTY_PER_DAY
    }
  }

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

  // Update monthly counter
  if (daysSinceMonthly >= ECONOMY_CONSTANTS.MONTHLY_CYCLE_DAYS) {
    state.daysSinceLastMonthly = 1
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

  // Generate new event if game is still active
  if (!state.isGameOver && !state.isVictory && !state.pendingEvent) {
    const event = generateEvent(state.currentDay, state)
    if (event) {
      state.pendingEvent = event
    }
  }

  state.lastUpdated = Date.now()

  return result
}
