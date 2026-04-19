import type { CashRegister, GameState } from '../types/game'
import { CASH_REGISTER_CONFIGS, MARKET_FAST_REGISTER_BONUS } from '../constants/cashRegisters'

export function getTotalThroughput(registers: CashRegister[], state?: GameState): number {
  if (!registers || registers.length === 0) return 0

  let total = 0
  const hasMarket = state?.services?.market?.isActive ?? false

  for (const reg of registers) {
    const config = CASH_REGISTER_CONFIGS[reg.type]
    let throughput = config.throughput * reg.count
    // Market + Fast register synergy: +25% throughput
    if (hasMarket && reg.type === 'fast') {
      throughput = Math.round(throughput * (1 + MARKET_FAST_REGISTER_BONUS))
    }
    total += throughput
  }

  return total
}

export function calculateRegisterPenalty(
  clients: number,
  throughput: number,
  revenue: number,
): number {
  if (throughput === 0 || clients <= throughput) return 0
  const overflow = clients - throughput
  // 10% revenue penalty for each 5 clients over throughput
  const penaltyGroups = Math.floor(overflow / 5)
  const penalty = Math.min(0.8, penaltyGroups * 0.1) // max 80% penalty
  return Math.round(revenue * penalty)
}

export function checkRegisterBreakdown(registers: CashRegister[]): boolean {
  if (!registers || registers.length === 0) return false
  for (const reg of registers) {
    const config = CASH_REGISTER_CONFIGS[reg.type]
    if (Math.random() < config.breakdownChance) return true
  }
  return false
}

export function getRegisterCostWithDiscount(
  existingRegisters: CashRegister[],
  baseCost: number,
): number {
  const totalCount = existingRegisters.reduce((sum, r) => sum + r.count, 0)
  if (totalCount >= 2) return Math.round(baseCost * 0.85) // 15% off 3rd
  if (totalCount >= 1) return Math.round(baseCost * 0.9)  // 10% off 2nd
  return baseCost
}

export function getRegisterSummary(registers: CashRegister[]): {
  totalRegisters: number
  totalThroughput: number
  names: string[]
} {
  if (!registers || registers.length === 0) {
    return { totalRegisters: 0, totalThroughput: 0, names: [] }
  }
  return {
    totalRegisters: registers.reduce((sum, r) => sum + r.count, 0),
    totalThroughput: getTotalThroughput(registers),
    names: registers.map((r) => {
      const cfg = CASH_REGISTER_CONFIGS[r.type]
      return r.count > 1 ? `${cfg.name} ×${r.count}` : cfg.name
    }),
  }
}
