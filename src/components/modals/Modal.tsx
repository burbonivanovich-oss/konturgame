import { useEffect } from 'react'

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
        background: 'var(--k-white)', color: 'var(--k-ink)',
        borderRadius: 20, padding: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        ...sizeMap[size],
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--k-ink-10)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </h2>
          {closeButton && (
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--k-ink-10)', border: 'none',
                cursor: 'pointer', fontSize: 18, color: 'var(--k-ink-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--k-ink-20)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--k-ink-10)')}
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
