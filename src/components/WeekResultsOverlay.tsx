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
    upcomingEventTeaser, pendingMilestoneCelebration,
    lastWeekPainLosses, lastWeekMicroEvent, npcs, lastDiaryEntry,
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
            background: K.violet,
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
              background: K.mintSoft,
              opacity: 0.45,
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

        {/* Pain losses — show weeks 1-5 as motivator */}
        {lastWeekPainLosses && lastWeekPainLosses.total > 0 && currentWeek <= 6 && (
          <div style={{
            background: K.orangeSoft,
            border: `1px solid ${K.orange}`,
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15 }}>⚠️</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: K.orange }}>
                Без сервисов Контура потеряно: <span style={{ fontSize: 14 }}>{lastWeekPainLosses.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(
                [
                  { key: 'market', label: 'Контур.Маркет' },
                  { key: 'ofd',    label: 'Контур.ОФД' },
                  { key: 'elba',   label: 'Контур.Эльба' },
                  { key: 'bank',   label: 'Контур.Банк' },
                  { key: 'diadoc', label: 'Контур.Диадок' },
                  { key: 'fokus',  label: 'Контур.Фокус' },
                  { key: 'extern', label: 'Контур.Экстерн' },
                ] as const
              )
                .filter(s => (lastWeekPainLosses as any)[s.key] > 0)
                .sort((a, b) => (lastWeekPainLosses as any)[b.key] - (lastWeekPainLosses as any)[a.key])
                .slice(0, 3)
                .map(s => (
                  <div key={s.key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 12, color: K.orange,
                  }}>
                    <span style={{ fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      −{(lastWeekPainLosses as any)[s.key].toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Weekly micro event */}
        {lastWeekMicroEvent && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: K.bone, border: `1px solid ${K.lineSoft}`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{lastWeekMicroEvent.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: K.ink }}>{lastWeekMicroEvent.title}</div>
              <div style={{ fontSize: 11, color: K.muted, marginTop: 2 }}>{lastWeekMicroEvent.effectText}</div>
            </div>
          </div>
        )}

        {/* Diary entry — first-person reflection, fired every 5 weeks */}
        {lastDiaryEntry && (
          <div style={{
            background: '#fdf6e3',
            border: `1px solid #e8dfc6`,
            borderLeft: `3px solid ${K.orange}`,
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: K.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {lastDiaryEntry.header}
            </div>
            <div style={{
              fontSize: 13, color: K.ink, lineHeight: 1.55,
              fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif',
            }}>
              {lastDiaryEntry.body}
            </div>
          </div>
        )}

        {/* Active NPC allies */}
        {(() => {
          const allies = (npcs ?? []).filter(n => n.isRevealed && n.relationshipLevel >= 60)
          if (allies.length === 0) return null
          const bonuses: Record<string, string> = {
            mikhail: 'Хорошая цена на поставки',
            svetlana: '+1 лояльности / нед',
            marina: '+1 репутации / нед',
            viktor: 'Льготные условия в банке',
            petrov: 'Лояльность при проверках',
          }
          const visible = allies.filter(n => bonuses[n.id])
          if (visible.length === 0) return null
          return (
            <div style={{
              background: K.bone, border: `1px solid ${K.lineSoft}`,
              borderRadius: 12, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 10, color: K.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Союзники
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visible.map(n => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{n.portrait}</span>
                    <span style={{ fontSize: 12, color: K.ink, fontWeight: 600, flex: 1 }}>{n.name}</span>
                    <span style={{ fontSize: 11, color: K.good }}>{bonuses[n.id]}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

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
