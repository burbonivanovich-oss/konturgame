import { useState, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'

export default function NextDayButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { currentDay, isGameOver, isVictory } = useGameStore()

  const handleClick = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      useGameStore.getState().nextDay()
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const isDisabled = isGameOver || isVictory
  const disabledReason = isGameOver ? '❌ Игра окончена' : isVictory ? '🎉 Победа!' : ''

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        className={`
          px-12 py-4 rounded-lg font-bold text-lg transition-all transform
          ${
            isDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-95'
          }
          ${isLoading ? 'opacity-75' : ''}
        `}
      >
        {isLoading ? '⏳ День ' + currentDay + '...' : '→ Следующий день'}
      </button>
      {disabledReason && <p className="text-sm text-gray-400 mt-2">{disabledReason}</p>}
    </div>
  )
}
