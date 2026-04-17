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
    <div className="bg-slate-700 rounded-lg p-6 space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-300">📅 День</span>
        <span className="font-semibold text-lg">{kpi.day}</span>
      </div>

      <div className={`flex justify-between ${kpi.balance < 10000 ? 'text-red-400' : ''}`}>
        <span className="text-gray-300">💰 Деньги</span>
        <span className="font-semibold text-lg">{kpi.balance.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between text-green-300">
        <span className="text-gray-300">💸 Спасённые рубли</span>
        <span className="font-semibold text-lg">{kpi.savedMoney.toLocaleString('ru-RU')} ₽</span>
      </div>

      <hr className="border-slate-600" />

      <div className="flex justify-between">
        <span className="text-gray-300">📈 Доход/день</span>
        <span className="font-semibold text-green-400">{kpi.dailyRevenue.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-300">📉 Расход/день</span>
        <span className="font-semibold text-red-400">{kpi.dailyExpenses.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between bg-slate-600 p-2 rounded">
        <span className="text-gray-300">📊 Чистая прибыль/день</span>
        <span className={`font-semibold text-lg ${kpi.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {kpi.netProfit.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Расходы/мес</span>
        <span>{kpi.monthlyExpenses.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  )
}
