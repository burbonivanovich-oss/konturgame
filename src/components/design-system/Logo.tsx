interface LogoProps {
  size?: number
  color?: string
}

export function Logo({ size = 14, color }: LogoProps) {
  const c = color || 'currentColor'
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
  )
}
