import { useGameStore } from '../../stores/gameStore'
import { BUSINESS_CONFIGS, getUpgradesForBusiness } from '../../constants/business'
import { PRODUCT_CATEGORIES, isCategoryAllowed } from '../../services/assortmentEngine'
import { getBusinessStage, STAGE_CONFIG, getNextStage } from '../../constants/businessStages'
import { OWNER_INVESTMENTS_MAP, type OwnerInvestmentId } from '../../constants/ownerInvestments'
import { K } from '../design-system/tokens'

const SERVICE_NAMES: Record<string, string> = {
  market: 'Маркет', bank: 'Банк', ofd: 'ОФД',
  diadoc: 'Диадок', fokus: 'Фокус', elba: 'Эльба', extern: 'Экстерн',
}

interface OperationsViewProps {
  onShowHireModal?: () => void
  onShowSupplierModal?: () => void
  onShowUpgradesModal?: () => void
  onOpenOwnerInvestments?: () => void
}

export default function OperationsView({ onShowHireModal, onShowSupplierModal, onShowUpgradesModal, onOpenOwnerInvestments }: OperationsViewProps) {
  const {
    businessType, cashRegisters, enabledCategories, services,
    buyCashRegister, toggleCategory, employees, suppliers, qualityLevel,
    fireEmployee, setActiveSupplierId, activeSupplierId, balance,
    entrepreneurEnergy, purchasedUpgrades, purchasedOwnerItems, ownerSubscriptions,
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
    <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Owner Energy */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Энергия владельца</div>
        <div style={{
          padding: 16, borderRadius: 14,
          background: K.white,
          border: `1px solid ${entrepreneurEnergy > 70 ? K.mint : entrepreneurEnergy > 40 ? K.warn : K.bad}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.muted }}>Уровень выгорания</span>
            <span style={{
              fontSize: 20, fontWeight: 800,
              color: entrepreneurEnergy > 70 ? K.mint : entrepreneurEnergy > 40 ? K.warn : K.bad,
            }}>
              {entrepreneurEnergy}%
            </span>
          </div>
          <div style={{ height: 8, background: K.lineSoft, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              width: `${entrepreneurEnergy}%`,
              height: '100%',
              background: entrepreneurEnergy > 70 ? K.mint : entrepreneurEnergy > 40 ? K.warn : K.bad,
              borderRadius: 999,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 11, color: K.muted, lineHeight: 1.4 }}>
            {entrepreneurEnergy > 70 ? '✅ Полна энергии - работаете в полную силу' : entrepreneurEnergy > 40 ? '⚠️ Устаёте - энергия восстановится в конце недели' : '🔴 Выгорание - производительность снижена, срочно завершайте неделю'}
          </div>
        </div>
      </div>

      {/* Owner Investments status */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Инвестиции в себя</div>
          <button
            onClick={onOpenOwnerInvestments}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: K.violet, color: K.white, border: 'none', cursor: 'pointer',
            }}
          >
            + Купить
          </button>
        </div>

        {(() => {
          const permanentItems = (purchasedOwnerItems ?? [])
            .map(id => OWNER_INVESTMENTS_MAP[id as OwnerInvestmentId])
            .filter(Boolean)
          const activeSubs = (ownerSubscriptions ?? [])
            .map(sub => ({ config: OWNER_INVESTMENTS_MAP[sub.id as keyof typeof OWNER_INVESTMENTS_MAP], weeksLeft: sub.weeksLeft }))
            .filter(s => s.config)

          if (permanentItems.length === 0 && activeSubs.length === 0) {
            return (
              <div style={{
                padding: 14, borderRadius: 12, border: `1px dashed ${K.line}`,
                fontSize: 12, color: K.muted, textAlign: 'center',
              }}>
                Нет активных инвестиций · покупки помогают восстанавливать энергию быстрее
              </div>
            )
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {permanentItems.map(item => (
                <div key={item.id} style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: K.mintSoft, border: `1px solid ${K.mint}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: K.muted }}>{item.description}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                    background: K.mint, color: K.white,
                  }}>ПОСТОЯННО</span>
                </div>
              ))}
              {activeSubs.map(({ config: item, weeksLeft }) => (
                <div key={item.id} style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: K.orangeSoft, border: `1px solid ${K.orange}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: K.muted }}>{item.description}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                    background: K.orange, color: K.white,
                  }}>ещё {weeksLeft} нед.</span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Cash Registers */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Кассовые системы</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { type: 'mobile' as const, label: '📱 Mobile POS', price: 5000 },
            { type: 'reliable' as const, label: '🖥️ Надёжная касса', price: 15000 },
            { type: 'fast' as const, label: '⚡ Быстрая касса', price: 25000 },
          ].map(({ type, label, price }) => (
            <div key={type} style={{ padding: 12, borderRadius: 12, background: K.white, border: `1px solid ${K.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: K.muted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                {cashRegisters.filter(r => r.type === type).length} шт
              </div>
              <button
                onClick={() => buyCashRegister(type)}
                style={{
                  padding: '8px 12px', borderRadius: 8, width: '100%',
                  background: K.ink, color: K.white,
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}
              >
                +1 ({price.toLocaleString('ru-RU')} ₽)
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: K.muted, marginTop: 10, fontStyle: 'italic' }}>
          Каждая касса добавляет +15 клиентов в день. Без ОФД — штраф за каждый чек.
        </div>
      </div>

      {/* Assortment Categories */}
      {config.usesAssortment && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Ассортимент</div>
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

      {/* Quality Level */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Качество услуг</div>
        <div style={{ padding: 16, borderRadius: 14, background: K.white, border: `1px solid ${K.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.muted }}>Уровень качества</span>
            <span style={{
              fontSize: 20, fontWeight: 800,
              color: qualityLevel > 70 ? K.mint : qualityLevel > 40 ? K.warn : K.bad,
            }}>{qualityLevel}%</span>
          </div>
          <div style={{ height: 8, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${qualityLevel}%`,
              height: '100%',
              background: qualityLevel > 70 ? K.mint : qualityLevel > 40 ? K.warn : K.bad,
              borderRadius: 999,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: K.muted, marginTop: 8, lineHeight: 1.4 }}>
            ✓ Повышает репутацию и лояльность клиентов<br/>
            ✓ Зависит от уровня сотрудников и поставщика
          </div>
        </div>
      </div>

      {/* Business Stage */}
      <div style={{ padding: '14px 16px', background: K.bone, borderRadius: 12, border: `1px solid ${K.lineSoft}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: K.muted, marginBottom: 4, textTransform: 'uppercase' }}>СТАДИЯ БИЗНЕСА</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{stageConfig.label}</div>
            <div style={{ fontSize: 11, color: K.muted, marginTop: 2 }}>{stageConfig.description}</div>
          </div>
          {nextStageConfig && (
            <div style={{ textAlign: 'right', fontSize: 11, color: K.muted }}>
              <div>Следующая: {nextStageConfig.label}</div>
              <div>нед. {nextStageConfig.weeksMin} · ур. {nextStageConfig.levelMin}</div>
            </div>
          )}
        </div>
      </div>

      {/* Employees */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Сотрудники</div>
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
                    {emp.position} · {emp.salary.toLocaleString('ru-RU')} ₽/мес · эффективность {(emp.efficiency * 100).toFixed(0)}%
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
            border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Нанять сотрудника
        </button>
        <div style={{ fontSize: 10, color: K.muted, marginTop: 10, textAlign: 'center' }}>
          Сотрудники улучшают качество и эффективность работы
        </div>
      </div>

      {/* Suppliers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Поставщик</div>
          {suppliers.length > 0 && (
            <button
              onClick={onShowSupplierModal}
              style={{
                fontSize: 11, fontWeight: 700, padding: '6px 12px',
                borderRadius: 8, background: K.bone, border: `1px solid ${K.line}`,
                color: K.ink, cursor: 'pointer', transition: 'all 0.2s',
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
                  border: activeSupplierId === supplier.id ? `2px solid ${K.mint}` : `1px solid ${K.line}`,
                  background: activeSupplierId === supplier.id ? K.mintSoft : K.white,
                  cursor: 'pointer',
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
                  {activeSupplierId === supplier.id && (
                    <span style={{ fontSize: 12, fontWeight: 800, color: K.mint, marginLeft: 12 }}>✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: K.muted }}>
            Нет доступных поставщиков
          </div>
        )}
      </div>

      {/* Upgrades */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>🔧 Улучшения</div>
          <button
            onClick={onShowUpgradesModal}
            style={{
              fontSize: 11, fontWeight: 700, padding: '6px 12px',
              borderRadius: 8, background: K.bone, border: `1px solid ${K.line}`,
              color: K.ink, cursor: 'pointer', transition: 'all 0.2s',
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
                    border: isPurchased ? `2px solid ${K.mint}` : `1px solid ${K.line}`,
                    background: isPurchased ? K.mintSoft : K.white,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{upgrade.name}</div>
                    {isPurchased && <span style={{ fontSize: 12, fontWeight: 800, color: K.mint }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 10, color: K.muted, marginBottom: 6, lineHeight: 1.3 }}>
                    {upgrade.effect}
                  </div>
                  {!isPurchased && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: K.orange }}>
                      {upgrade.cost.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: K.muted }}>
            Нет доступных улучшений
          </div>
        )}
      </div>
    </div>
  )
}
