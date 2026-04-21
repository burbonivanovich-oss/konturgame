import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

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

export default function VictoryModal({ isOpen, type }: VictoryModalProps) {
  const { startNewGame, currentWeek, balance, reputation, gameOverReason } = useGameStore()

  const isVictory = type === 'victory'
  const gameOverMsg = getGameOverMessage(gameOverReason)

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
          {isVictory ? '🏆' : gameOverMsg.emoji}
        </div>

        <div>
          <h2 className={`text-3xl font-bold mb-2 ${
            isVictory ? 'text-brand-green' : 'text-red-600'
          }`}>
            {isVictory ? 'Вы выиграли!' : gameOverMsg.title}
          </h2>

          {!isVictory && (
            <p className="text-sm text-gray-600 mb-4">
              {gameOverMsg.description}
            </p>
          )}

          <div className={`space-y-3 text-sm mb-6 p-5 rounded-lg border ${
            isVictory ? 'bg-green-50 border-brand-green' : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex justify-between">
              <span className="text-gray-600">Неделя:</span>
              <span className="font-bold text-gray-800">{currentWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Финальный баланс:</span>
              <span className={`font-bold ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                {balance.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Репутация:</span>
              <span className="font-bold text-gray-800">{reputation}/100</span>
            </div>
          </div>

          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            {isVictory
              ? 'Вы успешно управляли бизнесом и освоили экосистему Контура!'
              : 'Анализируйте ошибки и попробуйте снова!'}
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
