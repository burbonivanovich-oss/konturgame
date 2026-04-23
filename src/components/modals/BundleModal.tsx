import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { BUNDLE_PROMO_CODE, BUNDLE_PROMO_OFFER } from '../../constants/promoCodes'
import { K } from '../design-system/tokens'

export default function BundleModal() {
  const { promoCodesRevealed, bundlePromoShown, markBundlePromoShown } = useGameStore()
  const [copied, setCopied] = useState(false)

  const shouldShow = promoCodesRevealed.length >= 7 && !bundlePromoShown

  if (!shouldShow) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(BUNDLE_PROMO_CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: 'rgba(14,17,22,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: K.white, borderRadius: 28, padding: 32,
        maxWidth: 400, width: '100%',
        boxShadow: '0 32px 100px rgba(0,0,0,0.35)',
        textAlign: 'center',
      }}>
        {/* Trophy */}
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>

        <div style={{
          fontSize: 12, fontWeight: 800, color: K.violet, marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Достижение разблокировано!
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Полный Контур!
        </div>

        <div style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.6, marginBottom: 24 }}>
          Вы подключили все 7 сервисов Контура.<br/>
          Экосистема работает на максимуме!
        </div>

        {/* Bundle offer */}
        <div style={{
          background: `linear-gradient(135deg, ${K.violet}, ${K.blue})`,
          borderRadius: 20, padding: 20, marginBottom: 24, color: '#fff',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 6 }}>
            ЭКСКЛЮЗИВНЫЙ ПРОМОКОД
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, lineHeight: 1.4 }}>
            {BUNDLE_PROMO_OFFER}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 14,
          }}>
            <div style={{
              fontFamily: 'monospace', fontSize: 20, fontWeight: 800,
              letterSpacing: '0.14em', marginBottom: 12,
            }}>
              {BUNDLE_PROMO_CODE}
            </div>
            <button
              onClick={handleCopy}
              style={{
                padding: '8px 24px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', width: '100%',
                background: copied ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                color: '#fff', transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Скопировано!' : 'Скопировать код'}
            </button>
          </div>
        </div>

        <button
          onClick={markBundlePromoShown}
          style={{
            padding: '12px', borderRadius: 14, fontSize: 14, fontWeight: 700,
            border: 'none', cursor: 'pointer', width: '100%',
            background: K.ink, color: K.white,
          }}
        >
          Продолжить! 🚀
        </button>
      </div>
    </div>
  )
}
