import { useGameStore } from '../../stores/gameStore'
import { Event } from '../../types/game'
import { K } from './tokens'

interface DesktopEventProps {
  event?: Event | null
  onOptionSelect?: (optionId: string) => void
  queueLength?: number
}

export function DesktopEvent({ event, onOptionSelect, queueLength = 0 }: DesktopEventProps) {
  if (!event) return null

  const currentIndex = Math.max(0, queueLength - 1)
  const totalEvents = queueLength + 1

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: 'rgba(14,17,22,0.72)',
      fontFamily: 'Manrope, sans-serif', position: 'fixed', top: 0, left: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', zIndex: 1000,
    }}>
      {/* Blurred dashboard behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: K.bone,
        filter: 'blur(24px) brightness(0.75)',
        opacity: 0.8,
      }}/>

      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: 60, left: 60, width: 320, height: 120,
        background: K.orange, opacity: 0.3, borderRadius: 24,
        filter: 'blur(8px)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 80, right: 80, width: 420, height: 180,
        background: K.violet, opacity: 0.25, borderRadius: 24,
        filter: 'blur(8px)',
      }}/>

      {/* Modal */}
      <div style={{
        position: 'relative', width: '90%', maxWidth: 900,
        background: K.ink, color: '#fff',
        borderRadius: 32, padding: 36,
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: K.orange, color: K.ink,
              fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
            }}>СОБЫТИЕ · ДЕНЬ {event.day}</div>
            <div style={{ fontSize: 12, opacity: 0.5, fontWeight: 700 }}>
              День {event.day} · Событие {currentIndex + 1}/{totalEvents}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02,
            }}>
              {event.title}
            </div>
            <div style={{ fontSize: 15, opacity: 0.6, lineHeight: 1.45, marginTop: 12 }}>
              {event.description}
            </div>
          </div>

          {/* Illustration placeholder */}
          <div style={{
            height: 220, display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 8,
          }}>
            <div style={{
              gridRow: 'span 2',
              background: K.violet, borderRadius: 20,
              padding: 20, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                background: '#fff', borderRadius: 12,
                padding: 14, height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                {event.title.charAt(0)}
              </div>
            </div>
            <div style={{
              background: K.orange, borderRadius: 16,
              padding: 14, color: K.ink,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>БЕЗ КОНТУРА</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>−30к</div>
            </div>
            <div style={{
              background: K.mint, borderRadius: 16,
              padding: 14, color: K.ink,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>С КОНТУРОМ</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>−5к</div>
            </div>
          </div>
        </div>

        {/* Choice cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {event.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect?.(option.id)}
              style={{
                background: option.isContourOption ? K.mint : 'rgba(255,255,255,0.06)',
                border: option.isContourOption ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
                color: option.isContourOption ? K.ink : '#fff',
                borderRadius: 20, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 10,
                cursor: 'pointer', transition: 'opacity 0.2s',
                fontSize: 15, fontWeight: 800,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ textAlign: 'left' }}>{option.text}</div>
              {option.consequences.balanceDelta !== undefined && (
                <div style={{
                  fontSize: 12, fontWeight: 600, opacity: 0.8,
                  textAlign: 'left',
                }}>
                  {option.consequences.balanceDelta > 0 ? '+' : '−'}
                  {Math.abs(option.consequences.balanceDelta).toLocaleString('ru-RU')} ₽
                </div>
              )}
              {option.isContourOption && (
                <div style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800,
                  background: K.ink, color: K.mint,
                  alignSelf: 'flex-start',
                }}>КОНТУР</div>
              )}
            </button>
          ))}
        </div>

        <div style={{
          padding: 14, borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          fontSize: 12, opacity: 0.6, lineHeight: 1.4,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            padding: '3px 7px', borderRadius: 4, fontSize: 9, fontWeight: 800,
            background: K.mint, color: K.ink,
            whiteSpace: 'nowrap',
          }}>ПОДСКАЗКА</span>
          Выбирайте опции с меткой КОНТУР для максимальной экономии.
        </div>
      </div>
    </div>
  )
}
