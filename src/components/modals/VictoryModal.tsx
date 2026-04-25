import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { PlayerBackstory, NPC } from '../../types/game'
import { K } from '../design-system/tokens'
import { buildNpcExitLines, buildGoalClosure } from '../../constants/npcExits'
import { getNPCDefinition } from '../../constants/npcs'
import { getMetaLesson } from '../../constants/metaLessons'

interface VictoryModalProps {
  isOpen: boolean
  type: 'victory' | 'defeat'
}

function getGameOverMessage(reason?: string): { emoji: string; title: string; description: string } {
  switch (reason) {
    case 'bankruptcy':
      return {
        emoji: '💸',
        title: 'Банкротство',
        description: 'Ваш баланс упал ниже нуля. Вы не смогли управлять расходами и потеряли все деньги.',
      }
    case 'burnout':
      return {
        emoji: '🔥',
        title: 'Выгорание',
        description: 'Вы потратили все свою энергию управлением бизнесом. Владелец полностью истощен.',
      }
    case 'reputation':
      return {
        emoji: '📉',
        title: 'Потеря репутации',
        description: 'Репутация вашего бизнеса упала настолько, что клиенты перестали вас посещать.',
      }
    default:
      return {
        emoji: '❌',
        title: 'Игра окончена',
        description: 'Ваш бизнес не смог пережить трудные времена. Попробуйте еще раз!',
      }
  }
}

function getNarrativeEnding(
  backstory: PlayerBackstory | null,
  npcs: NPC[],
  completedChainIds: string[],
  reputation: number,
  currentWeek: number,
): { title: string; text: string } {
  const mikhail = npcs.find(n => n.id === 'mikhail')
  const svetlana = npcs.find(n => n.id === 'svetlana')
  const anna = npcs.find(n => n.id === 'anna')

  // Alliance ending: Mikhail trusted partner + Svetlana stayed + reputation high
  if (
    mikhail && mikhail.relationshipLevel >= 70 &&
    svetlana && svetlana.relationshipLevel >= 70 &&
    reputation >= 70
  ) {
    return {
      title: 'Команда мечты',
      text: 'Михаил поставлял лучшие товары по честным ценам. Светлана стала правой рукой. Вместе вы сделали что-то настоящее — бизнес, которому доверяют.',
    }
  }

  // Rivalry ending: Anna subdued
  if (anna && anna.relationshipLevel <= 25 && completedChainIds.includes('anna_war')) {
    return {
      title: 'Победа в конкурентной борьбе',
      text: 'Анна Козлова пыталась вас уничтожить. Вы устояли. Теперь её магазин закрыт, а ваш процветает. Честная победа в нечестной игре.',
    }
  }

  // Legacy ending: mentorship chain completed + high reputation
  if (completedChainIds.includes('legacy') && reputation >= 75) {
    return {
      title: 'Наставник района',
      text: 'Молодые предприниматели приходят к вам за советом. Вы не просто открыли бизнес — вы стали частью жизни района. Это останется надолго.',
    }
  }

  // Backstory: left corporation
  if (backstory?.motivation === 'corp' && currentWeek >= 30) {
    return {
      title: 'Правильный выбор',
      text: 'Тот день, когда написали заявление? Он того стоил. Вы доказали — сначала себе, потом всем остальным. Опенспейс остался в прошлом.',
    }
  }

  // Backstory: won grant
  if (backstory?.motivation === 'contest' && reputation >= 60) {
    return {
      title: 'Грант не зря',
      text: 'Те 80 000 ₽ превратились в работающий бизнес. Вы показали: хорошая идея при правильных инструментах может превратиться во что-то реальное.',
    }
  }

  // Backstory: hometown
  if (backstory?.personal === 'hometown') {
    return {
      title: 'Свой район',
      text: 'Вы выросли здесь. Вы открыли бизнес здесь. Соседи, которые помнят вас с детства, теперь — ваши постоянные клиенты. Это называется домом.',
    }
  }

  // Friend personal
  if (backstory?.personal === 'friend') {
    return {
      title: 'Катя не ошиблась',
      text: 'Катя верила с самого начала — даже когда вы сами не были уверены. Теперь вы квиты: она помогала вам подняться, вы помогли ей начать заново. Так и работает настоящее.',
    }
  }

  // Default
  return {
    title: 'Год предпринимателя',
    text: 'Год назад вы сделали первый шаг. Сегодня у вас есть бизнес, клиенты и опыт, которого не купишь. Это ваша история.',
  }
}

const SERVICE_LABELS: Record<string, string> = {
  market: 'Контур.Маркет',
  ofd:    'Контур.ОФД',
  elba:   'Контур.Эльба',
  bank:   'Контур.Банк',
  diadoc: 'Контур.Диадок',
  fokus:  'Контур.Фокус',
  extern: 'Контур.Экстерн',
}

export default function VictoryModal({ isOpen, type }: VictoryModalProps) {
  const {
    startNewGame, currentWeek, balance, reputation, gameOverReason,
    playerBackstory, npcs, completedChainIds, totalPainLosses, personalGoal,
    decisionLog, newlyUnlockedLessons,
  } = useGameStore()

  const newLessons = (newlyUnlockedLessons ?? [])
    .map(id => getMetaLesson(id))
    .filter((l): l is NonNullable<typeof l> => !!l)

  // Postmortem: keep only choices that mattered — moral / NPC events with
  // non-neutral impact. Take up to 8, oldest first, so the timeline reads
  // as a story rather than a feed.
  const postmortemEntries = ((decisionLog ?? [])
    .filter(e => (e.type === 'choice' || e.type === 'npc') && e.impact !== 'neutral')
    .slice(-8))

  const isVictory = type === 'victory'
  const gameOverMsg = getGameOverMessage(gameOverReason)

  const narrativeEnding = isVictory
    ? getNarrativeEnding(
        playerBackstory ?? null,
        npcs ?? [],
        completedChainIds ?? [],
        reputation,
        currentWeek,
      )
    : null

  // Goal closure + per-NPC exit lines (v5.2). Shown on both victory and
  // defeat — these are the "where everyone ended up" moments that turn a
  // game-over into an ending.
  const goalClosure = buildGoalClosure(personalGoal, playerBackstory ?? null, balance)
  const npcExits = buildNpcExitLines(npcs ?? [])

  const handleNewGame = () => {
    startNewGame('shop')
  }

  return (
    <Modal
      isOpen={isOpen}
      title={isVictory ? '🎉 Победа!' : '💀 Поражение'}
      onClose={() => {}}
      closeButton={false}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>
          {isVictory ? '🏆' : gameOverMsg.emoji}
        </div>

        <div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: isVictory ? K.mint : K.bad,
          }}>
            {isVictory ? (narrativeEnding?.title ?? 'Вы выиграли!') : gameOverMsg.title}
          </h2>

          {isVictory && narrativeEnding && (
            <p style={{
              fontSize: 13,
              color: K.ink2,
              marginBottom: 16,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              «{narrativeEnding.text}»
            </p>
          )}

          {!isVictory && (
            <p style={{ fontSize: 13, color: K.muted, marginBottom: 16 }}>
              {gameOverMsg.description}
            </p>
          )}

          <div style={{
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            background: isVictory ? K.mintSoft : 'rgba(180,47,35,0.06)',
            border: isVictory ? `1px solid ${K.mint}` : `1px solid ${K.bad}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: K.muted }}>Неделя:</span>
              <span style={{ fontWeight: 700, color: K.ink }}>{currentWeek}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: K.muted }}>Финальный баланс:</span>
              <span style={{ fontWeight: 700, color: balance >= 0 ? K.ink : K.bad }}>
                {balance.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: K.muted }}>Репутация:</span>
              <span style={{ fontWeight: 700, color: K.ink }}>{reputation}/100</span>
            </div>
          </div>

          {/* Newly unlocked lessons — moved here so they're visible right
              after the stats, not buried at the bottom of the scroll. */}
          {newLessons.length > 0 && (
            <div style={{
              background: K.bone,
              border: `1px solid ${K.orange}`,
              borderLeft: `4px solid ${K.orange}`,
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: K.orange,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>📚</span>
                <span>Новые уроки — пойдут в следующую попытку</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {newLessons.map(l => (
                  <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{l.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: K.ink }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: K.ink2, marginTop: 1 }}>{l.earnedHow}.</div>
                      <div style={{ fontSize: 12, color: K.orange, fontWeight: 600, marginTop: 2 }}>
                        {l.bonusText}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isVictory && (
            <p style={{ fontSize: 14, color: K.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Вы успешно управляли бизнесом и освоили экосистему Контура!
            </p>
          )}
          {!isVictory && totalPainLosses && totalPainLosses.total > 0 && (() => {
            const top3 = Object.entries(SERVICE_LABELS)
              .map(([key, label]) => ({ label, loss: (totalPainLosses as any)[key] as number ?? 0 }))
              .filter(x => x.loss > 0)
              .sort((a, b) => b.loss - a.loss)
              .slice(0, 3)
            return top3.length > 0 ? (
              <div style={{
                textAlign: 'left',
                background: K.orangeSoft,
                border: `1px solid ${K.orange}`,
                borderRadius: 12, padding: '14px 18px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: K.orange, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  За всю игру потеряно без Контура
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {top3.map(({ label, loss }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: K.ink2 }}>{label}</span>
                      <span style={{ fontWeight: 700, color: K.bad, fontVariantNumeric: 'tabular-nums' }}>
                        −{loss.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          })()}
          {/* Goal closure scene — what happened to the personal dream */}
          {goalClosure && (
            <div style={{
              background: '#fdf6e3',
              border: `1px solid #e8dfc6`,
              borderLeft: `3px solid ${K.orange}`,
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 16,
              textAlign: 'left',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: K.orange,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 6,
              }}>
                {goalClosure.title}
              </div>
              <div style={{
                fontSize: 13, color: K.ink, lineHeight: 1.55,
                fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif',
              }}>
                {goalClosure.text}
              </div>
            </div>
          )}

          {/* Postmortem timeline — key moral choices the player made */}
          {postmortemEntries.length > 0 && (
            <div style={{
              background: K.white,
              border: `1px solid ${K.line}`,
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: K.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 10,
              }}>
                Ключевые решения
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {postmortemEntries.map((e, i) => {
                  const dotColor =
                    e.impact === 'positive' ? K.mint :
                    e.impact === 'negative' ? '#c0392b' :
                    K.muted
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10,
                      alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 999,
                        background: dotColor, flexShrink: 0, marginTop: 6,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: K.muted, fontVariantNumeric: 'tabular-nums' }}>
                          Неделя {e.week}
                        </div>
                        <div style={{ fontSize: 11, color: K.ink2, lineHeight: 1.45 }}>
                          {e.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* NPC exit lines — where everyone ended up */}
          {npcExits.length > 0 && (
            <div style={{
              background: K.bone,
              border: `1px solid ${K.lineSoft}`,
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: K.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 10,
              }}>
                Окружение — финал
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {npcExits.map(line => {
                  const def = getNPCDefinition(line.npcId)
                  if (!def) return null
                  return (
                    <div key={line.npcId} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 999,
                        background: K.white, border: `1px solid ${K.lineSoft}`,
                        display: 'grid', placeItems: 'center', fontSize: 16,
                        flexShrink: 0,
                      }}>
                        {def.portrait}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: K.ink }}>
                          {def.name}
                        </div>
                        <div style={{ fontSize: 12, color: K.ink2, lineHeight: 1.5, marginTop: 2 }}>
                          {line.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!isVictory && (
            <p style={{ fontSize: 14, color: K.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Анализируйте ошибки и попробуйте снова!
            </p>
          )}
        </div>

        <button
          onClick={handleNewGame}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            background: isVictory ? K.mint : K.ink,
            color: K.white,
          }}
        >
          {isVictory ? '▶️ Новая игра' : '🔄 Попробовать снова'}
        </button>
      </div>
    </Modal>
  )
}
