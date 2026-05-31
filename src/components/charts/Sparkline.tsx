interface SparklineProps {
  data: { value: number }[]
  positive: boolean
}

export default function Sparkline({ data, positive }: SparklineProps) {
  const width = 72
  const height = 32
  const color = positive ? '#10B981' : '#EF4444'

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const toX = (i: number) => (i / (values.length - 1)) * width
  const toY = (v: number) => height - ((v - min) / range) * height

  const linePath = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(' ')

  const areaPath =
    `${linePath} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${positive}`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity={0.25} />
          <stop offset='100%' stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${positive})`} />
      <path d={linePath} fill='none' stroke={color} strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}
