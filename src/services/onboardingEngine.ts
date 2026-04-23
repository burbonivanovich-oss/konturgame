import type { GameState, OnboardingStage, OnboardingStep, OnboardingTrigger, ServiceType } from '../types/game'
import { ONBOARDING_STAGES, SERVICE_UNLOCK_MAP } from '../constants/onboarding'

export function getUnlockedServicesForStage(stage: OnboardingStage): ServiceType[] {
  return SERVICE_UNLOCK_MAP[stage] ?? []
}

function getCurrentStep(state: GameState): OnboardingStep | null {
  const stageConfig = ONBOARDING_STAGES[state.onboardingStage]
  if (!stageConfig) return null
  const steps = stageConfig.steps
  if (!steps || steps.length === 0) return null
  const idx = Math.min(state.onboardingStepIndex, steps.length - 1)
  return steps[idx] ?? null
}

// Checks whether a given in-game trigger has fired (based on current state).
// Triggers are stateless checks over existing fields — no extra bookkeeping needed.
export function isTriggerFired(state: GameState, trigger: OnboardingTrigger): boolean {
  switch (trigger) {
    case 'first_day_completed':
      // We've advanced past day 0 at least once. currentWeek starts at 1,
      // dayOfWeek starts at 0 and increments as days progress.
      return (state.currentWeek ?? 1) > 1 || (state.dayOfWeek ?? 0) > 0 || !!state.lastDayResult
    case 'first_event_shown':
      return (state.triggeredEventIds?.length ?? 0) > 0 || !!state.pendingEvent
    case 'first_event_resolved':
      return (state.triggeredEventIds?.length ?? 0) > 0 && !state.pendingEvent
    case 'low_energy':
      return (state.entrepreneurEnergy ?? 100) < 50
    case 'negative_balance':
      return (state.balance ?? 0) < 0 || (state.daysBalanceNegative ?? 0) > 0
    case 'low_stock': {
      const total = (state.stockBatches ?? []).reduce((s, b) => s + b.quantity, 0)
      const cap = state.capacity ?? 1
      return cap > 0 && total / cap < 0.25
    }
    default:
      return false
  }
}

// Returns true if the action required by the given step is already done.
export function isStepActionDone(state: GameState, step: OnboardingStep): boolean {
  if (!step.requiresAction) return true
  switch (step.requiresAction) {
    case 'activate_bank':   return state.services?.bank?.isActive   ?? false
    case 'activate_ofd':    return state.services?.ofd?.isActive    ?? false
    case 'activate_market': return state.services?.market?.isActive ?? false
    case 'activate_diadoc': return state.services?.diadoc?.isActive ?? false
    case 'activate_fokus':  return state.services?.fokus?.isActive  ?? false
    case 'activate_elba':   return state.services?.elba?.isActive   ?? false
    case 'activate_extern': return state.services?.extern?.isActive ?? false
    case 'buy_register':    return (state.cashRegisters?.length ?? 0) > 0
    default:                return true
  }
}

// Returns true if the "wait" step's trigger has fired.
export function isWaitStepReady(state: GameState, step: OnboardingStep): boolean {
  if (step.kind !== 'wait' || !step.waitForTrigger) return true
  return isTriggerFired(state, step.waitForTrigger)
}

export function shouldAdvanceStage(state: GameState): boolean {
  const currentStage = state.onboardingStage
  if (currentStage >= 4) return false

  const nextStageConfig = ONBOARDING_STAGES[currentStage + 1]
  if (!nextStageConfig) return false

  const currentDay = (state.currentWeek - 1) * 7 + (state.dayOfWeek ?? 0) + 1
  const dayThresholdReached = currentDay >= nextStageConfig.dayRange[0]
  if (!dayThresholdReached) return false

  // Stage 0 → 1: advance purely by day (basic-loop tutorial is educational only)
  if (currentStage === 0) return true

  // Stage 1 → 2: bank + register + ofd must all be done
  if (currentStage === 1) {
    const bankOk = state.services?.bank?.isActive ?? false
    const ofdOk = state.services?.ofd?.isActive ?? false
    const registerOk = (state.cashRegisters?.length ?? 0) > 0
    return bankOk && ofdOk && registerOk
  }
  // Stage 2 → 3: Market active
  if (currentStage === 2) return state.services?.market?.isActive ?? false
  // Stage 3 → 4: Diadoc active
  if (currentStage === 3) return state.services?.diadoc?.isActive ?? false

  return false
}

// Block the "Next day" button only when the player is actively parked on an
// unsatisfied action step. Intro/wait steps never block — they're learning aids.
export function checkOnboardingBlocked(state: GameState): { blocked: boolean; reason?: string } {
  if (state.onboardingCompleted) return { blocked: false }

  const step = getCurrentStep(state)
  if (!step) return { blocked: false }

  // Intro and wait steps never block the game loop
  if (step.kind !== 'action' && !step.requiresAction) return { blocked: false }
  if (isStepActionDone(state, step)) return { blocked: false }

  // Give the player a grace period at the start of each stage so they can read
  // the preceding intro steps before being forced to act.
  const stageConfig = ONBOARDING_STAGES[state.onboardingStage]
  const currentDay = (state.currentWeek - 1) * 7 + (state.dayOfWeek ?? 0) + 1
  if (stageConfig && currentDay < stageConfig.dayRange[0]) return { blocked: false }

  const reason = getBlockReasonForAction(step.requiresAction)
  return { blocked: true, reason }
}

function getBlockReasonForAction(action?: string): string {
  switch (action) {
    case 'activate_bank':   return 'Подключите Контур.Банк — без него 40% клиентов уходят'
    case 'buy_register':    return 'Купите кассу — без неё нельзя принимать оплату легально'
    case 'activate_ofd':    return 'Подключите Контур.ОФД — иначе штраф за каждый чек'
    case 'activate_market': return 'Подключите Контур.Маркет — потери на складе слишком велики'
    case 'activate_diadoc': return 'Подключите Контур.Диадок — документы теряются'
    case 'activate_elba':   return 'Подключите Контур.Эльба — отчётность надо сдавать'
    default:                return 'Выполните требуемое действие из онбординга'
  }
}

export function getCurrentStageSteps(stage: OnboardingStage) {
  const config = ONBOARDING_STAGES[stage]
  return config?.steps ?? []
}

export function advanceOnboardingIfNeeded(state: GameState): void {
  if (state.onboardingCompleted) return

  if (shouldAdvanceStage(state)) {
    const newStage = (state.onboardingStage + 1) as OnboardingStage
    state.onboardingStage = newStage
    state.onboardingStepIndex = 0
    state.unlockedServices = getUnlockedServicesForStage(newStage)
  }

  // Mark onboarding completed after the last stage's steps are seen
  if (state.onboardingStage >= 4 && state.onboardingStepIndex >= getCurrentStageSteps(4).length) {
    state.onboardingCompleted = true
  }
}
