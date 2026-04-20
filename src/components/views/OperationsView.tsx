import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'

export default function OperationsView() {
  const {
    businessType, cashRegisters, enabledCategories,
    buyCashRegister, toggleCategory,
  } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      {/* Cash Registers */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Кассовые системы</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Mobile POS</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              {cashRegisters.filter(r => r.type === 'mobile').length} штук
            </div>
            <button
              onClick={() => buyCashRegister('mobile')}
              style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--k-orange)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}
            >
              +1 (₽5000)
            </button>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Надёжная касса</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              {cashRegisters.filter(r => r.type === 'reliable').length} штук
            </div>
            <button
              onClick={() => buyCashRegister('reliable')}
              style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--k-orange)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}
            >
              +1 (₽15000)
            </button>
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 6 }}>Быстрая касса</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              {cashRegisters.filter(r => r.type === 'fast').length} штук
            </div>
            <button
              onClick={() => buyCashRegister('fast')}
              style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--k-orange)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}
            >
              +1 (₽25000)
            </button>
          </div>
        </div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 12, fontStyle: 'italic' }}>
          Кассы определяют, сколько клиентов вы можете обслужить в день. Новая касса: +15 клиентов.
        </div>
      </div>

      {/* Assortment Categories (if applicable) */}
      {config.usesAssortment && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Ассортимент товаров</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['general', 'premium', 'discount'].map(cat => (
              <div
                key={cat}
                onClick={() => toggleCategory(cat)}
                style={{
                  padding: 12, borderRadius: 12,
                  border: enabledCategories.includes(cat) ? '2px solid var(--k-orange)' : '1px solid rgba(14,17,22,0.12)',
                  background: enabledCategories.includes(cat) ? 'var(--k-orange)' : 'transparent',
                  color: enabledCategories.includes(cat) ? '#fff' : 'var(--k-ink)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {cat === 'general' && '📦 Базовый'}
                  {cat === 'premium' && '✨ Премиум'}
                  {cat === 'discount' && '💰 Бюджет'}
                </div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>
                  {enabledCategories.includes(cat) ? '✓ Активен' : 'Добавить'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, opacity: 0.55, marginTop: 12, fontStyle: 'italic' }}>
            Разные категории товаров привлекают разных клиентов и дают разный доход.
          </div>
        </div>
      )}
    </div>
  )
}
