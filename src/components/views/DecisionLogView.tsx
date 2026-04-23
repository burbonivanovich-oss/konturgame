import { useGameStore } from '../../stores/gameStore'
import type { DecisionLogEntry } from '../../types/game'
import { K } from '../design-system/tokens'

const IMPACT_STYLES: Record<string, { color: string; label: string; icon: string }> = {
  positive: { color: K.good,  label: 'Польза',      icon: '↑' },
  negative: { color: K.bad,   label: 'Потери',      icon: '↓' },
  neutral:  { color: K.muted, label: 'Нейтрально',  icon: '—' },
}

const TYPE_LABELS: Record<string, string> = {
  choice:    'Решение',
  chain:     'Цепочка событий',
  milestone: 'Веха',
  npc:       'НПС',
  newspaper: 'Газета',
  customer:  'Клиент',
}

function EntryRow({ entry }: { entry: DecisionLogEntry }) {
  const s = IMPACT_STYLES[entry.impact] ?? IMPACT_STYLES.neutral
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px', borderRadius: 14,
      background: K.white,
      border: `1px solid ${K.line}`,
      borderLeft: `3px solid ${s.color}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: `${s.color}1F`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: s.color,
      }}>
        {s.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
            background: K.bone, color: K.muted,
            letterSpacing: '0.04em',
          }}>
            НЕДЕЛЯ {entry.week}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: `${s.color}1F`, color: s.color,
          }}>
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
          {entry.npcId && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              background: K.bone, color: K.ink,
            }}>
              {entry.npcId}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: K.ink }}>
          {entry.text}
        </div>
      </div>
    </div>
  )
}

export function DecisionLogView() {
  const decisionLog = useGameStore((s) => s.decisionLog)
  const currentWeek = useGameStore((s) => s.currentWeek)

  const entries = [...(decisionLog ?? [])].reverse()

  return (
    <main style={{
      flex: 1, padding: '24px 28px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: K.muted, textTransform: 'uppercase', marginBottom: 6,
          }}>
            ХРОНИКА РЕШЕНИЙ
          </div>
          <div style={{
            fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
            color: K.ink,
          }}>
            Журнал
          </div>
        </div>
        <div style={{
          padding: '8px 16px', borderRadius: 12,
          background: K.bone,
          fontSize: 12, fontWeight: 700, color: K.muted,
        }}>
          Неделя {currentWeek}
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12, opacity: 0.4,
          padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40 }}>📓</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Журнал пока пуст</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Когда вы будете принимать решения по событиям, они появятся здесь
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Summary stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8,
          }}>
            {(['positive', 'negative', 'neutral'] as const).map(impact => {
              const count = entries.filter(e => e.impact === impact).length
              const s = IMPACT_STYLES[impact]
              return (
                <div key={impact} style={{
                  padding: '12px 16px', borderRadius: 14,
                  background: K.white, border: `1px solid ${K.line}`,
                  borderTop: `3px solid ${s.color}`,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: K.muted, marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              )
            })}
          </div>

          {entries.map((entry, i) => (
            <EntryRow key={`${entry.week}-${entry.text.slice(0, 20)}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </main>
  )
}
