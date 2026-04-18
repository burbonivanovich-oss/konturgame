import { useState, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'

export default function NextDayButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [blockedReason, setBlockedReason] = useState<string | null>(null)
  const { currentDay, isGameOver, isVictory } = useGameStore()

  const handleClick = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    setBlockedReason(null)
    try {
      const result = useGameStore.getState().advanceDay()
      if (result.blocked) {
        setBlockedReason(result.reason ?? 'Действие заблокировано')
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const isDisabled = isGameOver || isVictory
  const isCrisisDay = currentDay > 0 && currentDay % 9 === 0
  const statusText = isGameOver ? '❌ Игра окончена' : isVictory ? '🎉 Победа!' : ''

  return (
    <div className="text-center">
      {isCrisisDay && !isDisabled && (
        <p className="text-sm text-red-600 font-semibold mb-4 px-4 py-2 bg-red-50 rounded-md border border-red-200">
          ⚠️ Кризисный день — возможны события
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        className={`
          px-16 py-4 rounded-lg font-bold text-lg transition-all transform
          ${
            isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isCrisisDay
              ? 'bg-brand-orange text-white hover:opacity-90 active:scale-95 shadow-md'
              : 'bg-brand-green text-white hover:opacity-90 active:scale-95 shadow-md'
          }
          ${isLoading ? 'opacity-75' : ''}
        `}
      >
        {isLoading
          ? `⏳ Расчёт...`
          : isCrisisDay
          ? `⚡ День ${currentDay} — Кризис`
          : `→ Следующий день`}
      </button>
      {statusText && <p className="text-sm text-brand-green font-semibold mt-3">{statusText}</p>}
      {blockedReason && (
        <p className="text-sm text-brand-orange font-semibold mt-3">⚠️ {blockedReason}</p>
      )}
    </div>
  )
}
