import { useState, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

export default function NextDayButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [blockedReason, setBlockedReason] = useState<string | null>(null)
  const { currentWeek, isGameOver, isVictory, pendingEvent } = useGameStore()

  const handleClick = useCallback(async () => {
    if (isLoading) return
    if (pendingEvent) {
      setBlockedReason('Сначала разрешите событие')
      setTimeout(() => setBlockedReason(null), 2500)
      return
    }
    setIsLoading(true)
    setBlockedReason(null)
    try {
      const result = useGameStore.getState().completeActionsPhase()
      if (result.blocked) {
        setBlockedReason(result.reason ?? 'Действие заблокировано')
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, pendingEvent])

  const isDisabled = isGameOver || isVictory

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        style={{
          padding: '18px 32px', borderRadius: 999, fontWeight: 800, fontSize: 16,
          border: 'none', cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
          background: isDisabled ? K.line : pendingEvent ? K.bone : K.orange,
          color: isDisabled ? K.muted : K.ink,
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.8 : 1,
          width: '100%',
        }}
      >
        {isLoading
          ? '⏳ Расчёт...'
          : pendingEvent
          ? '⏸ Разрешите событие'
          : isGameOver
          ? '❌ Игра окончена'
          : isVictory
          ? '🎉 Победа!'
          : 'Завершить неделю →'}
      </button>
      {blockedReason && (
        <p style={{ fontSize: 13, fontWeight: 700, marginTop: 12, color: K.orange }}>
          ⚠️ {blockedReason}
        </p>
      )}
    </div>
  )
}
