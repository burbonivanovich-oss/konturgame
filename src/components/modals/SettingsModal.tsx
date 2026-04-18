import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { startNewGame } = useGameStore()

  const handleNewGame = () => {
    if (confirm('Вы уверены? Текущий прогресс будет потерян.')) {
      startNewGame('shop')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="⚙️ Настройки" onClose={onClose} size="md">
      <div className="space-y-5">
        <section>
          <h3 className="font-bold text-brand-blue mb-3">🎮 Опции игры</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Звуковые эффекты</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Музыка</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Показывать подсказки</span>
            </label>
          </div>
        </section>

        <div className="border-t border-gray-200" />

        <section>
          <h3 className="font-bold text-brand-orange mb-3">📊 Данные</h3>

          <button
            onClick={() => {
              const state = useGameStore.getState()
              const data = JSON.stringify(state, null, 2)
              console.log('Game state:', data)
              alert('Состояние игры выведено в консоль')
            }}
            className="w-full text-left px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition border border-blue-200 font-semibold"
          >
            📋 Показать состояние в консоли
          </button>
        </section>

        <div className="border-t border-gray-200" />

        <section>
          <h3 className="font-bold text-red-600 mb-3">⚠️ Опасные операции</h3>

          <div className="space-y-2">
            <button
              onClick={handleNewGame}
              className="w-full text-left px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm transition font-semibold"
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
              className="w-full text-left px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm transition font-semibold"
            >
              🗑️ Очистить сохранения
            </button>
          </div>
        </section>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md transition font-semibold text-gray-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  )
}
