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
      <div className="space-y-4 text-center">
        <div className="text-4xl">
          {isVictory ? '🏆' : '❌'}
        </div>

        <div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isVictory ? 'text-green-400' : 'text-red-400'
          }`}>
            {isVictory ? 'Вы выиграли!' : 'Игра окончена'}
          </h2>

          <div className={`space-y-2 text-sm mb-6 p-4 rounded ${
            isVictory ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'
          }`}>
            <p>
              <span className="text-gray-400">День:</span>
              <span className="float-right font-semibold">{currentDay}</span>
            </p>
            <p>
              <span className="text-gray-400">Баланс:</span>
              <span className="float-right font-semibold">{balance.toLocaleString('ru-RU')} ₽</span>
            </p>
            <p>
              <span className="text-gray-400">Репутация:</span>
              <span className="float-right font-semibold">{reputation}/100</span>
            </p>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            {isVictory
              ? 'Вы успешно управляли бизнесом и достигли целей!'
              : 'Ваш бизнес не смог пережить трудные времена.'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleNewGame}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded transition font-semibold"
          >
            {isVictory ? '▶️ Новая игра' : '🔄 Попробовать снова'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
