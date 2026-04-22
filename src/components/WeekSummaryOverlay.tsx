import { useGameStore } from '../stores/gameStore'

interface WeekSummaryOverlayProps {
  onStart: () => void
}

export function WeekSummaryOverlay({ onStart }: WeekSummaryOverlayProps) {
  const { currentWeek, balance, lastDayResult, entrepreneurEnergy, services } = useGameStore()

  const activeCount = Object.values(services).filter(s => s.isActive).length
  const isProfitable = lastDayResult ? lastDayResult.netProfit >= 0 : null

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
        width: 480,
        maxWidth: '90vw',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', opacity: 0.45, marginBottom: 6 }}>
            НАЧАЛО НЕДЕЛИ
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Неделя {currentWeek}
          </div>
        </div>

        {/* Previous week recap */}
        {lastDayResult && (
          <div style={{
            background: 'var(--k-surface-2)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.5 }}>
              ПРОШЛАЯ НЕДЕЛЯ
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>Выручка</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {lastDayResult.revenue.toLocaleString('ru')}₽
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>Прибыль</div>
                <div style={{
                  fontSize: 18, fontWeight: 800,
                  color: isProfitable ? 'var(--k-green)' : 'var(--k-bad)',
                }}>
                  {isProfitable ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru')}₽
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>Баланс</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {balance.toLocaleString('ru')}₽
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Energy restored */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Энергия предпринимателя</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{entrepreneurEnergy} / 100</div>
          </div>
          <div style={{
            height: 8, background: 'var(--k-surface-2)', borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${entrepreneurEnergy}%`,
              background: 'var(--k-orange)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.45 }}>
            Энергия восстановлена. Планируйте действия на неделю.
          </div>
        </div>

        {/* Services hint */}
        {activeCount > 0 && (
          <div style={{
            fontSize: 12, opacity: 0.6,
            padding: '8px 12px',
            background: 'var(--k-surface-2)',
            borderRadius: 8,
          }}>
            Активно сервисов Контура: <strong>{activeCount} из 7</strong>
          </div>
        )}

        <button
          onClick={onStart}
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
          Начать неделю →
        </button>
      </div>
    </div>
  )
}
