import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import {
  AD_CAMPAIGNS_CONFIG, MAX_ACTIVE_CAMPAIGNS, CAMPAIGN_DIMINISHING_FACTORS,
  getUpgradesForBusiness,
} from '../../constants/business'
import { getCampaignStats } from '../../services/weekCalculator'
import { getCurrentTier, getNextTier, canUpgradeTier } from '../../services/economyEngine'
import { getDimensionStatus } from '../../services/businessHealth'
import { K } from '../design-system/tokens'

type DevTab = 'marketing' | 'upgrades' | 'tier' | 'roi'

export function DevelopmentView() {
  const [tab, setTab] = useState<DevTab>('marketing')

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>РОСТ</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Развитие</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${K.line}` }}>
        {([
          { id: 'tier',      label: 'Уровень бизнеса' },
          { id: 'marketing', label: 'Реклама' },
          { id: 'upgrades',  label: 'Улучшения' },
          { id: 'roi',       label: 'ROI кампаний' },
        ] as { id: DevTab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700,
              color: tab === t.id ? K.ink : K.muted,
              borderBottom: tab === t.id ? `2px solid ${K.ink}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tier'      && <TierSection />}
      {tab === 'marketing' && <MarketingSection />}
      {tab === 'upgrades'  && <UpgradesSection />}
      {tab === 'roi'       && <RoiSection />}
    </div>
  )
}

function TierSection() {
  const upgradeBusinessTier = useGameStore(s => s.upgradeBusinessTier)
  const state = useGameStore.getState()
  const current = getCurrentTier(state)
  const next = getNextTier(state)
  const check = canUpgradeTier(state)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpgrade = () => {
    setError(null)
    setSuccess(null)
    const r = upgradeBusinessTier()
    if (r.ok) {
      setSuccess(`Поздравляем! Теперь это ${getCurrentTier(useGameStore.getState()).name}.`)
    } else {
      setError(r.reason ?? 'Не удалось')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Current tier card */}
      <div style={{
        background: K.bone, border: `1px solid ${K.lineSoft}`,
        borderRadius: 14, padding: 18,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
          ТЕКУЩИЙ УРОВЕНЬ · T{current.level}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{current.icon}</span>
          {current.name}
        </div>
        <div style={{ fontSize: 13, color: K.ink2, marginTop: 6, lineHeight: 1.5 }}>
          {current.description}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8, marginTop: 14,
        }}>
          {[
            { label: 'Клиенты', v: current.multipliers.clients },
            { label: 'Чек', v: current.multipliers.check },
            { label: 'Аренда', v: current.multipliers.rent },
            { label: 'З/п', v: current.multipliers.baseSalary },
            { label: 'Зал', v: current.multipliers.capacity },
          ].map(m => (
            <div key={m.label} style={{
              background: K.white, borderRadius: 8, padding: '6px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: K.ink }}>×{m.v.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next tier */}
      {next ? (
        <div style={{
          background: K.white, border: `1px solid ${K.line}`,
          borderRadius: 14, padding: 18,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
            СЛЕДУЮЩИЙ УРОВЕНЬ · T{next.level}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{next.icon}</span>
            {next.name}
          </div>
          <div style={{ fontSize: 13, color: K.ink2, marginTop: 6, lineHeight: 1.5 }}>
            {next.description}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8, marginTop: 14,
          }}>
            {[
              { label: 'Клиенты', v: next.multipliers.clients },
              { label: 'Чек', v: next.multipliers.check },
              { label: 'Аренда', v: next.multipliers.rent },
              { label: 'З/п', v: next.multipliers.baseSalary },
              { label: 'Зал', v: next.multipliers.capacity },
            ].map(m => (
              <div key={m.label} style={{
                background: K.bone, borderRadius: 8, padding: '6px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: K.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: m.v >= 1 ? K.mint : K.muted }}>
                  ×{m.v.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Requirement met={state.currentWeek >= next.unlockWeek}
              label={`Неделя ${next.unlockWeek}+`}
              actual={`сейчас ${state.currentWeek}`} />
            <Requirement met={state.balance >= next.unlockBalance}
              label={`Оборот от ${next.unlockBalance.toLocaleString('ru-RU')} ₽`}
              actual={`${state.balance.toLocaleString('ru-RU')} ₽`} />
            {(() => {
              const repStatus = getDimensionStatus(state.reputation)
              return (
                <Requirement met={state.reputation >= next.unlockReputation}
                  label="Прочная репутация"
                  actual={repStatus.label} />
              )
            })()}
            {next.unlockQuality !== undefined && (() => {
              const qualStatus = getDimensionStatus(state.qualityLevel ?? 0)
              return (
                <Requirement met={(state.qualityLevel ?? 0) >= next.unlockQuality}
                  label="Качество держится"
                  actual={qualStatus.label} />
              )
            })()}
            <Requirement met={state.balance >= next.upgradeCost}
              label={`Стоимость апгрейда: ${next.upgradeCost.toLocaleString('ru-RU')} ₽`}
              actual={state.balance >= next.upgradeCost ? 'хватает' : 'не хватает'} />
          </div>

          <button
            disabled={!check.ok}
            onClick={handleUpgrade}
            style={{
              marginTop: 16, width: '100%',
              padding: '14px 18px', borderRadius: 12,
              background: check.ok ? K.ink : K.lineSoft,
              color: check.ok ? K.white : K.muted,
              border: 'none', fontSize: 14, fontWeight: 800,
              cursor: check.ok ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}
          >
            {check.ok ? `Перейти на «${next.name}» за ${next.upgradeCost.toLocaleString('ru-RU')} ₽` : (check.reason ?? 'Недоступно')}
          </button>
          {error && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#c0392b' }}>{error}</div>
          )}
          {success && (
            <div style={{ marginTop: 8, fontSize: 12, color: K.mint, fontWeight: 700 }}>{success}</div>
          )}
        </div>
      ) : (
        <div style={{
          background: K.mintSoft, border: `1px solid ${K.mint}`,
          borderRadius: 14, padding: 18, color: K.mintInk,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>🏆 Достигнут максимальный уровень</div>
          <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            Ваш бизнес работает в самой крупной форме. Дальше — масштабироваться можно только сетью.
          </div>
        </div>
      )}
    </div>
  )
}

function Requirement({ met, label, actual }: { met: boolean; label: string; actual: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 12, padding: '6px 10px',
      background: met ? K.mintSoft : K.bone,
      borderRadius: 8, color: met ? K.mintInk : K.ink2,
    }}>
      <span style={{ fontWeight: 600 }}>{met ? '✓' : '○'} {label}</span>
      <span style={{ fontSize: 11, color: K.muted }}>{actual}</span>
    </div>
  )
}

function MarketingSection() {
  const { activeAdCampaigns, balance, businessType, addAdCampaign, removeAdCampaign, campaignROI } = useGameStore()

  const recentROI = [...(campaignROI ?? [])].reverse().slice(0, 5)

  const availableCampaigns = AD_CAMPAIGNS_CONFIG.filter(cfg => {
    if (!('businessTypes' in cfg)) return true
    return (cfg as any).businessTypes.includes(businessType)
  })

  const isActive = (id: string) => activeAdCampaigns.some(c => c.id === id)
  const slotsUsed = activeAdCampaigns.length
  const slotsFull = slotsUsed >= MAX_ACTIVE_CAMPAIGNS

  const nextFactor = CAMPAIGN_DIMINISHING_FACTORS[slotsUsed] ?? 0.2
  const nextSlotPct = Math.round(nextFactor * 100)

  const handleLaunch = (cfg: typeof AD_CAMPAIGNS_CONFIG[number]) => {
    if (slotsFull) return
    if (balance < cfg.cost) return
    addAdCampaign({
      id: cfg.id,
      name: cfg.name,
      duration: cfg.duration,
      cost: cfg.cost,
      clientEffect: cfg.clientEffect,
      checkEffect: cfg.checkEffect ?? 0,
      daysRemaining: cfg.duration,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Slot indicator */}
      <div style={{
        background: slotsFull ? K.orangeSoft : K.bone,
        border: `1px solid ${slotsFull ? K.orange : K.line}`,
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: MAX_ACTIVE_CAMPAIGNS }).map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: 4,
              background: i < slotsUsed ? K.mint : K.lineSoft,
              border: `1.5px solid ${i < slotsUsed ? K.mint : K.line}`,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: slotsFull ? K.orange : K.ink }}>
          {slotsFull
            ? `Все ${MAX_ACTIVE_CAMPAIGNS} слота заняты — дождитесь завершения кампании`
            : `Слоты: ${slotsUsed}/${MAX_ACTIVE_CAMPAIGNS} · следующая кампания работает на ${nextSlotPct}% мощности`}
        </div>
      </div>

      {/* Active campaigns */}
      {activeAdCampaigns.length > 0 && (
        <div style={{ background: K.white, borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${K.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
            АКТИВНЫЕ · {activeAdCampaigns.length}/{MAX_ACTIVE_CAMPAIGNS}
          </div>
          {activeAdCampaigns
            .slice()
            .sort((a, b) => b.clientEffect - a.clientEffect)
            .map((campaign, slotIdx) => {
              const cfg = AD_CAMPAIGNS_CONFIG.find(c => c.id === campaign.id)
              const total = cfg?.duration ?? campaign.duration
              const pct = Math.round((campaign.daysRemaining / total) * 100)
              const factor = CAMPAIGN_DIMINISHING_FACTORS[slotIdx] ?? 0.2
              const effectivePct = Math.round(campaign.clientEffect * factor * 100)
              return (
                <div key={campaign.id} style={{
                  background: K.mintSoft,
                  border: `1.5px solid ${K.mint}`,
                  borderRadius: 14, padding: 14,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{campaign.name}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                        background: K.mint, color: K.white, letterSpacing: '0.06em',
                      }}>АКТИВНА</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: K.bone, color: K.muted,
                      }}>слот {slotIdx + 1} · {Math.round(factor * 100)}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, fontWeight: 600, color: K.muted }}>
                      <span>+{effectivePct}% клиентов (факт.)</span>
                      {campaign.checkEffect !== 0 && (
                        <span style={{ color: campaign.checkEffect > 0 ? K.good : K.warn }}>
                          {campaign.checkEffect > 0 ? '+' : ''}{Math.round(campaign.checkEffect * factor * 100)}% чек
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 8, height: 4, background: K.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: K.mint, borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: K.muted, marginTop: 4 }}>
                      Осталось {campaign.daysRemaining} из {total} дней
                    </div>
                  </div>
                  <button
                    onClick={() => removeAdCampaign(campaign.id)}
                    style={{
                      border: `1.5px solid ${K.line}`, cursor: 'pointer',
                      background: K.white, color: K.ink,
                      padding: '6px 12px', borderRadius: 999,
                      fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                    Остановить
                  </button>
                </div>
              )
            })}
        </div>
      )}

      {/* Available campaigns */}
      <div style={{ background: K.white, borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${K.line}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
          ДОСТУПНЫЕ КАМПАНИИ
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {availableCampaigns.map(cfg => {
            const active = isActive(cfg.id)
            const canAfford = balance >= cfg.cost
            const blocked = slotsFull && !active
            return (
              <div key={cfg.id} style={{
                background: active ? K.mintSoft : K.white,
                border: active ? `1.5px solid ${K.mint}` : `1.5px solid ${K.line}`,
                borderRadius: 16, padding: 14,
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: !active && (!canAfford || blocked) ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{cfg.name}</div>
                  {active && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: K.mint, color: K.white,
                    }}>ON</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: K.orangeSoft, color: K.orange,
                  }}>+{Math.round(cfg.clientEffect * 100)}% клиентов</span>
                  {cfg.checkEffect !== 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: cfg.checkEffect > 0 ? K.mintSoft : K.bone,
                      color: cfg.checkEffect > 0 ? K.good : K.ink,
                    }}>
                      {cfg.checkEffect > 0 ? '+' : ''}{Math.round(cfg.checkEffect * 100)}% чек
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: K.bone, color: K.muted,
                  }}>{cfg.duration} дн.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }} className="k-num">
                    {cfg.cost.toLocaleString('ru-RU')} ₽
                  </div>
                  <button
                    onClick={() => !active && !blocked && handleLaunch(cfg)}
                    disabled={active || !canAfford || blocked}
                    style={{
                      border: 'none',
                      cursor: active || !canAfford || blocked ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      background: active || blocked ? K.bone : canAfford ? K.ink : K.bone,
                      color: active || blocked ? K.muted : canAfford ? K.white : K.muted,
                      padding: '7px 14px', borderRadius: 10,
                      fontSize: 11, fontWeight: 800,
                      opacity: active || !canAfford || blocked ? 0.6 : 1,
                    }}>
                    {active ? 'Активна' : blocked ? 'Слоты заняты' : !canAfford ? 'Нет средств' : 'Запустить'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent ROI history */}
      {recentROI.length > 0 && (
        <div style={{ background: K.white, borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${K.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
            ИСТОРИЯ КАМПАНИЙ · последние {recentROI.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentROI.map(entry => {
              const cfg = AD_CAMPAIGNS_CONFIG.find(c => c.id === entry.campaignId)
              const name = cfg?.name ?? entry.campaignId
              const positive = entry.roi >= 0
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 10px', borderRadius: 10,
                  background: K.bone,
                  borderLeft: `3px solid ${positive ? K.mint : K.bad}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 10, color: K.muted, marginTop: 1 }}>
                      Неделя {entry.launchedWeek} · потрачено {entry.costSpent.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 800,
                      color: positive ? K.good : K.bad,
                    }}>
                      {positive ? '+' : ''}{entry.roi.toFixed(0)}% ROI
                    </div>
                    <div style={{ fontSize: 10, color: K.muted }}>
                      {entry.revenueGenerated.toLocaleString('ru-RU')} ₽ выручки
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      <div style={{ background: K.orangeSoft, borderRadius: 16, padding: 14, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
          Одновременно можно вести до {MAX_ACTIVE_CAMPAIGNS} кампаний. Каждая следующая работает слабее (100% → 60% → 30%) — выгоднее дождаться завершения и запустить новую.
        </div>
      </div>
    </div>
  )
}

function UpgradesSection() {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: K.ink2, lineHeight: 1.6, margin: 0 }}>
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
  )
}

function RoiSection() {
  const state = useGameStore()
  const stats = getCampaignStats(state)

  if (stats.totalCampaigns === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ textAlign: 'center', color: K.muted }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📈</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Нет данных</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Запустите рекламную кампанию во вкладке «Реклама»</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'КАМПАНИЙ', value: String(stats.totalCampaigns) },
          { label: 'ПОТРАЧЕНО', value: `${stats.totalSpent.toLocaleString('ru-RU')} ₽` },
          { label: 'ВЫРУЧКА', value: `${stats.totalRevenue.toLocaleString('ru-RU')} ₽` },
          {
            label: 'СРЕДНИЙ ROI',
            value: `${stats.averageROI >= 0 ? '+' : ''}${stats.averageROI.toFixed(1)}%`,
            color: stats.averageROI >= 0 ? K.good : K.bad,
          },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: K.white, borderRadius: 12, padding: 16, border: `1px solid ${K.line}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>{kpi.label}</div>
            <div style={{
              fontSize: 18, fontWeight: 800, marginTop: 4,
              color: kpi.color ?? K.ink,
            }} className="k-num">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      <div style={{ background: K.white, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 8, border: `1px solid ${K.line}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
          ВСЕ КАМПАНИИ
        </div>
        {[...stats.campaigns].reverse().map(entry => {
          const cfg = AD_CAMPAIGNS_CONFIG.find(c => c.id === entry.campaignId)
          const name = cfg?.name ?? entry.campaignId
          const positive = entry.roi >= 0
          const roiAbs = Math.abs(entry.roi)

          return (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 12px', borderRadius: 12,
              background: K.bone,
              borderLeft: `3px solid ${positive ? K.mint : K.bad}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 10, fontWeight: 600, color: K.muted }}>
                  <span>Неделя {entry.launchedWeek}</span>
                  <span className="k-num">потрачено {entry.costSpent.toLocaleString('ru-RU')} ₽</span>
                  <span className="k-num">выручка {entry.revenueGenerated.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 800,
                  color: positive ? K.good : K.bad,
                }}>
                  {positive ? '+' : '−'}{roiAbs.toFixed(1)}%
                </div>
                <div style={{ fontSize: 10, color: K.muted }}>ROI</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
