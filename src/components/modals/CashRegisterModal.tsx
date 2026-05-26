import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import { K } from '../design-system/tokens'

interface CashRegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

const COMPLIANCE_COST = 24000

// Раньше было 3 типа касс с throughput-механикой, поломками и комбо-скидками.
// Теперь это compliance-шаг по 54-ФЗ: одна покупка ККТ + ФН, и всё. Сама
// касса как «развитие» удалена — она была декоративной механикой, которая
// почти не кусала, кроме как в очень узком mid-game window.
export default function CashRegisterModal({ isOpen, onClose }: CashRegisterModalProps) {
  const { balance, fiscalDriveOwned, purchaseFiscalCompliance } = useGameStore()
  const owned = !!fiscalDriveOwned
  const canAfford = balance >= COMPLIANCE_COST

  return (
    <Modal isOpen={isOpen} title="🧾 Касса по 54-ФЗ" onClose={onClose} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{
          background: owned ? K.mintSoft : K.bone,
          borderRadius: 14, padding: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: K.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>
            {owned ? '✅' : '🧾'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
              {owned ? 'Закон выполнен' : 'ККТ + Фискальный накопитель'}
            </div>
            <div style={{ fontSize: 12, color: K.muted, lineHeight: 1.45 }}>
              {owned
                ? 'У вас есть онлайн-касса и фискальный накопитель — каждый чек передаётся в ФНС через ОФД. Штрафы по 54-ФЗ вам не грозят.'
                : 'По 54-ФЗ каждая продажа должна пробиваться через онлайн-кассу с фискальным накопителем (ФН подписывает чеки электронной подписью). Без них штраф до 10 000 ₽ за каждый чек.'}
            </div>
          </div>
        </div>

        {!owned && (
          <div style={{
            border: `1px solid ${K.line}`, borderRadius: 14, padding: 16,
            display: 'flex', alignItems: 'center', gap: 14,
            background: K.white,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Купить пакет (ККТ + ФН)
              </div>
              <div style={{ fontSize: 11, color: K.muted, lineHeight: 1.4 }}>
                Одноразовая покупка. Совместимо с любым ОФД.
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {COMPLIANCE_COST.toLocaleString('ru-RU')} ₽
              </div>
              <button
                onClick={() => {
                  // Спринт 6 (UX #5): auto-close после успешной покупки.
                  // Раньше модал оставался открыт в состоянии «Закон выполнен»,
                  // требуя лишнего клика для закрытия.
                  if (purchaseFiscalCompliance()) {
                    setTimeout(onClose, 600)  // 600ms задержка чтобы успеть увидеть подтверждение
                  }
                }}
                disabled={!canAfford}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
                  background: canAfford ? K.ink : K.bone,
                  color: canAfford ? K.white : K.muted,
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Купить
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, opacity: 0.5, textAlign: 'center', lineHeight: 1.4 }}>
          Касса по закону работает только с оператором фискальных данных (ОФД).<br/>
          Подключите Контур.ОФД в Экосистеме, чтобы чеки начали уходить в ФНС.
        </div>
      </div>
    </Modal>
  )
}
