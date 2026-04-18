import { useGameStore } from '../stores/gameStore'
import { useMemo } from 'react'

export default function KPIPanel() {
  const state = useGameStore()
  const lastResult = state.lastDayResult

  const kpi = useMemo(() => ({
    day: state.currentDay,
    balance: state.balance,
    savedMoney: state.savedBalance,
    dailyRevenue: lastResult?.revenue || 0,
    dailyExpenses: lastResult?.expenses || 0,
    netProfit: lastResult?.netProfit || 0,
    monthlyExpenses: lastResult?.monthlyExpense || 0,
  }), [state.currentDay, state.balance, state.savedBalance, lastResult])

  return (
    <div className="bg-white rounded-lg p-6 space-y-4 border border-gray-200">
      {/* Main KPI Row 1: День и Деньги */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-1">День</p>
          <p className="text-2xl font-bold text-brand-blue">{kpi.day}</p>
        </div>
        <div className={`p-3 bg-gray-50 rounded-md ${kpi.balance < 10000 ? 'border border-red-500' : ''}`}>
          <p className="text-xs text-gray-600 mb-1">Баланс</p>
          <p className={`text-2xl font-bold ${kpi.balance < 10000 ? 'text-red-500' : 'text-brand-green'}`}>
            {(kpi.balance / 1000).toFixed(0)}K₽
          </p>
        </div>
      </div>

      {/* Спасённые рубли */}
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs text-gray-600 mb-1">Контур сэкономил</p>
        <p className="text-xl font-bold text-brand-blue">{kpi.savedMoney.toLocaleString('ru-RU')} ₽</p>
      </div>

      <div className="border-t border-gray-200 pt-4" />

      {/* Daily economics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-600 mb-1">Доход</p>
          <p className="text-lg font-bold text-brand-green">+{(kpi.dailyRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Расход</p>
          <p className="text-lg font-bold text-orange-500">−{(kpi.dailyExpenses / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-brand-blue/10 rounded-md p-2">
          <p className="text-xs text-gray-600 mb-1">Итого</p>
          <p className={`text-lg font-bold ${kpi.netProfit >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
            {kpi.netProfit >= 0 ? '+' : '−'}{Math.abs(kpi.netProfit / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Monthly expenses hint */}
      <p className="text-xs text-gray-500 text-center pt-2">
        Расходы/мес: {kpi.monthlyExpenses.toLocaleString('ru-RU')} ₽
      </p>
    </div>
  )
}
