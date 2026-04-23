import { useGameStore } from '../../stores/gameStore'
import { AD_CAMPAIGNS_CONFIG } from '../../constants/business'
import { K } from '../design-system/tokens'

export function MarketingView() {
  const { activeAdCampaigns, balance, businessType, addAdCampaign, removeAdCampaign, campaignROI } = useGameStore()

  const recentROI = [...(campaignROI ?? [])].reverse().slice(0, 5)

  const availableCampaigns = AD_CAMPAIGNS_CONFIG.filter(cfg => {
    if (!('businessTypes' in cfg)) return true
    return (cfg as any).businessTypes.includes(businessType)
  })

  const isActive = (id: string) => activeAdCampaigns.some(c => c.id === id)

  const handleLaunch = (cfg: typeof AD_CAMPAIGNS_CONFIG[number]) => {
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
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: K.ink, letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>УПРАВЛЕНИЕ</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Маркетинг</div>
      </div>

      {/* Active campaigns */}
      {activeAdCampaigns.length > 0 && (
        <div style={{ background: K.white, borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, border: `1px solid ${K.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: K.muted, textTransform: 'uppercase' }}>
            АКТИВНЫЕ КАМПАНИИ · {activeAdCampaigns.length}
          </div>
          {activeAdCampaigns.map(campaign => {
            const cfg = AD_CAMPAIGNS_CONFIG.find(c => c.id === campaign.id)
            const total = cfg?.duration ?? campaign.duration
            const pct = Math.round((campaign.daysRemaining / total) * 100)
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
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, fontWeight: 600, color: K.muted }}>
                    <span>+{Math.round(campaign.clientEffect * 100)}% клиентов</span>
                    {campaign.checkEffect !== 0 && (
                      <span style={{ color: campaign.checkEffect > 0 ? K.good : K.warn }}>
                        {campaign.checkEffect > 0 ? '+' : ''}{Math.round(campaign.checkEffect * 100)}% чек
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
            return (
              <div key={cfg.id} style={{
                background: active ? K.mintSoft : K.white,
                border: active ? `1.5px solid ${K.mint}` : `1.5px solid ${K.line}`,
                borderRadius: 16, padding: 14,
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: !active && !canAfford ? 0.5 : 1,
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
                    onClick={() => !active && handleLaunch(cfg)}
                    disabled={active || !canAfford}
                    style={{
                      border: 'none', cursor: active || !canAfford ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      background: active ? K.bone : canAfford ? K.ink : K.bone,
                      color: active ? K.muted : canAfford ? K.white : K.muted,
                      padding: '7px 14px', borderRadius: 10,
                      fontSize: 11, fontWeight: 800,
                      opacity: active || !canAfford ? 0.6 : 1,
                    }}>
                    {active ? 'Активна' : !canAfford ? 'Нет средств' : 'Запустить'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campaign ROI history */}
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
          Акции с большим бонусом клиентов часто снижают средний чек. Выбирайте баланс под вашу стратегию.
        </div>
      </div>
    </div>
  )
}
