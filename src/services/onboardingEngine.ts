import type { GameState, OnboardingStage, ServiceType } from '../types/game'
import { ONBOARDING_STAGES, SERVICE_UNLOCK_MAP } from '../constants/onboarding'

export function getUnlockedServicesForStage(stage: OnboardingStage): ServiceType[] {
  return SERVICE_UNLOCK_MAP[stage] ?? ['bank']
}

export function shouldAdvanceStage(state: GameState): boolean {
  const currentStage = state.onboardingStage
  if (currentStage >= 4) return false

  const nextStageConfig = ONBOARDING_STAGES[currentStage + 1]
  if (!nextStageConfig) return false

  // dayRange is in days, convert currentWeek to days
  const currentDay = state.currentWeek * 7
  const dayThresholdReached = currentDay >= nextStageConfig.dayRange[0]

  if (!dayThresholdReached) return false

  // Check required actions for each stage before advancing
  if (currentStage === 0 && !(state.services?.bank?.isActive ?? false)) return false
  if (currentStage === 1 && !(state.services?.ofd?.isActive ?? false)) return false
  if (currentStage === 2 && !(state.services?.market?.isActive ?? false)) return false
  if (currentStage === 3 && !(state.services?.diadoc?.isActive ?? false)) return false
  if (currentStage === 4) return false // final stage — never auto-advance

  return true
}

export function checkOnboardingBlocked(state: GameState): { blocked: boolean; reason?: string } {
  if (state.onboardingCompleted) return { blocked: false }

  const stage = state.onboardingStage

  // Stage 0: must activate Bank before first day advance
  if (stage === 0 && !state.services?.bank?.isActive) {
    return { blocked: true, reason: 'Подключите Контур.Банк, чтобы принимать оплату картой' }
  }

  // Stage 1+: must have at least one cash register
  if (stage >= 1 && state.cashRegisters.length === 0) {
    return { blocked: true, reason: 'Купите кассу перед первой продажей (раздел "Касса")' }
  }

  return { blocked: false }
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

  // Mark onboarding completed after last stage steps are seen
  if (state.onboardingStage >= 4 && state.onboardingStepIndex >= (getCurrentStageSteps(4).length)) {
    state.onboardingCompleted = true
  }
}
