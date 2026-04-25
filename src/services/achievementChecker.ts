import type { GameState, DayResult } from '../types/game'
import { ACHIEVEMENTS, WAVE_UNLOCK_WEEKS } from '../constants/achievements'
import { getActiveSynergies } from './synergyEngine'
import { ECONOMY_CONSTANTS } from '../constants/business'

type CheckFn = (state: GameState, lastResult: DayResult | null) => boolean

const ACHIEVEMENT_CHECKS: Record<string, CheckFn> = {
  first_day: (s) => s.currentWeek >= 1,
  week_done: (s) => s.currentWeek >= 2,
  month_done: (s) => s.currentWeek >= 5,
  profitable_day: (_, r) => (r?.netProfit ?? 0) > 0,
  perfect_day: (_, r) => (r?.missed ?? 1) === 0 && (r?.clients ?? 0) > 0,
  big_profit: (_, r) => (r?.netProfit ?? 0) >= 100000,
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
  milestone_week10: (s) => s.milestoneStatus?.week10 ?? false,
  milestone_week20: (s) => s.milestoneStatus?.week20 ?? false,
  milestone_week30: (s) => s.milestoneStatus?.week30 ?? false,
  // v4.3 new achievements
  level_15: (s) => s.level >= 15,
  year_one_no_debt: (s) =>
    s.currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR
    && (s.daysBalanceNegative ?? 0) === 0
    && s.balance > 0,

  // v5.4 backstory choice achievements — read state.chosenEventOptions
  choice_refused_old_boss: (s) =>
    s.chosenEventOptions?.['PERS_CORP_OFFER'] === 'refuse_proudly',
  choice_opened_to_colleague: (s) =>
    s.chosenEventOptions?.['PERS_CORP_EXCOLLEAGUE'] === 'open_up',
  choice_mother_time: (s) =>
    s.chosenEventOptions?.['PERS_FREE_MOTHER_DROPIN'] === 'sit_with_her',
  choice_dimka_paper: (s) =>
    s.chosenEventOptions?.['PERS_FRIEND_LOAN_OFFER'] === 'take_with_terms',
  choice_lifted_anna: (s) =>
    s.chosenEventOptions?.['NPC_ANNA_CRISIS'] === 'lend_kindness',
  choice_svetlana_partner: (s) =>
    s.chosenEventOptions?.['NPC_SVETLANA_POACHED'] === 'partner_share',
  choice_gleb_recorded: (s) =>
    s.chosenEventOptions?.['NPC_GLEB_SCANDAL'] === 'go_public',

  // Goal achievements
  goal_achieved: (s) => s.personalGoal?.achieved === true,
  goal_clutch: (s) => {
    const g = s.personalGoal
    if (!g?.achieved) return false
    // "clutch" = achieved within the last 2 weeks before deadline
    return g.deadlineWeek - s.currentWeek <= 2
  },
}

export function checkNewAchievements(state: GameState): string[] {
  const current = state.achievements ?? []
  const lastResult = state.lastDayResult
  const newIds: string[] = []

  for (const ach of ACHIEVEMENTS) {
    if (current.includes(ach.id)) continue
    if ((state.currentWeek ?? 0) < WAVE_UNLOCK_WEEKS[ach.wave]) continue
    const checkFn = ACHIEVEMENT_CHECKS[ach.id]
    if (checkFn && checkFn(state, lastResult)) {
      newIds.push(ach.id)
    }
  }
  return newIds
}
