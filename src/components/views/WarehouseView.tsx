import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import AssortmentModal from '../modals/AssortmentModal'
import { K } from '../design-system/tokens'
import { BUSINESS_CONFIGS } from '../../constants/business'
import { PRODUCT_CATEGORIES } from '../../services/assortmentEngine'

export function WarehouseView() {
  const [showAssortmentModal, setShowAssortmentModal] = useState(false)
  const { businessType, enabledCategories } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]
  const hasStock = config.hasStock

  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const activeCategories = categories.filter(c => (enabledCategories ?? []).includes(c.id))
  const totalDailyRevenue = activeCategories.reduce((s, c) => s + c.baseRevenue, 0)
  const totalDailyCost = activeCategories.reduce((s, c) => s + c.dailyCost, 0)

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>УПРАВЛЕНИЕ</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Склад</div>
        </div>
        {hasStock && (
          <button
            onClick={() => setShowAssortmentModal(true)}
            style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: K.ink, color: K.white,
              padding: '12px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em',
            }}>
            🛍️ Управлять ассортиментом
          </button>
        )}
      </div>

      {!hasStock ? (
        <div style={{
          background: K.white, borderRadius: 20, padding: 24,
          border: `1px solid ${K.line}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32 }}>✂️</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Склад не нужен</div>
          <div style={{ fontSize: 13, color: K.muted }}>Для салона красоты склад не используется — расходники списываются автоматически.</div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: K.ink, color: K.white, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.75, textTransform: 'uppercase' }}>КАТЕГОРИЙ АКТИВНО</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }} className="k-num">{activeCategories.length}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>из {categories.length} доступных</div>
            </div>
            <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ЗАКУПКА/ДЕНЬ</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: K.orange }} className="k-num">
                {totalDailyCost.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 11, color: K.muted, marginTop: 4 }}>списывается автоматически</div>
            </div>
            <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ВЫРУЧКА/ДЕНЬ</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: K.good }} className="k-num">
                ~{totalDailyRevenue.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 11, color: K.muted, marginTop: 4 }}>базовая, без модификаторов</div>
            </div>
          </div>

          {/* Active categories list */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 8, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 4 }}>
              АКТИВНЫЕ КАТЕГОРИИ
            </div>

            {activeCategories.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: K.muted }}>Нет активных категорий</div>
                <div style={{ fontSize: 12, marginTop: 4, color: K.muted }}>
                  Нажмите «Управлять ассортиментом», чтобы включить товары
                </div>
              </div>
            ) : (
              activeCategories.map((cat, i) => (
                <div key={cat.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < activeCategories.length - 1 ? `1px dashed ${K.lineSoft}` : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: K.bone,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>{cat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: K.muted, marginTop: 2 }}>{cat.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: K.good }}>+{cat.baseRevenue.toLocaleString('ru-RU')} ₽/д</div>
                    <div style={{ fontSize: 11, color: K.muted }}>{cat.dailyCost.toLocaleString('ru-RU')} ₽ закупка</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tip */}
          <div style={{ background: K.mintSoft, borderRadius: 16, padding: 14, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
              <strong>Как работает склад:</strong> закупки происходят автоматически каждый день по активным категориям.
              Включайте категории через «Управлять ассортиментом». Чем больше категорий — тем выше выручка.
            </div>
          </div>
        </>
      )}

      <AssortmentModal isOpen={showAssortmentModal} onClose={() => setShowAssortmentModal(false)} />
    </div>
  )
}
