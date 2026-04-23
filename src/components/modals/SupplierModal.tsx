import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { K } from '../design-system/tokens'

interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupplierModal({ isOpen, onClose }: SupplierModalProps) {
  const { suppliers, activeSupplierId, setActiveSupplierId } = useGameStore()

  return (
    <Modal isOpen={isOpen} title="Выбрать поставщика" onClose={onClose}>
      <div style={{ maxWidth: 520 }}>

        {suppliers.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', opacity: 0.5,
            borderRadius: 12, border: `1px dashed ${K.line}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Нет доступных поставщиков</div>
            <div style={{ fontSize: 11, marginTop: 6 }}>Поставщики появятся по мере развития бизнеса</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suppliers.map((supplier) => {
              const isActive = activeSupplierId === supplier.id
              return (
                <div
                  key={supplier.id}
                  onClick={() => setActiveSupplierId(isActive ? null : supplier.id)}
                  style={{
                    padding: 16, borderRadius: 12,
                    border: isActive ? `2px solid ${K.mint}` : `1px solid ${K.line}`,
                    background: isActive ? K.mintSoft : K.white,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{supplier.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>
                        Уровень: <span style={{ fontWeight: 700 }}>
                          {supplier.tier === 'economy' ? '💰 Эконом' : supplier.tier === 'standard' ? '⭐ Стандарт' : '🏆 Премиум'}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 16, fontWeight: 800, color: K.mint }}>✓</div>
                    )}
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10, fontSize: 11, marginTop: 10, paddingTop: 10,
                    borderTop: `1px solid ${K.lineSoft}`,
                  }}>
                    <div>
                      <div style={{ opacity: 0.5, marginBottom: 2 }}>Качество</div>
                      <div style={{
                        fontWeight: 800,
                        color: supplier.qualityModifier > 0 ? K.good : supplier.qualityModifier < 0 ? K.bad : 'inherit',
                      }}>
                        {supplier.qualityModifier > 0 ? '+' : ''}{(supplier.qualityModifier * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.5, marginBottom: 2 }}>Цена</div>
                      <div style={{
                        fontWeight: 800,
                        color: supplier.priceModifier < 0 ? K.good : supplier.priceModifier > 0 ? K.bad : 'inherit',
                      }}>
                        {supplier.priceModifier > 0 ? '+' : ''}{(supplier.priceModifier * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.5, marginBottom: 2 }}>Надёжность</div>
                      <div style={{ fontWeight: 800, color: supplier.reliability > 0.8 ? K.good : 'inherit' }}>
                        {(supplier.reliability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div style={{
                      marginTop: 10, padding: 8, borderRadius: 8,
                      background: K.mintSoft, fontSize: 10, color: K.mint,
                      fontWeight: 700,
                    }}>
                      ✓ Активный поставщик
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{
          marginTop: 20, padding: 12, borderRadius: 10,
          background: K.bone, fontSize: 10, opacity: 0.6, lineHeight: 1.4,
        }}>
          Выбранный поставщик влияет на стоимость закупок и качество товаров. Премиум-поставщики дороже, но дают лучшее качество.
        </div>
      </div>
    </Modal>
  )
}
