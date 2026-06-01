import { useState } from 'react'
import { ALL_STOCKS_DATA } from '../../data/marketsData'
import { StockAvatar } from '../ui/StockAvatar'
import { useSettingsStore } from '../../store/settingsStore'

type Tab = 'gainers' | 'losers' | 'active'

const SORTED_GAINERS   = [...ALL_STOCKS_DATA].sort((a, b) => b.changeVal - a.changeVal)
const SORTED_LOSERS    = [...ALL_STOCKS_DATA].sort((a, b) => a.changeVal - b.changeVal)
const SORTED_ACTIVE    = [...ALL_STOCKS_DATA].sort((a, b) => b.volume - a.volume)

const TAB_LABELS: Record<Tab, string> = {
  gainers: 'Top Gainers',
  losers:  'Top Losers',
  active:  'Most Active',
}

function formatChange(changeVal: number, priceVal: number, format: 'percent' | 'absolute' | 'both'): string {
  const sign = changeVal >= 0 ? '+' : ''
  const pct = `${sign}${changeVal.toFixed(2)}%`
  const absChange = Math.abs(priceVal * changeVal / 100)
  const absStr = `${changeVal >= 0 ? '+' : '-'}₹${absChange.toFixed(2)}`
  if (format === 'absolute') return absStr
  if (format === 'both') return `${pct} · ${absStr}`
  return pct
}

export default function MarketMovers({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [tab, setTab] = useState<Tab>('gainers')
  const moversCount = useSettingsStore((s) => s.moversCount)
  const priceChangeFormat = useSettingsStore((s) => s.priceChangeFormat)

  const sorted = tab === 'gainers' ? SORTED_GAINERS : tab === 'losers' ? SORTED_LOSERS : SORTED_ACTIVE
  const items = sorted.slice(0, moversCount)

  return (
    <div className='flex flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'>
      <h3 className='mb-4 text-base font-semibold text-[var(--c-text-1)]'>Market Movers</h3>

      {/* Tabs */}
      <div className='mb-4 flex gap-1 rounded-xl bg-[var(--c-surface)] p-1'>
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
              tab === t ? 'bg-blue-600 text-white' : 'text-[var(--c-text-2)] hover:text-[var(--c-text-1)]'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className='space-y-0.5'>
        {items.map((stock, i) => (
          <button
            key={stock.symbol}
            onClick={() => onSelect(stock.symbol)}
            className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--c-overlay)]'
          >
            <span className='w-4 shrink-0 text-right text-xs text-[var(--c-text-3)]'>{i + 1}</span>
            <StockAvatar symbol={stock.symbol} size='sm' />
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-[var(--c-text-1)]'>{stock.symbol}</p>
              <p className='truncate text-[11px] text-[var(--c-text-3)]'>{stock.sector}</p>
            </div>
            <div className='shrink-0 text-right'>
              <p className='text-sm font-semibold text-[var(--c-text-1)]'>{stock.price}</p>
              <p className={`text-xs font-semibold ${stock.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatChange(stock.changeVal, stock.priceVal, priceChangeFormat)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
