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
    <div style={{ textAlign: 'center' }}>
      {isCrisisDay && !isDisabled && (
        <div style={{
          fontSize: 13, fontWeight: 700, marginBottom: 16, padding: '10px 16px',
          background: 'rgba(255, 90, 90, 0.12)', borderRadius: 12,
          border: '1.5px solid var(--k-bad)', color: 'var(--k-bad)',
        }}>
          ⚠️ Кризисный день — возможны события
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        style={{
          padding: '18px 32px', borderRadius: 999, fontWeight: 800, fontSize: 16,
          border: 'none', cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
          background: isDisabled
            ? 'var(--k-ink-10)'
            : isCrisisDay
            ? 'var(--k-orange)'
            : 'var(--k-green)',
          color: isDisabled
            ? 'var(--k-ink-50)'
            : isCrisisDay
            ? 'var(--k-ink)'
            : 'var(--k-ink)',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.8 : 1,
          transform: isLoading ? 'scale(0.98)' : 'scale(1)',
        }}
      >
        {isLoading
          ? `⏳ Расчёт...`
          : isCrisisDay
          ? `⚡ День ${currentDay} — Кризис`
          : `→ Следующий день`}
      </button>
      {statusText && (
        <p style={{ fontSize: 13, fontWeight: 700, marginTop: 16, color: 'var(--k-good)' }}>
          {statusText}
        </p>
      )}
      {blockedReason && (
        <p style={{ fontSize: 13, fontWeight: 700, marginTop: 16, color: 'var(--k-orange)' }}>
          ⚠️ {blockedReason}
        </p>
      )}
    </div>
  )
}
