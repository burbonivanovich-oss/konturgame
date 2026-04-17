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
    <div className="lg:w-56">
      {!isExpanded && (
        <div className="bg-slate-700 rounded-lg p-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center py-2 text-sm font-semibold hover:bg-slate-600 rounded transition"
          >
            Сервисы Контура 📘
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
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                  {service.name}
                </div>
              </button>
            ))}
          </div>
          {activeSynergies.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-600">
              <p className="text-xs text-purple-400 font-semibold mb-1">
                ⚡ {activeSynergies.length} синерг.
              </p>
              {activeSynergies.map((syn) => (
                <p key={syn.id} className="text-xs text-gray-400 truncate">
                  {syn.name}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="bg-slate-700 rounded-lg p-4 space-y-3 max-h-[32rem] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Сервисы Контура</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-400 hover:text-red-400 transition"
            >
              ✕
            </button>
          </div>

          {servicesList.map((service) => {
            const canAfford = balance >= service.monthlyPrice
            return (
              <div
                key={service.id}
                className={`p-3 rounded border transition ${
                  service.isActive
                    ? 'border-green-500 bg-slate-600'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{service.icon}</span>
                  <span className="font-semibold text-sm">{service.name}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{service.description}</p>
                <p className="text-xs text-gray-300 mb-2">
                  {service.monthlyPrice.toLocaleString('ru-RU')} ₽/мес
                </p>
                <p className={`text-xs mb-2 ${service.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                  {service.isActive ? '✅ Подключено' : '❌ Не подключено'}
                </p>
                <button
                  onClick={() => toggleService(service.id)}
                  disabled={!service.isActive && !canAfford}
                  title={!service.isActive && !canAfford ? 'Недостаточно средств' : undefined}
                  className={`w-full text-xs py-1.5 rounded transition ${
                    service.isActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : canAfford
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {service.isActive ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            )
          })}

          {/* Active synergies */}
          {activeSynergies.length > 0 && (
            <div className="border-t border-slate-600 pt-3">
              <p className="text-xs font-bold text-purple-400 mb-2">⚡ Активные синергии</p>
              {activeSynergies.map((syn) => (
                <div key={syn.id} className="mb-2 p-2 bg-purple-900/30 rounded border border-purple-700/50">
                  <p className="text-xs font-semibold text-purple-300">{syn.name}</p>
                  <p className="text-xs text-gray-400">{syn.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Possible synergies hint */}
          {activeSynergies.length < SYNERGIES_CONFIG.length && (
            <div className="border-t border-slate-600 pt-3">
              <p className="text-xs text-gray-500 mb-2">Возможные синергии:</p>
              {SYNERGIES_CONFIG.filter(
                (syn) => !syn.requiredServices.every((id) => services[id]?.isActive),
              ).map((syn) => {
                const missing = syn.requiredServices.filter((id) => !services[id]?.isActive)
                return (
                  <div key={syn.id} className="mb-1">
                    <p className="text-xs text-gray-500">
                      {syn.name}:{' '}
                      <span className="text-slate-400">
                        нужен {missing.map((id) => services[id]?.name?.replace('Контур.', '') ?? id).join(', ')}
                      </span>
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
