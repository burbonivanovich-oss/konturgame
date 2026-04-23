import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS } from '../../constants/business'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'
import { getBusinessStage, STAGE_CONFIG, getNextStage } from '../../constants/businessStages'
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
  const {
    businessType, enabledCategories, services,
    toggleCategory, employees, suppliers,
    fireEmployee, setActiveSupplierId, activeSupplierId,
    currentWeek, level,
  } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]
  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const state = useGameStore.getState()

  const stage = getBusinessStage(currentWeek, level)
  const stageConfig = STAGE_CONFIG[stage]
  const nextStage = getNextStage(stage)
  const nextStageConfig = nextStage ? STAGE_CONFIG[nextStage] : null
  const atHireLimit = employees.length >= stageConfig.maxEmployees

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
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                        fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                        background: isEnabled
                          ? (allowed ? K.mint : K.orange)
                          : K.bone,
                        color: isEnabled ? K.white : K.ink,
                        transition: 'all 0.2s',
                      }}
                    >
                      {isEnabled ? 'Вкл' : 'Выкл'}
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
            Лимит найма для стадии «{stageConfig.label}». Развивайте бизнес до «{nextStageConfig?.label ?? '—'}» для расширения команды.
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

      {/* Suppliers */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase', marginBottom: 12 }}>ПОСТАВЩИК</div>
        {suppliers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suppliers.map((supplier) => {
              const isActive = activeSupplierId === supplier.id
              return (
                <div
                  key={supplier.id}
                  onClick={() => { if (!isActive) setActiveSupplierId(supplier.id) }}
                  style={{
                    borderRadius: 12, padding: 14,
                    border: isActive ? `2px solid ${K.mint}` : `1px solid ${K.line}`,
                    background: isActive ? K.mintSoft : K.white,
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{supplier.name}</div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 10, color: K.muted }}>
                        <span>Качество: <span style={{ fontWeight: 700, color: supplier.qualityModifier > 0 ? K.good : K.warn }}>
                          {supplier.qualityModifier > 0 ? '+' : ''}{(supplier.qualityModifier * 100).toFixed(0)}%
                        </span></span>
                        <span>Цена: <span style={{ fontWeight: 700, color: supplier.priceModifier < 0 ? K.good : K.warn }}>
                          {supplier.priceModifier > 0 ? '+' : ''}{(supplier.priceModifier * 100).toFixed(0)}%
                        </span></span>
                        <span>Надёжность: <span style={{ fontWeight: 700 }}>{(supplier.reliability * 100).toFixed(0)}%</span></span>
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ fontSize: 12, fontWeight: 800, color: K.mint, marginLeft: 12 }}>✓ Активен</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: K.muted }}>
            Нет доступных поставщиков
          </div>
        )}
      </div>

    </div>
  )
}
