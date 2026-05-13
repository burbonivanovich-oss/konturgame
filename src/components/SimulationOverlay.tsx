import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

// Inline-format: utils/format not present on main yet. Inline keeps this
// component standalone — refactor to shared util later if it spreads.
const formatRubSigned = (n: number): string =>
  `${n >= 0 ? '+' : ''}${n.toLocaleString('ru-RU')} ₽`

interface SimulationOverlayProps {
  onContinue: () => void
}

interface SimulationChip {
  emoji: string
  label: string
  amount?: number
  color: string
  /** На каком из 7 дней появляется (0..6) */
  day: number
}

const TOTAL_DURATION_MS = 4500
const DAYS = 7

/**
 * Phase ③ «Симуляция» — фаза 3 недельного цикла.
 *
 * Полноэкранный 4-5-секундный анимированный показ прошедшей недели.
 * Все вычисления уже выполнены в processWeek (state финальный) — здесь
 * только визуализация: счётчик баланса плавно меняется к финальному
 * значению, по дням всплывают чипы значимых событий («−5 000 ₽: касса
 * сломалась», «Бандл 5/7: +20% выручки», и т.д.).
 *
 * Это сам по себе не игровой механизм, а **момент дыхания** между
 * решениями и итогами. Без неё игра ощущалась как «нажал — пошло» — с
 * ней неделя получает физический объём.
 *
 * Кнопка «Подвести итоги →» доступна с первой секунды — игрок может
 * скипнуть, если не хочет смотреть.
 */
export function SimulationOverlay({ onContinue }: SimulationOverlayProps) {
  const { lastDayResult, balance, services, weeklyTactic } = useGameStore()

  // Build chips from this week's data — выбор значимых моментов.
  const chips = useMemo<SimulationChip[]>(() => {
    if (!lastDayResult) return []
    const out: SimulationChip[] = []

    // ── Negative chips ────────────────────────────────────────────
    if (lastDayResult.expiredLoss > 0) {
      out.push({
        emoji: '🥬', label: 'Списали просрочку',
        amount: -lastDayResult.expiredLoss, color: K.bad, day: 1,
      })
    }
    if (lastDayResult.tax > 0) {
      out.push({
        emoji: '🧾', label: 'Налог УСН',
        amount: -lastDayResult.tax, color: K.muted, day: 4,
      })
    }
    if (lastDayResult.subscriptionCost > 0) {
      out.push({
        emoji: '💳', label: 'Подписки Контура',
        amount: -lastDayResult.subscriptionCost, color: K.muted, day: 0,
      })
    }
    // Раньше тут была строка «Очередь упустила клиентов» по
    // registerOverflowPenalty — мех. кассы как throughput удалена,
    // штраф теперь всегда 0.

    // Pain Engine как штраф к балансу выпилен — раньше тут показывались
    // top-2 потери от отсутствующих сервисов. Теперь оценка «без сервиса
    // теряете ~X ₽/мес» живёт одной строчкой на карточке сервиса в
    // экране «Экосистема».

    // ── Positive chips ────────────────────────────────────────────
    const activeCount = Object.values(services).filter(s => s.isActive).length
    if (activeCount >= 3) {
      const bonus = activeCount >= 7 ? 30 : activeCount >= 5 ? 20 : 10
      out.push({
        emoji: '✨', label: `Бандл ${activeCount}/7: +${bonus}% выручки`,
        color: K.mint, day: 5,
      })
    }
    if (weeklyTactic === 'aggressive') {
      out.push({ emoji: '🔥', label: 'Активная неделя: +20%', color: K.mint, day: 6 })
    } else if (weeklyTactic === 'service') {
      out.push({ emoji: '⭐', label: 'Качество и сервис: +рейтинг', color: K.mint, day: 6 })
    }

    if (lastDayResult.revenue > 0) {
      out.push({
        emoji: '💰', label: 'Выручка за неделю',
        amount: lastDayResult.revenue, color: K.good, day: 6,
      })
    }

    return out
  }, [lastDayResult, services, weeklyTactic])

  const startBalance = useMemo(() => {
    if (!lastDayResult) return balance
    return balance - lastDayResult.netProfit
  }, [balance, lastDayResult])

  const [progress, setProgress] = useState(0) // 0..1
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    if (skipped) return
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const elapsed = performance.now() - start
      const p = Math.min(1, elapsed / TOTAL_DURATION_MS)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [skipped])

  const currentDay = Math.min(DAYS, Math.floor(progress * DAYS) + 1)
  const animatedBalance = Math.round(startBalance + (balance - startBalance) * progress)
  const visibleChips = chips.filter(c => c.day < currentDay)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: K.bone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Header */}
        <header style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: K.muted,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Прошёл понедельник · {DAY_LABELS.slice(0, currentDay).join(' · ')}
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: K.ink,
            letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
          }}>
            Неделя идёт
          </h1>
        </header>

        {/* Live balance counter */}
        <div style={{
          background: K.white, border: `1px solid ${K.line}`,
          borderRadius: 14, padding: '20px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, color: K.muted, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Баланс
          </div>
          <div style={{
            fontSize: 32, fontWeight: 800,
            color: animatedBalance >= startBalance ? K.good : K.bad,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          }}>
            {animatedBalance.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 12, color: K.muted, marginTop: 4 }}>
            {animatedBalance >= startBalance ? '+' : ''}
            {(animatedBalance - startBalance).toLocaleString('ru-RU')} ₽ за неделю
          </div>
        </div>

        {/* Day pips — 7 dots, filled as days progress */}
        <div
          aria-label="Прогресс недели"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            display: 'flex', gap: 8, justifyContent: 'center',
          }}
        >
          {Array.from({ length: DAYS }).map((_, i) => (
            <div key={i} style={{
              width: 36, height: 6, borderRadius: 999,
              background: i < currentDay ? K.ink : K.line,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {/* Chips feed */}
        <div style={{
          minHeight: 140,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {visibleChips.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px 16px',
              color: K.muted, fontSize: 12, fontStyle: 'italic',
            }}>
              Понедельник, утро. Открыли двери. Ждём посетителей.
            </div>
          ) : (
            visibleChips.map((chip, i) => (
              <div
                key={`${chip.label}-${i}`}
                style={{
                  background: K.white, border: `1px solid ${K.line}`,
                  borderLeft: `4px solid ${chip.color}`,
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  animation: 'slideUp 280ms ease-out',
                }}
              >
                <span style={{ fontSize: 18 }} aria-hidden="true">{chip.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, color: K.ink, fontWeight: 600 }}>
                  {chip.label}
                </span>
                {chip.amount !== undefined && (
                  <span style={{
                    fontSize: 14, fontWeight: 800,
                    color: chip.amount >= 0 ? K.good : K.bad,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatRubSigned(chip.amount)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Skip / continue */}
        <button
          onClick={() => {
            if (!skipped && progress < 1) {
              setSkipped(true)
              setProgress(1)
            } else {
              onContinue()
            }
          }}
          style={{
            width: '100%', cursor: 'pointer',
            fontFamily: 'inherit',
            background: progress >= 1 ? K.ink : K.bone,
            color: progress >= 1 ? K.white : K.muted,
            padding: '16px 24px', borderRadius: 12,
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
            border: progress >= 1 ? 'none' : `1px solid ${K.line}`,
            transition: 'all 0.2s',
          }}
        >
          {progress >= 1 ? 'Подвести итоги →' : 'Пропустить ⏭'}
        </button>
      </div>
    </div>
  )
}

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
