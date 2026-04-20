import { useGameStore } from '../../stores/gameStore'

interface DesktopRecapProps {
  onContinue?: () => void
  embedded?: boolean
}

export function DesktopRecap({ onContinue, embedded = false }: DesktopRecapProps) {
  const { currentWeek, balance, lastDayResult, achievements, services } = useGameStore()

  if (!lastDayResult) return null

  const goalAmount = 1_000_000
  const toGoalPercent = Math.min((balance / goalAmount) * 100, 100)

  // Estimate "without Kontour" for comparison
  const activeCount = Object.values(services).filter(s => s.isActive).length
  const boostFactor = 1 + activeCount * 0.05
  const estRevWithout = Math.round(lastDayResult.revenue / boostFactor)
  const estExpWithout = lastDayResult.expenses - lastDayResult.subscriptionCost
  const estNetWithout = estRevWithout - Math.max(0, estExpWithout) - lastDayResult.tax
  const savedToday = Math.max(0, lastDayResult.netProfit - estNetWithout)

  const receiptRows = [
    {
      label: 'Выручка',
      sub: `${lastDayResult.served} из ${lastDayResult.clients} клиентов`,
      without: estRevWithout,
      with: lastDayResult.revenue,
      saved: lastDayResult.revenue - estRevWithout,
    },
    ...(lastDayResult.purchaseCost > 0 ? [{
      label: 'Закупки',
      sub: 'товар по себестоимости',
      without: -lastDayResult.purchaseCost,
      with: -lastDayResult.purchaseCost,
      saved: 0,
    }] : []),
    {
      label: 'Налог УСН 6%',
      sub: 'от выручки',
      without: -Math.round(estRevWithout * 0.06),
      with: -lastDayResult.tax,
      saved: Math.round(estRevWithout * 0.06) - lastDayResult.tax,
    },
    ...(lastDayResult.subscriptionCost > 0 ? [{
      label: 'Подписки Контур',
      sub: `${activeCount} сервисов`,
      without: 0,
      with: -lastDayResult.subscriptionCost,
      saved: 0,
    }] : []),
    ...(lastDayResult.expiredLoss > 0 ? [{
      label: 'Списание просрочки',
      sub: 'FIFO склад',
      without: -lastDayResult.expiredLoss,
      with: -lastDayResult.expiredLoss,
      saved: 0,
    }] : []),
  ]

  const todayAchievement = achievements.find((a: any) =>
    typeof a === 'object' && a.unlockedAt &&
    new Date(a.unlockedAt).toDateString() === new Date().toDateString()
  ) as any

  const isProfitable = lastDayResult.netProfit >= 0

  const inner = (
    <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

      {/* LEFT — hero */}
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
          ИТОГИ ДНЯ · {currentWeek}
        </div>

        {/* Net profit hero card */}
        <div style={{
          background: isProfitable ? 'var(--k-green)' : 'var(--k-bad)',
          color: isProfitable ? 'var(--k-ink)' : '#fff',
          borderRadius: 28, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
            ЧИСТАЯ ПРИБЫЛЬ
          </div>
          <div>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9 }} className="k-num">
              {lastDayResult.netProfit >= 0 ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.6, marginTop: 4 }}>рублей</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              padding: '5px 10px', borderRadius: 999,
              background: isProfitable ? 'var(--k-ink)' : 'rgba(255,255,255,0.2)',
              color: isProfitable ? 'var(--k-green)' : '#fff',
              fontSize: 11, fontWeight: 800,
            }}>
              {lastDayResult.served}/{lastDayResult.clients} клиентов
            </div>
            {lastDayResult.missed > 0 && (
              <div style={{
                padding: '5px 10px', borderRadius: 999,
                background: 'rgba(14,17,22,0.12)',
                fontSize: 11, fontWeight: 700,
                color: isProfitable ? 'var(--k-ink)' : '#fff',
              }}>
                −{lastDayResult.missed} потеряно
              </div>
            )}
          </div>
        </div>

        {/* Achievement — show if unlocked today */}
        {todayAchievement && (
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--k-ink)', color: 'var(--k-orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, flexShrink: 0,
            }}>★</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
                ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                {todayAchievement?.name ?? 'Новое достижение'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginTop: 2 }}>
                {achievements.length} / 20 достижений
              </div>
            </div>
          </div>
        )}

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', opacity: 0.45 }}>ВЫРУЧКА</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }} className="k-num">
              {lastDayResult.revenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', opacity: 0.45 }}>СПАСЕНО СЕГОДНЯ</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--k-green)' }} className="k-num">
              +{savedToday.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — receipt + progression */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

        {/* Receipt table */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: 20,
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                РАСЧЁТ ДНЯ
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 2 }}>
                День {currentWeek}
              </div>
            </div>
            <div className="k-mono" style={{ fontSize: 11, opacity: 0.35 }}>#D{currentWeek}</div>
          </div>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
            gap: 6, padding: '4px 8px',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4,
            borderBottom: '1.5px solid var(--k-ink-10)',
          }}>
            <span>ПОКАЗАТЕЛЬ</span>
            <span style={{ textAlign: 'right' }}>БЕЗ</span>
            <span style={{ textAlign: 'right' }}>С КОНТУРОМ</span>
            <span style={{ textAlign: 'right' }}>СПАСЕНО</span>
          </div>

          {/* Data rows */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {receiptRows.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
                gap: 6, padding: '7px 8px',
                borderBottom: i < receiptRows.length - 1 ? '1px dashed var(--k-ink-10)' : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.45, marginTop: 1 }}>{row.sub}</div>
                </div>
                <div className="k-num" style={{
                  textAlign: 'right', fontWeight: 700, fontSize: 13,
                  color: row.without < 0 ? 'var(--k-bad)' : 'var(--k-good)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {row.without > 0 ? '+' : ''}{row.without.toLocaleString('ru-RU')}
                </div>
                <div className="k-num" style={{
                  textAlign: 'right', fontWeight: 700, fontSize: 13,
                  color: row.with < 0 ? 'rgba(255,90,90,0.8)' : 'var(--k-good)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {row.with > 0 ? '+' : ''}{row.with.toLocaleString('ru-RU')}
                </div>
                <div className="k-num" style={{
                  textAlign: 'right', fontWeight: 800, fontSize: 13,
                  color: row.saved > 0 ? 'var(--k-good)' : 'var(--k-ink-30)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {row.saved > 0 ? `+${row.saved.toLocaleString('ru-RU')}` : '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
            gap: 6, padding: '10px 8px 0',
            borderTop: '2px solid var(--k-ink)',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Итого за день</div>
            <div className="k-num" style={{
              textAlign: 'right', fontWeight: 800, fontSize: 14,
              color: estNetWithout < 0 ? 'var(--k-bad)' : 'var(--k-good)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {estNetWithout > 0 ? '+' : ''}{estNetWithout.toLocaleString('ru-RU')}
            </div>
            <div className="k-num" style={{
              textAlign: 'right', fontWeight: 800, fontSize: 14,
              color: lastDayResult.netProfit < 0 ? 'var(--k-bad)' : 'var(--k-good)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {lastDayResult.netProfit > 0 ? '+' : ''}{lastDayResult.netProfit.toLocaleString('ru-RU')}
            </div>
            <div className="k-num" style={{
              textAlign: 'right', fontWeight: 800, fontSize: 18, color: 'var(--k-good)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {savedToday > 0 ? `+${savedToday.toLocaleString('ru-RU')}` : '—'}
            </div>
          </div>
        </div>

        {/* Progression row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
          {/* Goal */}
          <div style={{
            background: '#fff', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: 100,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.4, letterSpacing: '0.08em' }}>
              К ЦЕЛИ 1 000 000 ₽
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }} className="k-num">
                {Math.max(0, goalAmount - balance).toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ height: 5, background: 'var(--k-ink-10)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: `${toGoalPercent}%`, height: '100%', background: 'var(--k-green)', borderRadius: 999 }} />
              </div>
            </div>
          </div>

          {/* Continue */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: 100,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
              СЛЕДУЮЩИЙ ДЕНЬ
            </div>
            <button
              onClick={onContinue}
              style={{
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'var(--k-ink)', color: '#fff',
                padding: '10px 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
              }}
            >
              День {currentWeek + 1} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div style={{
        flex: 1, padding: '20px 24px',
        display: 'flex', flexDirection: 'column',
        background: 'var(--k-surface)',
        fontFamily: 'Manrope, sans-serif',
        color: 'var(--k-ink)',
        letterSpacing: '-0.01em',
      }}>
        {inner}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
      padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
      letterSpacing: '-0.01em',
    }}>
      {inner}
    </div>
  )
}
