import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { ACHIEVEMENTS, WAVE_UNLOCK_WEEKS } from '../../constants/achievements'
import { K } from '../design-system/tokens'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

const WAVE_LABELS: Record<number, string> = {
  1: 'Волна 1 — Старт',
  2: 'Волна 2 — Развитие',
  3: 'Волна 3 — Зрелость',
  4: 'Волна 4 — Мастерство',
}

const CATEGORY_LABELS: Record<string, string> = {
  progress: 'Прогресс',
  business: 'Бизнес',
  services: 'Контур',
  special: 'Особое',
}

const CATEGORY_COLORS: Record<string, string> = {
  progress: K.blue,
  business: K.good,
  services: K.orange,
  special: K.violet,
}

const WAVES = [1, 2, 3, 4] as const

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements, level, experience, currentWeek } = useGameStore()

  const totalCount = ACHIEVEMENTS.length
  const unlockedCount = achievements.length
  const progress = Math.round((unlockedCount / totalCount) * 100)

  return (
    <Modal isOpen={isOpen} title="🏆 Достижения" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Progress card */}
        <div style={{
          background: K.blueSoft,
          borderRadius: 12,
          padding: 16,
          border: `1.5px solid ${K.blue}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, fontSize: 13, fontWeight: 700,
          }}>
            <span>Уровень {level} · {experience} опыта · неделя {currentWeek}</span>
            <span style={{ color: K.violet }}>{unlockedCount}/{totalCount}</span>
          </div>
          <div style={{ height: 8, background: K.line, borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: K.violet, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, textAlign: 'right' }}>{progress}% завершено</div>
        </div>

        {/* Achievement waves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 420, overflowY: 'auto' }}>
          {WAVES.map((wave) => {
            const unlockWeek = WAVE_UNLOCK_WEEKS[wave]
            const isWaveUnlocked = currentWeek >= unlockWeek
            const waveAchs = ACHIEVEMENTS.filter(a => a.wave === wave)
            const unlockedInWave = waveAchs.filter(a => achievements.includes(a.id)).length

            return (
              <div key={wave}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, opacity: isWaveUnlocked ? 1 : 0.45 }}>
                      {WAVE_LABELS[wave]}
                    </div>
                    {!isWaveUnlocked && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        background: K.bone, borderRadius: 999, opacity: 0.6,
                      }}>
                        🔒 с недели {unlockWeek}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 8px',
                    background: K.bone, borderRadius: 999,
                    opacity: isWaveUnlocked ? 1 : 0.4,
                  }}>
                    {unlockedInWave}/{waveAchs.length}
                  </span>
                </div>

                {isWaveUnlocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {waveAchs.map((ach) => {
                      const isUnlocked = achievements.includes(ach.id)
                      return (
                        <div
                          key={ach.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: 12,
                            borderRadius: 10,
                            border: `1.5px solid ${isUnlocked ? K.violet : K.line}`,
                            background: isUnlocked ? K.violetSoft : K.bone,
                            opacity: isUnlocked ? 1 : 0.6, transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 24, filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                            {ach.icon}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <p style={{
                                fontSize: 12, fontWeight: 800,
                                color: isUnlocked ? K.ink : K.muted,
                                margin: 0, flex: 1,
                              }}>
                                {ach.name}
                              </p>
                              <span style={{
                                fontSize: 9, fontWeight: 700,
                                color: CATEGORY_COLORS[ach.category],
                                padding: '1px 5px', borderRadius: 3,
                                border: `1px solid ${CATEGORY_COLORS[ach.category]}`,
                                opacity: isUnlocked ? 1 : 0.5,
                                flexShrink: 0,
                              }}>
                                {CATEGORY_LABELS[ach.category]}
                              </span>
                              {isUnlocked && (
                                <span style={{
                                  fontSize: 10, fontWeight: 800,
                                  background: K.good, color: K.white,
                                  padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                                }}>✓</span>
                              )}
                            </div>
                            <p style={{
                              fontSize: 11, opacity: 0.7,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              margin: 0,
                            }}>
                              {ach.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: `1.5px dashed ${K.line}`,
                    fontSize: 12, opacity: 0.45, textAlign: 'center',
                  }}>
                    Откроется на неделе {unlockWeek} · {waveAchs.length} достижений ждут вас
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
