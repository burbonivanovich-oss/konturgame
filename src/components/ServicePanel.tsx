import { useState, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'

const SERVICE_ICONS = {
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
  const { services, toggleService } = useGameStore()

  const activeServiceIds = useMemo(
    () => Object.values(services)
      .filter(s => s.isActive)
      .map(s => s.id),
    [services]
  )

  const servicesList = Object.entries(services).map(([_, service]) => ({
    ...service,
    icon: SERVICE_ICONS[service.id as keyof typeof SERVICE_ICONS],
  }))

  return (
    <div className="lg:w-48">
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
                className="relative group"
                title={service.name}
              >
                <span className="text-2xl">{service.icon}</span>
                {service.isActive && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                  {service.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="bg-slate-700 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-right text-sm font-semibold hover:text-red-400 transition"
          >
            ✕
          </button>

          {servicesList.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded border transition ${
                service.isActive
                  ? 'border-green-500 bg-slate-600'
                  : 'border-slate-600 bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{service.icon}</span>
                <span className="font-semibold text-sm">{service.name}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {service.isActive ? '✅ Подключено' : '❌ Не подключено'}
              </p>
              <p className="text-xs text-gray-300 mb-2">
                {service.monthlyPrice.toLocaleString('ru-RU')} ₽/мес
              </p>
              <button
                onClick={() => toggleService(service.id)}
                className={`w-full text-xs py-1 rounded transition ${
                  service.isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {service.isActive ? 'Отключить' : 'Подключить'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
