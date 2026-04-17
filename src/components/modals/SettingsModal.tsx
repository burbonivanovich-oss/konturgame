import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { startNewGame } = useGameStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleNewGame = () => {
    if (confirm('Вы уверены? Текущий прогресс будет потерян.')) {
      startNewGame('shop')
      setConfirmReset(false)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="⚙️ Настройки" onClose={onClose} size="md">
      <div className="space-y-4">
        <section>
          <h3 className="font-bold text-green-400 mb-3">🎮 Опции игры</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Звуковые эффекты</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Музыка</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Показывать подсказки</span>
            </label>
          </div>
        </section>

        <hr className="border-slate-600" />

        <section>
          <h3 className="font-bold text-yellow-400 mb-3">📊 Данные</h3>

          <button
            onClick={() => {
              const state = useGameStore.getState()
              const data = JSON.stringify(state, null, 2)
              console.log('Game state:', data)
              alert('Состояние игры выведено в консоль')
            }}
            className="w-full text-left px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm transition"
          >
            📋 Показать состояние в консоли
          </button>
        </section>

        <hr className="border-slate-600" />

        <section>
          <h3 className="font-bold text-red-400 mb-3">⚠️ Опасные операции</h3>

          <button
            onClick={handleNewGame}
            className="w-full text-left px-3 py-2 rounded bg-red-900 bg-opacity-30 hover:bg-opacity-50 border border-red-600 text-red-400 text-sm transition"
          >
            🔄 Начать новую игру
          </button>

          <button
            onClick={() => {
              if (confirm('Удалить все сохраненные данные? Это необратимо.')) {
                localStorage.removeItem('konturgame_state')
                alert('Данные удалены')
                onClose()
              }
            }}
            className="w-full mt-2 text-left px-3 py-2 rounded bg-red-900 bg-opacity-30 hover:bg-opacity-50 border border-red-600 text-red-400 text-sm transition"
          >
            🗑️ Очистить сохранения
          </button>
        </section>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  )
}
