import { useState, useMemo } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'
import { K } from '../design-system/tokens'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PurchaseModal({ isOpen, onClose }: PurchaseModalProps) {
  const { balance, businessType, addStockBatch, setBalance } = useGameStore()
  const [quantity, setQuantity] = useState(10)

  const config = BUSINESS_CONFIGS[businessType]
  const costPerUnit = 100
  const totalCost = quantity * costPerUnit

  const canAfford = useMemo(() => balance >= totalCost, [balance, totalCost])

  const handlePurchase = () => {
    if (!canAfford) return

    addStockBatch({
      id: `batch-${Date.now()}`,
      quantity,
      costPerUnit,
      dayReceived: useGameStore.getState().currentWeek,
      expirationDays: config.stockExpiry,
    })

    setBalance(balance - totalCost)
    onClose()
  }

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
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: K.muted }}>от 1 до 100 единиц</p>
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
