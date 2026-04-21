import React, { useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { SYNERGIES_CONFIG } from '../../constants/business'

const SERVICE_COLORS: Record<string, string> = {
  market: 'var(--k-orange)',
  bank: 'var(--k-blue)',
  ofd: 'var(--k-purple)',
  diadoc: 'var(--k-green)',
  fokus: 'var(--k-orange)',
  elba: 'var(--k-blue)',
  extern: 'var(--k-green)',
}

export function DesktopKontur({ embedded = false }: { embedded?: boolean }) {
  const { services, savedBalance, toggleService, balance } = useGameStore()

  const activeSynergies = useMemo(() => {
    return SYNERGIES_CONFIG.filter((syn: any) =>
      syn.requiredServices.every((id: any) => (services as any)[id]?.isActive === true),
    )
  }, [services])

  const servicesList = useMemo(() => {
    return Object.entries(services)
      .map(([_, service]: [string, any]) => ({
        ...service,
        color: SERVICE_COLORS[service.id] ?? 'var(--k-ink)',
      }))
      .sort((a: any, b: any) => (b.isActive ? 1 : -1))
  }, [services])

  const totalCost = servicesList
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.yearlyPrice, 0)

  const roi = totalCost > 0 ? Math.round(savedBalance / totalCost) : 0

  const wrapperStyle: React.CSSProperties = embedded ? {
    flex: 1, padding: '20px 24px',
    background: 'var(--k-surface)',
    fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
    display: 'flex', gap: 20, letterSpacing: '-0.01em',
    overflow: 'auto',
  } : {
    width: '100%', minHeight: '100vh', background: 'var(--k-surface)',
    fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
    padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
    letterSpacing: '-0.01em',
  }

  return (
    <div style={wrapperStyle}>
      {/* Left — hero savings */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--k-ink)' }}/>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
            ЭКОСИСТЕМА
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98 }}>
          Контур<br/>
          <span style={{
            background: 'var(--k-green)', padding: '0 14px',
            borderRadius: 18, display: 'inline-block',
          }}>бережёт.</span>
        </div>

        <div style={{
          background: 'var(--k-ink)', color: '#fff',
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
                background: 'var(--k-green)', color: 'var(--k-ink)',
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
                ? 'var(--k-green-soft)'
                : 'var(--k-surface)',
              border: activeSynergies.some((syn: any) => syn.id === s.id)
                ? 'none'
                : '1.5px dashed var(--k-ink-10)',
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: activeSynergies.some((syn: any) => syn.id === s.id) ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? 'var(--k-ink)'
                    : 'var(--k-ink-10)',
                  color: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? '#fff'
                    : 'var(--k-ink-50)',
                  fontSize: 9, fontWeight: 800,
                }}>{s.requiredServices[0]}</span>
                <span style={{ fontSize: 10, opacity: 0.5, alignSelf: 'center' }}>+</span>
                <span style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? 'var(--k-ink)'
                    : 'var(--k-ink-10)',
                  color: activeSynergies.some((syn: any) => syn.id === s.id)
                    ? '#fff'
                    : 'var(--k-ink-50)',
                  fontSize: 9, fontWeight: 800,
                }}>{s.requiredServices[1]}</span>
              </div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 700 }}>{s.name}</div>
              {activeSynergies.some((syn: any) => syn.id === s.id) && (
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--k-good)' }}>✓</span>
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
            background: 'var(--k-ink)', color: '#fff',
            fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
          }}>Подключено {servicesList.filter(s => s.isActive).length} · {totalCost.toLocaleString('ru-RU')} ₽/год</div>
        </div>

        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: '1fr',
          gap: 10,
        }}>
          {servicesList.map(s => (
            <div
              key={s.id}
              style={{
                background: s.isActive ? s.color : '#fff',
                color: s.isActive ? (s.color === 'var(--k-orange)' || s.color === 'var(--k-green)' ? 'var(--k-ink)' : '#fff') : 'var(--k-ink)',
                border: s.isActive ? 'none' : '1.5px solid var(--k-ink-10)',
                borderRadius: 18, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, marginTop: 2, lineHeight: 1.3 }}>
                    {s.description}
                  </div>
                </div>
                {s.isActive ? (
                  <div style={{
                    padding: '3px 7px', borderRadius: 4,
                    background: s.color === 'var(--k-orange)' || s.color === 'var(--k-green)' ? 'var(--k-ink)' : '#fff',
                    color: s.color === 'var(--k-orange)' || s.color === 'var(--k-green)' ? s.color : 'var(--k-ink)',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                  }}>ON</div>
                ) : (
                  <div style={{
                    width: 14, height: 14, borderRadius: 4,
                    border: '1.5px solid var(--k-ink-30)',
                  }}/>
                )}
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>ЦЕНА</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }} className="k-num">
                    {s.yearlyPrice.toLocaleString('ru-RU')} ₽<span style={{ fontSize: 10, opacity: 0.7 }}>/год</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleService(s.id)}
                  disabled={!s.isActive && balance < s.yearlyPrice}
                  style={{
                    border: 'none', cursor: !s.isActive && balance < s.yearlyPrice ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    padding: '6px 12px', borderRadius: 999,
                    background: s.isActive
                      ? 'rgba(0,0,0,0.2)'
                      : balance >= s.yearlyPrice
                      ? 'var(--k-ink)'
                      : 'rgba(0,0,0,0.1)',
                    color: s.isActive
                      ? 'currentColor'
                      : balance >= s.yearlyPrice
                      ? '#fff'
                      : 'var(--k-ink-50)',
                    fontSize: 11, fontWeight: 700,
                    opacity: s.isActive || balance >= s.yearlyPrice ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {s.isActive ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
