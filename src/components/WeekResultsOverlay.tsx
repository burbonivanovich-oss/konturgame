import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

interface WeekResultsOverlayProps {
  onContinue: () => void
}

export function WeekResultsOverlay({ onContinue }: WeekResultsOverlayProps) {
  const { currentWeek, balance, lastDayResult, services, achievements } = useGameStore()

  if (!lastDayResult) return null

  const activeCount = Object.values(services).filter(s => s.isActive).length
  const isProfitable = lastDayResult.netProfit >= 0

  const rows = [
    { label: 'Выручка', value: lastDayResult.revenue },
    ...(lastDayResult.purchaseCost > 0
      ? [{ label: 'Закупки', value: -lastDayResult.purchaseCost }]
      : []),
    { label: 'Налог УСН 6%', value: -lastDayResult.tax },
    ...(lastDayResult.subscriptionCost > 0
      ? [{ label: `Подписки Контура (${activeCount})`, value: -lastDayResult.subscriptionCost }]
      : []),
    ...(lastDayResult.expiredLoss > 0
      ? [{ label: 'Списание просрочки', value: -lastDayResult.expiredLoss }]
      : []),
  ]

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
        width: 520,
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
            background: K.mintSoft, marginBottom: 12,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: K.mint }} />
            <span style={{ fontSize: 11, color: K.mintInk, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Итоги
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Неделя {currentWeek} завершена
          </div>
        </div>

        {/* Net profit hero */}
        <div style={{
          background: isProfitable ? K.ink : K.bad,
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {isProfitable && (
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,200,150,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Чистая прибыль
            </div>
            <div style={{
              fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em',
              color: K.white, marginTop: 4, fontVariantNumeric: 'tabular-nums',
            }}>
              {isProfitable ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Баланс</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: K.white, fontVariantNumeric: 'tabular-nums' }}>
              {balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{
          background: K.bone,
          border: `1px solid ${K.lineSoft}`,
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
            }}>
              <span style={{ color: K.muted }}>{row.label}</span>
              <span style={{
                fontWeight: 600,
                color: row.value >= 0 ? K.good : K.bad,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {row.value >= 0 ? '+' : ''}{row.value.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          ))}
          <div style={{
            borderTop: `1px solid ${K.line}`,
            paddingTop: 10,
            marginTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14, fontWeight: 700,
          }}>
            <span>Итого</span>
            <span style={{ color: isProfitable ? K.good : K.bad, fontVariantNumeric: 'tabular-nums' }}>
              {isProfitable ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Stats line */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Клиентов обслужено', value: `${lastDayResult.served} / ${lastDayResult.clients}` },
            ...(activeCount > 0 ? [{ label: 'Сервисов Контура', value: String(activeCount) }] : []),
            ...(achievements.length > 0 ? [{ label: 'Достижений', value: String(achievements.length) }] : []),
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
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
          Следующая неделя →
        </button>
      </div>
    </div>
  )
}
