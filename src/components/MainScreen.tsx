import KPIPanel from './KPIPanel'
import Indicators from './Indicators'
import NextDayButton from './NextDayButton'
import ServicePanel from './ServicePanel'

export default function MainScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-md mx-auto lg:max-w-2xl">
        {/* Верхняя панель KPI */}
        <KPIPanel />

        {/* Основная область */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Левая часть: индикаторы и кнопка */}
          <div className="flex-1">
            <Indicators />
            <div className="mt-8 flex justify-center">
              <NextDayButton />
            </div>
          </div>

          {/* Правая часть: сервисы (на мобиле - снизу) */}
          <ServicePanel />
        </div>

        {/* Нижняя область для настроек и справки */}
        <div className="mt-12 flex justify-between items-center text-sm text-gray-400">
          <button className="hover:text-white transition">ℹ️ Справка</button>
          <button className="hover:text-white transition">⚙️ Настройки</button>
          <button className="hover:text-white transition">🏆 Достижения</button>
        </div>
      </div>
    </div>
  )
}
