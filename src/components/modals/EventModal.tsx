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
    return '✓'
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`📰 День ${event.day}: ${event.title}`}
      onClose={() => {}}
      size="md"
      closeButton={false}
    >
      <div className="space-y-4">
        {queueLength > 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded px-3 py-1.5 text-xs text-red-300 font-medium">
            ⚠️ Кризисный день — ещё {queueLength} {queueLength === 1 ? 'событие' : 'события'} после этого
          </div>
        )}

        <p className="text-gray-300 text-sm">{event.description}</p>

        <div className="space-y-2">
          {event.options.map((option) => {
            const available = isOptionAvailable(option)
            const isContour = option.isContourOption

            return (
              <button
                key={option.id}
                onClick={() => available && onOptionSelect(option.id)}
                disabled={!available}
                className={`w-full text-left p-3 rounded border transition ${
                  !available
                    ? 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
                    : isContour
                    ? 'border-blue-500 bg-blue-900/40 hover:bg-blue-900/70 hover:border-blue-400'
                    : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{getOptionIcon(option)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{option.text}</p>
                      {isContour && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-700 text-blue-200 font-medium">
                          Контур
                        </span>
                      )}
                      {!available && option.requiredService && (
                        <span className="text-xs text-gray-500">
                          🔒 Нет {SERVICE_NAMES[option.requiredService as ServiceType]}
                        </span>
                      )}
                    </div>
                    {option.consequences.balanceDelta !== undefined && (
                      <p className={`text-xs mt-1 ${
                        option.consequences.balanceDelta >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {option.consequences.balanceDelta >= 0 ? '+' : ''}
                        {option.consequences.balanceDelta.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                    {option.consequences.reputationDelta !== undefined && (
                      <p className={`text-xs ${
                        option.consequences.reputationDelta >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
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
