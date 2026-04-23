import { useState, useMemo } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'
import { getActiveSupplier } from '../../services/supplierManager'
import { K } from '../design-system/tokens'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
}

const BASE_COST_PER_UNIT = 100

export default function PurchaseModal({ isOpen, onClose }: PurchaseModalProps) {
  const { balance, businessType, addStockBatch, setBalance } = useGameStore()
  const [quantity, setQuantity] = useState(10)

  const config = BUSINESS_CONFIGS[businessType]

  const { costPerUnit, supplierName, supplierReliability } = useMemo(() => {
    const state = useGameStore.getState()
    const supplier = getActiveSupplier(state)
    const modifier = supplier?.priceModifier ?? 0
    return {
      costPerUnit: Math.round(BASE_COST_PER_UNIT * (1 + modifier)),
      supplierName: supplier?.name ?? 'Стандартный поставщик',
      supplierReliability: supplier?.reliability ?? 1,
    }
  }, [])

  const totalCost = quantity * costPerUnit
  const canAfford = useMemo(() => balance >= totalCost, [balance, totalCost])

  const handlePurchase = () => {
    if (!canAfford) return

    const s = useGameStore.getState()
    addStockBatch({
      id: `batch-${Date.now()}`,
      quantity,
      costPerUnit,
      dayReceived: s.currentWeek * 7 + s.dayOfWeek,
      expirationDays: config.stockExpiry,
    })

    setBalance(balance - totalCost)
    onClose()
  }

  const reliabilityPct = Math.round(supplierReliability * 100)
  const reliabilityColor = reliabilityPct >= 90 ? K.good : reliabilityPct >= 80 ? K.orange : K.bad

  return (
    <Modal isOpen={isOpen} title="📦 Закупка товара" onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: K.muted, display: 'block' }}>
            Количество единиц: <span style={{ color: K.orange }}>{quantity}</span>
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: K.muted }}>от 1 до 200 единиц</p>
        </div>

        <div style={{
          background: K.blueSoft,
          border: `1px solid ${K.blue}`,
          borderRadius: 10,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: K.muted }}>Поставщик:</span>
            <span style={{ fontWeight: 600, color: K.ink }}>{supplierName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: K.muted }}>Надёжность доставки:</span>
            <span style={{ fontWeight: 600, color: reliabilityColor }}>{reliabilityPct}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: K.muted }}>Стоимость за единицу:</span>
            <span style={{ fontWeight: 600, color: K.ink }}>{costPerUnit.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: K.muted }}>Общая стоимость:</span>
            <span style={{ fontWeight: 700, color: canAfford ? K.good : K.bad }}>
              {totalCost.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div style={{
            borderTop: `1px solid ${K.blue}`,
            paddingTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
          }}>
            <span style={{ color: K.muted }}>Текущий баланс:</span>
            <span style={{ fontWeight: 600, color: K.ink }}>{balance.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: K.bone,
              color: K.ink,
              border: `1px solid ${K.line}`,
              borderRadius: 10,
              padding: '8px 0',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handlePurchase}
            disabled={!canAfford}
            style={{
              flex: 1,
              background: canAfford ? K.ink : K.lineSoft,
              color: canAfford ? K.white : K.muted,
              border: 'none',
              borderRadius: 10,
              padding: '8px 0',
              fontWeight: 600,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            Купить
          </button>
        </div>
      </div>
    </Modal>
  )
}
