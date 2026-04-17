interface KPIPanelProps {
  day?: number
  balance?: number
  savedMoney?: number
  dailyRevenue?: number
  dailyExpenses?: number
  netProfit?: number
  monthlyExpenses?: number
}

export default function KPIPanel({
  day = 1,
  balance = 50000,
  savedMoney = 0,
  dailyRevenue = 0,
  dailyExpenses = 0,
  netProfit = 0,
  monthlyExpenses = 0,
}: KPIPanelProps) {
  return (
    <div className="bg-slate-700 rounded-lg p-6 space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-300">📅 День</span>
        <span className="font-semibold text-lg">{day}</span>
      </div>

      <div className={`flex justify-between ${balance < 10000 ? 'text-red-400' : ''}`}>
        <span className="text-gray-300">💰 Деньги</span>
        <span className="font-semibold text-lg">{balance.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between text-green-300">
        <span className="text-gray-300">💸 Спасённые рубли</span>
        <span className="font-semibold text-lg">{savedMoney.toLocaleString('ru-RU')} ₽</span>
      </div>

      <hr className="border-slate-600" />

      <div className="flex justify-between">
        <span className="text-gray-300">📈 Доход/день</span>
        <span className="font-semibold text-green-400">{dailyRevenue.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-300">📉 Расход/день</span>
        <span className="font-semibold text-red-400">{dailyExpenses.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="flex justify-between bg-slate-600 p-2 rounded">
        <span className="text-gray-300">📊 Чистая прибыль/день</span>
        <span className={`font-semibold text-lg ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {netProfit.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Расходы/мес</span>
        <span>{monthlyExpenses.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  )
}
