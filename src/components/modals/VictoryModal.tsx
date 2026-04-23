import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { PlayerBackstory, NPC } from '../../types/game'
import { K } from '../design-system/tokens'

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
      title: 'Лучший друг не ошибся',
      text: 'Димка верил в вас с самого начала. Теперь у него есть право говорить «я так и знал». А у вас — бизнес, который доказал: поддержка имеет значение.',
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
    playerBackstory, npcs, completedChainIds, totalPainLosses,
  } = useGameStore()

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
