import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'
import { WEEKLY_TACTICS, getWeeklyTacticDef } from '../constants/weeklyTactics'

interface WeekSummaryOverlayProps {
  onStart: () => void
}

/**
 * Phase ① «Обзор» — фаза 1 недельного цикла.
 *
 * Полноэкранный обзор начала новой недели. Раньше показывал инфо-сводку,
 * которую можно было промотать одной кнопкой — пассивный информационный
 * слой. Теперь — активный шаг с обязательным решением:
 *
 *   1. 3 главные цифры (баланс / прибыль прошлой недели / репутация)
 *      — без 8 KPI, только то, что игрок реально удержит в голове.
 *   2. Эмоциональный заголовок (текущий месяц / сезон).
 *   3. Карточка «Тактика на неделю» (использует существующий weeklyTactic
 *      механизм). 3 + 1 опция (4-я — «просто работать неделю», без уклона).
 *   4. Кнопка «Дальше →» физически заблокирована, пока тактика не выбрана.
 *
 * Это первая половина перехода игры из «sandbox с триггерами» в
 * 4-фазный цикл с явной структурой.
 */

const MONTH_LABELS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function getMonthAndMood(week: number): { month: string; mood: string } {
  // 52 weeks ≈ 12 months. Each month ≈ 4.33 weeks.
  const monthIndex = Math.min(11, Math.floor((week - 1) / 4.33))
  const month = MONTH_LABELS[monthIndex]
  const mood =
    monthIndex === 11 ? 'Декабрь. Корпоративы. Темнеет в три.' :
    monthIndex === 0 ? 'Январь. Каникулы. Тише обычного.' :
    monthIndex === 1 ? 'Февраль. Холодно, скоро восьмое.' :
    monthIndex >= 5 && monthIndex <= 7 ? `${month}. Лето. Жара под тридцать.` :
    monthIndex >= 2 && monthIndex <= 4 ? `${month}. Тает, район просыпается.` :
    monthIndex >= 8 && monthIndex <= 9 ? `${month}. Школьники возвращаются.` :
    `${month}. Будни.`
  return { month, mood }
}

export function WeekSummaryOverlay({ onStart }: WeekSummaryOverlayProps) {
  const { currentWeek, balance, lastDayResult, reputation, weeklyTactic, setWeeklyTactic } = useGameStore()

  const { mood } = getMonthAndMood(currentWeek)
  const lastWeekProfit = lastDayResult?.netProfit ?? 0
  const isProfitable = lastWeekProfit >= 0
  const tactic = getWeeklyTacticDef(weeklyTactic)
  const canProceed = !!weeklyTactic

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: K.bone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'auto', padding: 24,
      fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>

        {/* Header — week + mood line */}
        <header style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: K.orange,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Понедельник · Неделя {currentWeek} из 52
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: K.ink,
            letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0,
          }}>
            {mood}
          </h1>
        </header>

        {/* Three numbers — никаких 8 KPI, только то, что важно */}
        <section
          aria-label="Состояние бизнеса"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          }}
        >
          {[
            {
              label: 'Баланс',
              value: `${balance.toLocaleString('ru-RU')} ₽`,
              color: K.ink,
            },
            {
              label: lastDayResult ? 'Прибыль прошлой недели' : 'Старт',
              value: lastDayResult
                ? `${isProfitable ? '+' : ''}${lastWeekProfit.toLocaleString('ru-RU')} ₽`
                : '—',
              color: lastDayResult ? (isProfitable ? K.good : K.bad) : K.muted,
            },
            {
              label: 'Репутация',
              value: `${reputation} / 100`,
              color: reputation >= 60 ? K.good : reputation >= 30 ? K.orange : K.bad,
            },
          ].map((m) => (
            <div key={m.label} style={{
              background: K.white, border: `1px solid ${K.line}`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{
                fontSize: 10, color: K.muted, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: m.color, marginTop: 4,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
              }}>
                {m.value}
              </div>
            </div>
          ))}
        </section>

        {/* Decision — тактика недели. Обязательная фаза. */}
        <section
          aria-label="Тактика недели"
          style={{
            background: K.white,
            border: canProceed ? `1px solid ${K.line}` : `2px solid ${K.orange}`,
            borderRadius: 14, padding: 16,
          }}
        >
          <div style={{
            fontSize: 11, fontWeight: 800,
            color: canProceed ? K.muted : K.orange,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Куда смотрите на этой неделе?
          </div>
          <div style={{ fontSize: 12, color: K.ink2, lineHeight: 1.5, marginBottom: 12 }}>
            Один выбор на 7 дней. Эффект скромный, не радикальный.
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
            marginBottom: 8,
          }}>
            {WEEKLY_TACTICS.map((t) => {
              const isSelected = weeklyTactic === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setWeeklyTactic(t.id)}
                  aria-pressed={isSelected}
                  style={{
                    background: isSelected ? K.ink : K.bone,
                    border: `1px solid ${isSelected ? K.ink : K.line}`,
                    borderRadius: 10, padding: '12px 10px',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = K.orange
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = K.line
                  }}
                >
                  <div style={{ fontSize: 20 }} aria-hidden="true">{t.icon}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 800,
                    color: isSelected ? K.white : K.ink,
                  }}>
                    {t.title}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: isSelected ? 'rgba(255,255,255,0.85)' : K.muted,
                    lineHeight: 1.45,
                  }}>
                    {t.blurb}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected confirmation line — small but visible */}
          {tactic && (
            <div style={{
              fontSize: 11, color: K.muted,
              padding: '6px 0', borderTop: `1px solid ${K.line}`,
              marginTop: 4,
            }}>
              Выбрано: <strong style={{ color: K.ink }}>{tactic.title}</strong>
            </div>
          )}
        </section>

        {/* Proceed — disabled until choice */}
        <button
          onClick={canProceed ? onStart : undefined}
          disabled={!canProceed}
          style={{
            width: '100%', border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            background: canProceed ? K.ink : K.lineSoft,
            color: canProceed ? K.white : K.muted,
            padding: '16px 24px', borderRadius: 12,
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
            transition: 'all 0.2s',
          }}
        >
          {canProceed ? 'Прожить неделю →' : 'Сначала выберите тактику'}
        </button>
      </div>
    </div>
  )
}
