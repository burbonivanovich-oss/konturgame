import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'
import { ECONOMY_CONSTANTS } from '../constants/business'

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
  const { reputation, loyalty, stockBatches, capacity, lastDayResult, balance } = useGameStore()
  const { addBalance, addLoyalty } = useGameStore()

  const stockLevel = useMemo(() => {
    if (!stockBatches.length || capacity === 0) return 0
    const totalQuantity = stockBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    return Math.min(100, Math.round((totalQuantity / capacity) * 100))
  }, [stockBatches, capacity])

  const premiumCost = lastDayResult
    ? Math.floor(lastDayResult.revenue * ECONOMY_CONSTANTS.PREMIUM_COST_RATE)
    : 0

  const handlePremium = () => {
    if (premiumCost > 0 && balance >= premiumCost) {
      addBalance(-premiumCost)
      addLoyalty(ECONOMY_CONSTANTS.LOYALTY_BONUS_PREMIUM)
    }
  }

  const servedPct = lastDayResult && lastDayResult.clients > 0
    ? Math.round((lastDayResult.served / lastDayResult.clients) * 100)
    : null

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
        {loyalty < 70 && premiumCost > 0 && (
          <button
            onClick={handlePremium}
            disabled={balance < premiumCost}
            className={`mt-3 w-full text-xs py-1.5 rounded transition font-medium ${
              balance >= premiumCost
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            💰 Премия персоналу ({premiumCost.toLocaleString('ru-RU')} ₽) → +{ECONOMY_CONSTANTS.LOYALTY_BONUS_PREMIUM} лояльности
          </button>
        )}
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

      {lastDayResult && lastDayResult.clients > 0 && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">👥 Клиенты вчера</span>
            {lastDayResult.missed > 0 && (
              <span className="text-xs text-red-400">
                -{lastDayResult.missed} ушли
              </span>
            )}
          </div>
          <div className="flex gap-1 h-4 rounded overflow-hidden">
            <div
              className="bg-green-500 rounded-l transition-all"
              style={{ width: `${servedPct}%` }}
              title={`Обслужено: ${lastDayResult.served}`}
            />
            {lastDayResult.missed > 0 && (
              <div
                className="bg-red-500 rounded-r transition-all"
                style={{ width: `${100 - (servedPct ?? 100)}%` }}
                title={`Ушли: ${lastDayResult.missed}`}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>✅ {lastDayResult.served} обслужено</span>
            <span>📊 {lastDayResult.clients} всего</span>
            {lastDayResult.missed > 0 && <span className="text-red-400">❌ {lastDayResult.missed}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
