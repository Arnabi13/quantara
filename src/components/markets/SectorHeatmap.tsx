import { useState } from 'react'
import { ALL_STOCKS_DATA, SECTOR_LIST, type ExtendedStockData } from '../../data/marketsData'

interface SectorInfo {
  sector: string
  avgChange: number
  positive: boolean
  topMover: ExtendedStockData
  count: number
}

const SECTOR_DATA: SectorInfo[] = SECTOR_LIST.flatMap((sector) => {
  const stocks = ALL_STOCKS_DATA.filter((s) => s.sector === sector)
  if (stocks.length === 0) return []
  const avgChange = stocks.reduce((sum, s) => sum + s.changeVal, 0) / stocks.length
  const topMover = [...stocks].sort(
    (a, b) => Math.abs(b.changeVal) - Math.abs(a.changeVal),
  )[0]
  return [{ sector, avgChange, positive: avgChange >= 0, topMover, count: stocks.length }]
})

function tileBackground(avgChange: number): string {
  const intensity = Math.min(Math.abs(avgChange) / 2.5, 1)
  const alpha = 0.07 + intensity * 0.38
  return avgChange >= 0
    ? `rgba(16, 185, 129, ${alpha})`
    : `rgba(239, 68, 68, ${alpha})`
}

export default function SectorHeatmap({
  onSelect,
}: {
  onSelect?: (symbol: string) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
      <div className='mb-5'>
        <h3 className='text-base font-semibold text-[var(--c-text-1)]'>Sector Heatmap</h3>
        <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>Average sector performance today</p>
      </div>

      <div className='grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7'>
        {SECTOR_DATA.map(({ sector, avgChange, positive, topMover, count }) => (
          <div
            key={sector}
            role='button'
            tabIndex={0}
            className='cursor-pointer rounded-xl p-3 transition-transform duration-150 hover:scale-[1.05] focus:outline-none'
            style={{ background: tileBackground(avgChange) }}
            onMouseEnter={() => setHovered(sector)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect?.(topMover.symbol)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect?.(topMover.symbol)}
          >
            <p className='truncate text-[11px] font-semibold text-[var(--c-text-1)]'>{sector}</p>
            <p
              className={`mt-0.5 text-xs font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {positive ? '+' : ''}
              {avgChange.toFixed(2)}%
            </p>
            <p className='mt-0.5 text-[10px] text-[var(--c-text-3)]'>{count} stocks</p>
            <p
              className={`mt-1 text-[10px] transition-opacity duration-150 ${
                hovered === sector ? 'opacity-100' : 'opacity-0'
              } ${topMover.positive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              ↑ {topMover.symbol}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
