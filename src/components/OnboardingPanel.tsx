import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { ONBOARDING_STAGES, ONBOARDING_STAGE_LABELS, SERVICE_UNLOCK_MAP } from '../constants/onboarding'
import {
  isStepActionDone,
  isWaitStepReady,
  checkOnboardingBlocked,
  getBlockedActionStep,
} from '../services/onboardingEngine'
import type { OnboardingTrigger, OnboardingStage } from '../types/game'
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
  activate_bank:    'Открыть Банк',
  activate_ofd:     'Открыть ОФД',
  activate_market:  'Открыть Маркет',
  activate_diadoc:  'Открыть Диадок',
  activate_fokus:   'Открыть Фокус',
  activate_elba:    'Открыть Эльбу',
  activate_extern:  'Открыть Экстерн',
  buy_register:     'Купить кассу',
}

const WAIT_HINT: Record<OnboardingTrigger, string> = {
  first_day_completed:  'Нажмите «Следующий день →» внизу экрана',
  first_event_shown:    'Дождитесь первого события',
  first_event_resolved: 'Выберите вариант ответа на событие',
  low_energy:           'Сыграйте несколько дней',
  negative_balance:     'Продолжайте играть',
  low_stock:            'Продолжайте играть',
}

const SERVICE_LABEL: Record<string, string> = {
  bank: 'Банк', ofd: 'ОФД', market: 'Маркет',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

// One unified skip dialog state
type ConfirmState = 'none' | 'skip-step' | 'skip-all'

export function OnboardingPanel({ onNavigate, onAction }: OnboardingPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [confirm, setConfirm] = useState<ConfirmState>('none')

  // Stage-opener modal state — pops once per stage transition
  const [openerStage, setOpenerStage] = useState<OnboardingStage | null>(null)
  const previousStageRef = useRef<number | null>(null)

  const gameState = useGameStore()
  const {
    onboardingStage, onboardingStepIndex, onboardingCompleted,
    nextOnboardingStep, advanceOnboardingStage, completeOnboarding,
    skipOnboarding, skipOnboardingStep, claimEmergencyGrant,
    onboardingEmergencyGrantUsed,
  } = gameState

  // Detect stage transition (1→2, 2→3, etc.) and open the stage modal.
  // Skip stage 0 (start) since the player just got there from business
  // selector and doesn't need a "you've reached stage 0" celebration.
  useEffect(() => {
    if (onboardingCompleted) return
    const prev = previousStageRef.current
    if (prev !== null && onboardingStage > prev && onboardingStage > 0) {
      setOpenerStage(onboardingStage as OnboardingStage)
    }
    previousStageRef.current = onboardingStage
  }, [onboardingStage, onboardingCompleted])

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

  const stepKind: 'intro' | 'action' | 'wait' =
    step.kind ?? (step.requiresAction ? 'action' : 'intro')

  const actionDone = stepKind === 'action' ? isStepActionDone(gameState as any, step) : true
  const waitReady = stepKind === 'wait' ? isWaitStepReady(gameState as any, step) : true
  const needsAction = stepKind === 'action' && !actionDone
  const isWaiting = stepKind === 'wait' && !waitReady

  const { insufficientFunds } = checkOnboardingBlocked(gameState as any)
  const blockedStep = getBlockedActionStep(gameState as any)
  const canSkipStep = blockedStep !== null
  const canSkipAll = onboardingStage >= 1

  const targetNav = step.requiresAction ? ACTION_TO_NAV[step.requiresAction] : undefined
  const actionLabel = step.requiresAction ? ACTION_LABEL[step.requiresAction] : undefined
  const waitHint = stepKind === 'wait' && step.waitForTrigger ? WAIT_HINT[step.waitForTrigger] : undefined

  const canProceed = !needsAction && !isWaiting

  const handleConfirm = () => {
    if (!canProceed) return
    setConfirm('none')
    if (isLastStep) {
      if (isLastStage) completeOnboarding()
      else advanceOnboardingStage()
    } else {
      nextOnboardingStep()
    }
  }

  const handleSkipStep = () => {
    skipOnboardingStep()
    setConfirm('none')
  }

  const handleSkipAll = () => {
    skipOnboarding()
    setConfirm('none')
  }

  const nextLabel = (() => {
    if (isLastStep && isLastStage) return 'Готово!'
    if (isLastStep) return 'Принято ✓'
    if (stepKind === 'intro') return 'Понял →'
    return 'Далее →'
  })()

  // State-driven accent: orange for action, violet for wait, dark for intro
  const accent = needsAction ? K.orange : isWaiting ? K.violet : K.ink

  return (
    <>
      {/* Stage-opener modal: fires once per stage advance */}
      {openerStage !== null && (
        <StageOpenerModal
          stage={openerStage}
          onClose={() => setOpenerStage(null)}
        />
      )}

      {/* Bottom-center sticky bar — fixed positioning over the viewport.
          Z-index sits above content but below modals. Doesn't push layout. */}
      <div
        style={{
          position: 'fixed',
          bottom: 90,  // clears NextDayButton on desktop and mobile tab bar
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          width: 'min(640px, calc(100vw - 32px))',
          background: K.white,
          border: `2px solid ${accent}`,
          borderRadius: 18,
          boxShadow: '0 8px 28px rgba(20,30,50,0.18), 0 2px 6px rgba(20,30,50,0.08)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Manrope, sans-serif',
          letterSpacing: '-0.01em',
        }}
      >
        {/* Top progress bar — 5 stages with labels */}
        <StageProgressBar currentStage={onboardingStage} stepInStage={clampedIndex + 1} totalInStage={steps.length} />

        {/* Main row: icon + content + action */}
        <div style={{
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* Left: state icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: needsAction ? 'rgba(255,107,0,0.12)' : isWaiting ? 'rgba(127,77,233,0.12)' : 'rgba(20,30,50,0.06)',
            color: accent,
            display: 'grid', placeItems: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            {needsAction ? '🎯' : isWaiting ? '⏳' : '📚'}
          </div>

          {/* Center: title + subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
              color: accent, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {needsAction ? 'СЕЙЧАС НУЖНО' : isWaiting ? 'ЖДЁМ ВАС В ИГРЕ' : 'ОБУЧЕНИЕ'}
              <span style={{ color: K.muted, fontWeight: 600 }}>
                · {ONBOARDING_STAGE_LABELS[onboardingStage]}
              </span>
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: K.ink, marginTop: 2, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {step.title}
            </div>
          </div>

          {/* Right: action button */}
          {needsAction && actionLabel && (
            <button
              onClick={() => {
                if (targetNav) onNavigate(targetNav)
                if (step.requiresAction) onAction?.(step.requiresAction)
              }}
              style={{
                padding: '11px 18px', borderRadius: 10, border: 'none',
                background: K.orange, color: K.white,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', flexShrink: 0,
                boxShadow: '0 2px 6px rgba(255,107,0,0.35)',
              }}
            >
              {actionLabel} →
            </button>
          )}

          {isWaiting && (
            <div style={{
              padding: '8px 14px', borderRadius: 999,
              background: 'rgba(127,77,233,0.10)', color: K.violet,
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: K.violet,
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
              Играйте
            </div>
          )}

          {canProceed && (
            <button
              onClick={handleConfirm}
              style={{
                padding: '11px 18px', borderRadius: 10, border: 'none',
                background: K.ink, color: K.white,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              {nextLabel}
            </button>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
            style={{
              width: 28, height: 28, padding: 0, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: K.muted, fontSize: 14, fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            {expanded ? '▼' : '▲'}
          </button>
        </div>

        {/* Expanded body — text + helpers */}
        {expanded && (
          <div style={{
            padding: '0 18px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
            borderTop: `1px solid ${K.lineSoft}`,
            paddingTop: 14, marginTop: 0,
          }}>
            <div style={{
              fontSize: 13, color: K.ink2, lineHeight: 1.55, whiteSpace: 'pre-line',
            }}>
              {step.text}
            </div>

            {/* Insufficient funds warning + emergency grant */}
            {insufficientFunds && !onboardingEmergencyGrantUsed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff8f0', border: `1px solid ${K.orange}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 16 }}>💸</span>
                <div style={{ flex: 1, fontSize: 12, color: K.ink2 }}>
                  <span style={{ fontWeight: 700, color: K.orange }}>Не хватает на кассу.</span>
                  {' '}Государство поддерживает новый бизнес — получите грант 15 000 ₽
                </div>
                <button
                  onClick={() => claimEmergencyGrant()}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: K.orange, color: K.white,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    flexShrink: 0,
                  }}
                >
                  Получить грант
                </button>
              </div>
            )}

            {isWaiting && waitHint && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(127,77,233,0.06)', border: `1px solid ${K.violet}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 16 }}>👀</span>
                <div style={{ flex: 1, fontSize: 12, color: K.violet, fontWeight: 600 }}>
                  {waitHint}
                </div>
              </div>
            )}

            {needsAction && actionDone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: K.mintSoft, borderRadius: 10, padding: '8px 14px',
                fontSize: 12, fontWeight: 600, color: K.mintInk,
              }}>
                ✓ Выполнено — нажмите «Далее»
              </div>
            )}

            {isWaiting === false && stepKind === 'wait' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: K.mintSoft, borderRadius: 10, padding: '8px 14px',
                fontSize: 12, fontWeight: 600, color: K.mintInk,
              }}>
                ✓ Отлично — жмите «Далее»
              </div>
            )}

            {/* Skip controls — single unified row */}
            {(canSkipStep || canSkipAll) && confirm === 'none' && (
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 10,
                paddingTop: 4, borderTop: `1px dashed ${K.lineSoft}`, marginTop: 4,
              }}>
                {canSkipStep && !actionDone && (
                  <button
                    onClick={() => setConfirm('skip-step')}
                    style={{
                      padding: '5px 12px', borderRadius: 8,
                      border: `1px solid ${K.lineSoft}`, background: 'transparent',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', color: K.muted,
                    }}
                  >
                    Пропустить шаг
                  </button>
                )}
                {canSkipAll && (
                  <button
                    onClick={() => setConfirm('skip-all')}
                    style={{
                      padding: '5px 12px', borderRadius: 8,
                      border: `1px solid ${K.lineSoft}`, background: 'transparent',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', color: K.muted,
                    }}
                  >
                    Пропустить обучение
                  </button>
                )}
              </div>
            )}

            {confirm === 'skip-step' && (
              <ConfirmRow
                text="Пропустить сервис — значит отказаться от его защиты. Продолжить без него?"
                primaryLabel="Пропустить шаг"
                primaryColor="#e53e3e"
                onConfirm={handleSkipStep}
                onCancel={() => setConfirm('none')}
              />
            )}

            {confirm === 'skip-all' && (
              <ConfirmRow
                text="Все сервисы будут разблокированы сразу, без объяснений. Пропустить всё обучение?"
                primaryLabel="Да, пропустить"
                primaryColor="#718096"
                onConfirm={handleSkipAll}
                onCancel={() => setConfirm('none')}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

function ConfirmRow({ text, primaryLabel, primaryColor, onConfirm, onCancel }: {
  text: string
  primaryLabel: string
  primaryColor: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      borderTop: `1px solid ${K.lineSoft}`, paddingTop: 10, marginTop: 4,
    }}>
      <div style={{ flex: 1, fontSize: 12, color: K.ink2 }}>{text}</div>
      <button
        onClick={onCancel}
        style={{
          padding: '5px 12px', borderRadius: 8,
          border: `1px solid ${K.lineSoft}`, background: K.white,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          color: K.ink2,
        }}
      >
        Отмена
      </button>
      <button
        onClick={onConfirm}
        style={{
          padding: '5px 14px', borderRadius: 8, border: 'none',
          background: primaryColor, color: K.white,
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {primaryLabel}
      </button>
    </div>
  )
}

// 5-stage horizontal progress bar — replaces tiny dot indicator with labeled
// segments. Past stages filled, current stage shows step counter, future stages
// dim. Reads as a journey, not a notification.
function StageProgressBar({ currentStage, stepInStage, totalInStage }: {
  currentStage: number
  stepInStage: number
  totalInStage: number
}) {
  return (
    <div style={{
      display: 'flex', gap: 4,
      padding: '8px 12px 0',
    }}>
      {[0, 1, 2, 3, 4].map(s => {
        const isPast = s < currentStage
        const isCurrent = s === currentStage
        return (
          <div key={s} style={{
            flex: 1, position: 'relative',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <div style={{
              height: 4, borderRadius: 999,
              background: isPast ? K.mint : isCurrent ? K.orange : K.lineSoft,
              opacity: isPast ? 0.6 : 1,
              overflow: 'hidden', position: 'relative',
            }}>
              {isCurrent && totalInStage > 0 && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: K.orange,
                  width: `${(stepInStage / totalInStage) * 100}%`,
                  transition: 'width 0.3s',
                }} />
              )}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
              color: isCurrent ? K.orange : isPast ? K.mint : K.muted,
              textAlign: 'center',
              opacity: isCurrent ? 1 : 0.7,
            }}>
              {ONBOARDING_STAGE_LABELS[s as OnboardingStage].toUpperCase()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Stage-opener modal: celebrates entering a new stage, lists what unlocks.
// Fullscreen overlay, dismissible, fires once per stage transition.
function StageOpenerModal({ stage, onClose }: { stage: OnboardingStage; onClose: () => void }) {
  const stageConfig = ONBOARDING_STAGES[stage]
  if (!stageConfig) return null

  // Compute newly unlocked services (vs previous stage)
  const prevServices = stage > 0 ? new Set(SERVICE_UNLOCK_MAP[(stage - 1) as OnboardingStage]) : new Set()
  const newServices = SERVICE_UNLOCK_MAP[stage].filter(s => !prevServices.has(s))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(20,30,50,0.55)',
        display: 'grid', placeItems: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: K.white, borderRadius: 22,
          padding: 32, maxWidth: 480, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.01em',
        }}
      >
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
          color: K.orange, textTransform: 'uppercase',
        }}>
          Стадия {stage} из 4 · открылась
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800, color: K.ink,
          margin: '6px 0 10px', lineHeight: 1.15,
        }}>
          {ONBOARDING_STAGE_LABELS[stage]}
        </div>

        {newServices.length > 0 && (
          <div style={{
            marginTop: 14, padding: 14,
            background: K.bone, borderRadius: 12,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
              color: K.muted, textTransform: 'uppercase', marginBottom: 8,
            }}>
              Открылись сервисы:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {newServices.map(s => (
                <div key={s} style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: K.white, border: `1px solid ${K.line}`,
                  fontSize: 12, fontWeight: 700, color: K.ink,
                }}>
                  Контур.{SERVICE_LABEL[s]}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          fontSize: 13, color: K.ink2, marginTop: 14, lineHeight: 1.55,
        }}>
          Сейчас вас проведут через {stageConfig.steps.length} {stageConfig.steps.length === 1 ? 'шаг' : 'шагов'}.
          Подсказка снизу будет вести по очереди — её можно свернуть, если уже знакомы с темой.
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 22, width: '100%',
            padding: '14px 20px', borderRadius: 12, border: 'none',
            background: K.ink, color: K.white,
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
          }}
        >
          Поехали →
        </button>
      </div>
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
