import { useGameStore } from '../stores/gameStore'
import { ONBOARDING_STAGES, ONBOARDING_STAGE_LABELS } from '../constants/onboarding'

export function OnboardingPanel() {
  const {
    onboardingStage, onboardingStepIndex, onboardingCompleted,
    nextOnboardingStep, advanceOnboardingStage, completeOnboarding, services, cashRegisters,
  } = useGameStore()

  if (onboardingCompleted) return null

  const stageConfig = ONBOARDING_STAGES[onboardingStage]
  if (!stageConfig) return null

  const steps = stageConfig.steps
  if (!steps || steps.length === 0) return null
  const clampedStepIndex = Math.min(onboardingStepIndex, steps.length - 1)
  const currentStep = steps[clampedStepIndex]
  if (!currentStep) return null

  const isLastStep = clampedStepIndex >= steps.length - 1
  const isLastStage = onboardingStage >= 4

  const isActionDone = (): boolean => {
    if (!currentStep.requiresAction) return true
    if (currentStep.requiresAction === 'activate_bank') return services?.bank?.isActive ?? false
    if (currentStep.requiresAction === 'activate_ofd') return services?.ofd?.isActive ?? false
    if (currentStep.requiresAction === 'buy_register') return cashRegisters.length > 0
    return true
  }

  const handleNext = () => {
    if (!isActionDone()) return
    if (isLastStep) {
      if (isLastStage) {
        completeOnboarding()
      } else {
        advanceOnboardingStage()
      }
    } else {
      nextOnboardingStep()
    }
  }

  const actionDone = isActionDone()
  const stageLabel = ONBOARDING_STAGE_LABELS[onboardingStage]
  const pendingAction = !!(currentStep.requiresAction && !actionDone)

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 20,
      border: pendingAction ? '2px solid var(--k-orange)' : '1px solid var(--k-ink-10)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Stage progress */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            height: 3, flex: 1, borderRadius: 2,
            background: i <= onboardingStage ? 'var(--k-orange)' : 'var(--k-ink-10)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Stage label */}
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
        color: 'var(--k-orange)', textTransform: 'uppercase',
      }}>
        Этап {onboardingStage + 1} · {stageLabel}
      </div>

      {/* Mentor avatar + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--k-orange), var(--k-blue))',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          🧑‍💼
        </div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{currentStep.title}</div>
      </div>

      {/* Dialog text */}
      <div style={{
        fontSize: 12, lineHeight: 1.6, color: 'var(--k-ink)',
        opacity: 0.8,
      }}>
        {currentStep.text}
      </div>

      {/* Stage completion hint */}
      {isLastStep && !isLastStage && (
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--k-green)',
          background: 'rgba(34, 197, 94, 0.08)',
          borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🔓</span>
          При завершении этапа откроются новые сервисы
        </div>
      )}

      {/* Action required notice */}
      {currentStep.requiresAction && !actionDone && (
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--k-orange)',
          background: 'rgba(255, 107, 0, 0.08)',
          borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠️</span>
          <div>
            {currentStep.requiresAction === 'activate_bank' && 'Подключите Контур.Банк в панели сервисов'}
            {currentStep.requiresAction === 'activate_ofd' && 'Подключите Контур.ОФД в панели сервисов'}
            {currentStep.requiresAction === 'buy_register' && 'Нажмите кнопку "Касса" и купите кассовый аппарат'}
          </div>
        </div>
      )}

      {/* Step dots + button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: i <= clampedStepIndex ? 'var(--k-orange)' : 'var(--k-ink-10)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!actionDone}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: actionDone ? 'var(--k-orange)' : 'var(--k-ink-10)',
            color: actionDone ? '#fff' : 'var(--k-ink-50)',
            fontSize: 12, fontWeight: 700,
            border: 'none', cursor: actionDone ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {isLastStep && isLastStage ? 'Начать работу!' : isLastStep ? 'Понятно!' : 'Далее →'}
        </button>
      </div>
    </div>
  )
}
