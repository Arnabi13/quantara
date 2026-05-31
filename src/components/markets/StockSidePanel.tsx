import { motion } from 'framer-motion'
import { ExternalLink, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import StockDetailChart from '../charts/StockDetailChart'
import { getExtendedStockData } from '../../data/marketsData'
import { StockAvatar } from '../ui/StockAvatar'

export default function StockSidePanel({
  symbol,
  watchlistSymbols,
  onClose,
  onToggleWatchlist,
}: {
  symbol: string
  watchlistSymbols: string[]
  onClose: () => void
  onToggleWatchlist: (symbol: string, add: boolean) => Promise<void>
}) {
  const stock = getExtendedStockData(symbol)
  const isInWatchlist = watchlistSymbols.includes(symbol)

  const stats = [
    { label: 'Open',       value: `₹${stock.openVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Day High',   value: `₹${stock.highVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Day Low',    value: `₹${stock.lowVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Close',      value: stock.price },
    { label: 'Volume',     value: stock.volumeStr },
    { label: 'Mkt Cap',    value: stock.marketCap },
    { label: '52W High',   value: stock.high52w },
    { label: '52W Low',    value: stock.low52w },
    { label: 'P/E',        value: stock.pe },
    { label: 'EPS',        value: stock.eps },
    { label: 'Book Value', value: stock.bookValue },
  ]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      className='fixed bottom-0 right-0 top-[86px] z-40 flex w-[480px] flex-col overflow-y-auto border-l border-[var(--c-border)] bg-[var(--c-surface-3)] shadow-2xl'
    >
      {/* Header */}
      <div className='flex-shrink-0 border-b border-[var(--c-border)] p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-[11px] font-semibold uppercase tracking-widest text-blue-400'>
              {stock.sector} · NSE
            </p>
            <div className='mt-1 flex items-center gap-2.5'>
              <StockAvatar symbol={symbol} size="lg" />
              <div className='min-w-0'>
                <h2 className='text-2xl font-bold text-[var(--c-text-1)]'>{symbol}</h2>
                <p className='mt-0.5 truncate text-sm text-[var(--c-text-2)]'>{stock.name}</p>
              </div>
            </div>
            <div className='mt-2.5 flex items-baseline gap-2.5'>
              <span className='text-xl font-bold text-[var(--c-text-1)]'>{stock.price}</span>
              <span
                className={`text-sm font-semibold ${
                  stock.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stock.change}
              </span>
            </div>
          </div>

          <div className='flex shrink-0 flex-col gap-2'>
            <button
              onClick={() => onToggleWatchlist(symbol, !isInWatchlist)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isInWatchlist
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              <Star size={13} className={isInWatchlist ? 'fill-red-400' : ''} />
              {isInWatchlist ? 'Remove' : 'Watch'}
            </button>
            <button
              onClick={onClose}
              className='flex items-center justify-center rounded-xl p-2 text-[var(--c-text-3)] transition hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-2)]'
              aria-label='Close panel'
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className='flex-shrink-0 p-5 pb-4'>
        <div className='h-[230px] rounded-2xl bg-[var(--c-surface-3)] p-4'>
          <StockDetailChart symbol={symbol} />
        </div>
      </div>

      {/* Stats grid */}
      <div className='flex-shrink-0 border-t border-[var(--c-border)] px-5 pt-4 pb-2'>
        <div className='grid grid-cols-3 gap-2'>
          {stats.map(({ label, value }) => (
            <div key={label} className='rounded-xl bg-[var(--c-surface)] p-3'>
              <p className='text-[10px] text-[var(--c-text-3)]'>{label}</p>
              <p className='mt-0.5 text-sm font-semibold text-[var(--c-text-1)]'>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto flex-shrink-0 border-t border-[var(--c-border)] p-4'>
        <Link
          to={`/markets/${symbol}`}
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--c-border)] py-2.5 text-sm font-medium text-[var(--c-text-2)] transition hover:border-blue-500/30 hover:text-[var(--c-text-1)]'
        >
          <ExternalLink size={14} />
          View Full Page
        </Link>
      </div>
    </motion.div>
  )
}
