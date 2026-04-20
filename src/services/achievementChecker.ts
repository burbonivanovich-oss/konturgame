import type { GameState, DayResult } from '../types/game'
import { ACHIEVEMENTS } from '../constants/achievements'
import { getActiveSynergies } from './synergyEngine'
import { ECONOMY_CONSTANTS } from '../constants/business'

type CheckFn = (state: GameState, lastResult: DayResult | null) => boolean

const ACHIEVEMENT_CHECKS: Record<string, CheckFn> = {
  first_day: (s) => s.currentWeek >= 1,
  week_done: (s) => s.currentWeek >= 2,
  month_done: (s) => s.currentWeek >= 5,
  profitable_week: (_, r) => (r?.netProfit ?? 0) > 0,
  big_profit: (_, r) => (r?.netProfit ?? 0) >= 100000,  // Weekly instead of daily
  millionaire: (s) => s.balance >= 1000000,
  high_rep: (s) => s.reputation >= 90,
  loyal_staff: (s) => s.loyalty >= 90,
  first_service: (s) => Object.values(s.services).some((sv) => sv.isActive),
  three_services: (s) => Object.values(s.services).filter((sv) => sv.isActive).length >= 3,
  all_services: (s) => Object.values(s.services).every((sv) => sv.isActive),
  synergy: (s) => getActiveSynergies(s).length >= 3,
  first_campaign: (s) => (s.activeAdCampaigns?.length ?? 0) > 0,
  hall_upgrade: (s) => s.purchasedUpgrades?.includes('hall-expansion') ?? false,
  level_5: (s) => s.level >= 5,
  level_10: (s) => s.level >= 10,
  event_veteran: (s) => (s.triggeredEventIds?.length ?? 0) >= 10,
  resilient: (s) => (s.hadLowReputation ?? false) && s.reputation >= 60,
  stock_master: (s) => (s.consecutiveNoExpiry ?? 0) >= 10,
  first_register: (s) => (s.cashRegisters?.length ?? 0) > 0,
  promo_collector: (s) => (s.promoCodesRevealed?.length ?? 0) >= 5,
  full_promo: (s) => (s.promoCodesRevealed?.length ?? 0) >= 7,
  survived_competitor: (s) => s.currentWeek >= 4 && (s.competitorEventTriggered ?? false),
  survival_year_one: (s) => s.currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR && s.balance > 0 && s.reputation > 0,
}

export function checkNewAchievements(state: GameState): string[] {
  const current = state.achievements ?? []
  const lastResult = state.lastDayResult
  const newIds: string[] = []

  for (const ach of ACHIEVEMENTS) {
    if (current.includes(ach.id)) continue
    const checkFn = ACHIEVEMENT_CHECKS[ach.id]
    if (checkFn && checkFn(state, lastResult)) {
      newIds.push(ach.id)
    }
  }
  return newIds
}
