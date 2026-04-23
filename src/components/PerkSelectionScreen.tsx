import { useState } from 'react'
import { useMetaStore, META_PERKS } from '../stores/metaStore'
import { K } from './design-system/tokens'

interface PerkSelectionScreenProps {
  onContinue: () => void
}

export default function PerkSelectionScreen({ onContinue }: PerkSelectionScreenProps) {
  const { totalRuns, getAvailablePerks, selectedPerk, selectPerk } = useMetaStore()
  const available = getAvailablePerks()
  const [hovered, setHovered] = useState<string | null>(null)

  // No perks yet — first run just ended
  if (available.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', background: K.paper,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif', color: K.ink, padding: 24,
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Первый опыт получен
          </h2>
          <p style={{ fontSize: 15, color: K.ink2, lineHeight: 1.5, marginBottom: 32 }}>
            Каждое банкротство — урок. Со второй попытки откроется первое постоянное преимущество.
          </p>
          <button
            onClick={onContinue}
            style={{
              background: K.ink, color: K.white,
              border: 'none', borderRadius: 12, padding: '14px 40px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Попробовать снова →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: K.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif', color: K.ink, padding: 24,
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: K.muted, textTransform: 'uppercase', marginBottom: 12,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: K.violet, display: 'inline-block' }} />
            Прогресс между запусками
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, marginBottom: 8 }}>
            Выберите преимущество
          </h2>
          <p style={{ fontSize: 14, color: K.ink2, margin: 0 }}>
            Опыт {totalRuns} запуск{totalRuns === 1 ? 'а' : 'ов'} — разблокировано {available.length} из {META_PERKS.length} перков
          </p>
        </div>

        {/* Perk cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {available.map(perk => {
            const isSelected = selectedPerk === perk.id
            const isHovered = hovered === perk.id
            return (
              <button
                key={perk.id}
                onClick={() => selectPerk(isSelected ? null : perk.id)}
                onMouseEnter={() => setHovered(perk.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isSelected ? K.ink : isHovered ? K.bone : K.white,
                  border: `1.5px solid ${isSelected ? K.ink : isHovered ? K.ink2 : K.line}`,
                  borderRadius: 14, padding: '16px 20px',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: isSelected ? 'rgba(255,255,255,0.15)' : K.lineSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {perk.id === 'extra_capital' ? '💰' :
                   perk.id === 'rent_grace_week1' ? '🏠' :
                   perk.id === 'bank_headstart' ? '🏦' :
                   perk.id === 'reputation_boost' ? '⭐' : '⚡'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: isSelected ? K.white : K.ink,
                    marginBottom: 3,
                  }}>
                    {perk.name}
                  </div>
                  <div style={{
                    fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.6)' : K.ink2,
                    lineHeight: 1.4,
                  }}>
                    {perk.description}
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${isSelected ? K.white : K.line}`,
                  background: isSelected ? K.white : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke={K.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}

          {/* Show locked perks */}
          {META_PERKS.filter(p => !available.find(a => a.id === p.id)).map(perk => (
            <div
              key={perk.id}
              style={{
                background: K.white, border: `1.5px solid ${K.lineSoft}`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, opacity: 0.4,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: K.lineSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                🔒
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: K.ink }}>{perk.name}</div>
                <div style={{ fontSize: 12, color: K.muted }}>Откроется после следующего запуска</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%',
            background: selectedPerk ? K.ink : K.bone,
            color: selectedPerk ? K.white : K.muted,
            border: 'none', borderRadius: 12, padding: '14px 24px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        >
          {selectedPerk ? 'Начать с преимуществом →' : 'Пропустить и начать →'}
        </button>
      </div>
    </div>
  )
}
