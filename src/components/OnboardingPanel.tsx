import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { ONBOARDING_STAGES, ONBOARDING_STAGE_LABELS } from '../constants/onboarding'
import { isStepActionDone, isWaitStepReady } from '../services/onboardingEngine'
import type { OnboardingTrigger } from '../types/game'
import { K } from './design-system/tokens'
import type { NavId } from './design-system/KLeftRail'

interface OnboardingPanelProps {
  onNavigate: (nav: NavId) => void
  onAction?: (action: string) => void
}

const ACTION_TO_NAV: Record<string, NavId> = {
  activate_bank:    'ecosystem',
  activate_ofd:     'ecosystem',
  activate_market:  'ecosystem',
  activate_diadoc:  'ecosystem',
  activate_fokus:   'ecosystem',
  activate_elba:    'ecosystem',
  activate_extern:  'ecosystem',
  buy_register:     'operations',
}

const ACTION_LABEL: Record<string, string> = {
  activate_bank:    'Открыть Контур.Банк',
  activate_ofd:     'Открыть Контур.ОФД',
  activate_market:  'Открыть Контур.Маркет',
  activate_diadoc:  'Открыть Контур.Диадок',
  activate_fokus:   'Открыть Контур.Фокус',
  activate_elba:    'Открыть Контур.Эльба',
  activate_extern:  'Открыть Контур.Экстерн',
  buy_register:     'Купить кассу',
}

const WAIT_HINT: Record<OnboardingTrigger, string> = {
  first_day_completed:  'Нажмите «Следующий день →» внизу экрана',
  first_event_shown:    'Дождитесь первого события в игре',
  first_event_resolved: 'Выберите вариант ответа на событие',
  low_energy:           'Сыграйте несколько дней, пока энергия не упадёт',
  negative_balance:     'Продолжайте играть, пока не увидите минус',
  low_stock:            'Продолжайте играть, пока склад не покажет меньше 25%',
}

const STAGE_COLORS = [K.blue, K.violet, K.orange, K.mint, K.orange]

export function OnboardingPanel({ onNavigate, onAction }: OnboardingPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const gameState = useGameStore()
  const {
    onboardingStage, onboardingStepIndex, onboardingCompleted,
    nextOnboardingStep, advanceOnboardingStage, completeOnboarding,
  } = gameState

  if (onboardingCompleted) return null

  const stageConfig = ONBOARDING_STAGES[onboardingStage]
  if (!stageConfig) return null

  const steps = stageConfig.steps
  if (!steps || steps.length === 0) return null

  const clampedIndex = Math.min(onboardingStepIndex, steps.length - 1)
  const step = steps[clampedIndex]
  if (!step) return null

  const isLastStep = clampedIndex >= steps.length - 1
  const isLastStage = onboardingStage >= 4
  const stageColor = STAGE_COLORS[onboardingStage] ?? K.orange

  const stepKind: 'intro' | 'action' | 'wait' =
    step.kind ?? (step.requiresAction ? 'action' : 'intro')

  const actionDone = stepKind === 'action' ? isStepActionDone(gameState as any, step) : true
  const waitReady = stepKind === 'wait' ? isWaitStepReady(gameState as any, step) : true
  const needsAction = stepKind === 'action' && !actionDone
  const isWaiting = stepKind === 'wait' && !waitReady

  const targetNav = step.requiresAction ? ACTION_TO_NAV[step.requiresAction] : undefined
  const actionLabel = step.requiresAction ? ACTION_LABEL[step.requiresAction] : undefined
  const waitHint = stepKind === 'wait' && step.waitForTrigger ? WAIT_HINT[step.waitForTrigger] : undefined

  const canProceed = !needsAction && !isWaiting

  const handleConfirm = () => {
    if (!canProceed) return
    if (isLastStep) {
      if (isLastStage) completeOnboarding()
      else advanceOnboardingStage()
    } else {
      nextOnboardingStep()
    }
  }

  const nextLabel = (() => {
    if (isLastStep && isLastStage) return 'Готово!'
    if (isLastStep) return 'Принято ✓'
    if (stepKind === 'intro') return 'Понял →'
    if (stepKind === 'wait') return 'Далее →'
    return 'Далее →'
  })()

  const borderColor = needsAction ? K.orange : isWaiting ? K.violet : stageColor
  const bg = needsAction ? K.orangeSoft : isWaiting ? K.violetSoft : K.bone

  return (
    <div style={{
      borderBottom: `2px solid ${borderColor}`,
      background: bg,
      flexShrink: 0,
      transition: 'background 0.2s',
    }}>
      {/* Collapsed header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 24px', cursor: 'pointer',
        }}
      >
        {/* Stage dots */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: 999,
              background: i < onboardingStage ? stageColor
                : i === onboardingStage ? stageColor
                : K.lineSoft,
              opacity: i < onboardingStage ? 0.4 : 1,
            }} />
          ))}
        </div>

        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: stageColor, textTransform: 'uppercase', flexShrink: 0,
        }}>
          {ONBOARDING_STAGE_LABELS[onboardingStage]} · {clampedIndex + 1}/{steps.length}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: K.ink, flex: 1, lineHeight: 1.2 }}>
          {step.title}
        </div>

        {needsAction && targetNav && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(targetNav)
              if (step.requiresAction) onAction?.(step.requiresAction)
            }}
            style={{
              padding: '5px 14px', borderRadius: 8, border: 'none',
              background: K.orange, color: K.white,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            {actionLabel} →
          </button>
        )}

        {isWaiting && (
          <div style={{
            padding: '5px 12px', borderRadius: 8,
            background: K.white, color: K.violet,
            fontSize: 11, fontWeight: 700, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999, background: K.violet,
              animation: 'pulse 1.4s ease-in-out infinite',
            }} />
            Ждём вас в игре
          </div>
        )}

        {canProceed && (
          <button
            onClick={(e) => { e.stopPropagation(); handleConfirm() }}
            style={{
              padding: '5px 14px', borderRadius: 8, border: 'none',
              background: K.ink, color: K.white,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            {nextLabel}
          </button>
        )}

        <div style={{ color: K.muted, fontSize: 16, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{
          padding: '0 24px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            fontSize: 13, color: K.ink2, lineHeight: 1.6, maxWidth: 640,
            whiteSpace: 'pre-line',
          }}>
            {step.text}
          </div>

          {needsAction && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: K.white, border: `1px solid ${K.orange}`,
              borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div style={{ flex: 1, fontSize: 12, color: K.orange, fontWeight: 600 }}>
                Требуется действие — перейдите в раздел и выполните его
              </div>
              {targetNav && (
                <button
                  onClick={() => onNavigate(targetNav)}
                  style={{
                    padding: '6px 16px', borderRadius: 8, border: 'none',
                    background: K.orange, color: K.white,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {actionLabel} →
                </button>
              )}
            </div>
          )}

          {isWaiting && waitHint && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: K.white, border: `1px solid ${K.violet}`,
              borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 16 }}>👀</span>
              <div style={{ flex: 1, fontSize: 12, color: K.violet, fontWeight: 600 }}>
                {waitHint}
              </div>
            </div>
          )}

          {stepKind === 'action' && actionDone && step.requiresAction && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: K.mintSoft, borderRadius: 10, padding: '8px 14px',
              fontSize: 12, fontWeight: 600, color: K.mintInk,
            }}>
              ✓ Выполнено — нажмите «Далее»
            </div>
          )}

          {stepKind === 'wait' && waitReady && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: K.mintSoft, borderRadius: 10, padding: '8px 14px',
              fontSize: 12, fontWeight: 600, color: K.mintInk,
            }}>
              ✓ Отлично — жмите «Далее»
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Returns the nav id that onboarding currently wants the player to visit
export function getOnboardingTargetNav(
  onboardingStage: number,
  onboardingStepIndex: number,
  onboardingCompleted: boolean,
): NavId | undefined {
  if (onboardingCompleted) return undefined
  const stageConfig = ONBOARDING_STAGES[onboardingStage as 0 | 1 | 2 | 3 | 4]
  if (!stageConfig) return undefined
  const step = stageConfig.steps[onboardingStepIndex ?? 0]
  if (!step?.requiresAction) return undefined
  return ACTION_TO_NAV[step.requiresAction]
}
