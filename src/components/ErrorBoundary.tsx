import { Component, type ErrorInfo, type ReactNode } from 'react'
import { downloadPlaytestReport } from '../utils/playtestReport'
import { isFeedbackConfigured, openFeedbackForm } from '../constants/playtest'
import { track } from '../utils/analytics'

// Граница ошибок для плейтеста.
//
// Без неё любая ошибка рендера (или повреждённый сэйв) показывает тестеру
// белый экран — и игра «кирпичится»: при перезагрузке тот же сэйв снова
// падает. Здесь мы ловим ошибку, показываем понятный экран и даём три пути:
//   1. Перезагрузить (вдруг разовый сбой)
//   2. Скачать отчёт об ошибке (со стеком + snapshot'ом игры) → в форму
//   3. Сбросить игру (чистим сэйвы) — гарантированно выводит из тупика

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  componentStack: string
}

/** Удалить все сэйвы игры из localStorage (гарантированный выход из тупика). */
function clearGameStorage(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('konturgame')) keys.push(key)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch (err) {
    console.error('Не удалось очистить localStorage', err)
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, componentStack: '' }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Перехвачена ошибка рендера:', error, info)
    this.setState({ componentStack: info.componentStack ?? '' })
    track('error.caught', { message: error.message.slice(0, 200) })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleDownloadReport = (): void => {
    const { error, componentStack } = this.state
    const ok = downloadPlaytestReport({
      source: 'error-boundary',
      error: {
        message: error?.message ?? 'unknown',
        stack: error?.stack,
        componentStack,
      },
    })
    if (!ok) {
      alert('Не удалось сохранить отчёт. Сделайте, пожалуйста, скриншот этого экрана.')
    }
  }

  handleReset = (): void => {
    if (confirm('Сбросить игру и начать заново? Текущий прогресс будет удалён.')) {
      clearGameStorage()
      window.location.reload()
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    const ink = '#1a1a1a'
    const muted = '#6b6b6b'
    const orange = '#ff6b35'
    const line = '#e6e2da'

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#faf8f4',
          fontFamily:
            'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: '100%',
            background: '#fff',
            border: `1px solid ${line}`,
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }}>🙈</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: ink, margin: '0 0 8px' }}>
            Что-то сломалось
          </h1>
          <p style={{ fontSize: 14, color: muted, lineHeight: 1.6, margin: '0 0 24px' }}>
            Игра наткнулась на ошибку. Это баг с нашей стороны — извините.
            Скачайте, пожалуйста, отчёт и пришлите его с фидбеком: так мы быстро
            починим. Перезагрузка часто помогает; если нет — сбросьте игру.
          </p>

          {this.state.error?.message && (
            <pre
              style={{
                fontSize: 11,
                color: muted,
                background: '#f4f1ec',
                border: `1px solid ${line}`,
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 96,
                margin: '0 0 20px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={this.handleDownloadReport}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                background: orange,
                color: '#fff',
              }}
            >
              📥 Скачать отчёт об ошибке
            </button>

            {isFeedbackConfigured() && (
              <button
                onClick={openFeedbackForm}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  border: `1.5px solid ${line}`,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: ink,
                }}
              >
                💬 Оставить фидбек
              </button>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  border: `1.5px solid ${line}`,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: ink,
                }}
              >
                🔄 Перезагрузить
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  border: `1.5px solid ${line}`,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: muted,
                }}
              >
                🗑️ Сбросить игру
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
