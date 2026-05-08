import { useMemo } from 'react'

/**
 * CSS-only confetti: 50 absolutely-positioned squares with randomized
 * positions, colors, and animation delays. No external dependency, no canvas.
 * The keyframes live in globals.css; the global prefers-reduced-motion
 * rule disables the animation for vestibular-sensitive users.
 */
const COLORS = ['#FF6A2C', '#14B88A', '#3D5BE6', '#8A4AE0', '#FFD23F', '#FF4D6D']

export default function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.4 + Math.random() * 1.6,
        rotation: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [count],
  )

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 60,
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
