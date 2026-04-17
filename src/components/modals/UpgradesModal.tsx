import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'

interface UpgradesModalProps {
  isOpen: boolean
  onClose: () => void
}

const UPGRADES = [
  {
    id: 'expansion',
    name: '📏 Расширение помещения',
    description: 'Увеличивает вместимость склада на 50%',
    cost: 50000,
    effect: '+50% вместимость',
  },
  {
    id: 'staff-hire',
    name: '👥 Наем сотрудника',
    description: 'Повышает лояльность на 10 пунктов',
    cost: 30000,
    effect: '+10 лояльности',
  },
  {
    id: 'better-location',
    name: '🏪 Улучшенная локация',
    description: 'Увеличивает количество клиентов на 20%',
    cost: 80000,
    effect: '+20% клиентов',
  },
  {
    id: 'equipment',
    name: '⚙️ Оборудование',
    description: 'Сокращает время обслуживания на 15%',
    cost: 40000,
    effect: '+15% скорость',
  },
]

export default function UpgradesModal({ isOpen, onClose }: UpgradesModalProps) {
  const { balance, purchasedUpgrades, purchaseUpgrade, setBalance } = useGameStore()
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null)

  const handlePurchase = (upgrade: typeof UPGRADES[0]) => {
    if (balance >= upgrade.cost && !purchasedUpgrades.includes(upgrade.id)) {
      purchaseUpgrade(upgrade.id)
      setBalance(balance - upgrade.cost)
      setSelectedUpgrade(null)
    }
  }

  return (
    <Modal isOpen={isOpen} title="🔧 Улучшения" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {UPGRADES.map((upgrade) => {
            const isPurchased = purchasedUpgrades.includes(upgrade.id)
            const canAfford = balance >= upgrade.cost

            return (
              <div
                key={upgrade.id}
                className={`p-3 rounded border transition cursor-pointer ${
                  isPurchased
                    ? 'border-green-500 bg-green-900 bg-opacity-30'
                    : 'border-slate-600 bg-slate-800 hover:border-slate-400'
                }`}
                onClick={() => !isPurchased && setSelectedUpgrade(upgrade.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{upgrade.name}</span>
                  {isPurchased && <span className="text-green-400 text-sm">✓</span>}
                </div>
                <p className="text-xs text-gray-400 mb-2">{upgrade.description}</p>
                <p className="text-xs text-green-400 mb-2">{upgrade.effect}</p>
                {!isPurchased && (
                  <p className={`text-xs font-semibold ${
                    canAfford ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {upgrade.cost.toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition"
          >
            Закрыть
          </button>
          {selectedUpgrade && (
            <button
              onClick={() => {
                const upgrade = UPGRADES.find(u => u.id === selectedUpgrade)
                if (upgrade) handlePurchase(upgrade)
              }}
              disabled={!balance || balance < (UPGRADES.find(u => u.id === selectedUpgrade)?.cost || 0)}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded transition font-semibold"
            >
              Купить
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
