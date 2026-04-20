import { useGameStore } from '../../stores/gameStore'
import { ECONOMY_CONSTANTS } from '../../constants/business'

export default function StatisticsView() {
  const { currentWeek, balance, reputation, achievements, level } = useGameStore()

  // Calculate game progress
  const weekProgress = (currentWeek / ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR) * 100
  const isYearComplete = currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR

  // Mock survival stats (in real app would be loaded from localStorage)
  const survivalStats = {
    totalGames: 3,
    gamesCompleted: 1,
    averageWeeks: 18,
    bestBalance: 450000,
  }

  const shareText = `Я прожил ${currentWeek} неделю${currentWeek % 10 === 1 ? '' : 'и'} в Бизнесе с Контуром! 💼
Баланс: ${balance.toLocaleString('ru-RU')} ₽
Репутация: ${reputation}%
Уровень: ${level}
Ачивки: ${achievements.length}/24

${isYearComplete ? '✨ Выжил первый год! ✨' : `Прогресс: ${weekProgress.toFixed(0)}%`}

Сыграй в Бизнес с Контуром: https://konturgame.ru`

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: 'Бизнес с Контуром',
        text: shareText,
      }).catch(() => {
        // Fallback to copy
        navigator.clipboard.writeText(shareText)
        alert('Текст скопирован в буфер обмена!')
      })
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(shareText)
      alert('Текст скопирован в буфер обмена!')
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      {/* Current Game Stats */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Текущая игра</h3>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Неделя {currentWeek} из 52</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: weekProgress >= 100 ? 'var(--k-green)' : 'inherit' }}>
              {weekProgress.toFixed(0)}%
            </div>
          </div>
          <div style={{
            width: '100%', height: 8, borderRadius: 4,
            background: 'var(--k-surface)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: isYearComplete ? 'var(--k-green)' : 'var(--k-orange)',
              width: `${Math.min(weekProgress, 100)}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>БАЛАНС</div>
            <div style={{ fontSize: 18, fontWeight: 800 }} className="k-num">
              {balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>РЕПУТАЦИЯ</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {reputation}%
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>УРОВЕНЬ</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {level}/10
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>АЧИВКИ</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {achievements.length}/24
            </div>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: 'var(--k-orange)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          📤 Поделиться результатом
        </button>
      </div>

      {/* Survival Stats */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Статистика выживаемости</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Игр начато</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{survivalStats.totalGames}</div>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Завершено (1 год)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--k-green)' }}>
              {survivalStats.gamesCompleted}
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Ср. выживаемость</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{survivalStats.averageWeeks} нед.</div>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Лучший результат</div>
            <div style={{ fontSize: 20, fontWeight: 800 }} className="k-num">
              {survivalStats.bestBalance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 12, fontStyle: 'italic' }}>
          Статистика сохраняется после завершения каждой игры.
        </div>
      </div>
    </div>
  )
}
