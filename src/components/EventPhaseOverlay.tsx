import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'
import { getNPCDefinition } from '../constants/npcs'
import type { Event } from '../types/game'

interface EventPhaseOverlayProps {
  /**
   * Handler для выбора опции — реализован в MainScreen / MobileMainScreen
   * (там завязан весь side-effect pipeline: NPC relationships, decision log,
   * chain follow-ups, savings tracking).
   */
  onOptionSelect: (optionId: string) => void
  /**
   * Если фаза events запустилась без pendingEvent (странный edge case
   * после рестарта / миграции) — overlay должен иметь способ продвинуть
   * фазу вперёд, чтобы игрок не застрял. Показывает «Тихая неделя» и
   * переводит в results.
   */
  onContinueIfNoEvent: () => void
}

/**
 * Phase ② «Решения» — фаза 2 недельного цикла.
 *
 * Раньше события показывались как inline-карточка в DashboardView, рядом
 * с обычным дашбордом и микро-событиями — игрок не понимал, какое из них
 * блокирует прогресс, и часто пропускал. Теперь — полноэкранный
 * блокирующий экран, ровно один на неделю.
 *
 * Структура:
 *   1. Эмоциональный заголовок («Среда. Что-то происходит.»)
 *   2. NPC-карточка (если событие связано с персонажем) — портрет,
 *      имя, отношение
 *   3. Заголовок события + описание
 *   4. Опции — вертикальный стек (не горизонтальный — на узком экране
 *      опции читаются сверху вниз)
 *   5. Контур-опция помечена и подсвечена зелёным
 *   6. Если опция несёт балансовый эффект — он показан крупно справа
 *
 * Если pendingEvent === null в фазе events (edge case) — показываем
 * «Тихая неделя» с кнопкой «Дальше → итоги».
 */
export function EventPhaseOverlay({ onOptionSelect, onContinueIfNoEvent }: EventPhaseOverlayProps) {
  const { pendingEvent, pendingEventsQueue, npcs, currentWeek } = useGameStore()

  // Edge case: фаза events без события. Показываем «тишину» и
  // позволяем продвинуть фазу.
  if (!pendingEvent) {
    return <QuietWeekScreen onContinue={onContinueIfNoEvent} week={currentWeek} />
  }

  const totalEvents = 1 + (pendingEventsQueue?.length ?? 0)
  const npcDef = pendingEvent.npcId ? getNPCDefinition(pendingEvent.npcId) : null
  const npc = pendingEvent.npcId ? (npcs ?? []).find(n => n.id === pendingEvent.npcId) : null
  const isMoral = pendingEvent.isMoralDilemma === true
  const deadlineWeeksLeft = pendingEvent.decisionDeadlineWeek
    ? Math.max(0, pendingEvent.decisionDeadlineWeek - currentWeek)
    : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: K.bone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'auto', padding: 24,
      fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 600,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Header */}
        <header style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 800,
            color: isMoral ? K.bad : K.orange,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {isMoral ? 'Дилемма' : 'Решение требует внимания'}
            {totalEvents > 1 && ` · 1 из ${totalEvents}`}
            {deadlineWeeksLeft !== null && (
              ` · ${deadlineWeeksLeft === 0 ? 'решить сейчас' : `${deadlineWeeksLeft} нед. до срока`}`
            )}
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: K.ink,
            letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
          }}>
            {pendingEvent.title}
          </h1>
        </header>

        {/* NPC card (if linked) */}
        {npcDef && (
          <section style={{
            background: K.white, border: `1px solid ${K.line}`,
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: K.bone,
              display: 'grid', placeItems: 'center',
              fontSize: 24, flexShrink: 0,
            }} aria-hidden="true">
              {npcDef.portrait}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: K.ink }}>
                {npcDef.name}
              </div>
              <div style={{ fontSize: 11, color: K.muted, marginTop: 1 }}>
                {npcDef.shortRole}
              </div>
            </div>
            {npc && npc.isRevealed && (
              <div style={{
                fontSize: 10, fontWeight: 800,
                padding: '4px 10px', borderRadius: 999,
                background: npc.relationshipLevel >= 80 ? K.mint :
                            npc.relationshipLevel >= 60 ? K.mint :
                            npc.relationshipLevel >= 40 ? K.muted :
                            npc.relationshipLevel >= 20 ? K.orange : K.bad,
                color: K.white,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {npc.relationshipLevel >= 80 ? 'Союзник' :
                 npc.relationshipLevel >= 60 ? 'Доверяет' :
                 npc.relationshipLevel >= 40 ? 'Нейтрально' :
                 npc.relationshipLevel >= 20 ? 'Настороженно' :
                 'Враждебно'}
              </div>
            )}
          </section>
        )}

        {/* Description */}
        {pendingEvent.description && (
          <section style={{
            fontSize: 15, color: K.ink, lineHeight: 1.6,
            padding: '0 4px', whiteSpace: 'pre-line',
          }}>
            {pendingEvent.description}
          </section>
        )}

        {/* Options — vertical stack */}
        <section
          aria-label="Варианты ответа"
          style={{
            display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          {pendingEvent.options.map((opt) => (
            <OptionButton
              key={opt.id}
              option={opt}
              onClick={() => onOptionSelect(opt.id)}
            />
          ))}
        </section>
      </div>
    </div>
  )
}

function OptionButton({
  option,
  onClick,
}: {
  option: Event['options'][number]
  onClick: () => void
}) {
  const balanceDelta = option.consequences?.balanceDelta
  const hasMonetary = balanceDelta !== undefined && balanceDelta !== 0
  const isContour = option.isContourOption === true
  const isRisk = !isContour && balanceDelta != null && balanceDelta < -5000

  return (
    <button
      onClick={onClick}
      style={{
        background: isContour ? K.mint : K.white,
        border: `2px solid ${isContour ? K.mint : K.line}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 12,
        textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isContour) e.currentTarget.style.borderColor = K.orange
      }}
      onMouseLeave={(e) => {
        if (!isContour) e.currentTarget.style.borderColor = K.line
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          {isContour && (
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 999,
              background: 'rgba(255,255,255,0.25)', color: K.white,
              fontWeight: 800, letterSpacing: '0.08em',
            }}>
              КОНТУР
            </span>
          )}
          {isRisk && (
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 999,
              background: K.bad, color: K.white,
              fontWeight: 800, letterSpacing: '0.06em',
            }}>
              РИСК
            </span>
          )}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, lineHeight: 1.4,
          color: isContour ? K.white : K.ink,
        }}>
          {option.text}
        </div>
      </div>
      {hasMonetary && (
        <div style={{
          fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums', flexShrink: 0,
          color: isContour ? K.white :
                 balanceDelta! > 0 ? K.good :
                 balanceDelta! < -5000 ? K.bad :
                 K.ink,
        }}>
          {balanceDelta! > 0 ? '+' : ''}
          {balanceDelta!.toLocaleString('ru-RU')} ₽
        </div>
      )}
    </button>
  )
}

function QuietWeekScreen({ onContinue, week }: { onContinue: () => void; week: number }) {
  // Тихие недели — нет событий. Показываем короткую нарративную сцену
  // и кнопку «Дальше». Это редкий edge case, не должна быть основной
  // веткой; в нормальном потоке processWeek сам переключает фазу.
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: K.bone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: 'Manrope, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', gap: 20,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: K.muted,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Среда · Неделя {week}
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: K.ink,
          letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0,
        }}>
          Тихая неделя
        </h1>
        <p style={{
          fontSize: 14, color: K.ink2, lineHeight: 1.6, margin: 0,
        }}>
          Никаких писем, проверок, поломок. Семь дней просто работы, без событий.
          Иногда «ничего не случилось» — это лучшая запись в дневнике.
        </p>
        <button
          onClick={onContinue}
          style={{
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: K.ink, color: K.white,
            padding: '16px 24px', borderRadius: 12,
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
            marginTop: 8,
          }}
        >
          Дальше → итоги
        </button>
      </div>
    </div>
  )
}
