import { useGameStore } from '../stores/gameStore'

interface WeekResultsOverlayProps {
  onContinue: () => void
}

export function WeekResultsOverlay({ onContinue }: WeekResultsOverlayProps) {
  const { currentWeek, balance, lastDayResult, services, achievements } = useGameStore()

  if (!lastDayResult) return null

  const activeCount = Object.values(services).filter(s => s.isActive).length
  const isProfitable = lastDayResult.netProfit >= 0

  const rows = [
    { label: 'Выручка', value: lastDayResult.revenue, positive: true },
    ...(lastDayResult.purchaseCost > 0
      ? [{ label: 'Закупки', value: -lastDayResult.purchaseCost, positive: false }]
      : []),
    { label: 'Налог УСН 6%', value: -lastDayResult.tax, positive: false },
    ...(lastDayResult.subscriptionCost > 0
      ? [{ label: `Подписки Контура (${activeCount})`, value: -lastDayResult.subscriptionCost, positive: false }]
      : []),
    ...(lastDayResult.expiredLoss > 0
      ? [{ label: 'Списание просрочки', value: -lastDayResult.expiredLoss, positive: false }]
      : []),
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(14,17,22,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'var(--k-surface)',
        border: '1px solid var(--k-border)',
        borderRadius: 20,
        padding: '40px 48px',
        width: 520,
        maxWidth: '90vw',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', opacity: 0.45, marginBottom: 6 }}>
            ИТОГИ НЕДЕЛИ
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Неделя {currentWeek} завершена
          </div>
        </div>

        {/* Net profit hero */}
        <div style={{
          background: isProfitable ? 'var(--k-green)' : 'var(--k-bad)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.7 }}>
              ЧИСТАЯ ПРИБЫЛЬ
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 4 }}>
              {isProfitable ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru')}₽
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Баланс</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{balance.toLocaleString('ru')}₽</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{
          background: 'var(--k-surface-2)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
            }}>
              <span style={{ opacity: 0.7 }}>{row.label}</span>
              <span style={{
                fontWeight: 700,
                color: row.value >= 0 ? 'var(--k-green)' : 'var(--k-bad)',
              }}>
                {row.value >= 0 ? '+' : ''}{row.value.toLocaleString('ru')}₽
              </span>
            </div>
          ))}
          <div style={{
            borderTop: '1px solid var(--k-border)',
            paddingTop: 10,
            marginTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14, fontWeight: 800,
          }}>
            <span>Итого</span>
            <span style={{ color: isProfitable ? 'var(--k-green)' : 'var(--k-bad)' }}>
              {isProfitable ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru')}₽
            </span>
          </div>
        </div>

        {/* Stats line */}
        <div style={{
          display: 'flex', gap: 16, fontSize: 12, opacity: 0.6,
        }}>
          <span>Клиентов: {lastDayResult.served} / {lastDayResult.clients}</span>
          {activeCount > 0 && <span>Сервисов Контура: {activeCount}</span>}
          {achievements.length > 0 && <span>Достижений: {achievements.length}</span>}
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
            background: 'var(--k-orange)',
            color: 'var(--k-ink)',
            padding: '18px 24px',
            borderRadius: 999,
            fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
          }}
        >
          Следующая неделя →
        </button>
      </div>
    </div>
  )
}
