import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { getUpgradesForBusiness } from '../../constants/business'
import { K } from '../design-system/tokens'

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {upgrades.map((upgrade) => {
            const isPurchased = purchasedUpgrades.includes(upgrade.id)
            const canAfford = balance >= upgrade.cost

            return (
              <div
                key={upgrade.id}
                onClick={() => !isPurchased && setSelectedUpgrade(upgrade.id)}
                style={{
                  background: isPurchased ? K.mintSoft : K.white,
                  border: isPurchased ? `1.5px solid ${K.mint}` : `1px solid ${K.line}`,
                  borderRadius: 12,
                  padding: 14,
                  cursor: isPurchased ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{upgrade.name}</span>
                  {isPurchased && <span style={{ fontSize: 16, color: K.mint }}>✓</span>}
                </div>
                <p style={{ fontSize: 11, color: K.orange, fontWeight: 600, marginBottom: 4, margin: '0 0 4px 0' }}>
                  {upgrade.effect}
                </p>
                {!isPurchased && (
                  <p style={{ fontSize: 12, fontWeight: 700, color: canAfford ? K.ink : K.bad, margin: 0 }}>
                    {upgrade.cost.toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </div>
            )
          })}
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
            Закрыть
          </button>
          {selectedUpgrade && (
            <button
              onClick={() => {
                const upgrade = upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)
                if (upgrade) handlePurchase(upgrade)
              }}
              disabled={!balance || balance < (upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)?.cost || 0)}
              style={{
                flex: 1,
                background: (!balance || balance < (upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)?.cost || 0))
                  ? K.bone : K.ink,
                color: (!balance || balance < (upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)?.cost || 0))
                  ? K.muted : K.white,
                border: 'none',
                borderRadius: 10,
                padding: '8px 0',
                fontWeight: 600,
                cursor: (!balance || balance < (upgrades.find((u: typeof upgrades[0]) => u.id === selectedUpgrade)?.cost || 0))
                  ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Купить
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
