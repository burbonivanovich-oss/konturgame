import { useGameStore } from '../../stores/gameStore'
import { getMilestoneProgress } from '../../services/weekCalculator'
import { K } from '../design-system/tokens'

const MILESTONES = [
  {
    key: 'week10' as const,
    week: 10,
    label: 'Первый квартал',
    balanceTarget: 100_000,
    profitTarget: 1_000,
    icon: '🌱',
  },
  {
    key: 'week20' as const,
    week: 20,
    label: 'Полгода работы',
    balanceTarget: 250_000,
    profitTarget: 5_000,
    icon: '🚀',
  },
  {
    key: 'week30' as const,
    week: 30,
    label: 'Три квартала',
    balanceTarget: 500_000,
    profitTarget: 10_000,
    icon: '🏆',
  },
]

export function MilestoneView() {
  const state = useGameStore()
  const milestones = getMilestoneProgress(state)
  const { currentWeek, balance, lastDayResult } = state
  const weeklyProfit = lastDayResult?.netProfit ?? 0

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ПРОГРЕСС</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Вехи</div>
      </div>

      {/* Current status strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>НЕДЕЛЯ</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{currentWeek}</div>
        </div>
        <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>БАЛАНС</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: K.good, fontVariantNumeric: 'tabular-nums' }}>
            {balance.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div style={{ background: K.white, border: `1px solid ${K.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ПРИБЫЛЬ СЕГОДНЯ</div>
          <div style={{
            fontSize: 18, fontWeight: 800, marginTop: 4,
            color: weeklyProfit >= 0 ? K.good : K.bad,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {weeklyProfit >= 0 ? '+' : ''}{weeklyProfit.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Milestone cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MILESTONES.map(m => {
          const achieved = milestones[m.key]
          const isPast = currentWeek > m.week
          const isCurrent = currentWeek >= m.week && !achieved

          const balancePct = Math.min(100, Math.round((balance / m.balanceTarget) * 100))
          const profitPct = Math.min(100, Math.round((weeklyProfit / m.profitTarget) * 100))

          let borderColor: string = K.line
          let bg: string = K.white
          if (achieved) { borderColor = K.mint; bg = K.mintSoft }
          else if (isCurrent) { borderColor = K.orange; bg = K.orangeSoft }

          return (
            <div key={m.key} style={{
              background: bg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 20, padding: 18,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: achieved ? K.mint : isCurrent ? K.orange : K.bone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  filter: (!achieved && !isCurrent) ? 'grayscale(1)' : 'none',
                  opacity: (!achieved && !isCurrent) ? 0.5 : 1,
                }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{m.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: K.muted, marginTop: 1 }}>
                    Неделя {m.week}
                  </div>
                </div>
                {achieved ? (
                  <div style={{
                    fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
                    background: K.mint, color: K.white,
                  }}>
                    ✓ Выполнено
                  </div>
                ) : isPast ? (
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                    background: K.bone, color: K.muted,
                  }}>
                    Не достигнута
                  </div>
                ) : (
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                    background: K.orange, color: K.white,
                    opacity: isCurrent ? 1 : 0.5,
                  }}>
                    {isCurrent ? 'Проверяется' : `Через ${m.week - currentWeek} нед.`}
                  </div>
                )}
              </div>

              {/* Targets */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: K.muted,
                background: K.bone, borderRadius: 10, padding: '8px 12px',
              }}>
                Условие: баланс ≥ {m.balanceTarget.toLocaleString('ru-RU')} ₽ &nbsp;ИЛИ&nbsp; прибыль ≥ {m.profitTarget.toLocaleString('ru-RU')} ₽ за день
              </div>

              {/* Progress bars — only when not yet achieved */}
              {!achieved && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Balance progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontWeight: 600, color: K.muted }}>
                      <span>Баланс</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{balance.toLocaleString('ru-RU')} / {m.balanceTarget.toLocaleString('ru-RU')} ₽ · {balancePct}%</span>
                    </div>
                    <div style={{ height: 6, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${balancePct}%`, height: '100%', borderRadius: 999,
                        background: balancePct >= 100 ? K.mint : K.violet,
                        transition: 'width 0.4s',
                      }} />
                    </div>
                  </div>
                  {/* Profit progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontWeight: 600, color: K.muted }}>
                      <span>Дневная прибыль</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{weeklyProfit.toLocaleString('ru-RU')} / {m.profitTarget.toLocaleString('ru-RU')} ₽ · {Math.max(0, profitPct)}%</span>
                    </div>
                    <div style={{ height: 6, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.max(0, profitPct)}%`, height: '100%', borderRadius: 999,
                        background: profitPct >= 100 ? K.mint : K.mint,
                        transition: 'width 0.4s',
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 11, color: K.muted, textAlign: 'center', paddingBottom: 8 }}>
        Достаточно выполнить одно из двух условий каждой вехи
      </div>
    </div>
  )
}
