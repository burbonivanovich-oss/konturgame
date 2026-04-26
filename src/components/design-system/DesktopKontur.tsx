import React, { useMemo, useState, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { SYNERGIES_CONFIG } from '../../constants/business'
import { ONBOARDING_STAGES } from '../../constants/onboarding'
import { K } from './tokens'

const ACTIVATION_TOAST: Record<string, { headline: string; detail: string }> = {
  market:  { headline: 'Контур.Маркет подключён!',  detail: '+20% клиентов · +15% к среднему чеку · списания -20%' },
  bank:    { headline: 'Контур.Банк подключён!',    detail: 'Кредиты по 5% · операционная нагрузка -30%' },
  ofd:     { headline: 'Контур.ОФД подключён!',     detail: 'Онлайн-касса в порядке — штрафы ФНС не страшны' },
  diadoc:  { headline: 'Контур.Диадок подключён!',  detail: '+2% клиентов · защита от штрафов до −30 000 ₽' },
  fokus:   { headline: 'Контур.Фокус подключён!',   detail: '+1 репутация/день · защита от мошенников до −55 000 ₽' },
  elba:    { headline: 'Контур.Эльба подключена!',  detail: '+1 лояльность/день · бухгалтерия автоматически' },
  extern:  { headline: 'Контур.Экстерн подключён!', detail: 'Налоговая нагрузка -2% — отчёты сдаются онлайн' },
}

const ONBOARDING_ACTION_SERVICE: Record<string, string> = {
  activate_bank:    'bank',
  activate_ofd:     'ofd',
  activate_market:  'market',
  activate_diadoc:  'diadoc',
  activate_fokus:   'fokus',
  activate_elba:    'elba',
  activate_extern:  'extern',
}

const SERVICE_COLORS: Record<string, string> = {
  market: K.orange,
  bank: K.blue,
  ofd: K.violet,
  diadoc: K.mint,
  fokus: K.orange,
  elba: K.blue,
  extern: K.mint,
}

export function DesktopKontur({ embedded = false }: { embedded?: boolean }) {
  const {
    services, savedBalance, toggleService, balance,
    onboardingStage, onboardingStepIndex, onboardingCompleted,
  } = useGameStore()

  const [toast, setToast] = useState<{ headline: string; detail: string } | null>(null)
  const [justActivated, setJustActivated] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Which service does the current onboarding step want activated?
  const onboardingTargetService = (() => {
    if (onboardingCompleted) return null
    const stage = ONBOARDING_STAGES[onboardingStage as 0 | 1 | 2 | 3 | 4]
    if (!stage) return null
    const step = stage.steps[onboardingStepIndex ?? 0]
    if (!step?.requiresAction) return null
    return ONBOARDING_ACTION_SERVICE[step.requiresAction] ?? null
  })()

  const handleToggle = (serviceId: string, currentlyActive: boolean) => {
    toggleService(serviceId as any)
    if (!currentlyActive) {
      const msg = ACTIVATION_TOAST[serviceId]
      if (msg) {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast(msg)
        setJustActivated(serviceId)
        toastTimer.current = setTimeout(() => {
          setToast(null)
          setJustActivated(null)
        }, 4000)
      }
    }
  }

  const activeSynergies = useMemo(() => {
    return SYNERGIES_CONFIG.filter((syn: any) =>
      syn.requiredServices.every((id: any) => (services as any)[id]?.isActive === true),
    )
  }, [services])

  const servicesList = useMemo(() => {
    return Object.entries(services)
      .map(([_, service]: [string, any]) => ({
        ...service,
        color: SERVICE_COLORS[service.id] ?? K.ink,
      }))
      .sort((a: any, b: any) => (b.isActive ? 1 : -1))
  }, [services])

  const totalCost = servicesList
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.annualPrice, 0)

  const roi = totalCost > 0 ? Math.round(savedBalance / totalCost) : 0

  const wrapperStyle: React.CSSProperties = embedded ? {
    flex: 1, padding: '20px 24px',
    background: K.bone,
    fontFamily: 'Manrope, sans-serif', color: K.ink,
    display: 'flex', gap: 20, letterSpacing: '-0.01em',
    overflow: 'auto',
  } : {
    width: '100%', minHeight: '100vh', background: K.bone,
    fontFamily: 'Manrope, sans-serif', color: K.ink,
    padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
    letterSpacing: '-0.01em',
  }

  return (
    <div style={wrapperStyle}>
      {/* Left — hero savings */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: K.ink }}/>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
            ЭКОСИСТЕМА
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98 }}>
          Контур<br/>
          <span style={{
            background: K.mint, padding: '0 14px',
            borderRadius: 18, display: 'inline-block',
          }}>бережёт.</span>
        </div>

        <div style={{
          background: K.ink, color: '#fff',
          borderRadius: 24, padding: 24, marginTop: 12,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.5, letterSpacing: '0.08em' }}>
                СПАСЕНО
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 4 }} className="k-num">
                {savedBalance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            {roi > 0 && (
              <div style={{
                padding: '6px 10px', borderRadius: 999,
                background: K.mint, color: K.ink,
                fontSize: 12, fontWeight: 800,
              }}>×{roi} ROI</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 2, height: 14, borderRadius: 999, overflow: 'hidden' }}>
            {servicesList.filter(s => s.isActive).map(s => (
              <div key={s.id} style={{
                flex: 1,
                background: s.color,
              }}/>
            ))}
            {servicesList.filter(s => !s.isActive).length > 0 && (
              <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.1)',
              }}/>
            )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>
            {totalCost > 0
              ? `Экономит в ${roi} раз больше, чем стоит подписка (${totalCost.toLocaleString('ru-RU')} ₽/год).`
              : 'Подключите сервисы для максимальной экономии.'}
          </div>
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 18,
          flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
            СИНЕРГИИ · {activeSynergies.length}/{SYNERGIES_CONFIG.length}
          </div>
          {SYNERGIES_CONFIG.map((s: any) => (
            <div key={s.id} style={{
              padding: '10px 12px', borderRadius: 12,
              background: activeSynergies.some((syn: any) => syn.id === s.id)
                ? K.mintSoft
                : K.bone,
              border: activeSynergies.some((syn: any) => syn.id === s.id)
                ? 'none'
                : `1.5px dashed ${K.line}`,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: activeSynergies.some((syn: any) => syn.id === s.id) ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? K.ink
                    : K.line,
                  color: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? '#fff'
                    : K.muted,
                  fontSize: 9, fontWeight: 800,
                }}>{s.requiredServices[0]}</span>
                <span style={{ fontSize: 10, opacity: 0.5, alignSelf: 'center' }}>+</span>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? K.ink
                    : K.line,
                  color: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? '#fff'
                    : K.muted,
                  fontSize: 9, fontWeight: 800,
                }}>{s.requiredServices[1]}</span>
              </div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 700 }}>{s.name}</div>
              {activeSynergies.some((syn: any) => syn.id === s.id) && (
                <span style={{ fontSize: 10, fontWeight: 800, color: K.good }}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right — services grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
              {servicesList.length} СЕРВИСОВ
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Каждый решает проблему</div>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 999,
            background: K.ink, color: '#fff',
            fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
          }}>Подключено {servicesList.filter(s => s.isActive).length} · {totalCost.toLocaleString('ru-RU')} ₽/год</div>
        </div>

        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: '1fr',
          gap: 10,
        }}>
          {servicesList.map(s => {
            const isOnboardingTarget = !s.isActive && s.id === onboardingTargetService
            const wasJustActivated = s.id === justActivated
            return (
            <div
              key={s.id}
              className={isOnboardingTarget ? 'nav-pulse' : undefined}
              style={{
                background: s.isActive ? s.color : '#fff',
                color: s.isActive ? (s.color === K.orange || s.color === K.mint ? K.ink : '#fff') : K.ink,
                border: isOnboardingTarget
                  ? `2px solid ${K.orange}`
                  : wasJustActivated
                  ? `2px solid ${K.mint}`
                  : s.isActive ? 'none' : `1.5px solid ${K.line}`,
                boxShadow: !isOnboardingTarget && wasJustActivated
                  ? `0 0 0 4px rgba(0,200,150,0.2)`
                  : 'none',
                borderRadius: 18, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
                cursor: 'pointer',
                transition: 'opacity 0.2s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {isOnboardingTarget && (
                <div style={{
                  position: 'absolute', top: -1, left: 16,
                  background: K.orange, color: K.white,
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                  padding: '3px 8px', borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase',
                }}>
                  → Следующий шаг
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: isOnboardingTarget ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, marginTop: 2, lineHeight: 1.3 }}>
                    {s.description}
                  </div>
                </div>
                {s.isActive ? (
                  <div style={{
                    padding: '3px 7px', borderRadius: 4,
                    background: s.color === K.orange || s.color === K.mint ? K.ink : '#fff',
                    color: s.color === K.orange || s.color === K.mint ? s.color : K.ink,
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                  }}>ON</div>
                ) : (
                  <div style={{
                    width: 14, height: 14, borderRadius: 4,
                    border: `1.5px solid ${K.muted2}`,
                  }}/>
                )}
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>ЦЕНА</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }} className="k-num">
                    {s.annualPrice.toLocaleString('ru-RU')} ₽<span style={{ fontSize: 10, opacity: 0.7 }}>/год</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(s.id, s.isActive)}
                  disabled={!s.isActive && balance < s.annualPrice}
                  style={{
                    border: 'none', cursor: !s.isActive && balance < s.annualPrice ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    padding: '6px 12px', borderRadius: 999,
                    background: s.isActive
                      ? 'rgba(0,0,0,0.2)'
                      : balance >= s.annualPrice
                      ? K.ink
                      : 'rgba(0,0,0,0.1)',
                    color: s.isActive
                      ? 'currentColor'
                      : balance >= s.annualPrice
                      ? '#fff'
                      : K.muted,
                    fontSize: 11, fontWeight: 700,
                    opacity: s.isActive || balance >= s.annualPrice ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {s.isActive ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Activation toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 300,
          background: K.ink, color: K.white,
          padding: '16px 24px', borderRadius: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
          minWidth: 280, maxWidth: 420,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{toast.headline}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', paddingLeft: 24 }}>
            {toast.detail}
          </div>
        </div>
      )}
    </div>
  )
}
