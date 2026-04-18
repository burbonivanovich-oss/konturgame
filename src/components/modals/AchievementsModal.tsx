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
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-700 font-semibold">
              Уровень {level} · {experience} опыта
            </span>
            <span className="text-brand-orange font-bold">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-brand-orange h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">{progress}% завершено</p>
        </div>

        {/* Achievement categories */}
        <div className="max-h-96 overflow-y-auto space-y-5">
          {CATEGORIES.map((cat) => {
            const catAchs = ACHIEVEMENTS.filter((a) => a.category === cat)
            const unlockedInCat = catAchs.filter((a) => achievements.includes(a.id)).length
            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">{CATEGORY_LABELS[cat]}</h3>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-semibold">
                    {unlockedInCat}/{catAchs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {catAchs.map((ach) => {
                    const isUnlocked = achievements.includes(ach.id)
                    return (
                      <div
                        key={ach.id}
                        className={`flex items-center gap-3 p-3 rounded-md border-2 transition-all ${
                          isUnlocked
                            ? 'border-brand-orange bg-orange-50'
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <span
                          className="text-3xl"
                          style={isUnlocked ? {} : { filter: 'grayscale(100%)' }}
                        >
                          {ach.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-bold ${
                                isUnlocked ? 'text-gray-800' : 'text-gray-500'
                              }`}
                            >
                              {ach.name}
                            </p>
                            {isUnlocked && (
                              <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isUnlocked ? 'text-gray-600' : 'text-gray-500'} truncate`}>
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
