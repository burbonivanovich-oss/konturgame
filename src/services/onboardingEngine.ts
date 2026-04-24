import type { GameState, OnboardingStage, OnboardingStep, OnboardingTrigger, ServiceType } from '../types/game'
import { ONBOARDING_STAGES, SERVICE_UNLOCK_MAP } from '../constants/onboarding'

// Minimum days a player must spend in a stage before advancing to the next one.
// Replaces the hard absolute-day gates (15, 29, 43) with a per-stage soak time,
// so a fast player isn't stuck waiting while a slow player isn't rushed.
const MIN_DAYS_IN_STAGE = 3

// Cost the player must cover to complete a buy_register action step.
// Service activations have no upfront cost (billed daily), so only the register matters.
const MIN_REGISTER_COST = 8000

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

  if (!ONBOARDING_STAGES[currentStage + 1]) return false

  const currentStageConfig = ONBOARDING_STAGES[currentStage]
  const currentDay = (state.currentWeek - 1) * 7 + (state.dayOfWeek ?? 0) + 1

  // Soft soak: player must spend MIN_DAYS_IN_STAGE days in the current stage.
  // This replaces the old hard absolute-day gates (day 15, 29, 43) so efficient
  // players aren't blocked after completing all required actions.
  const stageStartDay = currentStageConfig?.dayRange[0] ?? 1
  const daysInStage = currentDay - stageStartDay + 1
  if (daysInStage < MIN_DAYS_IN_STAGE) return false

  // Stage 0 → 1: advance purely by time (tutorial is educational only)
  if (currentStage === 0) return true

  const skipped = new Set(state.skippedOnboardingActions ?? [])

  // Stage 1 → 2: bank + register + ofd (each counts as done if active OR skipped)
  if (currentStage === 1) {
    const bankOk = (state.services?.bank?.isActive ?? false) || skipped.has('1-1')
    const registerOk = (state.cashRegisters?.length ?? 0) > 0 || skipped.has('1-3')
    const ofdOk = (state.services?.ofd?.isActive ?? false) || skipped.has('1-5')
    return bankOk && registerOk && ofdOk
  }
  // Stage 2 → 3: Market active or skipped
  if (currentStage === 2) {
    return (state.services?.market?.isActive ?? false) || skipped.has('2-2')
  }
  // Stage 3 → 4: Diadoc active or skipped
  if (currentStage === 3) {
    return (state.services?.diadoc?.isActive ?? false) || skipped.has('3-3')
  }

  return false
}

// Block the "Next day" button only when the player is actively parked on an
// unsatisfied action step. Intro/wait steps never block — they're learning aids.
export function checkOnboardingBlocked(state: GameState): {
  blocked: boolean
  reason?: string
  insufficientFunds?: boolean
} {
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

  // Detect insufficient funds on the buy_register step so UI can offer an emergency grant.
  const insufficientFunds =
    step.requiresAction === 'buy_register' && (state.balance ?? 0) < MIN_REGISTER_COST

  const reason = getBlockReasonForAction(step.requiresAction)
  return { blocked: true, reason, insufficientFunds }
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

// Returns the current action step if the player is parked on one and hasn't completed it.
// Used by UI to decide whether to show the "skip this step" escape-valve button.
export function getBlockedActionStep(state: GameState): OnboardingStep | null {
  if (state.onboardingCompleted) return null
  const step = getCurrentStep(state)
  if (!step || (step.kind !== 'action' && !step.requiresAction)) return null
  if (isStepActionDone(state, step)) return null
  return step
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
