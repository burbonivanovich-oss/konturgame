import { useGameStore } from '../../stores/gameStore'

interface DesktopRecapProps {
  onContinue?: () => void
}

export function DesktopRecap({ onContinue }: DesktopRecapProps) {
  const { currentDay, balance, lastDayResult, achievements } = useGameStore()

  if (!lastDayResult) return null

  const recapData = [
    {
      label: 'Доход за день',
      service: 'Маркет',
      without: -2000,
      with: -400,
      saved: 1600,
    },
    {
      label: 'Прибыль',
      service: 'Все',
      without: -30000,
      with: -5000,
      saved: 25000,
    },
  ]

  const unlockedAchievements = achievements.filter((a: any) =>
    typeof a === 'object' && a.unlockedAt &&
    new Date(a.unlockedAt).toDateString() === new Date().toDateString()
  )

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)',
      padding: 40, overflow: 'hidden', display: 'flex', gap: 20,
    }}>
      {/* Left — hero number */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>
          ИТОГИ ДНЯ · {currentDay}
        </div>

        <div style={{
          background: 'var(--k-green)', color: 'var(--k-ink)',
          borderRadius: 28, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
            ЧИСТАЯ ПРИБЫЛЬ
          </div>
          <div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9 }} className="k-num">
              +{lastDayResult.netProfit.toLocaleString('ru-RU')}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.6, marginTop: 2 }}>рублей</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'var(--k-ink)', color: 'var(--k-green)',
              fontSize: 12, fontWeight: 800,
            }}>+18% к среднему</div>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(14,17,22,0.1)',
              fontSize: 12, fontWeight: 700,
            }}>лучший день недели</div>
          </div>
        </div>

        {unlockedAchievements.length > 0 && (
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--k-ink)', color: 'var(--k-orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800,
            }}>★</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
                ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                {unlockedAchievements.length > 0 ? (unlockedAchievements[0] as any)?.name || 'Новое достижение' : 'Новое достижение'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginTop: 2 }}>
                +50 репутации · {achievements.length}/20 достижений
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right — receipt */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{
          background: '#fff', borderRadius: 24, padding: 20,
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.5 }}>
                СРАВНЕНИЕ ДНЕВНОГО РЕЗУЛЬТАТА
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 2 }}>
                День {currentDay}
              </div>
            </div>
            <div className="k-mono" style={{ fontSize: 11, opacity: 0.4 }}>#D{currentDay}</div>
          </div>

          {/* Table */}
          <div style={{
            flex: 1, minHeight: 0, overflow: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
              gap: 8, padding: '6px 10px',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4,
              borderBottom: '1.5px solid var(--k-ink-10)',
              flexShrink: 0,
            }}>
              <span>ПОКАЗАТЕЛЬ</span>
              <span style={{ textAlign: 'right' }}>БЕЗ</span>
              <span style={{ textAlign: 'right' }}>С КОНТУРОМ</span>
              <span style={{ textAlign: 'right' }}>СПАСЕНО</span>
            </div>

            {recapData.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
                gap: 8, padding: '8px 10px',
                borderBottom: i < recapData.length - 1 ? '1px dashed var(--k-ink-10)' : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, marginTop: 1 }}>
                    через {row.service}
                  </div>
                </div>
                <div className="k-mono k-num" style={{
                  textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--k-bad)',
                }}>
                  {row.without}
                </div>
                <div className="k-mono k-num" style={{
                  textAlign: 'right', fontWeight: 700, fontSize: 14,
                  color: row.with === 0 ? 'var(--k-good)' : '#FFA066',
                }}>
                  {row.with === 0 ? '0' : row.with}
                </div>
                <div className="k-mono k-num" style={{
                  textAlign: 'right', fontWeight: 800, fontSize: 14, color: 'var(--k-good)',
                }}>
                  +{row.saved}
                </div>
              </div>
            ))}

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
              gap: 8, padding: '10px 10px 0',
              borderTop: '2px solid var(--k-ink)',
              alignItems: 'center', marginTop: 'auto',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Сэкономлено за день</div>
              <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--k-bad)' }}>
                −{Math.abs(lastDayResult.expenses).toLocaleString('ru-RU')}
              </div>
              <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 15 }}>
                {lastDayResult.revenue > 0 ? '−' : '+'}{Math.abs(Math.round(lastDayResult.revenue * 0.1)).toLocaleString('ru-RU')}
              </div>
              <div className="k-mono k-num" style={{ textAlign: 'right', fontWeight: 800, fontSize: 22, color: 'var(--k-good)' }}>
                +{lastDayResult.netProfit.toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
        </div>

        {/* Progression */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 110, flexShrink: 0 }}>
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
              К ЦЕЛИ 1 000 000 ₽
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }} className="k-num">
                {Math.max(0, 1000000 - balance).toLocaleString('ru-RU')} ₽
              </div>
              <div style={{
                height: 6, background: 'rgba(255,255,255,0.22)', borderRadius: 999,
                overflow: 'hidden', marginTop: 8,
              }}>
                <div style={{ width: `${Math.min(100, (balance / 1000000) * 100)}%`, height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: '0.08em' }}>
              СЛЕДУЮЩИЙ ДЕНЬ
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }} className="k-num">
                День {currentDay + 1}
              </div>
              <button
                onClick={onContinue}
                style={{
                  width: '100%', marginTop: 12, border: 'none', cursor: 'pointer',
                  background: '#fff', color: 'var(--k-blue)',
                  padding: '8px 12px', borderRadius: 8,
                  fontSize: 11, fontWeight: 800,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Продолжить →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
