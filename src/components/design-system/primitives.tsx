import { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'
import { K } from './tokens'

// ── Layout ──────────────────────────────────────────────────

interface RowProps {
  children: ReactNode
  gap?: number
  align?: CSSProperties['alignItems']
  justify?: CSSProperties['justifyContent']
  wrap?: boolean
  style?: CSSProperties
  className?: string
  onClick?: () => void
}

export function Row({ children, gap = 12, align = 'center', justify = 'flex-start', wrap = false, style, ...rest }: RowProps) {
  return (
    <div style={{ display: 'flex', gap, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }} {...rest}>
      {children}
    </div>
  )
}

interface ColProps {
  children: ReactNode
  gap?: number
  align?: CSSProperties['alignItems']
  style?: CSSProperties
  className?: string
}

export function Col({ children, gap = 12, align = 'stretch', style, ...rest }: ColProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: align, ...style }} {...rest}>
      {children}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  pad?: number
  radius?: number
  tone?: string
  bg?: string
  border?: string
  style?: CSSProperties
  className?: string
}

export function Card({ children, pad = 16, radius = 14, tone, bg = K.white, border = K.line, style, ...rest }: CardProps) {
  return (
    <div
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: radius, padding: pad, position: 'relative', ...style }}
      {...rest}
    >
      {tone && (
        <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, background: tone, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
      )}
      {children}
    </div>
  )
}

// ── Label (CAPS eyebrow) ─────────────────────────────────────

interface LabelProps {
  children: ReactNode
  color?: string
  size?: number
  style?: CSSProperties
}

export function Label({ children, color = K.muted, size = 11, style }: LabelProps) {
  return (
    <div style={{ fontSize: size, color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, ...style }}>
      {children}
    </div>
  )
}

// ── Pill ─────────────────────────────────────────────────────

interface PillProps {
  children: ReactNode
  bg?: string
  fg?: string
  border?: string
  style?: CSSProperties
  size?: 'sm' | 'md'
}

export function Pill({ children, bg, fg, border, style, size = 'md' }: PillProps) {
  const sz: CSSProperties = size === 'sm'
    ? { padding: '2px 7px', fontSize: 10, borderRadius: 999 }
    : { padding: '4px 10px', fontSize: 11, borderRadius: 999 }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg || 'transparent', color: fg || K.ink,
      border: border ? `1px solid ${border}` : 'none',
      textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
      ...sz, ...style,
    }}>
      {children}
    </span>
  )
}

// ── Btn ──────────────────────────────────────────────────────

type BtnKind = 'primary' | 'orange' | 'mint' | 'blue' | 'violet' | 'ghost' | 'soft'
type BtnSize = 'sm' | 'md' | 'lg'

const BTN_SIZES: Record<BtnSize, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, height: 30 },
  md: { padding: '9px 16px', fontSize: 13, height: 38 },
  lg: { padding: '12px 20px', fontSize: 14, height: 46 },
}

const BTN_KINDS: Record<BtnKind, CSSProperties> = {
  primary: { background: K.ink,    color: K.white, border: `1px solid ${K.ink}` },
  orange:  { background: K.orange, color: K.white, border: `1px solid ${K.orange}` },
  mint:    { background: K.mint,   color: K.white, border: `1px solid ${K.mint}` },
  blue:    { background: K.blue,   color: K.white, border: `1px solid ${K.blue}` },
  violet:  { background: K.violet, color: K.white, border: `1px solid ${K.violet}` },
  ghost:   { background: 'transparent', color: K.ink, border: `1px solid ${K.line}` },
  soft:    { background: K.bone,   color: K.ink,   border: `1px solid ${K.line}` },
}

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  kind?: BtnKind
  size?: BtnSize
  sub?: string
  style?: CSSProperties
}

export function Btn({ children, kind = 'primary', size = 'md', disabled, style, sub, ...rest }: BtnProps) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button
        style={{
          ...BTN_SIZES[size],
          ...BTN_KINDS[kind],
          borderRadius: 10, fontWeight: 600, fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1, letterSpacing: '-0.01em',
          border: BTN_KINDS[kind].border,
          ...style,
        }}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
      {sub && <div style={{ fontSize: 10, color: K.muted }}>{sub}</div>}
    </div>
  )
}

// ── Delta ────────────────────────────────────────────────────

interface DeltaProps {
  value: number
  fmt?: (v: number) => string
  style?: CSSProperties
}

export function Delta({ value, fmt: fmtFn, style }: DeltaProps) {
  const pos = value > 0, neg = value < 0
  const color = pos ? K.good : neg ? K.bad : K.muted
  const arrow = pos ? '↑' : neg ? '↓' : '·'
  const display = fmtFn ? fmtFn(Math.abs(value)) : String(Math.abs(value))
  return (
    <span style={{ color, fontWeight: 600, fontSize: 12, ...style }}>
      {arrow} {display}
    </span>
  )
}

// ── ProgressBar ───────────────────────────────────────────────

interface ProgressBarProps {
  value?: number
  max?: number
  color?: string
  track?: string
  h?: number
  radius?: number
}

export function ProgressBar({ value = 0, max = 100, color = K.ink, track = K.lineSoft, h = 6, radius = 999 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height: h, background: track, borderRadius: radius, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: radius }} />
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────

interface SparklineProps {
  data: number[]
  w?: number
  h?: number
  color?: string
  fill?: string
}

export function Sparkline({ data, w = 240, h = 40, color = K.ink, fill = 'rgba(0,0,0,0.06)' }: SparklineProps) {
  if (!data || data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1 || 1)
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as [number, number])
  const linePath = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const areaPath = `M 0 ${h} L ${pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} L ${w} ${h} Z`
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Formatters ────────────────────────────────────────────────

export const fmt = (n: number): string => {
  const sign = n < 0 ? '−' : ''
  const abs = Math.abs(Math.round(n))
  return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const rub = (n: number): string => `${fmt(n)} ₽`
