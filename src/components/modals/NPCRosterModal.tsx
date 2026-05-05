import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { NPC_DEFINITIONS, getNpcDefinition, getNpcOpinion } from '../../constants/npcs'
import { getRelationshipLabel } from '../../services/npcManager'
import { getNpcArc } from '../../constants/npcEpisodes'
import { K } from '../design-system/tokens'

interface NPCRosterModalProps {
  isOpen: boolean
  onClose: () => void
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
          const opinion = npc ? getNpcOpinion(npc) : 0
          const band = getRelationshipLabel(opinion)
          const modifiers = (npc?.modifiers ?? []).slice().reverse()
          const arc = getNpcArc(def.id)
          const completed = (npc?.completedEpisodes ?? []).length
          const totalEpisodes = arc.length

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
                    {def.shortBlurb}
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
              {/* Header: portrait + name + opinion band */}
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
                    {def.shortBlurb}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: band.color,
                  background: K.bone,
                  padding: '4px 10px', borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}>
                  {band.text} {opinion >= 0 ? '+' : ''}{opinion}
                </div>
              </div>

              {/* What this NPC unlocks */}
              <div style={{
                fontSize: 11, color: K.ink2, lineHeight: 1.4,
                background: K.bone, borderRadius: 8, padding: '6px 10px',
              }}>
                <span style={{ fontWeight: 700, color: K.ink }}>Открывает: </span>
                {def.unlocks}
              </div>

              {/* Arc progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: K.muted }}>
                <span>Эпизоды:</span>
                <span style={{ fontWeight: 700, color: K.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {completed} / {totalEpisodes}
                </span>
                <div style={{ flex: 1, height: 4, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: totalEpisodes > 0 ? `${(completed / totalEpisodes) * 100}%` : '0%',
                    height: '100%',
                    background: band.color,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              {/* Modifier list — CK3-style "this is why they feel this way" */}
              {modifiers.length > 0 && (
                <div style={{
                  borderTop: `1px solid ${K.lineSoft}`,
                  paddingTop: 10, marginTop: 2,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    {def.name} помнит
                  </div>
                  {modifiers.map((m, i) => {
                    const sign = m.value >= 0 ? '+' : ''
                    const color = m.value > 0 ? K.mintInk : m.value < 0 ? '#c0392b' : K.muted
                    return (
                      <div key={i} style={{
                        fontSize: 12, lineHeight: 1.35,
                        display: 'flex', gap: 8, alignItems: 'baseline',
                      }}>
                        <span style={{ color: K.muted, fontVariantNumeric: 'tabular-nums', flexShrink: 0, fontSize: 11 }}>
                          нед. {m.week}
                        </span>
                        <span style={{ flex: 1, color: K.ink2 }}>{m.reason}</span>
                        {m.value !== 0 && (
                          <span style={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                            {sign}{m.value}
                          </span>
                        )}
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

export { getNpcDefinition }
