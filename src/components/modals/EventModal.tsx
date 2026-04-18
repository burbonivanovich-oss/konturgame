import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { Event, ServiceType } from '../../types/game'

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
      <div className="space-y-4">
        {queueLength > 0 && (
          <div className="bg-orange-50 border border-orange-300 rounded-md px-4 py-3 text-sm text-orange-700 font-semibold">
            ⚠️ Кризисный день — ещё {queueLength} {queueLength === 1 ? 'событие' : 'события'} после этого
          </div>
        )}

        <p className="text-gray-700 text-base leading-relaxed">{event.description}</p>

        <div className="grid grid-cols-1 gap-3 pt-4">
          {event.options.map((option) => {
            const available = isOptionAvailable(option)
            const isContour = option.isContourOption

            return (
              <button
                key={option.id}
                onClick={() => available && onOptionSelect(option.id)}
                disabled={!available}
                className={`w-full text-left p-4 rounded-md border-2 transition ${
                  !available
                    ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                    : isContour
                    ? 'border-brand-green bg-green-50 hover:bg-green-100 hover:border-brand-green'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{getOptionIcon(option)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${isContour ? 'text-brand-green' : 'text-gray-800'}`}>
                        {option.text}
                      </p>
                      {isContour && (
                        <span className="text-xs px-2 py-1 rounded-full bg-brand-green text-white font-bold">
                          Контур ✓
                        </span>
                      )}
                      {!available && option.requiredService && (
                        <span className="text-xs text-red-600 font-semibold">
                          🔒 {SERVICE_NAMES[option.requiredService as ServiceType]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs font-semibold">
                      {option.consequences.balanceDelta !== undefined && (
                        <p className={option.consequences.balanceDelta >= 0 ? 'text-brand-green' : 'text-red-600'}>
                          {option.consequences.balanceDelta >= 0 ? '+' : ''}
                          {option.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                        </p>
                      )}
                      {option.consequences.reputationDelta !== undefined && (
                        <p className={option.consequences.reputationDelta >= 0 ? 'text-brand-green' : 'text-red-600'}>
                          Репутация: {option.consequences.reputationDelta >= 0 ? '+' : ''}
                          {option.consequences.reputationDelta}
                        </p>
                      )}
                    </div>
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
