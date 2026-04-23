import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

interface WeekResultsOverlayProps {
  onContinue: () => void
}

const MILESTONE_LABELS: Record<string, { title: string; text: string; emoji: string }> = {
  week10: {
    emoji: '🌱',
    title: '10 недель — вы выжили!',
    text: 'Первый критический рубеж пройден. Бизнес стоит на ногах.',
  },
  week20: {
    emoji: '🚀',
    title: '20 недель — уже не новичок',
    text: 'Половина года позади. Вы знаете свой бизнес изнутри.',
  },
  week30: {
    emoji: '🏆',
    title: '30 недель — настоящий предприниматель',
    text: 'Три четверти года. Немногие доходят до этой точки.',
  },
}

export function WeekResultsOverlay({ onContinue }: WeekResultsOverlayProps) {
  const {
    currentWeek, balance, lastDayResult, services, achievements,
    upcomingEventTeaser, regularCustomer, pendingMilestoneCelebration,
  } = useGameStore()

  if (!lastDayResult) return null

  const activeCount = Object.values(services).filter(s => s.isActive).length
  const isProfitable = lastDayResult.netProfit >= 0
  const milestone = pendingMilestoneCelebration ? MILESTONE_LABELS[pendingMilestoneCelebration] : null

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
        maxHeight: '90vh',
        overflowY: 'auto',
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
            Неделя {currentWeek - 1} завершена
          </div>
        </div>

        {/* Milestone celebration */}
        {milestone && (
          <div style={{
            background: `linear-gradient(135deg, ${K.violet} 0%, ${K.blue} 100%)`,
            borderRadius: 16, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 36, flexShrink: 0 }}>{milestone.emoji}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: K.white, lineHeight: 1.2 }}>
                {milestone.title}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                {milestone.text}
              </div>
            </div>
          </div>
        )}

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

        {/* Regular customer status */}
        {regularCustomer && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: regularCustomer.missedWeeks >= 2 ? K.orangeSoft : K.mintSoft,
            border: `1px solid ${regularCustomer.missedWeeks >= 2 ? K.orange : K.mint}`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 22 }}>{regularCustomer.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: K.ink }}>
                {regularCustomer.name}
              </div>
              <div style={{ fontSize: 11, color: K.ink2, marginTop: 1 }}>
                {regularCustomer.missedWeeks >= 2
                  ? `Не приходил ${regularCustomer.missedWeeks} нед. — ${regularCustomer.habit.toLowerCase()}`
                  : regularCustomer.missedWeeks === 1
                    ? 'На этой неделе не зашёл'
                    : `${regularCustomer.habit} · ${regularCustomer.totalVisits} визит${regularCustomer.totalVisits >= 5 ? 'ов' : regularCustomer.totalVisits >= 2 ? 'а' : ''}`
                }
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: regularCustomer.missedWeeks >= 2 ? K.orange : K.mintInk,
            }}>
              {regularCustomer.missedWeeks >= 2 ? 'Пропал' : '✓ Был'}
            </div>
          </div>
        )}

        {/* Cliffhanger teaser */}
        {upcomingEventTeaser && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: K.bone,
            border: `1px solid ${K.lineSoft}`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: K.lineSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              👁
            </div>
            <div>
              <div style={{ fontSize: 10, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                Следующая неделя
              </div>
              <div style={{ fontSize: 13, color: K.ink, lineHeight: 1.4 }}>
                {upcomingEventTeaser}
              </div>
            </div>
          </div>
        )}

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
