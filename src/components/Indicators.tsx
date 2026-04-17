import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'

function getColorClass(value: number): string {
  if (value >= 70) return 'text-green-400'
  if (value >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function getBarColor(value: number): string {
  if (value >= 70) return 'bg-green-500'
  if (value >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function Indicators() {
  const { reputation, loyalty, stockBatches } = useGameStore()

  const stockLevel = useMemo(() => {
    if (!stockBatches.length) return 0
    const totalQuantity = stockBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    const capacity = useGameStore.getState().capacity
    return Math.min(100, Math.round((totalQuantity / capacity) * 100))
  }, [stockBatches])
  return (
    <div className="space-y-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">⭐ Репутация</span>
          <span className={`font-semibold ${getColorClass(reputation)}`}>{reputation}/100</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getBarColor(reputation)}`}
            style={{ width: `${reputation}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">❤️ Лояльность</span>
          <span className={`font-semibold ${getColorClass(loyalty)}`}>{loyalty}/100</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getBarColor(loyalty)}`}
            style={{ width: `${loyalty}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">📦 Склад</span>
          <span className={`font-semibold ${getColorClass(stockLevel)}`}>{stockLevel}%</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getBarColor(stockLevel)}`}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>
    </div>
  )
}
