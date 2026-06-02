import { useState } from 'react'
import Modal from './Modal'
import PrivacyModal from './PrivacyModal'
import { useGameStore } from '../../stores/gameStore'
import { K } from '../design-system/tokens'
import { downloadPlaytestReport } from '../../utils/playtestReport'
import { isFeedbackConfigured, openFeedbackForm } from '../../constants/playtest'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onRestart?: () => void
}

export default function SettingsModal({ isOpen, onClose, onRestart }: SettingsModalProps) {
  const [showPrivacy, setShowPrivacy] = useState(false)

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

  // Спринт 6 (alpha playtest): экспорт сэйв-файла для аналитики.
  // Игрок отправляет файл вместе с заполненной формой фидбека. Replay-скрипт
  // (docs/playtest/replay.mjs) парсит JSON и выдаёт postmortem: где умер,
  // какие сервисы, решения, ачивки. Логика вынесена в utils/playtestReport.
  const handlePlaytestExport = () => {
    const ok = downloadPlaytestReport({ source: 'settings' })
    if (ok) {
      alert('Отчёт о тесте сохранён. Прикрепите его к форме фидбека в Google Form.')
    } else {
      alert('Не удалось сохранить отчёт. Попробуйте ещё раз.')
    }
  }

  const handleClearData = () => {
    if (confirm('Удалить все сохраненные данные? Это необратимо.')) {
      localStorage.removeItem('konturgame_state')
      alert('Данные удалены')
      onClose()
    }
  }

  return (
    <>
    <Modal isOpen={isOpen} title="⚙️ Настройки" onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Game options */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: K.blue, marginBottom: 12 }}>
            🎮 Опции игры
          </div>
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
        </div>

        <div style={{ height: 1, background: K.line }} />

        {/* Data section */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: K.orange, marginBottom: 12 }}>
            📊 Данные
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handlePlaytestExport}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: K.orangeSoft, border: `1.5px solid ${K.orange}`,
                color: K.orange, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              📥 Скачать отчёт для плейтеста
            </button>
            {isFeedbackConfigured() && (
              <button
                onClick={openFeedbackForm}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: K.mintSoft, border: `1.5px solid ${K.mint}`,
                  color: K.ink, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                💬 Оставить фидбек
              </button>
            )}
            <button
              onClick={handleExportState}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: K.blueSoft, border: `1.5px solid ${K.blue}`,
                color: K.blue, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              📋 Показать состояние в консоли
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: K.bone, border: `1.5px solid ${K.line}`,
                color: K.ink2, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🔒 Приватность и данные
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: K.line }} />

        {/* Dangerous operations */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: K.bad, marginBottom: 12 }}>
            ⚠️ Опасные операции
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleNewGame}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: `${K.bad}18`, border: `1.5px solid ${K.bad}`,
                color: K.bad, fontSize: 12, fontWeight: 700,
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
                background: `${K.bad}18`, border: `1.5px solid ${K.bad}`,
                color: K.bad, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🗑️ Очистить сохранения
            </button>
          </div>
        </div>
      </div>
    </Modal>
    <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  )
}
