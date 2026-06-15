import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, Target } from 'lucide-react'
import type { EnrichedPosition } from '../../hooks/usePortfolio'

interface Props {
  positions: EnrichedPosition[]
}

function RiskBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className='h-1.5 w-full overflow-hidden rounded-full bg-[var(--c-border)]'>
      <div className='h-full rounded-full transition-all duration-500' style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

export default function RiskPanel({ positions }: Props) {
  if (positions.length === 0) return null

  const totalValue = positions.reduce((s, p) => s + p.currentVal, 0)

  const maxWeight = Math.max(...positions.map((p) => p.weight))
  const mostConcentrated = positions.find((p) => p.weight === maxWeight)!

  const sectorMap: Record<string, number> = {}
  for (const p of positions) {
    sectorMap[p.sector] = (sectorMap[p.sector] ?? 0) + p.currentVal
  }
  const sectorWeights = Object.entries(sectorMap)
    .map(([s, v]) => ({ sector: s, pct: (v / totalValue) * 100 }))
    .sort((a, b) => b.pct - a.pct)
  const numSectors = sectorWeights.length
  const topSectorPct = sectorWeights[0]?.pct ?? 0

  let score = 100
  if (maxWeight > 40) score -= 30
  else if (maxWeight > 25) score -= 15
  if (numSectors < 3) score -= 25
  else if (numSectors < 5) score -= 10
  if (topSectorPct > 50) score -= 20
  else if (topSectorPct > 35) score -= 10
  if (positions.length < 3) score -= 15
  score = Math.max(0, Math.min(100, score))

  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 75 ? 'Well diversified' : score >= 50 ? 'Moderate risk' : 'Concentrated'
  const ScoreIcon  = score >= 75 ? ShieldCheck : score >= 50 ? ShieldAlert : AlertTriangle

  const metrics = [
    {
      label: 'Largest holding',
      value: `${mostConcentrated.symbol} (${maxWeight.toFixed(1)}%)`,
      sub: maxWeight > 30 ? 'Consider trimming' : 'Healthy weight',
      warn: maxWeight > 30,
      barVal: maxWeight,
      barColor: maxWeight > 30 ? '#EF4444' : '#10B981',
    },
    {
      label: 'Sector exposure',
      value: `${sectorWeights[0]?.sector ?? '—'} (${topSectorPct.toFixed(1)}%)`,
      sub: topSectorPct > 40 ? 'High concentration' : 'Balanced mix',
      warn: topSectorPct > 40,
      barVal: topSectorPct,
      barColor: topSectorPct > 40 ? '#F59E0B' : '#10B981',
    },
    {
      label: 'Diversification',
      value: `${numSectors} sector${numSectors !== 1 ? 's' : ''}, ${positions.length} stocks`,
      sub: numSectors >= 5 ? 'Good spread' : 'Add more sectors',
      warn: numSectors < 4,
      barVal: Math.min(numSectors * 15, 100),
      barColor: numSectors >= 5 ? '#10B981' : numSectors >= 3 ? '#F59E0B' : '#EF4444',
    },
  ]

  return (
    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
      <div className='mb-5 flex items-start justify-between'>
        <div>
          <h2 className='text-base font-semibold text-[var(--c-text-1)]'>Risk Analysis</h2>
          <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>Portfolio health metrics</p>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <div className='flex items-center gap-2'>
            <ScoreIcon size={14} style={{ color: scoreColor }} />
            <span className='text-2xl font-bold' style={{ color: scoreColor }}>{score}</span>
            <span className='text-xs text-[var(--c-text-3)]'>/ 100</span>
          </div>
          <span className='text-[10px] font-semibold' style={{ color: scoreColor }}>{scoreLabel}</span>
        </div>
      </div>

      <div className='space-y-5'>
        {metrics.map(({ label, value, sub, warn, barVal, barColor }) => (
          <div key={label}>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {warn
                  ? <AlertTriangle size={12} className='text-amber-400' />
                  : <CheckCircle size={12} className='text-emerald-400' />
                }
                <span className='text-xs font-medium text-[var(--c-text-2)]'>{label}</span>
              </div>
              <div className='text-right'>
                <span className='text-xs font-semibold text-[var(--c-text-1)]'>{value}</span>
                <p className={`text-[10px] ${warn ? 'text-amber-400' : 'text-emerald-400'}`}>{sub}</p>
              </div>
            </div>
            <RiskBar value={barVal} color={barColor} />
          </div>
        ))}
      </div>

      <div className='mt-5 border-t border-[var(--c-border)] pt-5'>
        <div className='mb-3 flex items-center gap-2'>
          <Target size={12} className='text-[var(--c-text-3)]' />
          <p className='text-xs font-medium text-[var(--c-text-3)]'>Sector breakdown</p>
        </div>
        <div className='space-y-2'>
          {sectorWeights.map(({ sector, pct }) => (
            <div key={sector} className='flex items-center gap-3'>
              <span className='w-20 truncate text-[11px] text-[var(--c-text-3)]'>{sector}</span>
              <div className='flex-1'>
                <RiskBar value={pct} color='#3B82F6' />
              </div>
              <span className='w-10 text-right text-[11px] font-medium text-[var(--c-text-2)]'>{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
