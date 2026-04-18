import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'
import { ECONOMY_CONSTANTS } from '../constants/business'

function getStatusColor(value: number): { bg: string; text: string; bar: string } {
  if (value >= 70) return { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' }
  if (value >= 40) return { bg: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-500' }
  return { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' }
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

  const repColor = getStatusColor(reputation)
  const loyaltyColor = getStatusColor(loyalty)
  const stockColor = getStatusColor(stockLevel)

  const servedPct = lastDayResult && lastDayResult.clients > 0
    ? Math.round((lastDayResult.served / lastDayResult.clients) * 100)
    : null

  return (
    <div className="space-y-4">
      {/* Репутация */}
      <div className={`${repColor.bg} rounded-md p-4 border border-gray-200`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">⭐ Репутация</span>
          <span className={`font-bold text-sm ${repColor.text}`}>{reputation}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${repColor.bar}`}
            style={{ width: `${reputation}%` }}
          />
        </div>
      </div>

      {/* Лояльность */}
      <div className={`${loyaltyColor.bg} rounded-md p-4 border border-gray-200`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">❤️ Лояльность</span>
          <span className={`font-bold text-sm ${loyaltyColor.text}`}>{loyalty}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${loyaltyColor.bar}`}
            style={{ width: `${loyalty}%` }}
          />
        </div>
        {loyalty < 70 && premiumCost > 0 && (
          <button
            onClick={handlePremium}
            disabled={balance < premiumCost}
            className={`mt-3 w-full text-xs py-2 rounded-md transition font-semibold ${
              balance >= premiumCost
                ? 'bg-brand-orange text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            💰 Премия персоналу ({premiumCost.toLocaleString('ru-RU')} ₽)
          </button>
        )}
      </div>

      {/* Склад */}
      <div className={`${stockColor.bg} rounded-md p-4 border border-gray-200`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">📦 Склад</span>
          <span className={`font-bold text-sm ${stockColor.text}`}>{stockLevel}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${stockColor.bar}`}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>

      {/* Последние клиенты */}
      {lastDayResult && lastDayResult.clients > 0 && (
        <div className="bg-blue-50 rounded-md p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">👥 Обслуженность</span>
            {lastDayResult.missed > 0 && (
              <span className="text-xs text-red-600 font-semibold">−{lastDayResult.missed} не обслужены</span>
            )}
          </div>
          <div className="flex gap-1 h-3 rounded overflow-hidden">
            <div
              className="bg-brand-green rounded-l transition-all"
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
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>✅ {lastDayResult.served}</span>
            <span>{lastDayResult.clients} всего</span>
          </div>
        </div>
      )}
    </div>
  )
}
