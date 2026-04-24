import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { Event, ServiceType } from '../../types/game'
import { K } from '../design-system/tokens'

interface EventModalProps {
  isOpen: boolean
  event: Event | null
  onOptionSelect: (optionId: string) => void
  queueLength?: number
}

const SERVICE_ICONS: Record<ServiceType, string> = {
  market: '🛒',
  bank: '🏦',
  ofd: '📄',
  diadoc: '📁',
  fokus: '🔍',
  elba: '📊',
  extern: '⚖️',
}

const SERVICE_NAMES: Record<ServiceType, string> = {
  market: 'Контур.Маркет',
  bank: 'Контур.Банк',
  ofd: 'Контур.ОФД',
  diadoc: 'Контур.Диадок',
  fokus: 'Контур.Фокус',
  elba: 'Контур.Эльба',
  extern: 'Контур.Экстерн',
}

export default function EventModal({ isOpen, event, onOptionSelect, queueLength = 0 }: EventModalProps) {
  const services = useGameStore((s) => s.services)

  if (!event) return null

  const hasService = (serviceId: ServiceType) => services[serviceId]?.isActive ?? false

  const isOptionAvailable = (option: typeof event.options[0]) => {
    if (!option.requiredService) return true
    return hasService(option.requiredService as ServiceType)
  }

  const getOptionIcon = (option: typeof event.options[0]) => {
    if (option.isContourOption && option.requiredService) {
      return SERVICE_ICONS[option.requiredService as ServiceType] ?? '✓'
    }
    return '→'
  }

  const useHorizontal = event.options.length >= 2

  return (
    <Modal
      isOpen={isOpen}
      title=""
      onClose={() => {}}
      size="lg"
      closeButton={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Dark header block */}
        <div style={{
          background: K.ink, borderRadius: 12, padding: '16px 18px', marginBottom: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: K.orange, color: K.white,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
            }}>
              Событие · Требует решения
            </span>
            {queueLength > 0 && (
              <span style={{
                background: 'rgba(255,106,44,0.25)', color: K.orange,
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              }}>
                ещё {queueLength} {queueLength === 1 ? 'событие' : 'события'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, color: K.white, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {event.title}
          </div>
          {event.description && (
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              {event.description}
            </p>
          )}
        </div>

        {/* Options */}
        <div style={{
          display: 'flex',
          flexDirection: useHorizontal ? 'row' : 'column',
          gap: 8,
        }}>
          {event.options.map((option) => {
            const available = isOptionAvailable(option)
            const isContour = option.isContourOption
            const isRisk = !isContour &&
              option.consequences.balanceDelta !== undefined &&
              option.consequences.balanceDelta < -5000

            return (
              <button
                key={option.id}
                onClick={() => available && onOptionSelect(option.id)}
                disabled={!available}
                style={{
                  flex: useHorizontal ? 1 : undefined,
                  width: useHorizontal ? undefined : '100%',
                  textAlign: 'left',
                  padding: '14px 14px',
                  borderRadius: 12,
                  cursor: available ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  opacity: !available ? 0.5 : 1,
                  background: isContour ? K.mint : K.bone,
                  border: isContour
                    ? `1.5px solid ${K.mint}`
                    : `1px solid ${K.line}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, lineHeight: 1.3,
                    color: isContour ? K.white : K.ink,
                    margin: 0, flex: 1,
                  }}>
                    {option.text}
                  </p>
                  {isContour && (
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                      background: 'rgba(255,255,255,0.22)', color: K.white, fontWeight: 700, letterSpacing: '0.08em',
                    }}>
                      КОНТУР
                    </span>
                  )}
                  {isRisk && (
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                      background: 'rgba(255,90,90,0.15)', color: K.bad, fontWeight: 700,
                    }}>
                      РИСК
                    </span>
                  )}
                  {!available && option.requiredService && (
                    <span style={{ fontSize: 10, color: K.bad, fontWeight: 600, flexShrink: 0 }}>
                      🔒 {SERVICE_NAMES[option.requiredService as ServiceType]}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {option.consequences.balanceDelta !== undefined && (
                    <span style={{
                      fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                      color: isContour
                        ? K.white
                        : option.consequences.balanceDelta >= 0 ? K.good : K.bad,
                    }}>
                      {option.consequences.balanceDelta >= 0 ? '+' : ''}
                      {option.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                  {option.consequences.reputationDelta !== undefined && option.consequences.reputationDelta !== 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: isContour ? 'rgba(255,255,255,0.75)' : (option.consequences.reputationDelta >= 0 ? K.good : K.bad),
                      alignSelf: 'flex-end', paddingBottom: 2,
                    }}>
                      реп {option.consequences.reputationDelta >= 0 ? '+' : ''}{option.consequences.reputationDelta}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
