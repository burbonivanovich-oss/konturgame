import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import PurchaseModal from '../modals/PurchaseModal'
import AssortmentModal from '../modals/AssortmentModal'
import { K } from '../design-system/tokens'

function ExpiryBar({ pct, daysLeft }: { pct: number; daysLeft: number }) {
  const color = daysLeft <= 1 ? K.bad : daysLeft <= 3 ? K.warn : K.mint
  return (
    <div style={{ height: 4, background: K.lineSoft, borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.3s' }} />
    </div>
  )
}

export function WarehouseView() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showAssortmentModal, setShowAssortmentModal] = useState(false)
  const { stockBatches, capacity, currentWeek, businessType, enabledCategories } = useGameStore()

  const totalStock = stockBatches.reduce((s, b) => s + b.quantity, 0)
  const capacityPct = capacity > 0 ? Math.min((totalStock / capacity) * 100, 100) : 0
  const capacityColor = capacityPct > 90 ? K.bad : capacityPct > 70 ? K.warn : K.mint

  const hasStock = businessType !== 'beauty-salon'

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
            onClick={() => (enabledCategories && enabledCategories.length > 0) ? setShowAssortmentModal(true) : setShowPurchaseModal(true)}
            style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: K.ink, color: K.white,
              padding: '12px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em',
            }}>
            {(enabledCategories && enabledCategories.length > 0) ? '🛍️ Ассортимент' : '+ Заказать товар'}
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
          {/* Capacity card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: K.ink, color: K.white, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.75, textTransform: 'uppercase' }}>НА СКЛАДЕ</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }} className="k-num">{totalStock}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>единиц товара</div>
            </div>
            <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ВМЕСТИМОСТЬ</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4, color: capacityColor }} className="k-num">{capacity}</div>
              <div style={{ height: 5, background: K.lineSoft, borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: `${capacityPct}%`, height: '100%', background: capacityColor, borderRadius: 999 }} />
              </div>
            </div>
            <div style={{ background: K.white, borderRadius: 14, padding: 18, border: `1px solid ${K.line}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>ПАРТИЙ В ОЧЕРЕДИ</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }} className="k-num">{stockBatches.length}</div>
              <div style={{ fontSize: 11, color: K.muted, marginTop: 4 }}>FIFO — первым пришёл, первым ушёл</div>
            </div>
          </div>

          {/* Batches */}
          <div style={{ background: K.white, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 4, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 8 }}>
              ПАРТИИ НА СКЛАДЕ
            </div>

            {stockBatches.length === 0 ? (
              <div style={{
                padding: '32px 0', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: K.muted }}>Склад пуст</div>
                <div style={{ fontSize: 12, marginTop: 4, color: K.muted }}>Закажите товар, чтобы начать продавать</div>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 120px',
                  gap: 8, padding: '4px 10px',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase',
                  borderBottom: `1.5px solid ${K.lineSoft}`, marginBottom: 4,
                }}>
                  <span>ПАРТИЯ</span>
                  <span style={{ textAlign: 'right' }}>ЕД.</span>
                  <span style={{ textAlign: 'right' }}>СЕБЕСТ.</span>
                  <span style={{ textAlign: 'right' }}>СТОИМОСТЬ</span>
                  <span style={{ textAlign: 'right' }}>СРОК</span>
                </div>

                {stockBatches.map((batch, i) => {
                  const daysLeft = batch.expirationDays - (currentWeek - batch.dayReceived)
                  const freshnessPct = Math.max(0, (daysLeft / batch.expirationDays) * 100)
                  const isExpiring = daysLeft <= 2
                  const isExpired = daysLeft <= 0

                  return (
                    <div key={batch.id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 120px',
                      gap: 8, padding: '8px 10px',
                      background: isExpired ? `${K.bad}0f` : isExpiring ? `${K.warn}14` : 'transparent',
                      borderRadius: 10,
                      alignItems: 'center',
                      borderBottom: i < stockBatches.length - 1 ? `1px dashed ${K.lineSoft}` : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>
                          Партия #{i + 1}
                          {i === 0 && <span style={{
                            marginLeft: 6, fontSize: 9, fontWeight: 800,
                            padding: '2px 6px', borderRadius: 4,
                            background: K.ink, color: K.white,
                          }}>СЛЕДУЮЩАЯ</span>}
                        </div>
                        <div style={{ fontSize: 10, color: K.muted, marginTop: 1 }}>День {batch.dayReceived}</div>
                        <ExpiryBar pct={freshnessPct} daysLeft={daysLeft} />
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14 }} className="k-num">
                        {batch.quantity}
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 12, color: K.muted }} className="k-num">
                        {batch.costPerUnit} ₽/ед
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }} className="k-num">
                        {(batch.quantity * batch.costPerUnit).toLocaleString('ru-RU')} ₽
                      </div>
                      <div style={{
                        textAlign: 'right', fontWeight: 800, fontSize: 13,
                        color: isExpired ? K.bad : isExpiring ? K.warn : K.good,
                      }}>
                        {isExpired ? 'ПРОСРОЧЕНО' : `${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
                      </div>
                    </div>
                  )
                })}

                {/* Total */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 120px',
                  gap: 8, padding: '10px 10px 0',
                  borderTop: `2px solid ${K.ink}`,
                  alignItems: 'center', marginTop: 4,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Итого</div>
                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 15 }} className="k-num">
                    {totalStock}
                  </div>
                  <div />
                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14 }} className="k-num">
                    {stockBatches.reduce((s, b) => s + b.quantity * b.costPerUnit, 0).toLocaleString('ru-RU')} ₽
                  </div>
                  <div />
                </div>
              </>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: K.mintSoft, borderRadius: 16, padding: 14, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
              <strong>FIFO:</strong> первая купленная партия продаётся первой. Следите за сроками — просроченный товар списывается автоматически в начале дня.
            </div>
          </div>
        </>
      )}

      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <AssortmentModal isOpen={showAssortmentModal} onClose={() => setShowAssortmentModal(false)} />
    </div>
  )
}
