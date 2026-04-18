import { useState, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SYNERGIES_CONFIG } from '../constants/business'

const SERVICE_ICONS: Record<string, string> = {
  market: '🛒',
  bank: '🏦',
  ofd: '📄',
  diadoc: '📁',
  fokus: '🔍',
  elba: '📊',
  extern: '⚖️',
}

export default function ServicePanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { services, toggleService, balance } = useGameStore()

  const activeSynergies = useMemo(() => {
    return SYNERGIES_CONFIG.filter((syn) =>
      syn.requiredServices.every((id) => services[id]?.isActive === true),
    )
  }, [services])

  const servicesList = Object.entries(services).map(([_, service]) => ({
    ...service,
    icon: SERVICE_ICONS[service.id] ?? '📌',
  }))

  return (
    <div className="w-full lg:w-64">
      {!isExpanded && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center py-2 text-sm font-bold text-brand-blue hover:text-brand-blue/80 transition"
          >
            📘 Сервисы Контура
          </button>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {servicesList.map((service) => (
              <button
                key={service.id}
                onClick={() => setIsExpanded(true)}
                className="relative group"
                title={service.name}
              >
                <span className="text-2xl">{service.icon}</span>
                {service.isActive && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand-green rounded-full border border-white" />
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                  {service.name}
                </div>
              </button>
            ))}
          </div>
          {activeSynergies.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-bold text-brand-purple mb-2">
                ⚡ {activeSynergies.length} синергия
              </p>
              {activeSynergies.slice(0, 2).map((syn) => (
                <p key={syn.id} className="text-xs text-gray-600 truncate">
                  {syn.name}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="bg-white rounded-lg p-4 space-y-3 max-h-[40rem] overflow-y-auto border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-800">Экосистема Контура</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-lg text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>

          {servicesList.map((service) => {
            const canAfford = balance >= service.monthlyPrice
            return (
              <div
                key={service.id}
                className={`p-3 rounded-md border transition ${
                  service.isActive
                    ? 'border-brand-green bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.monthlyPrice.toLocaleString('ru-RU')} ₽/мес</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{service.description}</p>
                <button
                  onClick={() => toggleService(service.id)}
                  disabled={!service.isActive && !canAfford}
                  title={!service.isActive && !canAfford ? 'Недостаточно средств' : undefined}
                  className={`w-full text-xs py-2 rounded-md transition font-semibold ${
                    service.isActive
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : canAfford
                        ? 'bg-brand-green text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {service.isActive ? '✓ Подключено' : 'Подключить'}
                </button>
              </div>
            )
          })}

          {/* Active synergies */}
          {activeSynergies.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs font-bold text-brand-purple mb-2">⚡ Активные синергии ({activeSynergies.length})</p>
              {activeSynergies.map((syn) => (
                <div key={syn.id} className="mb-2 p-2 bg-purple-50 rounded-md border border-purple-200">
                  <p className="text-xs font-semibold text-brand-purple">{syn.name}</p>
                  <p className="text-xs text-gray-600">{syn.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
