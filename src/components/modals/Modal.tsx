import { useEffect, useId, useRef } from 'react'
import { K } from '../design-system/tokens'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
}

const sizeMap = {
  sm: { width: '400px', maxWidth: '90vw' },
  md: { width: '600px', maxWidth: '90vw' },
  lg: { width: '900px', maxWidth: '90vw' },
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Esc to close
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus management: trap focus inside the dialog and restore on close.
  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    // Move focus to the first focusable element inside the dialog.
    const root = dialogRef.current
    if (root) {
      const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        root.focus()
      }
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => {
      document.removeEventListener('keydown', handleTab)
      // Restore focus to the previously-focused element.
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'Manrope, sans-serif',
    }}>
      {/* Backdrop — clicking dismisses; not in tab order. fadeOverlay
          animation is auto-disabled by globals.css @media (prefers-reduced-motion). */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(14,17,22,0.72)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeOverlay 160ms ease-out',
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          position: 'relative', zIndex: 10,
          background: K.white, color: K.ink,
          borderRadius: 20, padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          ...sizeMap[size],
          maxHeight: '90vh', overflowY: 'auto',
          outline: 'none',
          animation: 'fadeIn 200ms ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${K.line}`,
        }}>
          <h2 id={titleId} style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </h2>
          {closeButton && (
            <button
              onClick={onClose}
              aria-label="Закрыть"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: K.bone, border: 'none',
                cursor: 'pointer', fontSize: 18, color: K.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = K.paper)}
              onMouseLeave={(e) => (e.currentTarget.style.background = K.bone)}
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
