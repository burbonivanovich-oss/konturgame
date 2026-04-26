import { useGameStore } from '../stores/gameStore'
import { TUTORIAL_MOMENTS } from '../constants/tutorialMoments'
import type { NavId } from './design-system/KLeftRail'
import { K } from './design-system/tokens'

interface TutorialMomentsProps {
  onNavigate?: (nav: NavId) => void
}

// Renders one active just-in-time tutorial moment as a centered modal.
// Only one shows at a time (priority by definition order). Player dismisses,
// next render evaluates again — may surface the next eligible moment.
export function TutorialMoments({ onNavigate }: TutorialMomentsProps) {
  const state = useGameStore()
  const markSeen = useGameStore(s => s.markTutorialMomentSeen)

  if (!state.onboardingCompleted && (state.onboardingStage ?? 0) < 1) {
    // Don't surface tutorials until the player has at least started stage 1
    return null
  }

  const seen = new Set(state.seenTutorialMoments ?? [])
  const active = TUTORIAL_MOMENTS.find(m => !seen.has(m.id) && m.shouldShow(state as any))
  if (!active) return null

  const handleDismiss = () => markSeen(active.id)
  const handleCta = () => {
    if (active.targetNav && onNavigate) onNavigate(active.targetNav)
    markSeen(active.id)
  }

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 95,
        background: 'rgba(20,30,50,0.5)',
        display: 'grid', placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: K.white, borderRadius: 18,
          padding: 26, maxWidth: 420, width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.01em',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: K.bone,
            display: 'grid', placeItems: 'center', fontSize: 26,
          }}>
            {active.icon}
          </div>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 800, color: K.orange,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Подсказка
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: K.ink, marginTop: 2 }}>
              {active.title}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: 13, color: K.ink2, lineHeight: 1.55,
          whiteSpace: 'pre-line',
        }}>
          {active.body}
        </div>

        <div style={{
          marginTop: 20, display: 'flex', gap: 10,
        }}>
          {active.targetNav && active.ctaLabel && (
            <button
              onClick={handleCta}
              className="nav-pulse"
              style={{
                flex: 1, padding: '12px 18px', borderRadius: 10, border: 'none',
                background: K.orange, color: K.white,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {active.ctaLabel} →
            </button>
          )}
          <button
            onClick={handleDismiss}
            style={{
              flex: active.targetNav ? '0 0 auto' : 1,
              padding: '12px 18px', borderRadius: 10,
              border: `1px solid ${K.line}`, background: K.white,
              color: K.ink, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Понял
          </button>
        </div>
      </div>
    </div>
  )
}
