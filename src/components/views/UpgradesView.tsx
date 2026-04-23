import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { getUpgradesForBusiness } from '../../constants/business'
import { K } from '../design-system/tokens'

export default function UpgradesView() {
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
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 20,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Page header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>УЛУЧШЕНИЯ</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Расширение возможностей</div>
      </div>

      {/* Upgrades grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13, color: K.ink2, lineHeight: 1.6 }}>
          Покупайте улучшения, чтобы расширить возможности вашего {businessType === 'shop' ? 'магазина' : businessType === 'cafe' ? 'кафе' : 'салона'}.
          Каждое улучшение добавляет постоянные бонусы к производительности и комфорту работы.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {upgrades.map((upgrade) => {
            const isPurchased = purchasedUpgrades.includes(upgrade.id)
            const canAfford = balance >= upgrade.cost
            const isSelected = selectedUpgrade === upgrade.id

            return (
              <div
                key={upgrade.id}
                onClick={() => !isPurchased && setSelectedUpgrade(upgrade.id)}
                style={{
                  background: isPurchased ? K.mintSoft : isSelected ? K.violetSoft : K.white,
                  border: isPurchased
                    ? `1.5px solid ${K.mint}`
                    : isSelected
                    ? `1.5px solid ${K.violet}`
                    : `1px solid ${K.line}`,
                  borderRadius: 12,
                  padding: 16,
                  cursor: isPurchased ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{upgrade.name}</span>
                  {isPurchased && <span style={{ fontSize: 18, color: K.mint }}>✓</span>}
                </div>

                <p style={{ fontSize: 12, color: K.ink2, margin: 0, lineHeight: 1.4 }}>
                  {upgrade.effect}
                </p>

                {!isPurchased && (
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: canAfford ? K.orange : K.bad,
                    marginTop: 'auto',
                  }}>
                    {upgrade.cost.toLocaleString('ru-RU')} ₽
                  </div>
                )}

                {isSelected && !isPurchased && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchase(upgrade)
                    }}
                    disabled={!canAfford}
                    style={{
                      background: canAfford ? K.ink : K.bone,
                      color: canAfford ? K.white : K.muted,
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontWeight: 600,
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      fontSize: 12,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (canAfford) e.currentTarget.style.opacity = '0.85'
                    }}
                    onMouseLeave={(e) => {
                      if (canAfford) e.currentTarget.style.opacity = '1'
                    }}
                  >
                    Купить сейчас
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {upgrades.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: K.muted }}>
            Нет доступных улучшений для этого типа бизнеса
          </div>
        )}
      </div>
    </div>
  )
}
