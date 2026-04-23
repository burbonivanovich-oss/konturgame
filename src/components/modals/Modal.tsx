import { useEffect } from 'react'
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

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'Manrope, sans-serif',
    }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(14,17,22,0.72)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: K.white, color: K.ink,
        borderRadius: 20, padding: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        ...sizeMap[size],
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${K.line}`,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </div>
          {closeButton && (
            <button
              onClick={onClose}
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
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
