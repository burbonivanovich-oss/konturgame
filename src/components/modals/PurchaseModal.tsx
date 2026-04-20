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
      dayReceived: useGameStore.getState().currentWeek,
      expirationDays: config.stockExpiry,
    })

    setBalance(balance - totalCost)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title="📦 Закупка товара" onClose={onClose} size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">
            Количество единиц: <span className="text-brand-orange">{quantity}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500">от 1 до 100 единиц</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md space-y-2 border border-blue-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Стоимость за единицу:</span>
            <span className="font-semibold text-gray-800">{costPerUnit.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Общая стоимость:</span>
            <span className={`font-bold ${totalCost > balance ? 'text-red-600' : 'text-brand-green'}`}>
              {totalCost.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between text-sm">
            <span className="text-gray-600">Текущий баланс:</span>
            <span className="font-semibold text-gray-800">{balance.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md font-semibold text-gray-700 transition"
          >
            Отмена
          </button>
          <button
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`flex-1 py-2 rounded-md transition font-semibold text-white ${
              canAfford
                ? 'bg-brand-green hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Купить
          </button>
        </div>
      </div>
    </Modal>
  )
}
