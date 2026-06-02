import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { PlayerBackstory, NPC } from '../../types/game'
import { K } from '../design-system/tokens'
import { buildNpcExitLines, buildGoalClosure } from '../../constants/npcExits'
import { getNPCDefinition } from '../../constants/npcs'
import { getMetaLesson } from '../../constants/metaLessons'
import { downloadPlaytestReport } from '../../utils/playtestReport'
import { isFeedbackConfigured, openFeedbackForm } from '../../constants/playtest'
import { konturHomeUrl, konturServiceUrl } from '../../constants/konturLinks'
import { SERVICES_CONFIG } from '../../constants/business'
import { BUNDLE_PROMO_CODE, BUNDLE_PROMO_OFFER } from '../../constants/promoCodes'
import { track } from '../../utils/analytics'
import type { ServiceType } from '../../types/game'

interface VictoryModalProps {
  isOpen: boolean
  type: 'victory' | 'defeat'
}

function getGameOverMessage(reason?: string): { emoji: string; title: string; description: string } {
  switch (reason) {
    case 'bankruptcy':
      return {
        emoji: '💸',
        title: 'Год не дотянул',
        description: 'Деньги кончились раньше года. Можно сказать «не повезло», можно сказать «не угадал». В реальности — и то, и другое.',
      }
    case 'burnout':
      return {
        emoji: '🔥',
        title: 'Год не дотянул',
        description: 'Сил больше не было. Бизнес шёл, но шёл уже без вас. Когда-то надо было остановиться и не остановились.',
      }
    case 'reputation':
      return {
        emoji: '📉',
        title: 'Год не дотянул',
        description: 'К вам перестали приходить. Тихо, без скандала. Просто однажды утром на пороге не было никого — и так каждое утро.',
      }
    case 'year_end':
      return {
        emoji: '📆',
        title: 'Год прошёл',
        description: 'Вы прожили год в этом бизнесе. Не ракета и не катастрофа — просто год, в котором было всё, как в любом году у любого человека.',
      }
    default:
      return {
        emoji: '📆',
        title: 'Год закрыт',
        description: '',
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

export default function VictoryModal({ isOpen, type }: VictoryModalProps) {
  const {
    startNewGame, currentWeek, balance, reputation, gameOverReason,
    playerBackstory, npcs, completedChainIds, personalGoal,
    decisionLog, newlyUnlockedLessons, triggeredEventIds, victoryType,
    services, businessType,
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

  // Title shifts the frame from win/lose to "the year ended". 'combined' is
  // the rare exceptional run; 'year_one' is the normal "you survived" win;
  // gameOverReason carries everything else (year_end, bankruptcy, ...).
  const headerTitle = isVictory
    ? (victoryType === 'combined' ? '🏆 Год сделан' : '📆 Год прожит')
    : `${gameOverMsg.emoji} ${gameOverMsg.title}`

  // Colour code: green for the rare combined win, neutral for "you lived
  // the year" outcomes (year_one survival win, year_end no-victory), red
  // only for actual collapse (bankruptcy / burnout / reputation).
  const isCombinedWin = isVictory && victoryType === 'combined'
  const isHardLoss = !isVictory && gameOverReason !== 'year_end'
  const accentColor = isCombinedWin ? K.mint : isHardLoss ? K.bad : K.ink2
  const accentBg = isCombinedWin ? K.mintSoft : isHardLoss ? 'rgba(180,47,35,0.06)' : K.bone

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
  const npcExits = buildNpcExitLines(npcs ?? [], triggeredEventIds ?? [])

  const handleNewGame = () => {
    startNewGame('shop')
  }

  const handleExportReport = () => {
    const ok = downloadPlaytestReport({ source: isVictory ? 'victory' : 'defeat' })
    if (!ok) alert('Не удалось сохранить отчёт. Попробуйте ещё раз.')
  }

  // CTA-блок «Попробовать в реальности» — главная бизнес-цель игры.
  const ctaPlacement = isVictory ? 'victory' : 'defeat'
  const activeServiceIds = (Object.keys(services ?? {}) as ServiceType[])
    .filter((id) => services?.[id]?.isActive)

  const handleHomeCta = () => {
    track('cta.clicked', { kind: 'home', placement: ctaPlacement, businessType })
  }
  const handleServiceCta = (service: ServiceType) => {
    track('cta.clicked', { kind: 'service', service, placement: ctaPlacement, businessType })
  }

  const [copied, setCopied] = useState(false)
  const handleCopyPromo = () => {
    navigator.clipboard?.writeText(BUNDLE_PROMO_CODE).catch(() => {})
    setCopied(true)
    track('promo.copied', { code: BUNDLE_PROMO_CODE, placement: ctaPlacement })
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={headerTitle}
      onClose={() => {}}
      closeButton={false}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>
          {isVictory ? (victoryType === 'combined' ? '🏆' : '📆') : gameOverMsg.emoji}
        </div>

        <div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: accentColor,
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
            background: accentBg,
            border: `1px solid ${accentColor}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
              <span style={{ color: K.muted }}>Прожито недель:</span>
              <span style={{ fontWeight: 700, color: K.ink }}>{currentWeek} / 52</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: K.muted }}>Финальный баланс:</span>
              <span style={{ fontWeight: 700, color: balance >= 0 ? K.ink : K.bad }}>
                {balance.toLocaleString('ru-RU')} ₽
              </span>
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
              Вы дожили до конца года и освоили экосистему Контура.
            </p>
          )}
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

        {/* CTA «Попробовать в реальности» — пик эмоции, главная цель игры:
            довести игрока до реальных сервисов Контура. */}
        <div style={{
          background: K.ink,
          borderRadius: 14,
          padding: '18px 18px 16px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: K.white, marginBottom: 6 }}>
            {isVictory ? 'Понравилось вести бизнес?' : 'В реальности это проще'}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, marginBottom: 14 }}>
            {isVictory
              ? 'В жизни Контур берёт на себя кассу, бухгалтерию и документы — чтобы у вас оставалось время на сам бизнес, а не на отчёты.'
              : 'Часть проблем, на которых спотыкается бизнес, в реальности закрывают сервисы Контура: касса по 54-ФЗ, бухгалтерия, проверка партнёров.'}
          </div>

          <a
            href={konturHomeUrl(ctaPlacement)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleHomeCta}
            style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              padding: '13px', borderRadius: 11,
              background: K.orange, color: K.white,
              fontSize: 14, fontWeight: 800,
            }}
          >
            Попробовать в реальности →
          </a>

          {activeServiceIds.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
              }}>
                Сервисы, которые вы подключали в игре
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeServiceIds.map((id) => (
                  <a
                    key={id}
                    href={konturServiceUrl(id, ctaPlacement)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleServiceCta(id)}
                    style={{
                      textDecoration: 'none',
                      padding: '6px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: K.white, fontSize: 11.5, fontWeight: 700,
                    }}
                  >
                    {SERVICES_CONFIG[id]?.name ?? id} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Промокод на пике эмоции (audit D10): конкретный повод дойти до
              kontur.ru — не просто ссылка, а реальная скидка. */}
          <div style={{
            marginTop: 14, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>
                {BUNDLE_PROMO_OFFER}
              </div>
              <div style={{
                fontSize: 14, fontWeight: 800, color: K.white,
                fontFamily: 'monospace', letterSpacing: '0.04em', marginTop: 2,
              }}>
                {BUNDLE_PROMO_CODE}
              </div>
            </div>
            <button
              onClick={handleCopyPromo}
              style={{
                flexShrink: 0, padding: '8px 12px', borderRadius: 9,
                background: copied ? K.mint : 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: K.white, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {copied ? '✓ Скопировано' : 'Копировать'}
            </button>
          </div>
        </div>

        {/* Плейтест: пик эмоции — лучший момент попросить отчёт и фидбек.
            Блок виден только в alpha-сборке (когда настроена форма) либо
            всегда даёт скачать отчёт. */}
        <div style={{
          background: K.bone,
          border: `1px solid ${K.line}`,
          borderRadius: 12,
          padding: '14px 16px',
          textAlign: 'left',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: K.orange,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
          }}>
            🧪 Помогите сделать игру лучше
          </div>
          <div style={{ fontSize: 12, color: K.ink2, lineHeight: 1.5, marginBottom: 12 }}>
            Это альфа-версия. Скачайте отчёт об этой партии и пришлите его
            вместе с коротким фидбеком — так мы поймём, что улучшить.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleExportReport}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                background: K.orangeSoft, border: `1.5px solid ${K.orange}`,
                color: K.orange, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              📥 Скачать отчёт
            </button>
            {isFeedbackConfigured() && (
              <button
                onClick={openFeedbackForm}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  background: K.mintSoft, border: `1.5px solid ${K.mint}`,
                  color: K.ink, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                💬 Оставить фидбек
              </button>
            )}
          </div>
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
