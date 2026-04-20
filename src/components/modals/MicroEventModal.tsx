import { useGameStore } from '../../stores/gameStore'

export default function MicroEventModal() {
  const { pendingMicroEvent, resolveMicroEvent } = useGameStore()

  if (!pendingMicroEvent) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(14, 17, 22, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        maxWidth: 400, width: '90%', maxHeight: '80vh', overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 40 }}>{pendingMicroEvent.icon}</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--k-ink)' }}>
            {pendingMicroEvent.title}
          </h2>
        </div>

        {/* Description */}
        <p style={{
          margin: '0 0 24px 0', fontSize: 14, lineHeight: 1.5,
          color: 'var(--k-ink)', opacity: 0.75,
        }}>
          {pendingMicroEvent.description}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingMicroEvent.options.map(option => (
            <button
              key={option.id}
              onClick={() => resolveMicroEvent(option.id)}
              style={{
                padding: '12px 16px', borderRadius: 12,
                border: '2px solid var(--k-orange)', background: 'transparent',
                color: 'var(--k-ink)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--k-orange)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--k-ink)'
              }}
            >
              {option.text}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          fontSize: 10, opacity: 0.4, marginTop: 16,
          fontStyle: 'italic', textAlign: 'center',
        }}>
          Выбери действие или закрой диалог
        </div>
      </div>

      {/* Click outside to close */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
        onClick={() => {
          if (pendingMicroEvent.options.length > 0) {
            resolveMicroEvent(pendingMicroEvent.options[0].id)
          }
        }}
      />
    </div>
  )
}
