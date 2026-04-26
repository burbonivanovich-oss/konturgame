import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { PROMO_CODE_DATA, BUNDLE_PROMO_CODE, BUNDLE_PROMO_OFFER } from '../../constants/promoCodes'
import type { ServiceType } from '../../types/game'
import { K } from '../design-system/tokens'

interface PromoWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PromoWalletModal({ isOpen, onClose }: PromoWalletModalProps) {
  const { promoCodesRevealed } = useGameStore()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  const hasAllServices = promoCodesRevealed.length >= 7

  return (
    <Modal isOpen={isOpen} title="🎟️ Кошелёк промокодов" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Progress */}
        <div style={{
          background: K.bone, borderRadius: 14, padding: 14,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, marginBottom: 6 }}>
              СОБРАНО ПРОМОКОДОВ
            </div>
            <div style={{
              height: 6, background: K.lineSoft, borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: K.violet,
                width: `${(promoCodesRevealed.length / 7) * 100}%`,
                borderRadius: 3, transition: 'width 0.4s',
              }} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {promoCodesRevealed.length}<span style={{ fontSize: 14, opacity: 0.45 }}>/7</span>
          </div>
        </div>

        {/* Bundle promo */}
        {hasAllServices && (
          <div style={{
            background: K.violet,
            borderRadius: 16, padding: 18, color: '#fff',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6, opacity: 0.85 }}>
              🏆 ПОЛНЫЙ КОМПЛЕКТ КОНТУРА!
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {BUNDLE_PROMO_OFFER}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, letterSpacing: '0.1em' }}>
                {BUNDLE_PROMO_CODE}
              </span>
              <button
                onClick={() => handleCopy(BUNDLE_PROMO_CODE)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: copiedCode === BUNDLE_PROMO_CODE ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                  color: '#fff',
                }}
              >
                {copiedCode === BUNDLE_PROMO_CODE ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>
          </div>
        )}

        {/* Individual codes */}
        {promoCodesRevealed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 32,
            fontSize: 13, opacity: 0.45, lineHeight: 1.6,
          }}>
            Промокоды появятся здесь при подключении<br/>сервисов Контура в игре.
          </div>
        ) : (
          promoCodesRevealed.map((serviceId) => {
            const data = PROMO_CODE_DATA[serviceId as ServiceType]
            if (!data) return null
            return (
              <div key={serviceId} style={{
                background: K.white,
                border: `1px solid ${K.line}`, borderRadius: 14, padding: 14,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: K.bone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  flexShrink: 0,
                }}>
                  {data.serviceIcon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                    {data.serviceName}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.55 }}>
                    {data.offerText}
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                    color: K.blue, marginTop: 4,
                  }}>
                    {data.code}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(data.code)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: copiedCode === data.code ? K.mint : K.bone,
                    color: copiedCode === data.code ? K.white : K.ink,
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedCode === data.code ? '✓' : 'Копировать'}
                </button>
              </div>
            )
          })
        )}

        {promoCodesRevealed.length < 7 && (
          <div style={{ fontSize: 11, opacity: 0.45, textAlign: 'center' }}>
            Подключите все 7 сервисов Контура, чтобы получить эксклюзивный промокод на пакетную скидку.
          </div>
        )}
      </div>
    </Modal>
  )
}
