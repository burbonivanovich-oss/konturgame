import { useState } from 'react'
import Modal from './Modal'
import { useGameStore } from '../../stores/gameStore'
import type { EmployeePosition } from '../../types/game'

const EMPLOYEE_POSITIONS: Array<{ id: EmployeePosition; label: string; baseSalary: number }> = [
  { id: 'cashier', label: '💳 Кассир', baseSalary: 15000 },
  { id: 'assistant', label: '🛍️ Помощник', baseSalary: 12000 },
  { id: 'manager', label: '👔 Менеджер', baseSalary: 25000 },
  { id: 'specialist', label: '🎓 Специалист', baseSalary: 30000 },
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Нанять сотрудника</h2>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 12 }}>
            Должность
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {EMPLOYEE_POSITIONS.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setSelectedPosition(pos.id)}
                style={{
                  padding: 12, borderRadius: 10,
                  border: selectedPosition === pos.id ? '2px solid var(--k-orange)' : '1px solid rgba(14,17,22,0.12)',
                  background: selectedPosition === pos.id ? 'rgba(255,107,0,0.08)' : '#fff',
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
              padding: 14, borderRadius: 12, background: 'var(--k-surface)',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, marginBottom: 8 }}>
                Зарплата в месяц
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--k-orange)' }} className="k-num">
                {selectedData.baseSalary.toLocaleString('ru-RU')} ₽
              </div>
              <div style={{ fontSize: 10, opacity: 0.5, marginTop: 8 }}>
                ≈ {(selectedData.baseSalary / 30).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽/день
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(14,17,22,0.04)', marginBottom: 20 }}>
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
                background: canAfford ? 'var(--k-green)' : 'rgba(14,17,22,0.08)',
                color: canAfford ? '#fff' : 'var(--k-ink-50)',
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
