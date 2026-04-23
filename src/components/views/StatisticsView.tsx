import { useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { ECONOMY_CONSTANTS } from '../../constants/business'
import { ACHIEVEMENTS } from '../../constants/achievements'
import { K } from '../design-system/tokens'

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
Ачивки: ${achievements.length}/${ACHIEVEMENTS.length}

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
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Текущая игра</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Неделя {currentWeek} из 52</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: weekProgress >= 100 ? K.good : K.ink }}>
              {weekProgress.toFixed(0)}%
            </div>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 4, background: K.lineSoft, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: isYearComplete ? K.mint : K.violet,
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
            { label: 'АЧИВКИ', value: `${achievements.length}/${ACHIEVEMENTS.length}` },
            { label: 'УЛУЧШЕНИЯ', value: String(purchasedUpgrades?.length ?? 0) },
          ].map(item => (
            <div key={item.label} style={{
              padding: 12, borderRadius: 12,
              background: K.white, border: `1px solid ${K.line}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: item.isNum ? 'tabular-nums' : undefined }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: K.ink, color: K.white, border: 'none',
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
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Статистика выживаемости</div>

        {totalGames === 0 ? (
          <div style={{
            padding: 16, borderRadius: 12, border: `1px dashed ${K.line}`,
            fontSize: 12, color: K.muted, textAlign: 'center',
          }}>
            Статистика появится после первой завершённой игры
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Игр сыграно', value: String(totalGames) },
              { label: 'Выжил год', value: String(gamesCompleted), color: gamesCompleted > 0 ? K.good : undefined },
              { label: 'Ср. выживаемость', value: `${averageWeeks} нед.` },
              { label: 'Лучший результат', value: `${bestBalance.toLocaleString('ru-RU')} ₽`, isNum: true },
            ].map(item => (
              <div key={item.label} style={{
                padding: 12, borderRadius: 12,
                background: K.white, border: `1px solid ${K.line}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: K.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color, fontVariantNumeric: item.isNum ? 'tabular-nums' : undefined }}>
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
