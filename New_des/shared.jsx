// Shared tokens, primitives, icons for Kontur Business game screens.
// Palette discipline: neutrals do most work; each screen uses 1 primary
// accent + optionally 1 supporting. Never 3 accents in one frame.

const K = {
  // Neutrals — creamier, more contrast between paper and card
  white: '#FFFFFF',
  paper: '#ECE7DC',       // warmer, more chromatic page bg
  paper2:'#E4DED0',
  bone:  '#F5F1E6',       // soft card alt
  line:  '#D9D3C3',
  lineSoft: '#E6E0D0',
  ink:   '#1A1A22',       // brand black (slightly deeper)
  ink2:  '#2E2E38',
  muted: '#6B6B74',
  muted2:'#9A9AA0',
  // Accents (Kontur) — mint and violet as protagonists; orange only for alerts
  mint:   '#00C896',
  mintSoft: '#D5F0E4',
  mintInk: '#004F3E',
  blue:   '#2B5BFF',
  blueSoft:'#DDE4FF',
  blueInk:'#0D1E6B',
  violet: '#6B3FD4',
  violetSoft: '#E6DDF8',
  violetInk: '#2A0F6B',
  orange: '#FF6F1A',      // alert only
  orangeSoft: '#FFE0CC',
  // Functional
  good:  '#007A5C',
  warn:  '#B36A00',
  bad:   '#B42F23',
};

// Inject fonts + base once
if (typeof document !== 'undefined' && !document.getElementById('kontur-base')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
  const s = document.createElement('style');
  s.id = 'kontur-base';
  s.textContent = `
    .kb *, .kb *::before, .kb *::after { box-sizing: border-box; }
    .kb { font-family: 'Manrope', system-ui, sans-serif; color: ${K.ink};
          font-feature-settings: 'ss01','cv11'; -webkit-font-smoothing: antialiased;
          letter-spacing: -0.01em; }
    .kb .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0; }
    .kb .caps { text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
    .kb .tnum { font-variant-numeric: tabular-nums; }
    @keyframes kb-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(107,63,212,.45);} 50% { box-shadow: 0 0 0 8px rgba(107,63,212,0);} }
    .kb .pulse { animation: kb-pulse 1.8s ease-in-out infinite; }
    .kb .scroll-h::-webkit-scrollbar{ display: none; }
  `;
  document.head.appendChild(s);
}

// ──────────────── Primitives ────────────────
const Row = ({ children, gap = 12, align = 'center', justify = 'flex-start', wrap = false, style, ...p }) => (
  <div style={{ display:'flex', gap, alignItems:align, justifyContent:justify, flexWrap: wrap?'wrap':'nowrap', ...style }} {...p}>{children}</div>
);
const Col = ({ children, gap = 12, align = 'stretch', style, ...p }) => (
  <div style={{ display:'flex', flexDirection:'column', gap, alignItems:align, ...style }} {...p}>{children}</div>
);
const Spacer = ({ h = 1 }) => <div style={{ flex: h }} />;

// Card — neutral container. `tone` adds a subtle accent band on the left.
const Card = ({ children, pad = 16, radius = 14, tone, bg = K.white, border = K.line, style, ...p }) => (
  <div style={{
    background: bg, border: `1px solid ${border}`, borderRadius: radius,
    padding: pad, position: 'relative', ...style,
  }} {...p}>
    {tone && <div style={{ position:'absolute', left:0, top:12, bottom:12, width:3, background:tone, borderTopRightRadius:3, borderBottomRightRadius:3 }} />}
    {children}
  </div>
);

const Label = ({ children, color = K.muted, size = 11, style }) => (
  <div className="caps" style={{ fontSize:size, color, ...style }}>{children}</div>
);

const Pill = ({ children, bg, fg, border, style, size = 'md' }) => {
  const sz = size === 'sm'
    ? { padding:'2px 7px', fontSize:10, borderRadius:999 }
    : { padding:'4px 10px', fontSize:11, borderRadius:999 };
  return (
    <span className="caps" style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background: bg || 'transparent', color: fg || K.ink,
      border: border ? `1px solid ${border}` : 'none',
      ...sz, ...style,
    }}>{children}</span>
  );
};

const Btn = ({ children, kind = 'primary', size = 'md', disabled, style, sub, ...p }) => {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, height: 30 },
    md: { padding: '9px 16px', fontSize: 13, height: 38 },
    lg: { padding: '12px 20px', fontSize: 14, height: 46 },
  };
  const kinds = {
    primary: { background: K.ink, color: K.white, border: `1px solid ${K.ink}` },
    orange:  { background: K.orange, color: K.white, border: `1px solid ${K.orange}` },
    mint:    { background: K.mint, color: K.white, border: `1px solid ${K.mint}` },
    blue:    { background: K.blue, color: K.white, border: `1px solid ${K.blue}` },
    violet:  { background: K.violet, color: K.white, border: `1px solid ${K.violet}` },
    ghost:   { background: 'transparent', color: K.ink, border: `1px solid ${K.line}` },
    soft:    { background: K.bone, color: K.ink, border: `1px solid ${K.line}` },
  };
  const st = { ...sizes[size], ...kinds[kind],
    borderRadius: 10, fontWeight: 600, fontFamily:'inherit',
    display: 'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, letterSpacing:'-0.01em',
    transition: 'transform .08s, filter .1s',
    ...style };
  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <button style={st} disabled={disabled} {...p}>{children}</button>
      {sub && <div style={{ fontSize: 10, color: K.muted }}>{sub}</div>}
    </div>
  );
};

const Delta = ({ value, fmt = v => v, style }) => {
  const pos = value > 0, neg = value < 0;
  const color = pos ? K.good : neg ? K.bad : K.muted;
  const arrow = pos ? '↑' : neg ? '↓' : '·';
  return (
    <span style={{ color, fontWeight:600, fontSize:12, ...style }}>
      {arrow} {fmt(Math.abs(value))}
    </span>
  );
};

const ProgressBar = ({ value = 0, max = 100, color = K.ink, track = K.lineSoft, h = 6, radius = 999 }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height: h, background: track, borderRadius: radius, overflow:'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: radius }} />
    </div>
  );
};

const Sparkline = ({ data, w = 240, h = 40, color = K.ink, fill = 'rgba(0,0,0,0.06)' }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaD = `M 0 ${h} L ` + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + ` L ${w} ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display:'block' }}>
      <path d={areaD} fill={fill} />
      <path d={d} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Currency formatter: 123456 → "123 456"
const fmt = n => {
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(Math.round(n));
  return sign + a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
const rub = n => fmt(n) + '\u00A0₽';

// ──────────────── Icons (simple, systemic, no SVG art) ────────────────
const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.6 }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' };
  const P = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dashboard': return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" {...P}/><rect x="14" y="3" width="7" height="5" {...P}/><rect x="14" y="12" width="7" height="9" {...P}/><rect x="3" y="16" width="7" height="5" {...P}/></svg>;
    case 'eco':       return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><circle cx="4" cy="6" r="2" {...P}/><circle cx="20" cy="6" r="2" {...P}/><circle cx="4" cy="18" r="2" {...P}/><circle cx="20" cy="18" r="2" {...P}/><path d="M6 7l4 4M18 7l-4 4M6 17l4-4M18 17l-4-4" {...P}/></svg>;
    case 'finance':   return <svg style={s} viewBox="0 0 24 24"><path d="M3 20h18M5 20V10M10 20V5M15 20v-8M20 20v-5" {...P}/></svg>;
    case 'mkt':       return <svg style={s} viewBox="0 0 24 24"><path d="M3 10l14-5v14L3 14z" {...P}/><path d="M17 9v6" {...P}/><path d="M7 14v3a2 2 0 004 0v-2" {...P}/></svg>;
    case 'ops':       return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...P}/></svg>;
    case 'warehouse': return <svg style={s} viewBox="0 0 24 24"><path d="M3 9l9-5 9 5v11H3z" {...P}/><path d="M3 13h18M8 20v-7M16 20v-7" {...P}/></svg>;
    case 'rep':       return <svg style={s} viewBox="0 0 24 24"><path d="M12 2l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 16.5 6.4 19.4l1.1-6.3L3 8.7l6.2-.9z" {...P}/></svg>;
    case 'milestone': return <svg style={s} viewBox="0 0 24 24"><path d="M5 21V5a1 1 0 011-1h12l-3 4 3 4H6" {...P}/></svg>;
    case 'stats':     return <svg style={s} viewBox="0 0 24 24"><path d="M3 3v18h18" {...P}/><path d="M7 15l4-4 3 3 5-6" {...P}/></svg>;
    case 'roi':       return <svg style={s} viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-9" {...P}/><path d="M14 6h7v7" {...P}/></svg>;
    case 'log':       return <svg style={s} viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z" {...P}/><path d="M9 10h6M9 14h6M9 18h4" {...P}/></svg>;
    case 'help':      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P}/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4" {...P}/><circle cx="12" cy="17.5" r=".6" fill={color}/></svg>;
    case 'settings':  return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 010-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3 1.6 1.6 0 001-1.5V3a2 2 0 014 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8 1.6 1.6 0 001.5 1H21a2 2 0 010 4h-.1a1.6 1.6 0 00-1.5 1z" {...P}/></svg>;
    case 'promo':     return <svg style={s} viewBox="0 0 24 24"><path d="M20 12l-8 8-9-9V3h8z" {...P}/><circle cx="7.5" cy="7.5" r="1.2" fill={color}/></svg>;
    case 'shop':      return <svg style={s} viewBox="0 0 24 24"><path d="M3 7h18l-1.5 12a2 2 0 01-2 1.8H6.5a2 2 0 01-2-1.8z" {...P}/><path d="M8 7V5a4 4 0 018 0v2" {...P}/></svg>;
    case 'cafe':      return <svg style={s} viewBox="0 0 24 24"><path d="M3 10h14v7a4 4 0 01-4 4H7a4 4 0 01-4-4z" {...P}/><path d="M17 12h2a2 2 0 010 4h-2" {...P}/><path d="M7 3v3M11 3v3M15 3v3" {...P}/></svg>;
    case 'salon':     return <svg style={s} viewBox="0 0 24 24"><circle cx="6" cy="6" r="3" {...P}/><circle cx="6" cy="18" r="3" {...P}/><path d="M20 4L8.5 15.5M20 20L14 14" {...P}/></svg>;
    case 'plus':      return <svg style={s} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" {...P}/></svg>;
    case 'arrow':     return <svg style={s} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" {...P}/></svg>;
    case 'play':      return <svg style={s} viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" {...P}/></svg>;
    case 'check':     return <svg style={s} viewBox="0 0 24 24"><path d="M5 12l4 4 10-10" {...P}/></svg>;
    case 'lock':      return <svg style={s} viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2" {...P}/><path d="M8 10V7a4 4 0 018 0v3" {...P}/></svg>;
    case 'bolt':      return <svg style={s} viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" {...P}/></svg>;
    case 'heart':     return <svg style={s} viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" {...P}/></svg>;
    case 'alert':     return <svg style={s} viewBox="0 0 24 24"><path d="M12 3l10 18H2z" {...P}/><path d="M12 10v5" {...P}/><circle cx="12" cy="18" r=".7" fill={color}/></svg>;
    case 'gift':      return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="5" {...P}/><rect x="4" y="13" width="16" height="8" {...P}/><path d="M12 8v13M8 8c-2 0-3-1-3-2.5S6 3 7.5 3 12 5 12 8c0-3 3-5 4.5-5S19 4 19 5.5 18 8 16 8" {...P}/></svg>;
    case 'wallet':    return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="2" {...P}/><path d="M17 13h2" {...P}/><path d="M3 10h18" {...P}/></svg>;
    case 'doc':       return <svg style={s} viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z" {...P}/><path d="M15 3v4h4" {...P}/></svg>;
    case 'search':    return <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" {...P}/><path d="M21 21l-4.5-4.5" {...P}/></svg>;
    case 'book':      return <svg style={s} viewBox="0 0 24 24"><path d="M4 5v14a2 2 0 002 2h14V7a2 2 0 00-2-2H6a2 2 0 00-2 2z" {...P}/><path d="M4 5a2 2 0 012-2h12" {...P}/></svg>;
    case 'tax':       return <svg style={s} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" {...P}/><path d="M8 16l8-8M9 9h.01M15 15h.01" {...P}/></svg>;
    case 'users':     return <svg style={s} viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" {...P}/><path d="M3 20c0-3 3-5 6-5s6 2 6 5" {...P}/><circle cx="17" cy="9" r="2.5" {...P}/><path d="M15 20c0-2 2-4 4-4s3 1.5 3 3" {...P}/></svg>;
    case 'cart':      return <svg style={s} viewBox="0 0 24 24"><path d="M3 4h3l2.5 12h11l2-8H7" {...P}/><circle cx="10" cy="20" r="1.5" {...P}/><circle cx="17" cy="20" r="1.5" {...P}/></svg>;
    case 'megaphone': return <svg style={s} viewBox="0 0 24 24"><path d="M3 11v3a1 1 0 001 1h3l7 5V6L7 11H4a1 1 0 00-1 0z" {...P}/><path d="M17 8a6 6 0 010 9" {...P}/></svg>;
    case 'clipboard':return <svg style={s} viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="17" rx="2" {...P}/><rect x="9" y="2" width="6" height="4" rx="1" {...P}/></svg>;
    case 'flag':      return <svg style={s} viewBox="0 0 24 24"><path d="M5 21V4M5 4h13l-3 4 3 4H5" {...P}/></svg>;
    case 'queue':     return <svg style={s} viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" {...P}/><circle cx="12" cy="12" r="2" {...P}/><circle cx="18" cy="12" r="2" {...P}/></svg>;
    case 'spark':     return <svg style={s} viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" {...P}/></svg>;
    case 'lightning': return <svg style={s} viewBox="0 0 24 24"><path d="M13 3L5 13h6l-1 8 9-11h-6z" {...P}/></svg>;
    default: return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P}/></svg>;
  }
};

// Small logo mark
const Logo = ({ size = 28, color = K.ink }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ display:'block' }}>
    <circle cx="16" cy="16" r="15" fill="none" stroke={color} strokeWidth="1.6"/>
    <path d="M22 10 L12 16 L22 22" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Left rail used across game screens
const LeftRail = ({ active = 'dashboard', businessType = 'shop', week = 5, season = 'Лето', activeServices = 3, savings = 127500, weeks = 5 }) => {
  const items = [
    { id:'dashboard', label:'Дневной цикл', icon:'dashboard' },
    { id:'eco',       label:'Экосистема',   icon:'eco', badge: `${activeServices}/7` },
    { id:'finance',   label:'Финансы',      icon:'finance' },
    { id:'mkt',       label:'Маркетинг',    icon:'mkt' },
    { id:'ops',       label:'Управление',   icon:'ops' },
    { id:'warehouse', label:'Склад',        icon:'warehouse' },
    { id:'rep',       label:'Репутация',    icon:'rep' },
    { id:'milestone', label:'Вехи',         icon:'milestone', badge:'NEW', badgeKind:'violet' },
    { id:'stats',     label:'Статистика',   icon:'stats' },
    { id:'roi',       label:'Кампании ROI', icon:'roi' },
    { id:'log',       label:'Журнал',       icon:'log' },
  ];
  const bizLabel = { shop:'Магазин', cafe:'Кафе', salon:'Салон красоты' }[businessType];
  const bizIcon  = { shop:'shop',    cafe:'cafe', salon:'salon' }[businessType];
  return (
    <aside style={{ width:240, flex:'0 0 240px', background:K.white, borderRight:`1px solid ${K.line}`, padding:'20px 14px', display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
      {/* Logo */}
      <Row gap={10} style={{ padding:'2px 6px 0' }}>
        <Logo size={26}/>
        <div>
          <div style={{ fontSize:11, color:K.muted, letterSpacing:'0.04em', textTransform:'uppercase' }}>Бизнес</div>
          <div style={{ fontSize:13, fontWeight:700, marginTop:-2 }}>с Контуром</div>
        </div>
      </Row>
      {/* Status card */}
      <Card pad={12} radius={12} bg={K.bone} border={K.lineSoft}>
        <Row gap={8}>
          <div style={{ width:30, height:30, borderRadius:8, background:K.white, border:`1px solid ${K.line}`, display:'grid', placeItems:'center' }}>
            <Icon name={bizIcon} size={16}/>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>{bizLabel}</div>
            <div style={{ fontSize:11, color:K.muted }}>Неделя {week} · {season}</div>
          </div>
        </Row>
      </Card>
      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 10px', borderRadius:9,
              background: isActive ? K.ink : 'transparent',
              color: isActive ? K.white : K.ink,
              fontSize:13, fontWeight:500, cursor:'pointer',
            }}>
              <Icon name={it.icon} size={16} color={isActive ? K.white : K.ink2}/>
              <div style={{ flex:1 }}>{it.label}</div>
              {it.badge && (
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:999,
                  background: it.badgeKind === 'violet' ? K.violet : (isActive ? 'rgba(255,255,255,0.15)' : K.bone),
                  color: it.badgeKind === 'violet' ? K.white : (isActive ? K.white : K.muted),
                  letterSpacing:'0.04em',
                }}>{it.badge}</span>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{ flex:1 }} />
      {/* Savings */}
      <Card pad={12} radius={12} bg={K.ink} border={K.ink} style={{ color:K.white }}>
        <div className="caps" style={{ fontSize:10, color:'rgba(255,255,255,0.55)' }}>Спасено с Контуром</div>
        <div style={{ fontSize:22, fontWeight:700, marginTop:2, letterSpacing:'-0.02em' }}>{rub(savings)}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>за {weeks} недель</div>
      </Card>
      {/* Promo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:K.mintSoft, color:K.mintInk, fontSize:13, fontWeight:600, cursor:'pointer' }}>
        <Icon name="gift" size={16} color={K.mintInk}/>
        <div style={{ flex:1 }}>Промокоды</div>
        <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:6, background:K.mint, color:K.white }}>2</span>
      </div>
      {/* Bottom */}
      <Row gap={8} style={{ borderTop:`1px solid ${K.lineSoft}`, paddingTop:12 }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, color:K.muted, fontSize:12, cursor:'pointer' }}>
          <Icon name="help" size={15}/> Справка
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, color:K.muted, fontSize:12, cursor:'pointer' }}>
          <Icon name="settings" size={15}/> Настройки
        </div>
      </Row>
    </aside>
  );
};

// Shared export to window so other babel scripts can use.
Object.assign(window, {
  K, Row, Col, Spacer, Card, Label, Pill, Btn, Delta,
  ProgressBar, Sparkline, fmt, rub, Icon, Logo, LeftRail
});
