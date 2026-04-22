import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS, getUpgradesForBusiness } from '../../constants/business'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'
import { getBusinessStage, STAGE_CONFIG, getNextStage } from '../../constants/businessStages'

const SERVICE_NAMES: Record<string, string> = {
  market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

interface OperationsViewProps {
  onShowHireModal?: () => void
  onShowSupplierModal?: () => void
  onShowUpgradesModal?: () => void
}

export default function OperationsView({ onShowHireModal, onShowSupplierModal, onShowUpgradesModal }: OperationsViewProps) {
  const {
    businessType, cashRegisters, enabledCategories, services,
    buyCashRegister, toggleCategory, employees, suppliers, qualityLevel,
    fireEmployee, setActiveSupplierId, activeSupplierId, balance,
    entrepreneurEnergy, purchasedUpgrades,
  } = useGameStore()

  const config = BUSINESS_CONFIGS[businessType]
  const categories = PRODUCT_CATEGORIES[businessType] ?? []
  const state = useGameStore.getState()

  const { currentWeek, level } = useGameStore()
  const stage = getBusinessStage(currentWeek, level)
  const stageConfig = STAGE_CONFIG[stage]
  const nextStage = getNextStage(stage)
  const nextStageConfig = nextStage ? STAGE_CONFIG[nextStage] : null
  const atHireLimit = employees.length >= stageConfig.maxEmployees

  return (
    <div style={{ padding: 20, maxWidth: 640 }}>
      {/* Owner Energy */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Энергия владельца</h3>
        <div style={{
          padding: 16, borderRadius: 14, background: entrepreneurEnergy > 70 ? 'rgba(0,180,120,0.06)' : entrepreneurEnergy > 40 ? 'rgba(255,107,0,0.06)' : 'rgba(220,50,50,0.06)',
          border: `1px solid ${entrepreneurEnergy > 70 ? 'rgba(0,180,120,0.2)' : entrepreneurEnergy > 40 ? 'rgba(255,107,0,0.2)' : 'rgba(220,50,50,0.2)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.55 }}>Уровень выгорания</span>
            <span style={{
              fontSize: 20, fontWeight: 800,
              color: entrepreneurEnergy > 70 ? 'var(--k-green)' : entrepreneurEnergy > 40 ? 'var(--k-orange)' : 'var(--k-bad)',
            }}>
              {entrepreneurEnergy}%
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(14,17,22,0.1)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              width: `${entrepreneurEnergy}%`,
              height: '100%',
              background: entrepreneurEnergy > 70 ? 'var(--k-green)' : entrepreneurEnergy > 40 ? 'var(--k-orange)' : 'var(--k-bad)',
              borderRadius: 999,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
            {entrepreneurEnergy > 70 ? '✅ Полна энергии - работаете в полную силу' : entrepreneurEnergy > 40 ? '⚠️ Устаёте - энергия восстановится в конце недели' : '🔴 Выгорание - производительность снижена, срочно завершайте неделю'}
          </div>
        </div>
      </div>

      {/* Cash Registers */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Кассовые системы</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { type: 'mobile' as const, label: '📱 Mobile POS', price: 5000 },
            { type: 'reliable' as const, label: '🖥️ Надёжная касса', price: 15000 },
            { type: 'fast' as const, label: '⚡ Быстрая касса', price: 25000 },
          ].map(({ type, label, price }) => (
            <div key={type} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(14,17,22,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {cashRegisters.filter(r => r.type === type).length} шт
              </div>
              <button
                onClick={() => buyCashRegister(type)}
                style={{
                  padding: '8px 12px', borderRadius: 8, width: '100%',
                  background: 'var(--k-orange)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}
              >
                +1 ({price.toLocaleString('ru-RU')} ₽)
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 10, fontStyle: 'italic' }}>
          Каждая касса добавляет +15 клиентов в день. Без ОФД — штраф за каждый чек.
        </div>
      </div>

      {/* Assortment Categories */}
      {config.usesAssortment && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Ассортимент</h3>
            <span style={{ fontSize: 11, opacity: 0.5 }}>
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
                      ? `2px solid ${allowed ? 'var(--k-green)' : 'var(--k-orange)'}`
                      : '1px solid rgba(14,17,22,0.1)',
                    background: isEnabled
                      ? (allowed ? 'rgba(0,180,120,0.04)' : 'rgba(255,107,0,0.04)')
                      : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--k-surface)',
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
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6, lineHeight: 1.3 }}>
                        {cat.description}
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                        <span>
                          <span style={{ opacity: 0.45 }}>Выручка: </span>
                          <span style={{ fontWeight: 700, color: 'var(--k-green)' }}>
                            ~{cat.baseRevenue.toLocaleString('ru-RU')} ₽/день
                          </span>
                        </span>
                        <span>
                          <span style={{ opacity: 0.45 }}>Закупка: </span>
                          <span style={{ fontWeight: 700, color: 'var(--k-orange)' }}>
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
                                background: active ? 'var(--k-green)' : 'rgba(220,50,50,0.12)',
                                color: active ? '#fff' : '#c0392b',
                              }}>
                                {SERVICE_NAMES[sId]} {active ? '✓' : '✕'}
                              </span>
                            )
                          })}
                          {cat.requiresEgais && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: 'rgba(220,50,50,0.12)', color: '#c0392b',
                            }}>ЕГАИС</span>
                          )}
                          {cat.requiresVetCert && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px',
                              borderRadius: 5, background: 'rgba(220,50,50,0.12)', color: '#c0392b',
                            }}>Ветсертификат</span>
                          )}
                        </div>
                      )}

                      {isEnabled && !allowed && missingServices.length > 0 && (
                        <div style={{
                          marginTop: 8, fontSize: 11, fontWeight: 600,
                          color: 'var(--k-orange)',
                          background: 'rgba(255,107,0,0.08)', borderRadius: 8, padding: '6px 10px',
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
                          ? (allowed ? 'var(--k-green)' : 'var(--k-orange)')
                          : 'var(--k-surface)',
                        color: isEnabled ? '#fff' : 'var(--k-ink)',
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
          <div style={{ fontSize: 11, opacity: 0.45, marginTop: 10, textAlign: 'center' }}>
            Закупка происходит автоматически. Включайте только категории с выполненными требованиями.
          </div>
        </div>
      )}

      {/* Quality Level */}
      <div style={{ marginTop: 32, marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Качество услуг</h3>
        <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(14,17,22,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.55 }}>Уровень качества</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--k-green)' }}>{qualityLevel}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--k-surface)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${qualityLevel}%`,
              height: '100%',
              background: qualityLevel > 70 ? 'var(--k-green)' : qualityLevel > 40 ? 'var(--k-orange)' : 'var(--k-bad)',
              borderRadius: 999,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 8, lineHeight: 1.4 }}>
            ✓ Повышает репутацию и лояльность клиентов<br/>
            ✓ Зависит от уровня сотрудников и поставщика
          </div>
        </div>
      </div>

      {/* Business Stage */}
      <div style={{ marginBottom: 24, padding: '14px 16px', background: 'var(--k-surface-2)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.45, marginBottom: 4 }}>СТАДИЯ БИЗНЕСА</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{stageConfig.label}</div>
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{stageConfig.description}</div>
          </div>
          {nextStageConfig && (
            <div style={{ textAlign: 'right', fontSize: 11, opacity: 0.5 }}>
              <div>Следующая: {nextStageConfig.label}</div>
              <div>нед. {nextStageConfig.weeksMin} · ур. {nextStageConfig.levelMin}</div>
            </div>
          )}
        </div>
      </div>

      {/* Employees */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Сотрудники</h3>
          <span style={{ fontSize: 11, opacity: 0.5 }}>
            {employees.length} / {stageConfig.maxEmployees} (лимит стадии)
          </span>
        </div>

        {employees.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  borderRadius: 12, padding: 12, border: '1px solid rgba(14,17,22,0.12)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{emp.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.55 }}>
                    {emp.position} · {emp.salary.toLocaleString('ru-RU')} ₽/мес · эффективность {(emp.efficiency * 100).toFixed(0)}%
                  </div>
                </div>
                <button
                  onClick={() => fireEmployee(emp.id)}
                  style={{
                    padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: '1px solid rgba(220,50,50,0.3)', background: 'rgba(220,50,50,0.05)',
                    color: '#c0392b', cursor: 'pointer', marginLeft: 12,
                  }}
                >
                  Уволить
                </button>
              </div>
            ))}
          </div>
        )}

        {atHireLimit && (
          <div style={{ fontSize: 11, color: 'var(--k-bad)', marginBottom: 8, fontWeight: 600 }}>
            Лимит найма для стадии «{stageConfig.label}». Развивайте бизнес до «{nextStageConfig?.label ?? '—'}» для расширения команды.
          </div>
        )}
        <button
          onClick={atHireLimit ? undefined : onShowHireModal}
          disabled={atHireLimit}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--k-orange)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Нанять сотрудника
        </button>
        <div style={{ fontSize: 10, opacity: 0.45, marginTop: 10, textAlign: 'center' }}>
          Сотрудники улучшают качество и эффективность работы
        </div>
      </div>

      {/* Suppliers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Поставщик</h3>
          {suppliers.length > 0 && (
            <button
              onClick={onShowSupplierModal}
              style={{
                fontSize: 11, fontWeight: 700, padding: '6px 12px',
                borderRadius: 8, background: 'var(--k-surface)', border: 'none',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Изменить
            </button>
          )}
        </div>
        {suppliers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => setActiveSupplierId(activeSupplierId === supplier.id ? null : supplier.id)}
                style={{
                  borderRadius: 12, padding: 14,
                  border: activeSupplierId === supplier.id ? '2px solid var(--k-green)' : '1px solid rgba(14,17,22,0.12)',
                  background: activeSupplierId === supplier.id ? 'rgba(0,180,120,0.04)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{supplier.name}</div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 10, opacity: 0.6 }}>
                      <span>Качество: <span style={{ fontWeight: 700, color: supplier.qualityModifier > 0 ? 'var(--k-green)' : 'var(--k-orange)' }}>
                        {supplier.qualityModifier > 0 ? '+' : ''}{(supplier.qualityModifier * 100).toFixed(0)}%
                      </span></span>
                      <span>Цена: <span style={{ fontWeight: 700, color: supplier.priceModifier < 0 ? 'var(--k-green)' : 'var(--k-orange)' }}>
                        {supplier.priceModifier > 0 ? '+' : ''}{(supplier.priceModifier * 100).toFixed(0)}%
                      </span></span>
                      <span>Надёжность: <span style={{ fontWeight: 700 }}>{(supplier.reliability * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                  {activeSupplierId === supplier.id && (
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--k-green)', marginLeft: 12 }}>✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
            Нет доступных поставщиков
          </div>
        )}
      </div>

      {/* Upgrades */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>🔧 Улучшения</h3>
          <button
            onClick={onShowUpgradesModal}
            style={{
              fontSize: 11, fontWeight: 700, padding: '6px 12px',
              borderRadius: 8, background: 'var(--k-surface)', border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Все улучшения
          </button>
        </div>
        {getUpgradesForBusiness(businessType).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {getUpgradesForBusiness(businessType).slice(0, 4).map((upgrade) => {
              const isPurchased = purchasedUpgrades.includes(upgrade.id)
              return (
                <div
                  key={upgrade.id}
                  style={{
                    padding: 12, borderRadius: 12,
                    border: isPurchased ? '2px solid var(--k-green)' : '1px solid rgba(14,17,22,0.12)',
                    background: isPurchased ? 'rgba(0,180,120,0.04)' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{upgrade.name}</div>
                    {isPurchased && <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--k-green)' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 6, lineHeight: 1.3 }}>
                    {upgrade.effect}
                  </div>
                  {!isPurchased && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--k-orange)' }}>
                      {upgrade.cost.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
            Нет доступных улучшений
          </div>
        )}
      </div>
    </div>
  )
}
