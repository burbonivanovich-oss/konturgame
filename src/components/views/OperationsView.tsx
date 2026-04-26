import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS, UPGRADES_CONFIG } from '../../constants/business'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'
import { getCurrentTier, getNextTier } from '../../services/economyEngine'
import { ONBOARDING_STAGES } from '../../constants/onboarding'
import CashRegisterModal from '../modals/CashRegisterModal'
import { K } from '../design-system/tokens'

const SERVICE_NAMES: Record<string, string> = {
  market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

const POSITION_LABELS: Record<string, string> = {
  cashier: 'Кассир',
  assistant: 'Помощник',
  manager: 'Управляющий',
  specialist: 'Специалист',
  supervisor: 'Супервайзер',
  trainer: 'Тренер',
}

interface OperationsViewProps {
  onShowHireModal?: () => void
}

export default function OperationsView({ onShowHireModal }: OperationsViewProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const {
    businessType, enabledCategories, services,
    toggleCategory, employees,
    fireEmployee,
    currentWeek, level,
    cashRegisters,
    onboardingStage, onboardingStepIndex, onboardingCompleted,
  } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]
  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const state = useGameStore.getState()

  const stageConfig = getCurrentTier(state)
  const nextStageConfig = getNextTier(state)
  const atHireLimit = employees.length >= stageConfig.maxEmployees

  // Pulse the "Купить кассу" button when onboarding asks for buy_register
  const isRegisterTargeted = (() => {
    if (onboardingCompleted) return false
    const stage = ONBOARDING_STAGES[onboardingStage as 0|1|2|3|4]
    if (!stage) return false
    const step = stage.steps[onboardingStepIndex ?? 0]
    return step?.requiresAction === 'buy_register' && (cashRegisters?.length ?? 0) === 0
  })()

  const totalRegisters = (cashRegisters ?? []).reduce((s, r) => s + r.count, 0)

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 20,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Page header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>УПРАВЛЕНИЕ</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Операции</div>
      </div>

      {/* Cash registers — needed for legal POS, onboarding-targeted at stage 1 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>КАССЫ</div>
          <span style={{ fontSize: 11, color: K.muted }}>
            {totalRegisters > 0 ? `${totalRegisters} установлено` : 'не установлено'}
          </span>
        </div>
        <div style={{
          background: K.white, border: `1px solid ${K.line}`,
          borderRadius: 14, padding: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: K.bone, color: K.ink,
            display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0,
          }}>
            🧾
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: K.ink }}>
              {totalRegisters === 0 ? 'Касса не установлена' : `Касс: ${totalRegisters}`}
            </div>
            <div style={{ fontSize: 12, color: K.muted, marginTop: 2 }}>
              {totalRegisters === 0
                ? 'Без кассы продажи нелегальны — штрафы ФНС'
                : 'Хотите больше пропускной способности? Добавьте ещё.'}
            </div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className={isRegisterTargeted ? 'nav-pulse' : undefined}
            style={{
              padding: '11px 18px', borderRadius: 10, border: 'none',
              background: isRegisterTargeted ? K.orange : totalRegisters === 0 ? K.ink : K.bone,
              color: isRegisterTargeted || totalRegisters === 0 ? K.white : K.ink,
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
              outline: isRegisterTargeted ? `2px solid ${K.orange}` : 'none',
              boxShadow: isRegisterTargeted ? '0 2px 8px rgba(255,107,0,0.35)' : 'none',
            }}
          >
            {totalRegisters === 0 ? 'Купить кассу' : 'Купить ещё'}
          </button>
        </div>
      </div>

      <CashRegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />

      {/* Assortment Categories */}
      {config.usesAssortment && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>АССОРТИМЕНТ</div>
            <span style={{ fontSize: 11, color: K.muted }}>
              {enabledCategories.length}/{categories.length} активных
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categories.map(cat => {
              const isEnabled = enabledCategories.includes(cat.id)
              const allowed = isCategoryAllowed(cat, state)
              const missingServices = cat.requiredServices.filter(
                sId => !services?.[sId]?.isActive
              )
              const purchasedSet = new Set(state.purchasedUpgrades ?? [])
              const upgradesList = UPGRADES_CONFIG[businessType] ?? []
              const missingUpgrades = (cat.requiredUpgradeIds ?? []).filter(u => !purchasedSet.has(u))
              const upgradeName = (id: string) => upgradesList.find(u => u.id === id)?.name ?? id

              return (
                <div
                  key={cat.id}
                  style={{
                    borderRadius: 14, padding: 14,
                    border: isEnabled
                      ? `2px solid ${allowed ? K.mint : K.orange}`
                      : `1px solid ${K.line}`,
                    background: isEnabled
                      ? (allowed ? K.mintSoft : K.orangeSoft)
                      : K.white,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: K.bone,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {cat.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                          background: 'rgba(0,0,0,0.07)',
                        }}>
                          +{Math.round(cat.margin * 100)}% маржа
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: K.muted, marginBottom: 6, lineHeight: 1.3 }}>
                        {cat.description}
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                        <span>
                          <span style={{ color: K.muted }}>Выручка: </span>
                          <span style={{ fontWeight: 700, color: K.good }}>
                            ~{cat.baseRevenue.toLocaleString('ru-RU')} ₽/день
                          </span>
                        </span>
                        <span>
                          <span style={{ color: K.muted }}>Закупка: </span>
                          <span style={{ fontWeight: 700, color: K.orange }}>
                            {cat.dailyCost.toLocaleString('ru-RU')} ₽/день
                          </span>
                        </span>
                      </div>

                      {/* Required services */}
                      {cat.requiredServices.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                          {cat.requiredServices.map(sId => {
                            const active = services?.[sId]?.isActive
                            return (
                              <span key={sId} style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                                background: active ? K.mint : `${K.bad}1F`,
                                color: active ? K.white : K.bad,
                              }}>
                                {SERVICE_NAMES[sId]} {active ? '✓' : '✕'}
                              </span>
                            )
                          })}
                          {(cat.requiredUpgradeIds ?? []).map(uId => {
                            const owned = purchasedSet.has(uId)
                            return (
                              <span key={uId} style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                                background: owned ? K.mint : `${K.bad}1F`,
                                color: owned ? K.white : K.bad,
                              }}>
                                {upgradeName(uId)} {owned ? '✓' : '✕'}
                              </span>
                            )
                          })}
                          {cat.requiresEgais && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: `${K.bad}1F`, color: K.bad,
                            }}>ЕГАИС</span>
                          )}
                          {cat.requiresVetCert && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: `${K.bad}1F`, color: K.bad,
                            }}>Ветсертификат</span>
                          )}
                        </div>
                      )}

                      {/* Lock reason hint when category not yet usable */}
                      {!allowed && (missingServices.length > 0 || missingUpgrades.length > 0) && (
                        <div style={{
                          marginTop: 8, fontSize: 11, fontWeight: 600,
                          color: K.muted,
                          padding: '6px 10px', borderRadius: 6,
                          background: K.bone,
                        }}>
                          🔒 Заблокировано: нужно {[
                            ...missingServices.map(s => `Контур.${SERVICE_NAMES[s]}`),
                            ...missingUpgrades.map(upgradeName),
                          ].join(', ')}
                        </div>
                      )}

                      {isEnabled && !allowed && missingServices.length > 0 && (
                        <div style={{
                          marginTop: 8, fontSize: 11, fontWeight: 600,
                          color: K.orange,
                          background: K.orangeSoft, borderRadius: 8, padding: '6px 10px',
                        }}>
                          ⚠️ Штраф 10% без: {missingServices.map(s => SERVICE_NAMES[s]).join(', ')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => allowed && toggleCategory(cat.id)}
                      disabled={!allowed && !isEnabled}
                      style={{
                        flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                        fontSize: 12, fontWeight: 700, border: 'none',
                        cursor: !allowed && !isEnabled ? 'not-allowed' : 'pointer',
                        background: isEnabled
                          ? (allowed ? K.mint : K.orange)
                          : K.bone,
                        color: isEnabled ? K.white : (!allowed ? K.muted : K.ink),
                        opacity: !allowed && !isEnabled ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {!allowed && !isEnabled ? '🔒' : isEnabled ? 'Вкл' : 'Выкл'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: K.muted, marginTop: 10, textAlign: 'center' }}>
            Закупка происходит автоматически. Включайте только категории с выполненными требованиями.
          </div>
        </div>
      )}

      {/* Employees */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>СОТРУДНИКИ</div>
          <span style={{ fontSize: 11, color: K.muted }}>
            {employees.length} / {stageConfig.maxEmployees} (лимит стадии)
          </span>
        </div>

        {employees.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  borderRadius: 12, padding: 12,
                  background: K.white, border: `1px solid ${K.line}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{emp.name}</div>
                  <div style={{ fontSize: 10, color: K.muted }}>
                    {POSITION_LABELS[emp.position] ?? emp.position} · {emp.salary.toLocaleString('ru-RU')} ₽/мес · эффективность {(emp.efficiency * 100).toFixed(0)}%
                  </div>
                </div>
                <button
                  onClick={() => fireEmployee(emp.id)}
                  style={{
                    padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: `1px solid ${K.bad}`,
                    background: `${K.bad}1A`,
                    color: K.bad, cursor: 'pointer', marginLeft: 12,
                  }}
                >
                  Уволить
                </button>
              </div>
            ))}
          </div>
        )}

        {atHireLimit && (
          <div style={{ fontSize: 11, color: K.bad, marginBottom: 8, fontWeight: 600 }}>
            Лимит найма для уровня «{stageConfig.name}». Перейдите на «{nextStageConfig?.name ?? '—'}» для расширения команды.
          </div>
        )}
        <button
          onClick={atHireLimit ? undefined : onShowHireModal}
          disabled={atHireLimit}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: K.ink, color: K.white,
            border: 'none', cursor: atHireLimit ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 700,
            opacity: atHireLimit ? 0.5 : 1,
          }}
        >
          + Нанять сотрудника
        </button>
        <div style={{ fontSize: 10, color: K.muted, marginTop: 10, textAlign: 'center' }}>
          Сотрудники улучшают качество и эффективность работы
        </div>
      </div>


    </div>
  )
}
