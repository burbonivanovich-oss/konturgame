import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { Event } from '../../types/game'

interface EventModalProps {
  isOpen: boolean
  event: Event | null
  onOptionSelect: (optionId: string) => void
}

const SERVICE_ICONS = {
  market: '🛒',
  bank: '🏦',
  ofd: '📄',
  diadoc: '📁',
  fokus: '🔍',
  elba: '📊',
  extern: '⚖️',
}

export default function EventModal({ isOpen, event, onOptionSelect }: EventModalProps) {
  if (!event) return null

  const getOptionIcon = (option: typeof event.options[0]) => {
    if (option.isContourOption && option.consequences.serviceId) {
      return SERVICE_ICONS[option.consequences.serviceId as keyof typeof SERVICE_ICONS]
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
        <p className="text-gray-300 text-sm">{event.description}</p>

        <div className="space-y-2">
          {event.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className="w-full text-left p-3 rounded border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-green-500 transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{getOptionIcon(option)}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{option.text}</p>
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
          ))}
        </div>
      </div>
    </Modal>
  )
}
