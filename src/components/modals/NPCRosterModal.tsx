import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { NPC_DEFINITIONS, getNPCDefinition } from '../../constants/npcs'
import type { NpcMemoryEntry } from '../../types/game'
import { K } from '../design-system/tokens'

interface NPCRosterModalProps {
  isOpen: boolean
  onClose: () => void
}

function relationshipBand(level: number) {
  if (level >= 80) return { label: 'Союзник', color: K.mint }
  if (level >= 60) return { label: 'Доверяет', color: K.mint }
  if (level >= 40) return { label: 'Нейтрально', color: K.muted }
  if (level >= 20) return { label: 'Настороженно', color: K.orange }
  return { label: 'Враждебно', color: '#c0392b' }
}

// Sort: anchors first (permanent), then by recency. Hide entries with
// zero delta — they're not opinion-shaping events. Show up to ~6 lines.
function buildOpinionStack(memory: NpcMemoryEntry[]): NpcMemoryEntry[] {
  const meaningful = memory.filter(m => (m.delta ?? 0) !== 0)
  const anchors = meaningful.filter(m => m.isAnchor)
  const nonAnchors = meaningful.filter(m => !m.isAnchor).slice(-6)
  return [...anchors, ...nonAnchors].slice(-8)
}

function deltaColor(d: number): string {
  if (d > 0) return K.mint
  if (d < 0) return '#c0392b'
  return K.muted
}

function deltaText(d: number): string {
  if (d > 0) return `+${d}`
  return String(d)
}

export default function NPCRosterModal({ isOpen, onClose }: NPCRosterModalProps) {
  const npcs = useGameStore(s => s.npcs ?? [])

  const revealedIds = new Set(npcs.filter(n => n.isRevealed).map(n => n.id))
  const totalCount = NPC_DEFINITIONS.length
  const revealedCount = revealedIds.size

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Окружение" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 12, color: K.muted, marginBottom: 4 }}>
          Люди, с которыми пересекались. Открыто {revealedCount} из {totalCount}.
        </div>

        {NPC_DEFINITIONS.map(def => {
          const npc = npcs.find(n => n.id === def.id)
          const isRevealed = npc?.isRevealed ?? false
          const level = npc?.relationshipLevel ?? def.startRelationship
          const band = relationshipBand(level)
          const stack = buildOpinionStack(npc?.memory ?? [])

          if (!isRevealed) {
            return (
              <div key={def.id} style={{
                background: K.bone,
                border: `1px solid ${K.lineSoft}`,
                borderRadius: 12,
                padding: 14,
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: 0.55,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: K.lineSoft,
                  display: 'grid', placeItems: 'center',
                  fontSize: 20, filter: 'grayscale(1)',
                }}>?</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: K.muted }}>
                    {def.shortRole}
                  </div>
                  <div style={{ fontSize: 11, color: K.muted, marginTop: 2 }}>
                    Появится позже
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={def.id} style={{
              background: K.white,
              border: `1px solid ${K.line}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {/* Header: portrait + name + relationship band */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999,
                  background: K.bone,
                  display: 'grid', placeItems: 'center',
                  fontSize: 24,
                }}>
                  {def.portrait}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: K.ink }}>
                    {def.name}
                  </div>
                  <div style={{ fontSize: 11, color: K.muted, marginTop: 1 }}>
                    {def.shortRole}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: band.color,
                    background: K.bone,
                    padding: '4px 10px', borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}>
                    {band.label}
                  </div>
                  <div style={{
                    fontSize: 10, color: K.muted, marginTop: 4,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {level} / 100
                  </div>
                </div>
              </div>

              {/* Personality blurb */}
              <div style={{
                fontSize: 12, color: K.ink2, lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                «{def.personality}»
              </div>

              {/* Opinion stack — CK3-style "they remember" list. Each line
                  is a moment that moved the needle, with the signed delta. */}
              {stack.length > 0 && (
                <div style={{
                  borderTop: `1px solid ${K.lineSoft}`,
                  paddingTop: 10, marginTop: 2,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: K.muted,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: 2,
                  }}>
                    {def.name.split(' ')[0]} помнит
                  </div>
                  {stack.map((m, i) => {
                    const d = m.delta ?? 0
                    return (
                      <div key={i} style={{
                        fontSize: 12, color: K.ink2, lineHeight: 1.4,
                        display: 'flex', alignItems: 'baseline', gap: 8,
                      }}>
                        {m.isAnchor && (
                          <span style={{
                            fontSize: 9, color: K.muted,
                            flexShrink: 0, marginTop: 2,
                          }}>📌</span>
                        )}
                        <span style={{ flex: 1, minWidth: 0 }}>
                          {m.note}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 800,
                          color: deltaColor(d),
                          fontVariantNumeric: 'tabular-nums',
                          flexShrink: 0,
                        }}>
                          {deltaText(d)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export { getNPCDefinition }
