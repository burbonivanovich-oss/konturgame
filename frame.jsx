// Minimal phone frame + common atoms used across all Kontur Game screens.

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

function KHome({ dark = false }) {
  return <div className="k-home" style={{ background: dark ? '#fff' : '#0E1116' }}/>;
}

function Phone({ children, bg = 'var(--k-surface)', dark = false }) {
  return (
    <div className="kg-phone" style={{ background: bg }}>
      <KStatusBar dark={dark}/>
      <div className="kg-body">{children}</div>
      <KHome dark={dark}/>
    </div>
  );
}

// Kontur logo mark — ORIGINAL stylized brand for the in-game "Kontur" ecosystem
function Logo({ size = 14, color }) {
  const c = color || 'currentColor';
  return (
    <span style={{
      fontWeight: 800, fontSize: size, letterSpacing: '-0.02em',
      color: c, display: 'inline-flex', alignItems: 'center', gap: size * 0.45,
      lineHeight: 1,
    }}>
      <svg width={size * 1.1} height={size * 1.1} viewBox="0 0 20 20" fill="none">
        <rect x="1" y="1" width="18" height="18" rx="5" stroke={c} strokeWidth="2.5" fill="none"/>
      </svg>
      Контур
    </span>
  );
}

// Tab bar
function TabBar({ active = 'day' }) {
  const tabs = [
    { id: 'day',  label: 'День',     glyph: '◎' },
    { id: 'stock',label: 'Склад',    glyph: '▦' },
    { id: 'ads',  label: 'Реклама',  glyph: '◆' },
    { id: 'kon',  label: 'Контур',   glyph: '□' },
    { id: 'me',   label: 'Профиль',  glyph: '●' },
  ];
  return (
    <div className="k-tabbar">
      {tabs.map(t => (
        <div key={t.id} className={`k-tab ${active === t.id ? 'active' : ''}`}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: active === t.id ? 'var(--k-ink)' : 'var(--k-ink-10)',
            color: active === t.id ? '#fff' : 'var(--k-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>{t.glyph}</div>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// simple sparkline
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
    <svg className="k-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && (
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.15"/>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { Phone, KStatusBar, KHome, Logo, TabBar, Spark });
