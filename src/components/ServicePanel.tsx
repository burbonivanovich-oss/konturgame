import { useState, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SYNERGIES_CONFIG } from '../constants/business'
import { ONBOARDING_STAGE_LABELS } from '../constants/onboarding'
import type { OnboardingStage } from '../types/game'

const SERVICE_COLORS: Record<string, string> = {
  market: 'var(--k-orange)',
  bank: 'var(--k-blue)',
  ofd: 'var(--k-purple)',
  diadoc: 'var(--k-green)',
  fokus: 'var(--k-orange)',
  elba: 'var(--k-blue)',
  extern: 'var(--k-green)',
}

const SERVICE_ICONS: Record<string, string> = {
  market: '🛒',
  bank: '🏦',
  ofd: '📄',
  diadoc: '📁',
  fokus: '🔍',
  elba: '📊',
  extern: '⚖️',
}

// When each locked service unlocks
const SERVICE_UNLOCK_STAGE: Record<string, OnboardingStage> = {
  bank: 0,
  ofd: 1,
  market: 2,
  diadoc: 3,
  fokus: 3,
  elba: 4,
  extern: 4,
}

export default function ServicePanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { services, toggleService, balance, unlockedServices } = useGameStore()

  const activeSynergies = useMemo(() => {
    return SYNERGIES_CONFIG.filter((syn) =>
      syn.requiredServices.every((id) => services[id]?.isActive === true),
    )
  }, [services])

  const allServicesList = Object.entries(services).map(([_, service]) => ({
    ...service,
    icon: SERVICE_ICONS[service.id] ?? '📌',
    color: SERVICE_COLORS[service.id] ?? 'var(--k-ink)',
  }))

  const visibleServices = allServicesList.filter((s) =>
    (unlockedServices ?? []).includes(s.id)
  )
  const lockedServices = allServicesList.filter((s) =>
    !(unlockedServices ?? []).includes(s.id)
  )

  if (!isExpanded) {
    return (
      <div style={{
        background: 'var(--k-white)', borderRadius: 16, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '100%', padding: '12px', textAlign: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--k-blue)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          📘 Сервисы Контура
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {visibleServices.map((service) => (
            <button
              key={service.id}
              onClick={() => setIsExpanded(true)}
              style={{
                position: 'relative', fontSize: 24, background: 'transparent',
                border: 'none', cursor: 'pointer', padding: 4,
                opacity: 1,
              }}
              title={service.name}
            >
              {service.icon}
              {service.isActive && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--k-green)', border: '2px solid white',
                }}/>
              )}
            </button>
          ))}
        </div>
        {activeSynergies.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--k-ink-10)', paddingTop: 8,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--k-purple)' }}>
              ⚡ {activeSynergies.length} синергия
            </div>
            {activeSynergies.slice(0, 2).map((syn) => (
              <div key={syn.id} style={{ fontSize: 10, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {syn.name}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--k-white)', borderRadius: 16, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
      maxHeight: '40rem', overflow: 'hidden', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Экосистема Контура</div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            fontSize: 18, color: 'var(--k-ink-50)', background: 'transparent',
            border: 'none', cursor: 'pointer', padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Unlocked services */}
      {visibleServices.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--k-green)', marginBottom: 8, opacity: 0.7 }}>
          ✓ Доступные сервисы на этом этапе
        </div>
      )}
      {visibleServices.map((service) => {
        const canAfford = balance >= service.yearlyPrice
        const isUnlocked = unlockedServices.includes(service.id)
        return (
          <div
            key={service.id}
            style={{
              background: service.isActive ? service.color : 'var(--k-white)',
              color: service.isActive ? (service.color === 'var(--k-orange)' || service.color === 'var(--k-green)' ? 'var(--k-ink)' : '#fff') : 'var(--k-ink)',
              borderRadius: 12, padding: 12, border: service.isActive ? 'none' : '1px solid var(--k-ink-10)',
              display: 'flex', flexDirection: 'column', gap: 8,
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{service.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{service.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{service.yearlyPrice.toLocaleString('ru-RU')} ₽/год</div>
              </div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.3 }}>{service.description}</div>
            <button
              onClick={() => isUnlocked && toggleService(service.id)}
              disabled={!isUnlocked}
              style={{
                width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: service.isActive
                  ? 'rgba(0,0,0,0.2)'
                  : 'rgba(0,0,0,0.15)',
                opacity: 1,
                color: 'inherit',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {service.isActive ? '✓ Подключено' : `Подключить`}
            </button>
          </div>
        )
      })}

      {/* Locked services */}
      {lockedServices.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.35, letterSpacing: '0.08em', marginTop: 4 }}>
            🔒 ОТКРОЕТСЯ ПОЗЖЕ
          </div>
          {lockedServices.map((service) => {
            const unlockStage = SERVICE_UNLOCK_STAGE[service.id]
            const stageLabel = unlockStage !== undefined ? ONBOARDING_STAGE_LABELS[unlockStage] : ''
            return (
              <div key={service.id} style={{
                borderRadius: 12, padding: 12, border: '1px dashed var(--k-ink-10)',
                display: 'flex', flexDirection: 'column', gap: 6,
                opacity: 0.45,
                filter: 'grayscale(0.8)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{service.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{service.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>{service.yearlyPrice.toLocaleString('ru-RU')} ₽/год</div>
                  </div>
                  <div style={{ fontSize: 18 }}>🔒</div>
                </div>
                {stageLabel && (
                  <div style={{ fontSize: 10, fontStyle: 'italic' }}>
                    Откроется на этапе: {stageLabel}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {activeSynergies.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--k-ink-10)', paddingTop: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--k-purple)', letterSpacing: '0.05em' }}>
            ⚡ АКТИВНЫЕ СИНЕРГИИ ({activeSynergies.length})
          </div>
          {activeSynergies.map((syn) => (
            <div key={syn.id} style={{
              background: 'var(--k-purple-soft)', borderRadius: 10, padding: 10,
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--k-purple)' }}>{syn.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.3 }}>{syn.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
