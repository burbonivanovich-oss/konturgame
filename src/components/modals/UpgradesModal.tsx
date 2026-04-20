import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { getUpgradesForBusiness } from '../../constants/business'

interface UpgradesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradesModal({ isOpen, onClose }: UpgradesModalProps) {
  const { balance, businessType, purchasedUpgrades, purchaseUpgrade, setBalance } = useGameStore()
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null)
  const upgrades = getUpgradesForBusiness(businessType)

  const handlePurchase = (upgrade: typeof upgrades[0]) => {
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
          {upgrades.map((upgrade) => {
            const isPurchased = purchasedUpgrades.includes(upgrade.id)
            const canAfford = balance >= upgrade.cost

            return (
              <div
                key={upgrade.id}
                className={`p-4 rounded-md border-2 transition cursor-pointer ${
                  isPurchased
                    ? 'border-brand-green bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => !isPurchased && setSelectedUpgrade(upgrade.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">{upgrade.name}</span>
                  {isPurchased && <span className="text-brand-green text-xl">✓</span>}
                </div>
                <p className="text-sm font-semibold text-brand-orange mb-2">{upgrade.effect}</p>
                {!isPurchased && (
                  <p className={`text-sm font-bold ${
                    canAfford ? 'text-gray-700' : 'text-red-600'
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
            className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md transition font-semibold text-gray-700"
          >
            Закрыть
          </button>
          {selectedUpgrade && (
            <button
              onClick={() => {
                const upgrade = upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)
                if (upgrade) handlePurchase(upgrade)
              }}
              disabled={!balance || balance < (upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)?.cost || 0)}
              className="flex-1 bg-brand-orange hover:opacity-90 disabled:bg-gray-300 py-2 rounded-md transition font-semibold text-white disabled:text-gray-500"
            >
              Купить
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
