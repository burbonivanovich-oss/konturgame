import { useEffect, useState } from 'react'
import { hasConsent, setConsent } from '../utils/analytics'
import { K } from './design-system/tokens'

const DECISION_KEY = 'konturgame_analytics_consent_decision_v1'

function hasDecided(): boolean {
  try {
    return localStorage.getItem(DECISION_KEY) === '1'
  } catch {
    return true  // приватный режим — не пристаём
  }
}

function markDecided(): void {
  try {
    localStorage.setItem(DECISION_KEY, '1')
  } catch {
    // ignore
  }
}

/**
 * Privacy-first consent banner — показывается один раз при первом
 * заходе. Сразу две кнопки, без тёмных паттернов: «Разрешить» и
 * «Не разрешать». Никаких pre-checked, никаких «Принять всё».
 *
 * Решение пользователя (любое из двух) сохраняется навсегда —
 * через `markDecided`. Если игрок захочет передумать, переключатель
 * есть в SettingsModal (отдельная фича — сейчас не подключена).
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Показываем только если решение ещё не было принято.
    if (!hasDecided() && !hasConsent()) {
      // Небольшая задержка — не блокируем первую отрисовку игры.
      const t = window.setTimeout(() => setVisible(true), 800)
      return () => window.clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  const decide = (allow: boolean) => {
    setConsent(allow)
    markDecided()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-modal="false"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 80,
        maxWidth: 480,
        margin: '0 auto',
        background: K.white,
        border: `1px solid ${K.line}`,
        borderRadius: 14,
        boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
        padding: 16,
        fontFamily: 'Manrope, sans-serif',
        animation: 'slideUp 220ms ease-out',
      }}
    >
      <div id="consent-banner-title" style={{
        fontSize: 13, fontWeight: 800, color: K.ink, marginBottom: 6,
      }}>
        Анонимная статистика
      </div>
      <div style={{ fontSize: 12, color: K.ink2, lineHeight: 1.5, marginBottom: 12 }}>
        Хотим понимать, на каких неделях игроки бросают и какие сервисы
        Контура подключают. Никаких имён, e-mail или fingerprint —
        только обезличенные события вроде «начал кафе» или «победил».
        Можно отказаться, и игра продолжит работать как обычно.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => decide(false)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${K.line}`,
            background: K.bone,
            color: K.ink,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Не разрешать
        </button>
        <button
          onClick={() => decide(true)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: K.ink,
            color: K.white,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Разрешить
        </button>
      </div>
    </div>
  )
}
