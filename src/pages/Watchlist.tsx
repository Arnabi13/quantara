import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search, Star, X } from 'lucide-react'
import { api } from '../lib/api'
import Sparkline from '../components/charts/Sparkline'
import StockDetailChart from '../components/charts/StockDetailChart'
import { StockAvatar } from '../components/ui/StockAvatar'
import { NSE_STOCKS } from '../data/nseStocks'
import { generateSparklineData, getStockMeta } from '../data/stockDataGenerator'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className='flex animate-pulse items-center gap-3 rounded-2xl bg-[var(--c-surface)] px-4 py-3'>
      <div className='flex-1 space-y-2'>
        <div className='h-3 w-20 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-2 w-8 rounded bg-[var(--c-overlay)]' />
      </div>
      <div className='h-8 w-[72px] rounded bg-[var(--c-overlay)]' />
      <div className='space-y-1 text-right'>
        <div className='h-3 w-16 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-2 w-12 rounded bg-[var(--c-overlay)]' />
      </div>
    </div>
  )
}

// ─── Watchlist Row ────────────────────────────────────────────────────────────

function WatchlistRow({
  symbol,
  isActive,
  onClick,
  onRemove,
}: {
  symbol: string
  isActive: boolean
  onClick: () => void
  onRemove: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const meta = getStockMeta(symbol)
  const sparkline = generateSparklineData(symbol)

  return (
    <div
      role='button'
      tabIndex={0}
      className={`relative flex cursor-pointer select-none items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-150 focus:outline-none ${
        isActive
          ? 'border-l-2 border-blue-500 bg-blue-950/40 pl-[14px]'
          : 'bg-[var(--c-surface)] hover:bg-[var(--c-surface-2)]'
      }`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StockAvatar symbol={symbol} size="sm" />
      {/* Symbol + Exchange */}
      <div className='min-w-0 flex-1'>
        <p className='truncate font-semibold text-[var(--c-text-1)]'>{symbol}</p>
        <span className='mt-0.5 inline-block rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-400'>
          NSE
        </span>
      </div>

      {/* Sparkline */}
      <div className='flex-shrink-0'>
        <Sparkline data={sparkline} positive={meta.positive} />
      </div>

      {/* Price + Change */}
      <div className='min-w-[68px] flex-shrink-0 text-right'>
        <p className='text-sm font-semibold text-[var(--c-text-1)]'>{meta.price}</p>
        <p className={`text-xs font-medium ${meta.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {meta.change}
        </p>
      </div>

      {/* Remove button revealed on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.1 }}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className='absolute right-2.5 top-2.5 rounded-full p-1 text-[var(--c-text-3)] transition hover:bg-red-500/20 hover:text-red-400'
            aria-label={`Remove ${symbol}`}
          >
            <X size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Stock Detail Panel ───────────────────────────────────────────────────────

function StockDetailPanel({
  symbol,
  isInWatchlist,
  onAdd,
  onRemove,
  onClose,
}: {
  symbol: string
  isInWatchlist: boolean
  onAdd: (s: string) => void
  onRemove: (s: string) => void
  onClose: () => void
}) {
  const meta = getStockMeta(symbol)
  const stockInfo = NSE_STOCKS.find((s) => s.symbol === symbol)

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.15em] text-blue-400'>
            {stockInfo?.name ?? symbol}
          </p>
          <div className='mt-1 flex items-center gap-3'>
            <StockAvatar symbol={symbol} size="lg" />
            <h2 className='text-3xl font-bold tracking-tight text-[var(--c-text-1)]'>{symbol}</h2>
          </div>
          <div className='mt-2 flex items-baseline gap-3'>
            <span className='text-xl font-semibold text-[var(--c-text-1)]'>{meta.price}</span>
            <span
              className={`text-sm font-medium ${meta.positive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {meta.change}
            </span>
          </div>
        </div>

        <div className='flex flex-shrink-0 items-center gap-2'>
          <button
            onClick={() => (isInWatchlist ? onRemove(symbol) : onAdd(symbol))}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              isInWatchlist
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            <Star size={14} className={isInWatchlist ? 'fill-red-400' : ''} />
            {isInWatchlist ? 'Remove' : 'Add to Watchlist'}
          </button>

          <button
            onClick={onClose}
            className='rounded-xl p-2 text-[var(--c-text-3)] transition hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-2)]'
            aria-label='Close detail'
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className='h-[260px] flex-shrink-0 rounded-2xl bg-[var(--c-surface)] p-4'>
        <StockDetailChart symbol={symbol} />
      </div>

      {/* Stats row */}
      <div className='mt-4 grid grid-cols-5 gap-3'>
        {[
          { label: 'Open', value: `₹${meta.openVal.toLocaleString('en-IN')}` },
          { label: 'High', value: `₹${meta.highVal.toLocaleString('en-IN')}` },
          { label: 'Low', value: `₹${meta.lowVal.toLocaleString('en-IN')}` },
          { label: 'Close', value: `₹${meta.closeVal.toLocaleString('en-IN')}` },
          { label: 'Volume', value: meta.volumeStr },
        ].map(({ label, value }) => (
          <div key={label} className='rounded-xl bg-[var(--c-surface)] p-3 text-center'>
            <p className='text-xs text-[var(--c-text-3)]'>{label}</p>
            <p className='mt-1 text-sm font-semibold text-[var(--c-text-1)]'>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Watchlist = () => {
  const [symbols, setSymbols] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchWatchlist() {
    setIsLoading(true)
    try {
      const res = await api.get<{ symbol: string }[]>('/watchlist')
      setSymbols(res.data.map((item) => item.symbol))
    } catch {
      setSymbols([])
    } finally {
      setIsLoading(false)
    }
  }

  async function addSymbol(symbol: string) {
    if (symbols.includes(symbol)) {
      setSelected(symbol)
      setQuery('')
      setShowDropdown(false)
      return
    }
    try {
      await api.post('/watchlist', { symbol })
      setSymbols((prev) => [...prev, symbol])
      setSelected(symbol)
      setQuery('')
      setShowDropdown(false)
    } catch {
      // conflict — already in list
    }
  }

  async function removeSymbol(symbol: string) {
    try {
      await api.delete(`/watchlist/${symbol}`)
      setSymbols((prev) => prev.filter((s) => s !== symbol))
      if (selected === symbol) setSelected(null)
    } catch {
      // error
    }
  }

  const searchResults =
    query.length > 0
      ? NSE_STOCKS.filter(
          (s) =>
            s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : []

  return (
    <div className='mx-auto flex h-full max-w-[1600px] flex-col'>
      {/* Page header */}
      <div className='mb-6 flex-shrink-0'>
        <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Portfolio</p>
        <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>Watchlist</h1>
        <p className='mt-3 text-[var(--c-text-2)]'>
          Track and monitor your favourite NSE stocks in real time.
        </p>
      </div>

      {/* Two-column layout */}
      <div className='flex min-h-0 flex-1 gap-6'>

        {/* ── Left panel (40%) ──────────────────────────────────────── */}
        <div className='flex w-[40%] flex-shrink-0 flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>

          {/* Search */}
          <div className='relative mb-4 flex-shrink-0' ref={searchRef}>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Search
                  size={15}
                  className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-3)]'
                />
                <input
                  type='text'
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowDropdown(e.target.value.length > 0)
                  }}
                  onFocus={() => query.length > 0 && setShowDropdown(true)}
                  placeholder='Search stocks…'
                  className='w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--c-text-1)] placeholder-[var(--c-text-3)] outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                />
              </div>

              {query && searchResults.length > 0 && (
                <button
                  onClick={() => addSymbol(searchResults[0].symbol)}
                  className='flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500'
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className='absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl'
                >
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => addSymbol(stock.symbol)}
                      className='flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-[var(--c-overlay)]'
                    >
                      <div>
                        <p className='text-sm font-semibold text-[var(--c-text-1)]'>{stock.symbol}</p>
                        <p className='text-xs text-[var(--c-text-3)]'>{stock.name}</p>
                      </div>
                      {symbols.includes(stock.symbol) ? (
                        <span className='text-xs text-blue-400'>In list</span>
                      ) : (
                        <Plus size={14} className='text-[var(--c-text-3)]' />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Row list */}
          <div className='flex-1 overflow-y-auto pr-0.5'>
            {isLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            ) : symbols.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center text-center'>
                <div className='mb-4 rounded-2xl bg-[var(--c-surface)] p-6'>
                  <Star size={32} className='mx-auto text-[var(--c-text-3)]' />
                </div>
                <p className='font-medium text-[var(--c-text-2)]'>Your watchlist is empty.</p>
                <p className='mt-1 text-sm text-[var(--c-text-3)]'>
                  Search for a stock to get started.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {symbols.map((symbol) => (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className='overflow-hidden'
                    style={{ marginBottom: '8px' }}
                  >
                    <WatchlistRow
                      symbol={symbol}
                      isActive={selected === symbol}
                      onClick={() => setSelected(selected === symbol ? null : symbol)}
                      onRemove={() => removeSymbol(symbol)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Right panel (60%) ─────────────────────────────────────── */}
        <AnimatePresence mode='wait'>
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className='flex flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'
            >
              <StockDetailPanel
                symbol={selected}
                isInWatchlist={symbols.includes(selected)}
                onAdd={addSymbol}
                onRemove={removeSymbol}
                onClose={() => setSelected(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key='empty'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='flex flex-1 items-center justify-center rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)]'
            >
              <div className='text-center'>
                <div className='mb-4 inline-flex rounded-2xl bg-[var(--c-surface)] p-5'>
                  <Star size={32} className='text-blue-500/40' />
                </div>
                <p className='font-medium text-[var(--c-text-2)]'>Select a stock to view details</p>
                <p className='mt-1 text-sm text-[var(--c-text-3)]'>
                  Click any row on the left to get started
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Watchlist
