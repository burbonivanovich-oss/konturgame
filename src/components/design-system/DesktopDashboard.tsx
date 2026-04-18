import { ReactNode } from 'react'
import { Spark } from './Spark'

interface DesktopDashboardProps {
  children?: ReactNode
  businessName?: string
  dayNumber?: number
  season?: string
  weather?: string
  weatherBonus?: number
  dailyIncome?: number
  incomeChange?: number
  netProfit?: number
  monthlyExpenses?: number
  daysUntilExpense?: number
  goalRemaining?: number
  goalProgress?: number
}

export function DesktopDashboard({
  children,
  businessName = 'КОФЕЙНЯ «ЗЕРНО»',
  dayNumber = 47,
  season = 'Весна',
  weather = 'солнечно',
  weatherBonus = 8,
  dailyIncome = 24860,
  incomeChange = 18,
  netProfit = 14220,
  monthlyExpenses = 168000,
  daysUntilExpense = 12,
  goalRemaining = 672400,
  goalProgress = 67,
}: DesktopDashboardProps) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif',
      color: 'var(--k-ink)',
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      {/* LEFT RAIL — navigation */}
      <aside style={{
        width: 240, background: 'var(--k-ink)', color: '#fff',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--k-orange)',
          }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em' }}>
            {businessName}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День {dayNumber}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontSize: 11, fontWeight: 600, opacity: 0.7,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-blue-soft)' }}/>
            {season} · {weather} · +{weatherBonus}%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: 'Дневной цикл',  g: '◎', on: true,  badge: '1' },
            { n: 'Склад',         g: '▦', on: false, badge: '20' },
            { n: 'Маркетинг',     g: '◆', on: false },
            { n: 'Экосистема',    g: '□', on: false, badge: '4/7' },
            { n: 'Финансы',       g: '₽', on: false },
            { n: 'Репутация',     g: '★', on: false },
            { n: 'Достижения',    g: '◈', on: false },
          ].map(i => (
            <div key={i.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: i.on ? 'var(--k-orange)' : 'transparent',
              color: i.on ? 'var(--k-ink)' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.08)',
                color: i.on ? 'var(--k-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i.g}</span>
              <span style={{ flex: 1 }}>{i.n}</span>
              {i.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 999,
                  background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.12)',
                  color: i.on ? 'var(--k-orange)' : '#fff',
                }}>{i.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* Saved rubles — bottom of rail */}
        <div style={{
          padding: 14, borderRadius: 16,
          background: 'var(--k-green)', color: 'var(--k-ink)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>
            СПАСЕНО С КОНТУРОМ
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            220 400 ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 4 }}>
            ×6 ROI · за {dayNumber} дней
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{
        flex: 1, padding: '20px 24px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 10, height: 146,
        }}>
          {/* Income */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
                  ДОХОД ЗА ДЕНЬ
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                  {dailyIncome.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 999,
                background: 'var(--k-ink)', color: 'var(--k-orange)',
                fontSize: 11, fontWeight: 800,
              }}>+{incomeChange}%</div>
            </div>
            <Spark data={[8,11,9,14,13,18,16,22,19,25]} color="#0E1116" fill/>
          </div>

          {/* Net Profit */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
              ЧИСТАЯ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +{netProfit.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 4 }}>
                после налога 6% и закупок
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              РАСХОДЫ / МЕС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {monthlyExpenses.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
                через {daysUntilExpense} дн. списание
              </div>
            </div>
          </div>

          {/* To Goal */}
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              К ЦЕЛИ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                {goalRemaining.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{
                marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{ width: `${goalProgress}%`, height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, flex: 1, minHeight: 0 }}>
          {/* Placeholder for left content */}
          {children || (
            <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
              <p>События и решения появятся здесь</p>
            </div>
          )}

          {/* Right sidebar */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
            <p>Индикаторы и сервисы Контура</p>
          </div>
        </div>
      </main>
    </div>
  )
}
