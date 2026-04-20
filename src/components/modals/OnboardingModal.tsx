import { useGameStore } from '../../stores/gameStore'
import { ONBOARDING_STAGES, ONBOARDING_STAGE_LABELS } from '../../constants/onboarding'

export default function OnboardingModal() {
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

  // Check if the required action for this step is done
  const isActionDone = (): boolean => {
    if (!currentStep.requiresAction) return true
    if (currentStep.requiresAction === 'activate_bank') return services?.bank?.isActive ?? false
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
      position: 'fixed', zIndex: 200,
      pointerEvents: pendingAction ? 'none' : 'auto',
      // When action is pending: anchor to bottom-right, no backdrop, pointer-events none
      // When action done or no action: center with full backdrop
      ...(pendingAction ? {
        bottom: 24, right: 24,
        width: 360,
      } : {
        inset: 0,
        background: 'rgba(14,17,22,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }),
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: 28,
        maxWidth: pendingAction ? '100%' : 440, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        pointerEvents: 'auto',
        // Subtle highlight border when floating
        ...(pendingAction ? { border: '2px solid var(--k-orange)' } : {}),
      }}>
        {/* Stage indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: i <= onboardingStage ? 'var(--k-orange)' : 'var(--k-ink-10)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Stage label */}
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--k-orange)', marginBottom: 8, textTransform: 'uppercase',
        }}>
          Этап {onboardingStage + 1} · {stageLabel}
        </div>

        {/* Mentor avatar + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--k-orange), var(--k-blue))',
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            🧑‍💼
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.45, marginBottom: 2 }}>
              Ваш ментор
            </div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{currentStep.title}</div>
          </div>
        </div>

        {/* Dialog text */}
        <div style={{
          fontSize: 13, lineHeight: 1.6, color: 'var(--k-ink)',
          background: 'var(--k-surface)', borderRadius: 14, padding: 16,
          marginBottom: 20,
        }}>
          {currentStep.text}
        </div>

        {/* Action required notice */}
        {currentStep.requiresAction && !actionDone && (
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: 'var(--k-orange)',
            background: 'rgba(255, 107, 0, 0.08)',
            borderRadius: 10, padding: '10px 14px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠️</span>
            {currentStep.requiresAction === 'activate_bank' && 'Подключите Контур.Банк в панели сервисов'}
            {currentStep.requiresAction === 'buy_register' && 'Нажмите кнопку "Касса" и купите кассовый аппарат'}
          </div>
        )}

        {/* Step dots + button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i <= clampedStepIndex ? 'var(--k-orange)' : 'var(--k-ink-10)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!actionDone}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: actionDone ? 'var(--k-orange)' : 'var(--k-ink-10)',
              color: actionDone ? '#fff' : 'var(--k-ink-50)',
              fontSize: 13, fontWeight: 700,
              border: 'none', cursor: actionDone ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {isLastStep && isLastStage ? 'Начать работу!' : isLastStep ? 'Понятно!' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  )
}
