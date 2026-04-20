import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'
import { Spark } from './design-system'

export default function KPIPanel() {
  const state = useGameStore()
  const lastResult = state.lastDayResult

  const kpi = useMemo(() => ({
    week: state.currentWeek,
    balance: state.balance,
    savedMoney: state.savedBalance,
    weeklyRevenue: lastResult?.revenue || 0,
    weeklyExpenses: lastResult?.expenses || 0,
    netProfit: lastResult?.netProfit || 0,
    monthlyExpenses: lastResult?.monthlyExpense || 0,
    weeksUntilExpense: 4,
    goalRemaining: 500000,
    goalProgress: 0,
  }), [state.currentWeek, state.balance, state.savedBalance, lastResult])

  const revenueHistory = useMemo(() => {
    return [8, 11, 9, 14, 13, 18, 16, 22, 19, 25]
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
      gap: 10,
      height: 146,
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
              {kpi.weeklyRevenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div style={{
            padding: '4px 8px', borderRadius: 999,
            background: 'var(--k-ink)', color: 'var(--k-orange)',
            fontSize: 11, fontWeight: 800,
          }}>+18%</div>
        </div>
        <Spark data={revenueHistory} color="#0E1116" fill/>
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
            {kpi.netProfit >= 0 ? '+' : '−'}{Math.abs(kpi.netProfit).toLocaleString('ru-RU')} ₽
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
            {kpi.monthlyExpenses.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
            через {kpi.weeksUntilExpense} нед. списание
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
            {kpi.goalRemaining.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{
            marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
            borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{ width: `${kpi.goalProgress}%`, height: '100%', background: '#fff' }}/>
          </div>
        </div>
      </div>
    </div>
  )
}
