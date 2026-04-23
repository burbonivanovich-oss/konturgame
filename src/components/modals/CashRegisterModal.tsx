import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { CASH_REGISTER_CONFIGS } from '../../constants/cashRegisters'
import { getTotalThroughput, getRegisterSummary } from '../../services/cashRegisterEngine'
import type { CashRegisterType } from '../../types/game'
import { K } from '../design-system/tokens'

interface CashRegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

const REGISTER_TYPES: CashRegisterType[] = ['mobile', 'reliable', 'fast']

export default function CashRegisterModal({ isOpen, onClose }: CashRegisterModalProps) {
  const { balance, cashRegisters, buyCashRegister, services } = useGameStore()
  const summary = getRegisterSummary(cashRegisters)
  const totalThroughput = getTotalThroughput(cashRegisters, { services } as any)
  const totalCount = cashRegisters.reduce((s, r) => s + r.count, 0)

  const handleBuy = (type: CashRegisterType) => {
    buyCashRegister(type)
  }

  const getDiscount = (idx: number): number => {
    if (totalCount >= 2) return 15
    if (totalCount >= 1 && idx > 0) return 10
    return 0
  }

  const getEffectiveCost = (type: CashRegisterType): number => {
    const baseCost = CASH_REGISTER_CONFIGS[type].cost
    if (totalCount >= 2) return Math.round(baseCost * 0.85)
    if (totalCount >= 1) return Math.round(baseCost * 0.9)
    return baseCost
  }

  return (
    <Modal isOpen={isOpen} title="🖥️ Кассовое оборудование" onClose={onClose} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Current status */}
        {cashRegisters.length > 0 && (
          <div style={{
            background: K.bone, borderRadius: 14, padding: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, marginBottom: 4 }}>
                ТЕКУЩЕЕ ОБОРУДОВАНИЕ
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {summary.names.join(', ')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.45 }}>Пропускная</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: K.mint }}>
                {totalThroughput}/день
              </div>
            </div>
          </div>
        )}

        {/* Combo discount notice */}
        {totalCount > 0 && (
          <div style={{
            background: K.orangeSoft, borderRadius: 10, padding: '10px 14px',
            fontSize: 12, fontWeight: 600, color: K.orange,
          }}>
            🎁 Скидка на следующую кассу: {totalCount >= 2 ? '15%' : '10%'}
          </div>
        )}

        {/* Register cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REGISTER_TYPES.map((type, idx) => {
            const cfg = CASH_REGISTER_CONFIGS[type]
            const effectiveCost = getEffectiveCost(type)
            const discount = getDiscount(idx)
            const canAfford = balance >= effectiveCost
            const existing = cashRegisters.find((r) => r.type === type)

            return (
              <div key={type} style={{
                border: `1px solid ${K.line}`, borderRadius: 14, padding: 16,
                display: 'flex', alignItems: 'center', gap: 14,
                background: K.white,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: K.bone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{cfg.name}</div>
                    {existing && (
                      <div style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px',
                        borderRadius: 6, background: K.mint, color: K.white,
                      }}>
                        ×{existing.count}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.55, lineHeight: 1.4, marginBottom: 8 }}>
                    {cfg.description}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                    <div>
                      <span style={{ opacity: 0.45 }}>Пропускная: </span>
                      <span style={{ fontWeight: 700 }}>{cfg.throughput} чел/день</span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.45 }}>Отказ: </span>
                      <span style={{ fontWeight: 700 }}>{(cfg.breakdownChance * 100).toFixed(1)}%/день</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {discount > 0 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: K.mint, marginBottom: 2 }}>
                      −{discount}%
                    </div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                    {effectiveCost.toLocaleString('ru-RU')} ₽
                  </div>
                  <button
                    onClick={() => handleBuy(type)}
                    disabled={!canAfford}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
                      background: canAfford ? K.ink : K.bone,
                      color: canAfford ? K.white : K.muted,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {existing ? 'Ещё одну' : 'Купить'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontSize: 11, opacity: 0.5, textAlign: 'center', lineHeight: 1.4 }}>
          Если клиентов больше пропускной способности — выручка снижается.<br/>
          Контур.Маркет + Быстрая касса даёт бонус +25% к пропускной.
        </div>
      </div>
    </Modal>
  )
}
