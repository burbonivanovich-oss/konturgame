import { useState, useMemo } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'

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
      dayReceived: useGameStore.getState().currentDay,
      expirationDays: config.stockExpiry,
    })

    setBalance(balance - totalCost)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title="🛍️ Закупка товара" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Количество единиц
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-semibold min-w-12">{quantity}</span>
          </div>
        </div>

        <div className="bg-slate-600 p-3 rounded space-y-2">
          <div className="flex justify-between text-sm">
            <span>Стоимость за единицу:</span>
            <span>{costPerUnit.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Общая стоимость:</span>
            <span className={totalCost > balance ? 'text-red-400' : 'text-green-400'}>
              {totalCost.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Текущий баланс:</span>
            <span>{balance.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition"
          >
            Отмена
          </button>
          <button
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`flex-1 py-2 rounded transition font-semibold ${
              canAfford
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Купить
          </button>
        </div>
      </div>
    </Modal>
  )
}
