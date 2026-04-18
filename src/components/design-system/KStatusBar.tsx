interface KStatusBarProps {
  dark?: boolean
}

export function KStatusBar({ dark = false }: KStatusBarProps) {
  const col = dark ? '#fff' : '#0E1116'
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
  )
}
