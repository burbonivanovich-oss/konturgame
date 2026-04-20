import type { GameState, StockBatch } from '../types/game'
import { BUSINESS_CONFIGS, ECONOMY_CONSTANTS } from '../constants/business'

const EXPIRY_DAYS: Record<string, number> = {
  shop: 10,
  cafe: 7,
  'beauty-salon': 0,
}

function getExpirationDays(state: GameState): number {
  return EXPIRY_DAYS[state.businessType] ?? 10
}

export function addStock(state: GameState, quantity: number, costPerUnit: number): void {
  if (!state.stockBatches) state.stockBatches = []

  const batch: StockBatch = {
    id: `batch-${(state.currentWeek * 7 + state.dayOfWeek)}-${state.stockBatches.length}`,
    quantity,
    costPerUnit,
    dayReceived: (state.currentWeek * 7 + state.dayOfWeek),
    expirationDays: getExpirationDays(state),
  }
  state.stockBatches.push(batch)
}

export function consumeStock(
  state: GameState,
  quantity: number,
): { consumed: number; cost: number } {
  if (!state.stockBatches) state.stockBatches = []

  let remaining = quantity
  let totalCost = 0

  for (const batch of state.stockBatches) {
    if (remaining <= 0) break
    const take = Math.min(batch.quantity, remaining)
    batch.quantity -= take
    remaining -= take
    totalCost += take * batch.costPerUnit
  }

  state.stockBatches = state.stockBatches.filter((b) => b.quantity > 0)

  const consumed = quantity - remaining
  return { consumed, cost: totalCost }
}

export function checkExpiry(state: GameState): { expired: number; loss: number } {
  if (!state.stockBatches?.length) return { expired: 0, loss: 0 }

  const config = BUSINESS_CONFIGS[state.businessType]
  if (!config.hasStock) return { expired: 0, loss: 0 }

  const hasMarket = state.services?.market?.isActive ?? false
  const lossRate = hasMarket
    ? ECONOMY_CONSTANTS.EXPIRY_LOSS_RATE_WITH_MARKET
    : ECONOMY_CONSTANTS.EXPIRY_LOSS_RATE

  let totalExpired = 0
  let totalLoss = 0

  for (const batch of state.stockBatches) {
    const age = (state.currentWeek * 7 + state.dayOfWeek) - batch.dayReceived
    if (age >= batch.expirationDays) {
      totalExpired += batch.quantity
      totalLoss += batch.quantity * batch.costPerUnit * lossRate
      batch.quantity = 0
    }
  }

  state.stockBatches = state.stockBatches.filter((b) => b.quantity > 0)
  return { expired: totalExpired, loss: totalLoss }
}

export function getTotalStock(state: GameState): number {
  if (!state.stockBatches?.length) return 0
  return state.stockBatches.reduce((sum, b) => sum + b.quantity, 0)
}

export function getStockPercentage(state: GameState, maxCapacity = 200): number {
  const total = getTotalStock(state)
  return Math.min(100, (total / maxCapacity) * 100)
}

export function predictedDemand(state: GameState, days = 2): number {
  const baseClients: Record<string, number> = { shop: 80, cafe: 100, 'beauty-salon': 0 }
  return (baseClients[state.businessType] ?? 0) * days
}

export function needsRestock(state: GameState): boolean {
  const config = BUSINESS_CONFIGS[state.businessType]
  if (!config.hasStock) return false
  return getTotalStock(state) < predictedDemand(state)
}
