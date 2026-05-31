import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ALL_STOCKS_DATA } from '../../data/marketsData'
import { StockAvatar } from '../ui/StockAvatar'

const sorted = [...ALL_STOCKS_DATA].sort((a, b) => b.changeVal - a.changeVal)
const TOP_GAINERS = sorted.slice(0, 5)
const TOP_LOSERS = sorted.slice(-5).reverse()

type Tab = 'gainers' | 'losers'

export default function TopMovers() {
  const [tab, setTab] = useState<Tab>('gainers')
  const navigate = useNavigate()
  const list = tab === 'gainers' ? TOP_GAINERS : TOP_LOSERS

  return (
    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
      {/* Header */}
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Top Movers</h2>
          <p className='mt-0.5 text-sm text-[var(--c-text-2)]'>Today's biggest market moves</p>
        </div>

        {/* Tab switcher */}
        <div className='flex rounded-xl bg-[var(--c-surface)] p-1 text-xs font-medium'>
          <button
            onClick={() => setTab('gainers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              tab === 'gainers'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
            }`}
          >
            <TrendingUp size={13} />
            Gainers
          </button>
          <button
            onClick={() => setTab('losers')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              tab === 'losers'
                ? 'bg-red-500/15 text-red-400'
                : 'text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
            }`}
          >
            <TrendingDown size={13} />
            Losers
          </button>
        </div>
      </div>

      {/* List */}
      <div className='space-y-2'>
        {list.map((stock, i) => {
          const barWidth = Math.min(Math.abs(stock.changeVal) * 8, 100)
          const isGain = stock.changeVal >= 0

          return (
            <button
              key={stock.symbol}
              onClick={() => navigate(`/markets/${stock.symbol}`)}
              className='group flex w-full items-center gap-3 rounded-2xl bg-[var(--c-surface)] px-4 py-3 text-left transition hover:bg-[var(--c-overlay)]'
            >
              {/* Rank */}
              <span className='w-4 shrink-0 text-xs font-medium text-[var(--c-text-3)]'>{i + 1}</span>

              <StockAvatar symbol={stock.symbol} size='sm' />

              {/* Name */}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-[var(--c-text-1)]'>{stock.symbol}</p>
                <p className='truncate text-xs text-[var(--c-text-3)]'>{stock.sector}</p>
              </div>

              {/* Bar + change */}
              <div className='flex shrink-0 flex-col items-end gap-1'>
                <span
                  className={`text-sm font-bold tabular-nums ${isGain ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {isGain ? '+' : ''}{stock.changeVal.toFixed(2)}%
                </span>
                {/* mini progress bar */}
                <div className='h-1 w-16 overflow-hidden rounded-full bg-[var(--c-border)]'>
                  <div
                    className={`h-full rounded-full ${isGain ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
