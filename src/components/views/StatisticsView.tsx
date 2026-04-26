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
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 20,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>АНАЛИТИКА</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Статистика</div>
        </div>
        <button
          onClick={handleShare}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: K.ink, color: K.white, border: 'none',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          📤 Поделиться
        </button>
      </div>

      {/* Hero — current week progress */}
      <div style={{
        background: K.ink, borderRadius: 20, padding: 24, color: K.white,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%',
          background: K.mintSoft,
          opacity: 0.45,
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ПРОГРЕСС ГОДА
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
          {currentWeek} <span style={{ fontSize: 22, opacity: 0.55, fontWeight: 600 }}>из 52 нед.</span>
        </div>
        <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(weekProgress, 100)}%`,
            background: isYearComplete ? K.mint : 'rgba(255,255,255,0.7)',
            borderRadius: 999, transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.55, fontWeight: 600 }}>
          {isYearComplete ? '✨ Первый год выжит!' : `${weekProgress.toFixed(0)}% первого года`}
        </div>
      </div>

      {/* Current game stats grid */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 12 }}>
          ТЕКУЩАЯ ИГРА
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'БАЛАНС', value: `${balance.toLocaleString('ru-RU')} ₽`, isNum: true, wide: true },
            { label: 'РЕПУТАЦИЯ', value: `${reputation}` },
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
              padding: 16, borderRadius: 14,
              background: K.white, border: `1px solid ${K.line}`,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: K.muted,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 28, fontWeight: 800,
                letterSpacing: '-0.02em',
                fontVariantNumeric: item.isNum ? 'tabular-nums' : undefined,
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-game history */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 12 }}>
          СТАТИСТИКА ВЫЖИВАЕМОСТИ
        </div>

        {totalGames === 0 ? (
          <div style={{
            padding: 20, borderRadius: 14, border: `1.5px dashed ${K.line}`,
            fontSize: 13, color: K.muted, textAlign: 'center', fontWeight: 600,
          }}>
            Статистика появится после первой завершённой игры
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'ИГРСЫГРАНО', value: String(totalGames) },
              { label: 'ВЫЖИЛ ГОД', value: String(gamesCompleted), color: gamesCompleted > 0 ? K.good : undefined },
              { label: 'СРЕДНЯЯ ВЫЖИВАЕМОСТЬ', value: `${averageWeeks} нед.` },
              { label: 'ЛУЧШИЙ РЕЗУЛЬТАТ', value: `${bestBalance.toLocaleString('ru-RU')} ₽`, isNum: true },
            ].map(item => (
              <div key={item.label} style={{
                padding: 16, borderRadius: 14,
                background: K.white, border: `1px solid ${K.line}`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: K.muted,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em',
                  color: item.color,
                  fontVariantNumeric: item.isNum ? 'tabular-nums' : undefined,
                }}>
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
