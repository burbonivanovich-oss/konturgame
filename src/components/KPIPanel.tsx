import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'
import { ECONOMY_CONSTANTS } from '../constants/business'

export default function KPIPanel() {
  const state = useGameStore()
  const lastResult = state.lastDayResult
  const { qualityLevel, entrepreneurEnergy, daysSinceLastMonthly } = state

  const kpi = useMemo(() => {
    const daysInCycle = ECONOMY_CONSTANTS.MONTHLY_CYCLE_WEEKS * 7
    const daysRemaining = Math.max(0, daysInCycle - (daysSinceLastMonthly ?? 0))
    const weeksUntilExpense = Math.max(1, Math.ceil(daysRemaining / 7))
    const goalRemaining = Math.max(0, ECONOMY_CONSTANTS.GOAL_AMOUNT - state.balance)
    const goalProgress = Math.min((state.balance / ECONOMY_CONSTANTS.GOAL_AMOUNT) * 100, 100)
    return {
      week: state.currentWeek,
      balance: state.balance,
      savedMoney: state.savedBalance,
      weeklyRevenue: lastResult?.revenue || 0,
      weeklyExpenses: lastResult?.expenses || 0,
      netProfit: lastResult?.netProfit || 0,
      monthlyExpenses: lastResult?.monthlyExpense || 0,
      weeksUntilExpense,
      goalRemaining,
      goalProgress,
    }
  }, [state.currentWeek, state.balance, state.savedBalance, lastResult, daysSinceLastMonthly])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr',
      gap: 10,
      height: 146,
    }}>
      {/* Income */}
      <div style={{
        background: 'var(--k-orange)', color: 'var(--k-ink)',
        borderRadius: 20, padding: 20,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
            ДОХОД ЗА ДЕНЬ
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
            {kpi.weeklyRevenue.toLocaleString('ru-RU')} ₽
          </div>
        </div>
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

      {/* Quality Level */}
      <div style={{
        background: qualityLevel > 70 ? 'var(--k-green)' : qualityLevel > 40 ? 'var(--k-orange)' : 'var(--k-bad)',
        color: '#fff',
        borderRadius: 20, padding: 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>
          КАЧЕСТВО
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
            {qualityLevel}%
          </div>
          <div style={{
            marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
            borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{ width: `${qualityLevel}%`, height: '100%', background: '#fff' }}/>
          </div>
        </div>
      </div>

      {/* Entrepreneur Energy */}
      <div style={{
        background: entrepreneurEnergy > 70 ? '#3498db' : entrepreneurEnergy > 40 ? 'var(--k-orange)' : 'var(--k-bad)',
        color: '#fff',
        borderRadius: 20, padding: 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.75 }}>
          ЭНЕРГИЯ
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
            {entrepreneurEnergy}%
          </div>
          <div style={{
            marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
            borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{ width: `${entrepreneurEnergy}%`, height: '100%', background: '#fff' }}/>
          </div>
        </div>
      </div>
    </div>
  )
}
