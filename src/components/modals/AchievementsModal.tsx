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
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">
              Уровень {level} · Опыт: {experience}
            </span>
            <span className="text-yellow-400 font-semibold">
              {unlockedCount}/{totalCount} получено
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{progress}% завершено</p>
        </div>

        {/* Achievement categories */}
        <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
          {CATEGORIES.map((cat) => {
            const catAchs = ACHIEVEMENTS.filter((a) => a.category === cat)
            const unlockedInCat = catAchs.filter((a) => achievements.includes(a.id)).length
            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-300">{CATEGORY_LABELS[cat]}</h3>
                  <span className="text-xs text-gray-500">
                    {unlockedInCat}/{catAchs.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catAchs.map((ach) => {
                    const isUnlocked = achievements.includes(ach.id)
                    return (
                      <div
                        key={ach.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                          isUnlocked
                            ? 'border-yellow-500/50 bg-yellow-900/20'
                            : 'border-slate-700 bg-slate-800/50 opacity-60'
                        }`}
                      >
                        <span
                          className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}
                          style={isUnlocked ? {} : { filter: 'grayscale(100%)' }}
                        >
                          {ach.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isUnlocked ? 'text-yellow-300' : 'text-gray-400'
                              }`}
                            >
                              {ach.name}
                            </p>
                            {isUnlocked && (
                              <span className="text-xs text-green-400">✓</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{ach.description}</p>
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
