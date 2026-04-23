import { CSSProperties } from 'react'

interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  style?: CSSProperties
}

export function KIcon({ name, size = 16, color = 'currentColor', strokeWidth = 1.6, style }: IconProps) {
  const s: CSSProperties = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
  const P = { fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'dashboard':
      return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" {...P}/><rect x="14" y="3" width="7" height="5" {...P}/><rect x="14" y="12" width="7" height="9" {...P}/><rect x="3" y="16" width="7" height="5" {...P}/></svg>
    case 'eco':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><circle cx="4" cy="6" r="2" {...P}/><circle cx="20" cy="6" r="2" {...P}/><circle cx="4" cy="18" r="2" {...P}/><circle cx="20" cy="18" r="2" {...P}/><path d="M6 7l4 4M18 7l-4 4M6 17l4-4M18 17l-4-4" {...P}/></svg>
    case 'finance':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 20h18M5 20V10M10 20V5M15 20v-8M20 20v-5" {...P}/></svg>
    case 'mkt':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 10l14-5v14L3 14z" {...P}/><path d="M17 9v6" {...P}/><path d="M7 14v3a2 2 0 004 0v-2" {...P}/></svg>
    case 'ops':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...P}/></svg>
    case 'warehouse':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 9l9-5 9 5v11H3z" {...P}/><path d="M3 13h18M8 20v-7M16 20v-7" {...P}/></svg>
    case 'rep':
      return <svg style={s} viewBox="0 0 24 24"><path d="M12 2l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 16.5 6.4 19.4l1.1-6.3L3 8.7l6.2-.9z" {...P}/></svg>
    case 'milestone':
      return <svg style={s} viewBox="0 0 24 24"><path d="M5 21V5a1 1 0 011-1h12l-3 4 3 4H6" {...P}/></svg>
    case 'stats':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 3v18h18" {...P}/><path d="M7 15l4-4 3 3 5-6" {...P}/></svg>
    case 'roi':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-9" {...P}/><path d="M14 6h7v7" {...P}/></svg>
    case 'log':
      return <svg style={s} viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z" {...P}/><path d="M9 10h6M9 14h6M9 18h4" {...P}/></svg>
    case 'help':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P}/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4" {...P}/><circle cx="12" cy="17.5" r=".6" fill={color}/></svg>
    case 'settings':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...P}/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 010-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3 1.6 1.6 0 001-1.5V3a2 2 0 014 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8 1.6 1.6 0 001.5 1H21a2 2 0 010 4h-.1a1.6 1.6 0 00-1.5 1z" {...P}/></svg>
    case 'promo':
      return <svg style={s} viewBox="0 0 24 24"><path d="M20 12l-8 8-9-9V3h8z" {...P}/><circle cx="7.5" cy="7.5" r="1.2" fill={color}/></svg>
    case 'shop':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 7h18l-1.5 12a2 2 0 01-2 1.8H6.5a2 2 0 01-2-1.8z" {...P}/><path d="M8 7V5a4 4 0 018 0v2" {...P}/></svg>
    case 'cafe':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 10h14v7a4 4 0 01-4 4H7a4 4 0 01-4-4z" {...P}/><path d="M17 12h2a2 2 0 010 4h-2" {...P}/><path d="M7 3v3M11 3v3M15 3v3" {...P}/></svg>
    case 'salon':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="6" cy="6" r="3" {...P}/><circle cx="6" cy="18" r="3" {...P}/><path d="M20 4L8.5 15.5M20 20L14 14" {...P}/></svg>
    case 'plus':
      return <svg style={s} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" {...P}/></svg>
    case 'arrow':
      return <svg style={s} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" {...P}/></svg>
    case 'play':
      return <svg style={s} viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" {...P}/></svg>
    case 'check':
      return <svg style={s} viewBox="0 0 24 24"><path d="M5 12l4 4 10-10" {...P}/></svg>
    case 'lock':
      return <svg style={s} viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2" {...P}/><path d="M8 10V7a4 4 0 018 0v3" {...P}/></svg>
    case 'alert':
      return <svg style={s} viewBox="0 0 24 24"><path d="M12 3l10 18H2z" {...P}/><path d="M12 10v5" {...P}/><circle cx="12" cy="18" r=".7" fill={color}/></svg>
    case 'gift':
      return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="5" {...P}/><rect x="4" y="13" width="16" height="8" {...P}/><path d="M12 8v13M8 8c-2 0-3-1-3-2.5S6 3 7.5 3 12 5 12 8c0-3 3-5 4.5-5S19 4 19 5.5 18 8 16 8" {...P}/></svg>
    case 'wallet':
      return <svg style={s} viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="2" {...P}/><path d="M17 13h2" {...P}/><path d="M3 10h18" {...P}/></svg>
    case 'doc':
      return <svg style={s} viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z" {...P}/><path d="M15 3v4h4" {...P}/></svg>
    case 'search':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" {...P}/><path d="M21 21l-4.5-4.5" {...P}/></svg>
    case 'book':
      return <svg style={s} viewBox="0 0 24 24"><path d="M4 5v14a2 2 0 002 2h14V7a2 2 0 00-2-2H6a2 2 0 00-2 2z" {...P}/><path d="M4 5a2 2 0 012-2h12" {...P}/></svg>
    case 'users':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" {...P}/><path d="M3 20c0-3 3-5 6-5s6 2 6 5" {...P}/><circle cx="17" cy="9" r="2.5" {...P}/><path d="M15 20c0-2 2-4 4-4s3 1.5 3 3" {...P}/></svg>
    case 'cart':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 4h3l2.5 12h11l2-8H7" {...P}/><circle cx="10" cy="20" r="1.5" {...P}/><circle cx="17" cy="20" r="1.5" {...P}/></svg>
    case 'megaphone':
      return <svg style={s} viewBox="0 0 24 24"><path d="M3 11v3a1 1 0 001 1h3l7 5V6L7 11H4a1 1 0 00-1 0z" {...P}/><path d="M17 8a6 6 0 010 9" {...P}/></svg>
    case 'clipboard':
      return <svg style={s} viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="17" rx="2" {...P}/><rect x="9" y="2" width="6" height="4" rx="1" {...P}/></svg>
    case 'queue':
      return <svg style={s} viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" {...P}/><circle cx="12" cy="12" r="2" {...P}/><circle cx="18" cy="12" r="2" {...P}/></svg>
    case 'bolt':
      return <svg style={s} viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" {...P}/></svg>
    case 'spark':
      return <svg style={s} viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" {...P}/></svg>
    default:
      return <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P}/></svg>
  }
}
