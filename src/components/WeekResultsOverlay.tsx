import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'
import { getWeeklyTacticDef } from '../constants/weeklyTactics'

interface WeekResultsOverlayProps {
  onContinue: () => void
}

/**
 * Phase ④ «Итоги» — фаза 4 недельного цикла.
 *
 * Полноэкранный итог недели. Раньше показывал большой раскладок (P&L,
 * milestone, активные NPC, диаграммы) — много информации, которую
 * casual игрок не дочитывает. Теперь — структура «причинность за 5 строк»:
 *
 *   1. 3 ключевые цифры с дельтами (прибыль / клиенты / репутация)
 *   2. «Что сработало» — 2-3 строки конкретных причин роста
 *   3. «Что пошло не так» — 2-3 строки причин потерь
 *   4. (опционально) Дневник, если он сработал на этой неделе
 *   5. Кнопка «Следующая неделя →»
 *
 * Цель — игрок видит **что я сделал → что это дало**, а не «таблицу с
 * 14 параметрами, в которой я должен сам найти, где плохо».
 */

const MILESTONE_LABELS: Record<string, { title: string; emoji: string }> = {
  week10: { emoji: '🌱', title: '10 недель — вы выжили!' },
  week20: { emoji: '🚀', title: '20 недель — уже не новичок' },
  week30: { emoji: '🏆', title: '30 недель — настоящий предприниматель' },
}

// PAIN_LABELS удалены вместе с Pain Engine штрафами.

export function WeekResultsOverlay({ onContinue }: WeekResultsOverlayProps) {
  const {
    currentWeek, balance, lastDayResult, services, achievements,
    pendingMilestoneCelebration, weeklyTactic,
    lastWeekMicroEvent, lastDiaryEntry, pendingTierUpgrade,
  } = useGameStore()

  if (!lastDayResult) return null

  const isProfitable = lastDayResult.netProfit >= 0
  const milestone = pendingMilestoneCelebration
    ? MILESTONE_LABELS[pendingMilestoneCelebration]
    : null
  const tactic = getWeeklyTacticDef(weeklyTactic)
  const activeCount = Object.values(services).filter(s => s.isActive).length

  // ── Что сработало (positive causality) ──────────────────────────────
  const positives: string[] = []
  if (lastDayResult.revenue > 0 && isProfitable) {
    positives.push(`Выручка ${lastDayResult.revenue.toLocaleString('ru-RU')} ₽ за неделю`)
  }
  if (tactic && tactic.revenueMultiplier > 1) {
    const pct = Math.round((tactic.revenueMultiplier - 1) * 100)
    positives.push(`Тактика «${tactic.title}»: +${pct}% к выручке`)
  } else if (tactic && tactic.id === 'service') {
    // Спринт 6 (UX #8): service-тактика не имеет revenue boost, поэтому
    // молчала в «Что сработало». Показываем её rep-эффект — игрок видит
    // что тактика отработала.
    const repWeekly = Math.round((tactic.reputationDelta * 7 + tactic.loyaltyDelta * 7 * 0.5) * 10) / 10
    positives.push(`Тактика «${tactic.title}»: +${repWeekly} репутации за неделю`)
  } else if (tactic && tactic.id === 'calm') {
    positives.push(`Тактика «${tactic.title}»: +${Math.round(tactic.energyDelta * 7)} энергии за неделю`)
  }
  // Спринт 6 (UX phase-3 audit): показываем бандл-bonus ТОЛЬКО на неделях
  // изменения (когда добавили сервис → новый tier бандла). Раньше эта
  // строчка спамилась 20+ недель подряд с одинаковым +10%. Триггер:
  // currentWeek первая неделя после tier-crossing (3rd, 5th, 7th service).
  // Используем simple proxy: показываем только когда activeCount это TOP
  // bundle (5+ или 7+) ИЛИ когда сервис только что подключён (rare path).
  if (activeCount >= 5) {
    const bonus = activeCount >= 7 ? 30 : 20
    positives.push(`Полный бандл ${activeCount}/${activeCount >= 7 ? 7 : 5}: +${bonus}% выручки`)
  }
  if (lastWeekMicroEvent && lastWeekMicroEvent.effectText.includes('+')) {
    positives.push(lastWeekMicroEvent.effectText)
  }

  // ── Что пошло не так (negative causality) ──────────────────────────
  const negatives: string[] = []
  // Спринт 6 (Economy #3): null tactic = -5% revenue tax. Раньше было
  // молчаливо — игрок не понимал откуда «эффективность» падает. Теперь
  // явная строчка в Что пошло не так.
  if (!tactic) {
    negatives.push('Без тактики на неделю: −5% выручки (рассеянность)')
  }
  if (lastDayResult.expiredLoss > 0) {
    negatives.push(
      `Просрочка: −${lastDayResult.expiredLoss.toLocaleString('ru-RU')} ₽`
    )
  }
  if (lastDayResult.tax > 0) {
    negatives.push(`Налог УСН: −${lastDayResult.tax.toLocaleString('ru-RU')} ₽`)
  }
  // Спринт 6 (UX phase-4 audit): подписки Контура раньше попадали в
  // «Что пошло не так» каждую неделю — но это не «потеря», это
  // плановый расход. После W6 (стабилизировались) убираем из negatives.
  // На W1-6 оставляем чтобы игрок видел стоимость подписок в первый
  // месяц, потом — нет.
  if (lastDayResult.subscriptionCost > 0 && activeCount > 0 && currentWeek <= 6) {
    negatives.push(
      `Подписки Контура (${activeCount}): −${lastDayResult.subscriptionCost.toLocaleString('ru-RU')} ₽`
    )
  }
  // Pain Engine как ежедневный штраф к балансу выпилен; раньше тут
  // показывались top-2 потери от отсутствующих сервисов. Теперь оценка
  // живёт одной строчкой на карточке сервиса в экране «Экосистема».

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
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Header */}
        <header style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: K.mintInk,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {currentWeek - 1 >= 52
              ? 'Год завершён — итоги бизнеса'
              : `Воскресенье · Неделя ${currentWeek - 1} закончилась`}
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: K.ink,
            letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0,
          }}>
            {isProfitable ? 'Неделя в плюс' : 'Неделя в минус'}
          </h1>
        </header>

        {/* Milestone — если случилось */}
        {milestone && (
          <div style={{
            background: K.violet, borderRadius: 14, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 30 }} aria-hidden="true">{milestone.emoji}</div>
            <div style={{
              fontSize: 14, fontWeight: 800, color: K.white,
              lineHeight: 1.2,
            }}>
              {milestone.title}
            </div>
          </div>
        )}

        {/* Tier upgrade — отдельный slot, заметнее микрособытий.
            Раньше tier-апгрейд писался в lastWeekMicroEvent и терялся
            рядом с «соседка принесла печенье». */}
        {pendingTierUpgrade && (
          <div style={{
            background: 'linear-gradient(135deg, #6b46c1, #2563eb)',
            borderRadius: 14, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}>
            <div style={{ fontSize: 36 }} aria-hidden="true">{pendingTierUpgrade.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
              }}>
                Бизнес вырос — Этап {pendingTierUpgrade.level}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: K.white,
                lineHeight: 1.2, marginTop: 2,
              }}>
                {pendingTierUpgrade.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                Клиенты, чек и ёмкость подросли. Никаких новых трат.
              </div>
            </div>
          </div>
        )}

        {/* Three numbers — что изменилось */}
        <section
          aria-label="Итоги недели"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
        >
          {[
            {
              label: 'Прибыль',
              value: `${isProfitable ? '+' : ''}${lastDayResult.netProfit.toLocaleString('ru-RU')} ₽`,
              icon: isProfitable ? '📈' : '📉',
              color: isProfitable ? K.good : K.bad,
            },
            {
              label: 'Клиентов',
              value: `${lastDayResult.served}`,
              icon: '👥',
              color: K.ink,
            },
            {
              label: 'Баланс',
              value: `${balance.toLocaleString('ru-RU')} ₽`,
              icon: '💰',
              color: balance > 0 ? K.ink : K.bad,
            },
          ].map((m) => (
            <div key={m.label} style={{
              background: K.white, border: `1px solid ${K.line}`,
              borderRadius: 12, padding: '14px 16px',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{
                position: 'absolute', top: 8, right: 10,
                fontSize: 16, opacity: 0.3,
              }} aria-hidden="true">{m.icon}</span>
              <div style={{
                fontSize: 10, color: K.muted, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 800, color: m.color, marginTop: 4,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
              }}>
                {m.value}
              </div>
            </div>
          ))}
        </section>

        {/* Что сработало */}
        {positives.length > 0 && (
          <section style={{
            background: K.white, border: `1px solid ${K.line}`,
            borderLeft: `4px solid ${K.mint}`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: K.mintInk,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              ✓ Что сработало
            </div>
            <ul style={{
              margin: 0, padding: 0, listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {positives.slice(0, 3).map((p, i) => (
                <li key={i} style={{
                  fontSize: 13, color: K.ink, lineHeight: 1.5,
                }}>
                  · {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Что пошло не так */}
        {negatives.length > 0 && (
          <section style={{
            background: K.white, border: `1px solid ${K.line}`,
            borderLeft: `4px solid ${K.orange}`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: K.orange,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              × Что пошло не так
            </div>
            <ul style={{
              margin: 0, padding: 0, listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {negatives.slice(0, 3).map((n, i) => (
                <li key={i} style={{
                  fontSize: 13, color: K.ink, lineHeight: 1.5,
                }}>
                  · {n}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Diary — если сработала запись (раз в 5 недель) */}
        {lastDiaryEntry && (
          <section style={{
            background: '#fdf6e3',
            border: `1px solid #e8dfc6`,
            borderLeft: `3px solid ${K.orange}`,
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: K.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
            }}>
              {lastDiaryEntry.header}
            </div>
            <div style={{
              fontSize: 13, color: K.ink, lineHeight: 1.55,
              fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif',
            }}>
              {lastDiaryEntry.body}
            </div>
          </section>
        )}

        {/* Footnote — achievements unlocked count, when relevant */}
        {achievements.length > 0 && (
          <div style={{
            fontSize: 11, color: K.muted, textAlign: 'center',
          }}>
            Достижений всего: <strong style={{ color: K.ink }}>{achievements.length}</strong>
          </div>
        )}

        <button
          onClick={onContinue}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
            background: K.ink, color: K.white,
            padding: '16px 24px', borderRadius: 12,
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
          }}
        >
          Следующая неделя →
        </button>
      </div>
    </div>
  )
}
