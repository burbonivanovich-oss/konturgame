import { useGameStore } from '../../stores/gameStore'
import { getCampaignStats } from '../../services/weekCalculator'
import { AD_CAMPAIGNS_CONFIG } from '../../constants/business'

export function CampaignROIView() {
  const state = useGameStore()
  const stats = getCampaignStats(state)

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)', letterSpacing: '-0.01em',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.45 }}>АНАЛИТИКА</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>ROI кампаний</div>
      </div>

      {stats.totalCampaigns === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', opacity: 0.4 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📈</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Нет данных</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Запустите рекламную кампанию в разделе Маркетинг</div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'КАМПАНИЙ', value: String(stats.totalCampaigns) },
              { label: 'ПОТРАЧЕНО', value: `${stats.totalSpent.toLocaleString('ru-RU')} ₽` },
              { label: 'ВЫРУЧКА', value: `${stats.totalRevenue.toLocaleString('ru-RU')} ₽` },
              {
                label: 'СРЕДНИЙ ROI',
                value: `${stats.averageROI >= 0 ? '+' : ''}${stats.averageROI.toFixed(1)}%`,
                color: stats.averageROI >= 0 ? 'var(--k-green)' : 'var(--k-bad)',
              },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>{kpi.label}</div>
                <div style={{
                  fontSize: 18, fontWeight: 800, marginTop: 4,
                  color: kpi.color ?? 'var(--k-ink)',
                }} className="k-num">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Campaign list */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.45 }}>
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
                  background: 'var(--k-surface)',
                  borderLeft: `3px solid ${positive ? 'var(--k-green)' : 'var(--k-bad)'}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 10, fontWeight: 600, opacity: 0.5 }}>
                      <span>Неделя {entry.launchedWeek}</span>
                      <span className="k-num">потрачено {entry.costSpent.toLocaleString('ru-RU')} ₽</span>
                      <span className="k-num">выручка {entry.revenueGenerated.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 800,
                      color: positive ? 'var(--k-green)' : 'var(--k-bad)',
                    }}>
                      {positive ? '+' : '−'}{roiAbs.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.45 }}>ROI</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
