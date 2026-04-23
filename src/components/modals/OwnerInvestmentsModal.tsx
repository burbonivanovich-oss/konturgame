import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { OWNER_INVESTMENTS } from '../../constants/ownerInvestments'
import type { OwnerInvestmentId } from '../../constants/ownerInvestments'
import { ECONOMY_CONSTANTS } from '../../constants/business'
import { K } from '../design-system/tokens'

interface OwnerInvestmentsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OwnerInvestmentsModal({ isOpen, onClose }: OwnerInvestmentsModalProps) {
  const {
    balance, entrepreneurEnergy, purchasedOwnerItems, ownerSubscriptions, purchaseOwnerInvestment,
  } = useGameStore()

  const maxEnergy = ECONOMY_CONSTANTS.MAX_ENTREPRENEURIAL_ENERGY
  const energyPct = Math.round((entrepreneurEnergy / maxEnergy) * 100)
  const isLow = entrepreneurEnergy < 40

  const handleBuy = (id: OwnerInvestmentId) => {
    purchaseOwnerInvestment(id)
  }

  return (
    <Modal isOpen={isOpen} title="⚡ Восстановление энергии" onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Energy status */}
        <div style={{
          background: isLow ? `rgba(${parseInt(K.bad.slice(1,3),16)},${parseInt(K.bad.slice(3,5),16)},${parseInt(K.bad.slice(5,7),16)},0.08)` : K.bone,
          border: isLow ? `1.5px solid ${K.bad}` : '1px solid transparent',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
            <span>Энергия предпринимателя</span>
            <span style={{ color: isLow ? K.bad : K.mint }}>
              {entrepreneurEnergy} / {maxEnergy}
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${energyPct}%`,
              background: isLow ? K.bad : K.mint,
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>
          {isLow && (
            <div style={{ fontSize: 11, color: K.bad, marginTop: 6, fontWeight: 600 }}>
              Низкая энергия снижает эффективность бизнеса на 10–20%
            </div>
          )}
        </div>

        {/* Investment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OWNER_INVESTMENTS.map(item => {
            const isPermanentBought = item.type === 'permanent' && (purchasedOwnerItems ?? []).includes(item.id)
            const activeSub = (ownerSubscriptions ?? []).find(s => s.id === item.id)
            const canAfford = balance >= item.cost
            const disabled = isPermanentBought || !canAfford

            let statusLabel = ''
            if (isPermanentBought) statusLabel = '✓ Куплено'
            else if (activeSub) statusLabel = `Активно (${activeSub.weeksLeft} нед.)`

            return (
              <div key={item.id} style={{
                background: K.bone,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: isPermanentBought ? 0.6 : 1,
              }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                    {item.name}
                    {statusLabel && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: K.good, opacity: 0.8 }}>
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
                    {item.cost.toLocaleString('ru')}₽
                  </div>
                  <button
                    disabled={disabled}
                    onClick={() => handleBuy(item.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 12, fontWeight: 700,
                      background: isPermanentBought ? K.bone : canAfford ? K.ink : K.bone,
                      color: isPermanentBought ? K.muted : canAfford ? K.white : K.muted,
                      opacity: disabled ? 0.7 : 1,
                    }}
                  >
                    {isPermanentBought ? 'Куплено' : canAfford ? 'Купить' : 'Нет денег'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontSize: 11, opacity: 0.45, textAlign: 'center' }}>
          Баланс: {balance.toLocaleString('ru')}₽ · Покупки вычитаются из баланса немедленно
        </div>
      </div>
    </Modal>
  )
}
