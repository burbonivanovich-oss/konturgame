import { K } from './design-system/tokens'

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
  fill?: string
  label?: string
}

/**
 * Tiny SVG line chart. No external dependency, no axes, no tooltips —
 * just trajectory. Use for at-a-glance trends inside KPI cards.
 *
 * Renders the line + a soft area fill underneath. If values are constant or
 * empty, draws a flat dash. Currency formatting / labels are caller's job.
 */
export default function Sparkline({
  values,
  width = 160,
  height = 40,
  color = K.blue,
  fill,
  label,
}: SparklineProps) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label={label ?? 'Нет данных'}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={K.line}
          strokeDasharray="4 4"
        />
      </svg>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = values.length === 1 ? 0 : width / (values.length - 1)

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 4) - 2
    return [x, y] as const
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${(points[points.length - 1][0]).toFixed(1)} ${height} L 0 ${height} Z`

  return (
    <svg width={width} height={height} role="img" aria-label={label ?? `График из ${values.length} точек`}>
      {fill && <path d={areaPath} fill={fill} opacity={0.2} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      {/* Last value marker */}
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2.5} fill={color} />
    </svg>
  )
}
