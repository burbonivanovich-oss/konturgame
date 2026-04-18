import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { ACHIEVEMENTS, type AchievementDef } from '../../constants/achievements'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<AchievementDef['category'], string> = {
  progress: '📅 Прогресс',
  business: '💼 Бизнес',
  services: '🔌 Сервисы',
  special: '✨ Особые',
}

const CATEGORIES: AchievementDef['category'][] = ['progress', 'business', 'services', 'special']

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements, level, experience } = useGameStore()

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
            <span>Уровень {level} · {experience} опыта</span>
            <span style={{ color: 'var(--k-orange)' }}>{unlockedCount}/{totalCount}</span>
          </div>
          <div style={{
            height: 8, background: 'var(--k-ink-10)', borderRadius: 999,
            overflow: 'hidden', marginBottom: 8,
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'var(--k-orange)', transition: 'width 0.3s ease',
            }}/>
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, textAlign: 'right' }}>
            {progress}% завершено
          </div>
        </div>

        {/* Achievement categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto' }}>
          {CATEGORIES.map((cat) => {
            const catAchs = ACHIEVEMENTS.filter((a) => a.category === cat)
            const unlockedInCat = catAchs.filter((a) => achievements.includes(a.id)).length
            return (
              <div key={cat}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 10,
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800 }}>{CATEGORY_LABELS[cat]}</h3>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 8px',
                    background: 'var(--k-ink-10)', borderRadius: 999,
                  }}>
                    {unlockedInCat}/{catAchs.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {catAchs.map((ach) => {
                    const isUnlocked = achievements.includes(ach.id)
                    return (
                      <div
                        key={ach.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: 12,
                          borderRadius: 10, border: `1.5px solid ${isUnlocked ? 'var(--k-orange)' : 'var(--k-ink-10)'}`,
                          background: isUnlocked ? 'var(--k-orange-soft)' : 'var(--k-surface)',
                          opacity: isUnlocked ? 1 : 0.6,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{
                          fontSize: 24,
                          filter: isUnlocked ? 'none' : 'grayscale(100%)',
                        }}>
                          {ach.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <p style={{
                              fontSize: 12, fontWeight: 800,
                              color: isUnlocked ? 'var(--k-ink)' : 'var(--k-ink-50)',
                              margin: 0,
                            }}>
                              {ach.name}
                            </p>
                            {isUnlocked && (
                              <span style={{
                                fontSize: 10, fontWeight: 800,
                                background: 'var(--k-good)', color: 'white',
                                padding: '2px 6px', borderRadius: 4,
                              }}>
                                ✓
                              </span>
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
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
