import { useState } from 'react'

const SERVICES = [
  { id: 'market', name: 'Маркет', icon: '🛒', color: 'blue' },
  { id: 'bank', name: 'Банк', icon: '🏦', color: 'green' },
  { id: 'ofd', name: 'ОФД', icon: '📄', color: 'purple' },
  { id: 'diadoc', name: 'Диадок', icon: '📁', color: 'red' },
  { id: 'fokus', name: 'Фокус', icon: '🔍', color: 'yellow' },
  { id: 'elba', name: 'Эльба', icon: '📊', color: 'indigo' },
  { id: 'extern', name: 'Экстерн', icon: '⚖️', color: 'pink' },
]

interface ServicePanelProps {
  activeServices?: string[]
}

export default function ServicePanel({ activeServices = [] }: ServicePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="lg:w-48">
      {/* Свёрнутый вид (иконки) */}
      {!isExpanded && (
        <div className="bg-slate-700 rounded-lg p-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center py-2 text-sm font-semibold hover:bg-slate-600 rounded transition"
          >
            Сервисы Контура 📘
          </button>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                className="relative group"
                title={service.name}
              >
                <span className="text-2xl">{service.icon}</span>
                {activeServices.includes(service.id) && (
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

      {/* Развёрнутый вид (карточки) */}
      {isExpanded && (
        <div className="bg-slate-700 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-right text-sm font-semibold hover:text-red-400 transition"
          >
            ✕
          </button>

          {SERVICES.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded border transition ${
                activeServices.includes(service.id)
                  ? 'border-green-500 bg-slate-600'
                  : 'border-slate-600 bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{service.icon}</span>
                <span className="font-semibold text-sm">{service.name}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {activeServices.includes(service.id) ? '✅ Подключено' : '❌ Не подключено'}
              </p>
              <button
                className={`w-full text-xs py-1 rounded transition ${
                  activeServices.includes(service.id)
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {activeServices.includes(service.id) ? 'Отключить' : 'Подключить'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
