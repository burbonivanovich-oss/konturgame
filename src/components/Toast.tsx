import { K } from './design-system/tokens'

export type ToastType = 'success' | 'info' | 'warning' | 'savings'

interface ToastProps {
  message: string
  type?: ToastType
  /** Position from the screen edge. Defaults to bottom-right. */
  position?: 'bottom-right' | 'bottom-center' | 'top-right'
}

const TYPE_STYLES: Record<ToastType, { bg: string; color: string; emoji: string }> = {
  success:  { bg: K.mint,    color: K.white, emoji: '✓' },
  info:     { bg: K.violet,  color: K.white, emoji: 'ℹ' },
  warning:  { bg: K.orange,  color: K.white, emoji: '⚠' },
  savings:  { bg: '#3D5BE6', color: K.white, emoji: '💙' },
}

const POSITIONS: Record<NonNullable<ToastProps['position']>, React.CSSProperties> = {
  'bottom-right':  { bottom: 24, right: 24 },
  'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  'top-right':     { top: 24, right: 24 },
}

/**
 * Lightweight inline toast. role=status + aria-live=polite ⇒ screen readers
 * announce the message without stealing focus. Caller controls visibility
 * via conditional rendering — keeps the API simple and avoids a global
 * provider for what is currently 2-3 toast types in the codebase.
 *
 * Animation comes from `slideUp` keyframe in globals.css and is auto-disabled
 * by the global prefers-reduced-motion rule.
 */
export default function Toast({
  message,
  type = 'info',
  position = 'bottom-right',
}: ToastProps) {
  const style = TYPE_STYLES[type]
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        zIndex: 50,
        ...POSITIONS[position],
        background: style.bg,
        color: style.color,
        padding: '12px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
        animation: 'slideUp 220ms ease-out',
      }}
    >
      <span aria-hidden="true">{style.emoji}</span>
      <span>{message}</span>
    </div>
  )
}
