import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

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
      background: 'rgba(26,26,34,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: K.white,
        border: `1px solid ${K.line}`,
        borderRadius: 20,
        padding: '40px 48px',
        width: 480,
        maxWidth: '90vw',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Header */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 12px', borderRadius: 999,
            background: K.blueSoft, marginBottom: 12,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: K.blue }} />
            <span style={{ fontSize: 11, color: K.blue, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Сводка
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Неделя {currentWeek}
          </div>
          <div style={{ fontSize: 14, color: K.muted, marginTop: 4 }}>
            Итоги прошлой недели
          </div>
        </div>

        {/* Previous week recap */}
        {lastDayResult && (
          <div style={{
            background: K.bone,
            border: `1px solid ${K.lineSoft}`,
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ fontSize: 11, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Прошлая неделя
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              {[
                { label: 'Выручка', value: `${lastDayResult.revenue.toLocaleString('ru-RU')} ₽`, color: K.ink },
                { label: 'Прибыль', value: `${isProfitable ? '+' : ''}${lastDayResult.netProfit.toLocaleString('ru-RU')} ₽`, color: isProfitable ? K.good : K.bad },
                { label: 'Баланс', value: `${balance.toLocaleString('ru-RU')} ₽`, color: K.ink },
              ].map((t, i) => (
                <div key={t.label} style={{
                  flex: 1,
                  paddingRight: i < 2 ? 16 : 0,
                  borderRight: i < 2 ? `1px solid ${K.line}` : 'none',
                  marginRight: i < 2 ? 16 : 0,
                }}>
                  <div style={{ fontSize: 11, color: K.muted, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: t.color, fontVariantNumeric: 'tabular-nums' }}>
                    {t.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Energy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: K.ink2, fontWeight: 500 }}>Энергия предпринимателя</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{entrepreneurEnergy} / 100</div>
          </div>
          <div style={{ height: 6, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${entrepreneurEnergy}%`,
              background: entrepreneurEnergy < 40 ? K.orange : K.mint,
              borderRadius: 999,
            }} />
          </div>
          <div style={{ fontSize: 11, color: K.muted }}>
            Энергия восстановлена. Планируйте действия на неделю.
          </div>
        </div>

        {/* Services hint */}
        {activeCount > 0 && (
          <div style={{
            fontSize: 12, color: K.ink2,
            padding: '8px 14px',
            background: K.mintSoft,
            borderRadius: 8,
          }}>
            Активно сервисов Контура: <strong style={{ color: K.mintInk }}>{activeCount} из 7</strong>
          </div>
        )}

        <button
          onClick={onStart}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
            background: K.ink,
            color: K.white,
            padding: '14px 24px',
            borderRadius: 12,
            fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
          }}
        >
          Начать неделю →
        </button>
      </div>
    </div>
  )
}
