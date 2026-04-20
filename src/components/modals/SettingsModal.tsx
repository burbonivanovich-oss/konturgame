import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onRestart?: () => void
}

export default function SettingsModal({ isOpen, onClose, onRestart }: SettingsModalProps) {

  const handleNewGame = () => {
    if (confirm('Вы уверены? Текущий прогресс будет потерян.')) {
      if (onRestart) {
        onRestart()
      } else {
        localStorage.removeItem('konturgame_state')
        window.location.reload()
      }
    }
  }

  const handleExportState = () => {
    const state = useGameStore.getState()
    const data = JSON.stringify(state, null, 2)
    console.log('Game state:', data)
    alert('Состояние игры выведено в консоль')
  }

  const handleClearData = () => {
    if (confirm('Удалить все сохраненные данные? Это необратимо.')) {
      localStorage.removeItem('konturgame_state')
      alert('Данные удалены')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="⚙️ Настройки" onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Game options */}
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--k-blue)', marginBottom: 12 }}>
            🎮 Опции игры
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Звуковые эффекты', 'Музыка', 'Показывать подсказки'].map((label) => (
              <label key={label} style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
                <input type="checkbox" defaultChecked style={{
                  width: 18, height: 18, borderRadius: 4, cursor: 'pointer',
                }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--k-ink-10)' }} />

        {/* Data section */}
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--k-orange)', marginBottom: 12 }}>
            📊 Данные
          </h3>
          <button
            onClick={handleExportState}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              background: 'var(--k-blue-soft)', border: '1.5px solid var(--k-blue)',
              color: 'var(--k-blue)', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            📋 Показать состояние в консоли
          </button>
        </section>

        <div style={{ height: 1, background: 'var(--k-ink-10)' }} />

        {/* Dangerous operations */}
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--k-bad)', marginBottom: 12 }}>
            ⚠️ Опасные операции
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleNewGame}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255, 90, 90, 0.12)', border: '1.5px solid var(--k-bad)',
                color: 'var(--k-bad)', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🔄 Начать новую игру
            </button>

            <button
              onClick={handleClearData}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255, 90, 90, 0.12)', border: '1.5px solid var(--k-bad)',
                color: 'var(--k-bad)', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🗑️ Очистить сохранения
            </button>
          </div>
        </section>
      </div>
    </Modal>
  )
}
