interface SparkProps {
  data: number[]
  color?: string
  fill?: boolean
}

export function Spark({ data, color = 'currentColor', fill = false }: SparkProps) {
  const w = 100, h = 32
  const max = Math.max(...data), min = Math.min(...data)
  const rng = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / rng) * (h - 4) - 2
    return [x, y]
  })
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')

  return (
    <svg className="k-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.15"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}
