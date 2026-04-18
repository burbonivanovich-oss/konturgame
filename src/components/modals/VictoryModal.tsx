import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface VictoryModalProps {
  isOpen: boolean
  type: 'victory' | 'defeat'
}

export default function VictoryModal({ isOpen, type }: VictoryModalProps) {
  const { startNewGame, currentDay, balance, reputation } = useGameStore()

  const isVictory = type === 'victory'

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
      <div className="space-y-6 text-center">
        <div className="text-6xl">
          {isVictory ? '🏆' : '❌'}
        </div>

        <div>
          <h2 className={`text-3xl font-bold mb-4 ${
            isVictory ? 'text-brand-green' : 'text-red-600'
          }`}>
            {isVictory ? 'Вы выиграли!' : 'Игра окончена'}
          </h2>

          <div className={`space-y-3 text-sm mb-6 p-5 rounded-lg border ${
            isVictory ? 'bg-green-50 border-brand-green' : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex justify-between">
              <span className="text-gray-600">День:</span>
              <span className="font-bold text-gray-800">{currentDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Баланс:</span>
              <span className="font-bold text-gray-800">{balance.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Репутация:</span>
              <span className="font-bold text-gray-800">{reputation}/100</span>
            </div>
          </div>

          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            {isVictory
              ? 'Вы успешно управляли бизнесом и освоили экосистему Контура!'
              : 'Ваш бизнес не смог пережить трудные времена. Попробуйте еще раз!'}
          </p>
        </div>

        <button
          onClick={handleNewGame}
          className={`w-full py-3 rounded-lg transition font-bold text-white ${
            isVictory
              ? 'bg-brand-green hover:opacity-90'
              : 'bg-brand-orange hover:opacity-90'
          }`}
        >
          {isVictory ? '▶️ Новая игра' : '🔄 Попробовать снова'}
        </button>
      </div>
    </Modal>
  )
}
