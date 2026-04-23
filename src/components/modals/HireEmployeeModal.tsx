import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { EmployeePosition } from '../../types/game'
import { K } from '../design-system/tokens'

const EMPLOYEE_POSITIONS: Array<{ id: EmployeePosition; label: string; baseSalary: number }> = [
  { id: 'cashier', label: '💳 Кассир', baseSalary: 45000 },
  { id: 'assistant', label: '🛍️ Помощник', baseSalary: 50000 },
  { id: 'manager', label: '👔 Менеджер', baseSalary: 75000 },
  { id: 'specialist', label: '🎓 Специалист', baseSalary: 70000 },
  { id: 'supervisor', label: '🔝 Супервайзер', baseSalary: 90000 },
  { id: 'trainer', label: '📚 Тренер', baseSalary: 85000 },
]

interface HireEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HireEmployeeModal({ isOpen, onClose }: HireEmployeeModalProps) {
  const { balance, hireEmployee, employees } = useGameStore()
  const [selectedPosition, setSelectedPosition] = useState<EmployeePosition>('cashier')

  const selectedData = EMPLOYEE_POSITIONS.find(p => p.id === selectedPosition)
  const canAfford = balance >= (selectedData?.baseSalary ?? 0)

  const handleHire = () => {
    if (canAfford && selectedData) {
      hireEmployee(selectedPosition, `${selectedData.label.split(' ')[1]} #${employees.length + 1}`, selectedData.baseSalary)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} title="Нанять сотрудника" onClose={onClose}>
      <div style={{ maxWidth: 500 }}>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 12 }}>
            Должность
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {EMPLOYEE_POSITIONS.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setSelectedPosition(pos.id)}
                style={{
                  padding: 12, borderRadius: 10,
                  border: selectedPosition === pos.id ? `2px solid ${K.orange}` : `1px solid ${K.line}`,
                  background: selectedPosition === pos.id ? K.orangeSoft : K.white,
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {selectedData && (
          <>
            <div style={{
              padding: 14, borderRadius: 12, background: K.bone,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, marginBottom: 8 }}>
                Зарплата в месяц
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: K.orange, fontVariantNumeric: 'tabular-nums' }}>
                {selectedData.baseSalary.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 8 }}>
                ≈ {(selectedData.baseSalary / 30).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽/день
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: K.bone, marginBottom: 20 }}>
              <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
                ✓ Повышает эффективность работы<br/>
                ✓ Влияет на уровень качества<br/>
                ✓ Требует зарплату каждый месяц
              </div>
            </div>

            <button
              onClick={handleHire}
              disabled={!canAfford}
              style={{
                width: '100%', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 700,
                border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
                background: canAfford ? K.ink : K.bone,
                color: canAfford ? K.white : K.muted,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => canAfford && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {canAfford ? `Нанять за ${selectedData.baseSalary.toLocaleString('ru-RU')} ₽` : 'Недостаточно средств'}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
