import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'
import { K } from '../design-system/tokens'

const SERVICE_ICONS: Record<string, string> = {
  market: '🛒', bank: '🏦', ofd: '📄',
  diadoc: '📁', fokus: '🔍', elba: '📊', extern: '⚖️',
}

const SERVICE_NAMES: Record<string, string> = {
  market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

interface AssortmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AssortmentModal({ isOpen, onClose }: AssortmentModalProps) {
  const { businessType, services, enabledCategories, toggleCategory, balance } = useGameStore()

  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const state = useGameStore.getState()

  const totalDailyRevenue = categories
    .filter((c) => enabledCategories.includes(c.id))
    .reduce((sum, c) => sum + c.baseRevenue, 0)

  const totalDailyCost = categories
    .filter((c) => enabledCategories.includes(c.id))
    .reduce((sum, c) => sum + c.dailyCost, 0)

  return (
    <Modal isOpen={isOpen} title="📊 Управление ассортиментом" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Summary */}
        <div style={{
          background: K.bone, borderRadius: 14, padding: 14,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.45 }}>ВЫРУЧКА/ДЕНЬ</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: K.good }}>
              ~{totalDailyRevenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.45 }}>РАСХОДЫ/ДЕНЬ</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: K.orange }}>
              ~{totalDailyCost.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.45 }}>КАТЕГОРИЙ</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {enabledCategories.length}/{categories.length}
            </div>
          </div>
        </div>

        {/* Category cards */}
        {categories.map((cat) => {
          const isEnabled = enabledCategories.includes(cat.id)
          const allowed = isCategoryAllowed(cat, state)
          const missingServices = cat.requiredServices.filter(
            (sId) => !services?.[sId]?.isActive
          )

          return (
            <div key={cat.id} style={{
              border: isEnabled
                ? `2px solid ${allowed ? K.mint : K.orange}`
                : `1px solid ${K.line}`,
              borderRadius: 14, padding: 14,
              background: isEnabled
                ? (allowed ? K.mintSoft : K.orangeSoft)
                : K.white,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: K.bone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {cat.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px',
                      borderRadius: 6,
                      background: K.bone,
                      color: K.ink,
                    }}>
                      +{Math.round(cat.margin * 100)}% маржа
                    </div>
                  </div>

                  <div style={{ fontSize: 11, opacity: 0.55, lineHeight: 1.4, marginBottom: 8 }}>
                    {cat.description}
                  </div>

                  {/* Revenue & cost */}
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 8 }}>
                    <div>
                      <span style={{ opacity: 0.45 }}>Выручка: </span>
                      <span style={{ fontWeight: 700, color: K.good }}>
                        ~{cat.baseRevenue.toLocaleString('ru-RU')} ₽/день
                      </span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.45 }}>Закупка: </span>
                      <span style={{ fontWeight: 700, color: K.orange }}>
                        {cat.dailyCost.toLocaleString('ru-RU')} ₽/день
                      </span>
                    </div>
                  </div>

                  {/* Required services */}
                  {cat.requiredServices.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {cat.requiredServices.map((sId) => {
                        const active = services?.[sId]?.isActive
                        return (
                          <div key={sId} style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '3px 8px', borderRadius: 6,
                            background: active ? K.mint : 'rgba(180,47,35,0.12)',
                            color: active ? K.white : K.bad,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            {SERVICE_ICONS[sId]} {SERVICE_NAMES[sId]}
                            {active ? ' ✓' : ' ✕'}
                          </div>
                        )
                      })}
                      {cat.requiresEgais && (
                        <div style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 6, background: 'rgba(180,47,35,0.12)', color: K.bad,
                        }}>
                          ЕГАИС
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning for enabled but non-compliant */}
                  {isEnabled && !allowed && missingServices.length > 0 && (
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: K.orange,
                      background: K.orangeSoft, borderRadius: 8, padding: '8px 10px',
                    }}>
                      ⚠️ Штраф 10% выручки/день без: {missingServices.map((s) => SERVICE_NAMES[s]).join(', ')}
                    </div>
                  )}
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: isEnabled
                      ? (allowed ? K.mint : K.orange)
                      : K.bone,
                    color: isEnabled ? K.white : K.ink,
                    transition: 'all 0.2s',
                  }}
                >
                  {isEnabled ? 'Вкл' : 'Выкл'}
                </button>
              </div>
            </div>
          )
        })}

        <div style={{ fontSize: 11, opacity: 0.5, textAlign: 'center' }}>
          Закупка товаров происходит автоматически каждый день.
          Включайте только те категории, для которых есть все требования.
        </div>
      </div>
    </Modal>
  )
}
