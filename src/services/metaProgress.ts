import type { GameState, MetaProgress, MetaLessonBonus } from '../types/game'
import { META_LESSONS, getMetaLesson } from '../constants/metaLessons'

const META_KEY = 'kontur_meta_progress_v1'

const EMPTY_PROGRESS: MetaProgress = {
  totalRuns: 0,
  unlockedLessons: [],
  bestWeek: 0,
  totalGoalsAchieved: 0,
}

export function loadMetaProgress(): MetaProgress {
  if (typeof window === 'undefined') return { ...EMPTY_PROGRESS }
  try {
    const raw = window.localStorage.getItem(META_KEY)
    if (!raw) return { ...EMPTY_PROGRESS }
    const parsed = JSON.parse(raw) as Partial<MetaProgress>
    return {
      totalRuns: parsed.totalRuns ?? 0,
      unlockedLessons: parsed.unlockedLessons ?? [],
      bestWeek: parsed.bestWeek ?? 0,
      totalGoalsAchieved: parsed.totalGoalsAchieved ?? 0,
    }
  } catch {
    return { ...EMPTY_PROGRESS }
  }
}

export function saveMetaProgress(p: MetaProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(p))
  } catch {
    // Storage may be full or disabled — silently skip; metaprogression is
    // a flavor system, not critical to play.
  }
}

/**
 * Evaluate the just-finished run against all known lessons. Returns the
 * updated progress and a list of newly unlocked lesson ids (so UI can
 * celebrate them).
 */
export function evaluateRun(
  finalState: GameState,
  current: MetaProgress,
): { updated: MetaProgress; newLessons: string[] } {
  const newLessons: string[] = []

  for (const lesson of META_LESSONS) {
    if (current.unlockedLessons.includes(lesson.id)) continue
    if (lesson.check(finalState)) {
      newLessons.push(lesson.id)
    }
  }

  const updated: MetaProgress = {
    totalRuns: current.totalRuns + 1,
    unlockedLessons: [...current.unlockedLessons, ...newLessons],
    bestWeek: Math.max(current.bestWeek, finalState.currentWeek),
    totalGoalsAchieved:
      current.totalGoalsAchieved + (finalState.personalGoal?.achieved ? 1 : 0),
  }

  return { updated, newLessons }
}

/**
 * Aggregate all unlocked lesson bonuses into a single delta object.
 * Apply this to the initial state right after createInitialState().
 */
export function getAggregateBonus(progress: MetaProgress): MetaLessonBonus {
  const agg: MetaLessonBonus = {
    startingBalanceDelta: 0,
    startingEnergyDelta: 0,
    startingReputationDelta: 0,
    startingLoyaltyDelta: 0,
  }
  for (const id of progress.unlockedLessons) {
    const lesson = getMetaLesson(id)
    if (!lesson) continue
    agg.startingBalanceDelta! += lesson.bonus.startingBalanceDelta ?? 0
    agg.startingEnergyDelta! += lesson.bonus.startingEnergyDelta ?? 0
    agg.startingReputationDelta! += lesson.bonus.startingReputationDelta ?? 0
    agg.startingLoyaltyDelta! += lesson.bonus.startingLoyaltyDelta ?? 0
  }
  return agg
}
