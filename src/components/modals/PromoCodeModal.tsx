import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { PROMO_CODE_DATA } from '../../constants/promoCodes'
import type { ServiceType } from '../../types/game'

export default function PromoCodeModal() {
  const { pendingPromoCode, clearPendingPromoCode } = useGameStore()
  const [copied, setCopied] = useState(false)

  if (!pendingPromoCode) return null

  const data = PROMO_CODE_DATA[pendingPromoCode as ServiceType]
  if (!data) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(14,17,22,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: 28,
        maxWidth: 380, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, var(--k-orange), var(--k-blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 16px',
        }}>
          {data.serviceIcon}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--k-orange)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          🎉 Промокод получен!
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          {data.serviceName}
        </div>

        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 20, lineHeight: 1.5 }}>
          {data.offerText}
        </div>

        {/* Promo code block */}
        <div style={{
          background: 'var(--k-surface)', borderRadius: 14, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.45, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ваш промокод
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 20, fontWeight: 800,
            letterSpacing: '0.12em', color: 'var(--k-blue)',
            marginBottom: 12,
          }}>
            {data.code}
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: copied ? 'var(--k-green)' : 'var(--k-blue)',
              color: '#fff', transition: 'background 0.2s', width: '100%',
            }}
          >
            {copied ? '✓ Скопировано!' : 'Скопировать код'}
          </button>
        </div>

        <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 20, lineHeight: 1.4 }}>
          Используйте этот код при покупке {data.serviceName} на сайте Контура.
          Все промокоды сохраняются в Кошельке.
        </div>

        <button
          onClick={clearPendingPromoCode}
          style={{
            padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            border: 'none', cursor: 'pointer', width: '100%',
            background: 'var(--k-surface)', color: 'var(--k-ink)',
          }}
        >
          Закрыть и продолжить игру
        </button>
      </div>
    </div>
  )
}
