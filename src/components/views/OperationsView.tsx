import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'

const SERVICE_NAMES: Record<string, string> = {
  market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

export default function OperationsView() {
  const {
    businessType, cashRegisters, enabledCategories, services,
    buyCashRegister, toggleCategory,
  } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]
  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const state = useGameStore.getState()

  return (
    <div style={{ padding: 20, maxWidth: 640 }}>
      {/* Cash Registers */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Кассовые системы</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { type: 'mobile' as const, label: '📱 Mobile POS', price: 5000 },
            { type: 'reliable' as const, label: '🖥️ Надёжная касса', price: 15000 },
            { type: 'fast' as const, label: '⚡ Быстрая касса', price: 25000 },
          ].map(({ type, label, price }) => (
            <div key={type} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {cashRegisters.filter(r => r.type === type).length} шт
              </div>
              <button
                onClick={() => buyCashRegister(type)}
                style={{
                  padding: '8px 12px', borderRadius: 8, width: '100%',
                  background: 'var(--k-orange)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}
              >
                +1 ({price.toLocaleString('ru-RU')} ₽)
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 10, fontStyle: 'italic' }}>
          Каждая касса добавляет +15 клиентов в день. Без ОФД — штраф за каждый чек.
        </div>
      </div>

      {/* Assortment Categories */}
      {config.usesAssortment && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Ассортимент</h3>
            <span style={{ fontSize: 11, opacity: 0.5 }}>
              {enabledCategories.length}/{categories.length} активных
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categories.map(cat => {
              const isEnabled = enabledCategories.includes(cat.id)
              const allowed = isCategoryAllowed(cat, state)
              const missingServices = cat.requiredServices.filter(
                sId => !services?.[sId]?.isActive
              )

              return (
                <div
                  key={cat.id}
                  style={{
                    borderRadius: 14, padding: 14,
                    border: isEnabled
                      ? `2px solid ${allowed ? 'var(--k-green)' : 'var(--k-orange)'}`
                      : '1px solid rgba(14,17,22,0.1)',
                    background: isEnabled
                      ? (allowed ? 'rgba(0,180,120,0.04)' : 'rgba(255,107,0,0.04)')
                      : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--k-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {cat.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                          background: 'rgba(0,0,0,0.07)',
                        }}>
                          +{Math.round(cat.margin * 100)}% маржа
                        </span>
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6, lineHeight: 1.3 }}>
                        {cat.description}
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                        <span>
                          <span style={{ opacity: 0.45 }}>Выручка: </span>
                          <span style={{ fontWeight: 700, color: 'var(--k-green)' }}>
                            ~{cat.baseRevenue.toLocaleString('ru-RU')} ₽/день
                          </span>
                        </span>
                        <span>
                          <span style={{ opacity: 0.45 }}>Закупка: </span>
                          <span style={{ fontWeight: 700, color: 'var(--k-orange)' }}>
                            {cat.dailyCost.toLocaleString('ru-RU')} ₽/день
                          </span>
                        </span>
                      </div>

                      {/* Required services */}
                      {cat.requiredServices.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                          {cat.requiredServices.map(sId => {
                            const active = services?.[sId]?.isActive
                            return (
                              <span key={sId} style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                                background: active ? 'var(--k-green)' : 'rgba(220,50,50,0.12)',
                                color: active ? '#fff' : '#c0392b',
                              }}>
                                {SERVICE_NAMES[sId]} {active ? '✓' : '✕'}
                              </span>
                            )
                          })}
                          {cat.requiresEgais && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: 'rgba(220,50,50,0.12)', color: '#c0392b',
                            }}>ЕГАИС</span>
                          )}
                          {cat.requiresVetCert && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: 'rgba(220,50,50,0.12)', color: '#c0392b',
                            }}>Ветсертификат</span>
                          )}
                        </div>
                      )}

                      {isEnabled && !allowed && missingServices.length > 0 && (
                        <div style={{
                          marginTop: 8, fontSize: 11, fontWeight: 600,
                          color: 'var(--k-orange)',
                          background: 'rgba(255,107,0,0.08)', borderRadius: 8, padding: '6px 10px',
                        }}>
                          ⚠️ Штраф 10% без: {missingServices.map(s => SERVICE_NAMES[s]).join(', ')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                        fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                        background: isEnabled
                          ? (allowed ? 'var(--k-green)' : 'var(--k-orange)')
                          : 'var(--k-surface)',
                        color: isEnabled ? '#fff' : 'var(--k-ink)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isEnabled ? 'Вкл' : 'Выкл'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 11, opacity: 0.45, marginTop: 10, textAlign: 'center' }}>
            Закупка происходит автоматически. Включайте только категории с выполненными требованиями.
          </div>
        </div>
      )}
    </div>
  )
}
