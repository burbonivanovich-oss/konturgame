// Kontur Game Design System — all desktop screens
// Integrated design components from frame.jsx, Desktop.jsx, DesktopOthers.jsx

// ============ ATOMS & UTILITIES ============

function KStatusBar({ dark = false }) {
  const col = dark ? '#fff' : '#0E1116';
  return (
    <div className="kg-status" style={{ color: col }}>
      <span className="k-num">9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          {[3, 6, 9, 12].map((h, i) => (
            <rect key={i} x={i * 4} y={12 - h} width="3" height={h} rx="0.5" fill={col}/>
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 3c2.5 0 4.7 1 6.4 2.5l1.3-1.4C13.6 2.2 10.9 1 8 1 5.1 1 2.4 2.2.3 4.1L1.6 5.5C3.3 4 5.5 3 8 3zM8 6c1.4 0 2.6.5 3.5 1.4l1.3-1.4C11.6 4.9 9.9 4.2 8 4.2c-1.9 0-3.6.7-4.8 1.8l1.3 1.4C5.4 6.5 6.6 6 8 6zm0 3c.7 0 1.4.3 1.8.7L11 8.4c-.8-.8-1.9-1.2-3-1.2s-2.2.4-3 1.2l1.2 1.3c.4-.4 1.1-.7 1.8-.7z" fill={col}/>
        </svg>
        <div style={{
          width: 26, height: 12, borderRadius: 3, border: `1.2px solid ${col}`,
          padding: 1, position: 'relative'
        }}>
          <div style={{ height: '100%', width: '80%', background: col, borderRadius: 1.5 }}/>
          <div style={{
            position: 'absolute', right: -3, top: 3, width: 2, height: 4,
            background: col, borderRadius: 1,
          }}/>
        </div>
      </div>
    </div>
  );
}

function Phone({ children, bg = 'var(--k-surface)', dark = false }) {
  return (
    <div className="kg-phone" style={{ background: bg }}>
      <KStatusBar dark={dark}/>
      <div className="kg-body">{children}</div>
    </div>
  );
}

function Spark({ data, color = 'currentColor', fill = false }) {
  const w = 100, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / rng) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      {fill && <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity={0.2}/>}
      <path d={path} stroke={color} fill="none" strokeWidth="1.5"/>
    </svg>
  );
}

// ============ MAIN DASHBOARD ============

export function DesktopApp() {
  return (
    <div style={{
      width: 1440, height: 900,
      background: 'var(--k-surface)',
      fontFamily: 'Manrope, sans-serif',
      color: 'var(--k-ink)',
      display: 'flex',
      overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      {/* LEFT RAIL — navigation */}
      <aside style={{
        width: 240, background: 'var(--k-ink)', color: '#fff',
        padding: '24px 20px', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--k-orange)',
          }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Бизнес</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600 }}>с Контуром</div>
          </div>
        </div>

        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em' }}>
            КОФЕЙНЯ «ЗЕРНО»
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>День 47</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontSize: 11, fontWeight: 600, opacity: 0.7,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--k-blue-soft)' }}/>
            Весна · солнечно · +8%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { n: 'Дневной цикл',  g: '◎', on: true,  badge: '1' },
            { n: 'Склад',         g: '▦', on: false, badge: '20' },
            { n: 'Маркетинг',     g: '◆', on: false },
            { n: 'Экосистема',    g: '□', on: false, badge: '4/7' },
            { n: 'Финансы',       g: '₽', on: false },
            { n: 'Репутация',     g: '★', on: false },
            { n: 'Достижения',    g: '◈', on: false },
          ].map(i => (
            <div key={i.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: i.on ? 'var(--k-orange)' : 'transparent',
              color: i.on ? 'var(--k-ink)' : '#fff',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.08)',
                color: i.on ? 'var(--k-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i.g}</span>
              <span style={{ flex: 1 }}>{i.n}</span>
              {i.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '2px 6px', borderRadius: 999,
                  background: i.on ? 'var(--k-ink)' : 'rgba(255,255,255,0.12)',
                  color: i.on ? 'var(--k-orange)' : '#fff',
                }}>{i.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        {/* Saved rubles — bottom of rail */}
        <div style={{
          padding: 14, borderRadius: 16,
          background: 'var(--k-green)', color: 'var(--k-ink)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>
            СПАСЕНО С КОНТУРОМ
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }} className="k-num">
            220 400 ₽
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginTop: 4 }}>
            ×6 ROI · за 47 дней
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{
        flex: 1, padding: '20px 24px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 10, height: 146,
        }}>
          {/* Income */}
          <div style={{
            background: 'var(--k-orange)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 20,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
                  ДОХОД ЗА ДЕНЬ
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }} className="k-num">
                  24 860 ₽
                </div>
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 999,
                background: 'var(--k-ink)', color: 'var(--k-orange)',
                fontSize: 11, fontWeight: 800,
              }}>+18%</div>
            </div>
            <Spark data={[8,11,9,14,13,18,16,22,19,25]} color="#0E1116" fill/>
          </div>

          {/* Net Profit */}
          <div style={{
            background: 'var(--k-green)', color: 'var(--k-ink)',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.65 }}>
              ЧИСТАЯ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                +14 220 ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 4 }}>
                после налога 6% и закупок
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div style={{
            background: 'var(--k-blue)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              РАСХОДЫ / МЕС
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                168 000 ₽
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
                через 12 дн. списание
              </div>
            </div>
          </div>

          {/* To Goal */}
          <div style={{
            background: 'var(--k-purple)', color: '#fff',
            borderRadius: 20, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
              К ЦЕЛИ
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }} className="k-num">
                672 400 ₽
              </div>
              <div style={{
                marginTop: 6, height: 5, background: 'rgba(255,255,255,0.22)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{ width: '67%', height: '100%', background: '#fff' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, flex: 1, minHeight: 0 }}>
          {/* Placeholder for left content */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
            <p>События и решения появятся здесь</p>
          </div>

          {/* Right sidebar */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
            <p>Индикаторы и сервисы Контура</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export { Phone, Spark, KStatusBar };
