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

  return (
    <Modal
      isOpen={isOpen}
      title={`📰 ${event.title}`}
      onClose={() => {}}
      size="lg"
      closeButton={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {queueLength > 0 && (
          <div style={{
            background: K.orangeSoft,
            border: `1px solid ${K.line}`,
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            fontWeight: 600,
            color: K.orange,
          }}>
            ⚠️ Кризисный день — ещё {queueLength} {queueLength === 1 ? 'событие' : 'события'} после этого
          </div>
        )}

        <p style={{ fontSize: 14, lineHeight: 1.6, color: K.ink2, marginBottom: 16 }}>
          {event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {event.options.map((option) => {
            const available = isOptionAvailable(option)
            const isContour = option.isContourOption

            return (
              <button
                key={option.id}
                onClick={() => available && onOptionSelect(option.id)}
                disabled={!available}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  cursor: available ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  opacity: !available ? 0.5 : 1,
                  background: !available
                    ? K.bone
                    : isContour
                    ? K.mintSoft
                    : K.bone,
                  border: !available
                    ? `1px solid ${K.line}`
                    : isContour
                    ? `1.5px solid ${K.mint}`
                    : `1px solid ${K.line}`,
                }}
              >
                <span style={{ fontSize: 20 }}>{getOptionIcon(option)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isContour ? K.mintInk : K.ink,
                      margin: 0,
                    }}>
                      {option.text}
                    </p>
                    {isContour && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: K.mint,
                        color: K.white,
                        fontWeight: 700,
                      }}>
                        Контур ✓
                      </span>
                    )}
                    {!available && option.requiredService && (
                      <span style={{ fontSize: 11, color: K.bad, fontWeight: 600 }}>
                        🔒 {SERVICE_NAMES[option.requiredService as ServiceType]}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                    {option.consequences.balanceDelta !== undefined && (
                      <p style={{
                        margin: 0,
                        color: option.consequences.balanceDelta >= 0 ? K.good : K.bad,
                      }}>
                        {option.consequences.balanceDelta >= 0 ? '+' : ''}
                        {option.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                    {option.consequences.reputationDelta !== undefined && (
                      <p style={{
                        margin: 0,
                        color: option.consequences.reputationDelta >= 0 ? K.good : K.bad,
                      }}>
                        Репутация: {option.consequences.reputationDelta >= 0 ? '+' : ''}
                        {option.consequences.reputationDelta}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
