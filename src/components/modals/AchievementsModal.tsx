import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { ACHIEVEMENTS, WAVE_UNLOCK_WEEKS } from '../../constants/achievements'

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
  progress: 'var(--k-blue)',
  business: 'var(--k-good)',
  services: 'var(--k-orange)',
  special: '#9b59b6',
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
          background: 'var(--k-blue-soft)', borderRadius: 12, padding: 16,
          border: '1.5px solid var(--k-blue)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, fontSize: 13, fontWeight: 700,
          }}>
            <span>Уровень {level} · {experience} опыта · неделя {currentWeek}</span>
            <span style={{ color: 'var(--k-orange)' }}>{unlockedCount}/{totalCount}</span>
          </div>
          <div style={{ height: 8, background: 'var(--k-ink-10)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--k-orange)', transition: 'width 0.3s ease' }} />
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
                    <h3 style={{ fontSize: 13, fontWeight: 800, opacity: isWaveUnlocked ? 1 : 0.45 }}>
                      {WAVE_LABELS[wave]}
                    </h3>
                    {!isWaveUnlocked && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        background: 'var(--k-surface-2)', borderRadius: 999, opacity: 0.6,
                      }}>
                        🔒 с недели {unlockWeek}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 8px',
                    background: 'var(--k-ink-10)', borderRadius: 999,
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
                            borderRadius: 10, border: `1.5px solid ${isUnlocked ? 'var(--k-orange)' : 'var(--k-ink-10)'}`,
                            background: isUnlocked ? 'var(--k-orange-soft)' : 'var(--k-surface)',
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
                                color: isUnlocked ? 'var(--k-ink)' : 'var(--k-ink-50)',
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
                                  background: 'var(--k-good)', color: 'white',
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
                    border: '1.5px dashed var(--k-ink-10)',
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
