import { useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { ECONOMY_CONSTANTS } from '../../constants/business'

const HISTORY_KEY = 'konturgame_history'

interface GameRecord {
  week: number
  balance: number
  isVictory: boolean
  date: number
}

function loadHistory(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecord(record: GameRecord) {
  const history = loadHistory()
  localStorage.setItem(HISTORY_KEY, JSON.stringify([...history, record]))
}

export default function StatisticsView() {
  const { currentWeek, balance, reputation, loyalty, achievements, level, isGameOver, isVictory, services, purchasedUpgrades, employees, campaignROI, milestoneStatus } = useGameStore()

  const weekProgress = (currentWeek / ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR) * 100
  const isYearComplete = currentWeek >= ECONOMY_CONSTANTS.TOTAL_WEEKS_PER_YEAR

  // Save result to history when game ends
  useEffect(() => {
    if (isGameOver || isVictory) {
      saveRecord({ week: currentWeek, balance, isVictory: !!isVictory, date: Date.now() })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, isVictory])

  const history = loadHistory()
  const totalGames = history.length
  const gamesCompleted = history.filter(g => g.isVictory).length
  const averageWeeks = totalGames > 0 ? Math.round(history.reduce((s, g) => s + g.week, 0) / totalGames) : 0
  const bestBalance = history.reduce((max, g) => Math.max(max, g.balance), 0)

  const activeServices = Object.values(services).filter(s => s.isActive).length
  const milestonesAchieved = [milestoneStatus?.week10, milestoneStatus?.week20, milestoneStatus?.week30].filter(Boolean).length
  const campaignsLaunched = campaignROI?.length ?? 0

  const shareText = `Я прожил ${currentWeek} ${currentWeek % 10 === 1 && currentWeek !== 11 ? 'неделю' : 'недель'} в Бизнесе с Контуром! 💼
Баланс: ${balance.toLocaleString('ru-RU')} ₽
Репутация: ${reputation}%
Уровень: ${level}
Ачивки: ${achievements.length}/20

${isYearComplete ? '✨ Выжил первый год! ✨' : `Прогресс: ${weekProgress.toFixed(0)}%`}

Сыграй в Бизнес с Контуром: https://konturgame.ru`

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Бизнес с Контуром', text: shareText })
      } else {
        await navigator.clipboard.writeText(shareText)
        alert('Текст скопирован в буфер обмена!')
      }
    } catch {
      await navigator.clipboard.writeText(shareText).catch(() => {})
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      {/* Current game */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Текущая игра</h3>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Неделя {currentWeek} из 52</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: weekProgress >= 100 ? 'var(--k-green)' : 'inherit' }}>
              {weekProgress.toFixed(0)}%
            </div>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--k-surface)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: isYearComplete ? 'var(--k-green)' : 'var(--k-orange)',
              width: `${Math.min(weekProgress, 100)}%`, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'БАЛАНС', value: `${balance.toLocaleString('ru-RU')} ₽`, isNum: true },
            { label: 'РЕПУТАЦИЯ', value: `${reputation}%` },
            { label: 'ЛОЯЛЬНОСТЬ', value: `${loyalty}%` },
            { label: 'УРОВЕНЬ', value: `${level}/10` },
            { label: 'СЕРВИСЫ', value: `${activeServices}/7` },
            { label: 'СОТРУДНИКИ', value: String(employees?.length ?? 0) },
            { label: 'КАМПАНИИ', value: String(campaignsLaunched) },
            { label: 'ВЕХИ', value: `${milestonesAchieved}/3` },
            { label: 'АЧИВКИ', value: `${achievements.length}/20` },
            { label: 'УЛУЧШЕНИЯ', value: String(purchasedUpgrades?.length ?? 0) },
          ].map(item => (
            <div key={item.label} style={{ padding: 12, borderRadius: 12, background: 'var(--k-surface)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800 }} className={item.isNum ? 'k-num' : undefined}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: 'var(--k-orange)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          📤 Поделиться результатом
        </button>
      </div>

      {/* Cross-game history */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Статистика выживаемости</h3>

        {totalGames === 0 ? (
          <div style={{
            padding: 16, borderRadius: 12, border: '1px dashed var(--k-ink-10)',
            fontSize: 12, opacity: 0.45, textAlign: 'center',
          }}>
            Статистика появится после первой завершённой игры
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Игр сыграно', value: String(totalGames) },
              { label: 'Выжил год', value: String(gamesCompleted), color: gamesCompleted > 0 ? 'var(--k-green)' : undefined },
              { label: 'Ср. выживаемость', value: `${averageWeeks} нед.` },
              { label: 'Лучший результат', value: `${bestBalance.toLocaleString('ru-RU')} ₽`, isNum: true },
            ].map(item => (
              <div key={item.label} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color }} className={item.isNum ? 'k-num' : undefined}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
