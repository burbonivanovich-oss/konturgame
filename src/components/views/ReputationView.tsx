import { useGameStore } from '../../stores/gameStore'

function StatusDot({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  const color = value >= thresholds[1] ? 'var(--k-good)' : value >= thresholds[0] ? 'var(--k-warn)' : 'var(--k-bad)'
  const label = value >= thresholds[1] ? 'Хорошо' : value >= thresholds[0] ? 'Средне' : 'Критично'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color }}>{label}</span>
    </span>
  )
}

function MetricBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ height: 8, background: 'var(--k-ink-10)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.4s' }} />
    </div>
  )
}

const REPUTATION_FACTORS = [
  { label: 'Обслуженные клиенты', effect: '+1–3 за день при полной загрузке', positive: true },
  { label: 'Пропущенные клиенты', effect: '−1 за каждого пропущенного', positive: false },
  { label: 'Перегрузка 3+ дня подряд', effect: '−5 за серию перегрузок', positive: false },
  { label: 'Выбор опции Контур', effect: '+3–5 при решении события', positive: true },
  { label: 'Репутация = 0 три дня', effect: '→ Game Over', positive: false },
]

const LOYALTY_FACTORS = [
  { label: 'Карта лояльности (акция)', effect: '+5% чек от постоянных клиентов', positive: true },
  { label: 'Довольные клиенты', effect: 'Повышает с каждым успешным днём', positive: true },
  { label: 'Ценовые скачки', effect: '−3 за день с ценовой промо-акцией', positive: false },
  { label: 'Контур.Эльба', effect: 'Стабилизирует лояльность', positive: true },
]

export function ReputationView() {
  const { reputation, loyalty, lastDayResult, currentWeek } = useGameStore()

  const repColor = reputation >= 60 ? 'var(--k-good)' : reputation >= 30 ? 'var(--k-warn)' : 'var(--k-bad)'
  const loyColor = loyalty >= 60 ? 'var(--k-good)' : loyalty >= 30 ? 'var(--k-warn)' : 'var(--k-bad)'

  const repChange = lastDayResult?.reputationChange ?? 0
  const loyChange = lastDayResult?.loyaltyChange ?? 0

  return (
    <div style={{
      flex: 1, padding: '20px 24px', overflow: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'Manrope, sans-serif', color: 'var(--k-ink)', letterSpacing: '-0.01em',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.45 }}>АНАЛИТИКА</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>Репутация</div>
      </div>

      {/* Hero cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Reputation */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>РЕПУТАЦИЯ</div>
            <StatusDot value={reputation} thresholds={[30, 60]} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8, color: repColor }} className="k-num">
            {reputation}
          </div>
          <div style={{ fontSize: 11, opacity: 0.45, marginTop: 4 }}>из 100</div>
          <MetricBar value={reputation} color={repColor} />

          {/* Thresholds */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { v: 0, label: '0–29 Критично', bg: 'rgba(255,90,90,0.12)', color: 'var(--k-bad)' },
              { v: 30, label: '30–59 Средне', bg: 'rgba(255,176,32,0.12)', color: 'var(--k-warn)' },
              { v: 60, label: '60+ Хорошо', bg: 'var(--k-green-soft)', color: 'var(--k-good)' },
            ].map(t => (
              <span key={t.v} style={{
                fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6,
                background: t.bg, color: t.color,
                opacity: reputation >= t.v && (t.v === 60 ? true : reputation < t.v + 30) ? 1 : 0.4,
              }}>{t.label}</span>
            ))}
          </div>

          {repChange !== 0 && (
            <div style={{
              marginTop: 10, padding: '6px 10px', borderRadius: 10,
              background: repChange > 0 ? 'var(--k-green-soft)' : 'rgba(255,90,90,0.1)',
              fontSize: 12, fontWeight: 700,
              color: repChange > 0 ? 'var(--k-good)' : 'var(--k-bad)',
            }}>
              {repChange > 0 ? '+' : ''}{repChange} вчера (день {currentWeek - 1})
            </div>
          )}
        </div>

        {/* Loyalty */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4 }}>ЛОЯЛЬНОСТЬ</div>
            <StatusDot value={loyalty} thresholds={[30, 60]} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8, color: loyColor }} className="k-num">
            {loyalty}
          </div>
          <div style={{ fontSize: 11, opacity: 0.45, marginTop: 4 }}>из 100</div>
          <MetricBar value={loyalty} color={loyColor} />

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { v: 0, label: '0–29 Низкая', bg: 'rgba(255,90,90,0.12)', color: 'var(--k-bad)' },
              { v: 30, label: '30–59 Средняя', bg: 'rgba(255,176,32,0.12)', color: 'var(--k-warn)' },
              { v: 60, label: '60+ Высокая', bg: 'var(--k-green-soft)', color: 'var(--k-good)' },
            ].map(t => (
              <span key={t.v} style={{
                fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6,
                background: t.bg, color: t.color,
                opacity: loyalty >= t.v && (t.v === 60 ? true : loyalty < t.v + 30) ? 1 : 0.4,
              }}>{t.label}</span>
            ))}
          </div>

          {loyChange !== 0 && (
            <div style={{
              marginTop: 10, padding: '6px 10px', borderRadius: 10,
              background: loyChange > 0 ? 'var(--k-green-soft)' : 'rgba(255,90,90,0.1)',
              fontSize: 12, fontWeight: 700,
              color: loyChange > 0 ? 'var(--k-good)' : 'var(--k-bad)',
            }}>
              {loyChange > 0 ? '+' : ''}{loyChange} вчера (день {currentWeek - 1})
            </div>
          )}
        </div>
      </div>

      {/* Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        <div style={{ background: '#fff', borderRadius: 20, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4, marginBottom: 10 }}>
            ЧТО ВЛИЯЕТ НА РЕПУТАЦИЮ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REPUTATION_FACTORS.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 10,
                background: f.positive ? 'var(--k-green-soft)' : 'rgba(255,90,90,0.07)',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{f.positive ? '↑' : '↓'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{f.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>{f.effect}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.4, marginBottom: 10 }}>
            ЧТО ВЛИЯЕТ НА ЛОЯЛЬНОСТЬ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOYALTY_FACTORS.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 10,
                background: f.positive ? 'var(--k-green-soft)' : 'rgba(255,90,90,0.07)',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{f.positive ? '↑' : '↓'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{f.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>{f.effect}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Warning if critical */}
          {reputation < 30 && (
            <div style={{
              marginTop: 10, padding: 12, borderRadius: 12,
              background: 'rgba(255,90,90,0.1)',
              border: '1.5px solid var(--k-bad)',
              fontSize: 12, fontWeight: 700, color: 'var(--k-bad)',
            }}>
              ⚠️ Репутация критически низкая! Если она будет 0 три дня подряд — игра закончится.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
