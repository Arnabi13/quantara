import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getStockMeta } from '../../data/stockDataGenerator'
import { StockAvatar } from '../ui/StockAvatar'

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const RAW_TRADES = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'WIPRO',
  'BAJFINANCE', 'TITAN', 'AXISBANK', 'ICICIBANK', 'KOTAKBANK',
]

interface Trade {
  symbol: string
  side: 'BUY' | 'SELL'
  price: string
  qty: number
  minsAgo: number
}

const TRADES: Trade[] = RAW_TRADES.map((symbol, i) => {
  const meta = getStockMeta(symbol)
  const side: 'BUY' | 'SELL' = seededRandom(i * 7 + 42) > 0.5 ? 'BUY' : 'SELL'
  const qty = Math.floor(seededRandom(i * 3 + 11) * 90 + 10)
  const minsAgo = Math.floor(seededRandom(i * 5 + 99) * 200 + 3)
  return { symbol, side, price: meta.price, qty, minsAgo }
}).sort((a, b) => a.minsAgo - b.minsAgo)

function formatMinsAgo(mins: number): string {
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

export default function RecentActivity() {
  return (
    <div className='flex h-full flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
      <div className='mb-5 flex-shrink-0'>
        <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Recent Activity</h2>
        <p className='mt-0.5 text-sm text-[var(--c-text-2)]'>Latest executed trades</p>
      </div>

      <div className='flex-1 space-y-2 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--c-border)_transparent]'>
        {TRADES.map((trade, i) => (
          <div
            key={i}
            className='flex items-center gap-3 rounded-2xl bg-[var(--c-surface)] px-4 py-3'
          >
            {/* Side icon */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                trade.side === 'BUY'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              {trade.side === 'BUY'
                ? <ArrowDownLeft size={14} />
                : <ArrowUpRight size={14} />
              }
            </div>

            <StockAvatar symbol={trade.symbol} size='sm' />

            {/* Symbol + side label */}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='text-sm font-semibold text-[var(--c-text-1)]'>{trade.symbol}</p>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                    trade.side === 'BUY'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {trade.side}
                </span>
              </div>
              <p className='text-xs text-[var(--c-text-3)]'>{trade.qty} shares</p>
            </div>

            {/* Price + time */}
            <div className='shrink-0 text-right'>
              <p className='text-sm font-semibold text-[var(--c-text-1)]'>{trade.price}</p>
              <p className='text-[10px] text-[var(--c-text-3)]'>{formatMinsAgo(trade.minsAgo)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
