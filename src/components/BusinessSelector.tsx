import type { BusinessType } from '../types/game'
import { BUSINESS_CONFIGS } from '../constants/business'
import { useGameStore } from '../stores/gameStore'

const BUSINESS_INFO = {
  shop: {
    icon: '🏪',
    title: 'Магазин',
    description: 'Розничная торговля. Стабильный доход, много клиентов.',
    details: [
      'Начальный капитал: 50,000 ₽',
      'Среднее количество клиентов: 80 в день',
      'Средний чек: 300 ₽',
      'Вместимость: 60 человек',
      'Товар портится: каждые 10 дней',
    ],
  },
  cafe: {
    icon: '☕',
    title: 'Кафе',
    description: 'Общественное питание. Сезонный бизнес, зависит от погоды.',
    details: [
      'Начальный капитал: 40,000 ₽',
      'Среднее количество клиентов: 100 в день',
      'Средний чек: 180 ₽',
      'Вместимость: 70 человек',
      'Товар портится: каждые 7 дней',
      'Летом +22% клиентов, зимой -15%',
    ],
  },
  'beauty-salon': {
    icon: '💅',
    title: 'Салон красоты',
    description: 'Услуги красоты. Высокий чек, меньше клиентов.',
    details: [
      'Начальный капитал: 60,000 ₽',
      'Среднее количество клиентов: 40 в день',
      'Средний чек: 800 ₽',
      'Вместимость: 30 человек',
      'Товар не требуется',
      'Весной +12% клиентов',
    ],
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '10px',
            }}
          >
            Бизнес с Контуром
          </div>
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '500',
            }}
          >
            Выберите тип своего бизнеса, чтобы начать
          </div>
        </div>

        {/* Business cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {(Object.keys(BUSINESS_INFO) as BusinessType[]).map((type) => {
            const info = BUSINESS_INFO[type]
            const config = BUSINESS_CONFIGS[type]

            return (
              <button
                key={type}
                onClick={() => handleSelectBusiness(type)}
                style={{
                  background: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: '56px',
                    marginBottom: '16px',
                  }}
                >
                  {info.icon}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 12px 0',
                    color: '#0e1116',
                  }}
                >
                  {info.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 0 20px 0',
                    lineHeight: '1.5',
                  }}
                >
                  {info.description}
                </p>

                {/* Details */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '0',
                    fontSize: '13px',
                    color: '#555',
                    textAlign: 'left',
                  }}
                >
                  {info.details.map((detail, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '6px 0',
                        borderBottom:
                          i < info.details.length - 1
                            ? '1px solid rgba(0,0,0,0.08)'
                            : 'none',
                      }}
                    >
                      • {detail}
                    </li>
                  ))}
                </ul>

                {/* Button overlay */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    background: '#667eea',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#764ba2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#667eea'
                  }}
                >
                  Выбрать
                </div>
              </button>
            )
          })}
        </div>

        {/* Info footer */}
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          💡 Вы сможете менять решение в любой момент через Настройки
        </div>
      </div>
    </div>
  )
}
