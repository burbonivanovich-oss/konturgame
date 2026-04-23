import type { BusinessType } from '../types/game'
import { BUSINESS_CONFIGS, MONTHLY_EXPENSES } from '../constants/business'
import { useGameStore } from '../stores/gameStore'
import { K } from './design-system/tokens'

const BUSINESS_INFO: Record<BusinessType, { icon: string; title: string; description: string; season?: string }> = {
  shop: {
    icon: '🏪',
    title: 'Магазин',
    description: 'Розничная торговля. Стабильный поток клиентов, низкий средний чек.',
    season: 'Летом +5% клиентов',
  },
  cafe: {
    icon: '☕',
    title: 'Кафе',
    description: 'Общественное питание. Сезонный бизнес, зависит от погоды.',
    season: 'Летом +22% клиентов, зимой −15%',
  },
  'beauty-salon': {
    icon: '💅',
    title: 'Салон красоты',
    description: 'Услуги красоты. Высокий чек, меньше клиентов, без склада.',
    season: 'Весной +12% клиентов',
  },
}

interface BusinessSelectorProps {
  onGameStart?: () => void
}

export default function BusinessSelector({ onGameStart }: BusinessSelectorProps) {
  const startNewGame = useGameStore((s) => s.startNewGame)

  const handleSelectBusiness = (businessType: BusinessType) => {
    startNewGame(businessType)
    onGameStart?.()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: K.paper,
      color: K.ink,
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, sans-serif',
      letterSpacing: '-0.01em',
      padding: '48px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }}>
      <div style={{ maxWidth: 1120, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: K.muted, textTransform: 'uppercase', marginBottom: 12,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 3, background: K.ink, display: 'inline-block',
            }} />
            БИЗНЕС С КОНТУРОМ
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1.02, margin: 0, marginBottom: 12,
          }}>
            Выберите свой бизнес
          </h1>
          <p style={{
            fontSize: 15, fontWeight: 500, color: K.ink2,
            lineHeight: 1.4, margin: 0, maxWidth: 560, marginInline: 'auto',
          }}>
            От магазина до салона — управляйте бизнесом, используя сервисы Контура.
            Стартовый капитал 80 000 ₽, цель — дожить до окупаемости.
          </p>
        </div>

        {/* Business cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {(Object.keys(BUSINESS_INFO) as BusinessType[]).map((type) => {
            const info = BUSINESS_INFO[type]
            const config = BUSINESS_CONFIGS[type]
            const monthly = MONTHLY_EXPENSES[type]

            const details: { label: string; value: string }[] = [
              { label: 'Клиенты/день', value: `~${config.baseClients}` },
              { label: 'Средний чек', value: `${config.avgCheck} ₽` },
              { label: 'Вместимость', value: `${config.capacity} чел.` },
              { label: 'Аренда/мес', value: `${monthly.rent.toLocaleString('ru-RU')} ₽` },
              { label: 'Зарплата/мес', value: `${monthly.baseSalary.toLocaleString('ru-RU')} ₽` },
              { label: config.hasStock ? 'Срок хранения' : 'Склад', value: config.hasStock ? `${config.stockExpiry} дней` : 'не нужен' },
            ]

            return (
              <button
                key={type}
                onClick={() => handleSelectBusiness(type)}
                style={{
                  background: K.white,
                  border: `1px solid ${K.line}`,
                  borderRadius: 24,
                  padding: 24,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: K.ink,
                  letterSpacing: '-0.01em',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = K.ink
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = K.line
                }}
              >
                {/* Icon + Title */}
                <div>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: K.paper,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, marginBottom: 14,
                  }}>
                    {info.icon}
                  </div>
                  <div style={{
                    fontSize: 24, fontWeight: 700,
                    letterSpacing: '-0.02em', lineHeight: 1.05,
                    marginBottom: 8,
                  }}>
                    {info.title}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: K.ink2,
                    lineHeight: 1.4,
                  }}>
                    {info.description}
                  </div>
                </div>

                {/* Details grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
                  background: K.lineSoft, borderRadius: 12, overflow: 'hidden',
                  border: `1px solid ${K.lineSoft}`,
                }}>
                  {details.map((d, i) => (
                    <div key={i} style={{
                      background: K.white,
                      padding: '10px 12px',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                        color: K.muted, textTransform: 'uppercase',
                      }}>
                        {d.label}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 700, marginTop: 2,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Season note */}
                {info.season && (
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: K.muted,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>📈</span>
                    {info.season}
                  </div>
                )}

                {/* CTA */}
                <div style={{
                  marginTop: 'auto',
                  background: K.ink, color: K.white,
                  borderRadius: 999, padding: '14px 20px',
                  fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                  textAlign: 'center',
                }}>
                  Начать с этого
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', color: K.muted,
          fontSize: 12, fontWeight: 500,
          display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center',
        }}>
          <span>💡</span>
          Можно начать заново в любой момент через «Настройки»
        </div>
      </div>
    </div>
  )
}
