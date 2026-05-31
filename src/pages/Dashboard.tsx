import { useEffect, useRef, useState } from 'react'
import { Briefcase, TrendingUp, LayoutList, BookMarked, Plus, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../components/dashboard/DashboardCard'
import MarketStatusBadge from '../components/dashboard/MarketStatusBadge'
import TopMovers from '../components/dashboard/TopMovers'
import RecentActivity from '../components/dashboard/RecentActivity'
import MarketOverviewChart from '../components/charts/MarketOverviewChart'
import Sparkline from '../components/charts/Sparkline'
import { StockAvatar } from '../components/ui/StockAvatar'
import { api } from '../lib/api'
import { generateSparklineData, getStockMeta } from '../data/stockDataGenerator'
import { useAuthStore } from '../store/authStore'
import { NSE_STOCKS } from '../data/nseStocks'

const FALLBACK_SYMBOLS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'NIFTY50']

// Pre-computed at module level — stable across renders
const PORTFOLIO_SPARK = generateSparklineData('PORTFOLIO_VAL')
const PNL_SPARK       = generateSparklineData('DAILY_PNL')
const POSITIONS_SPARK = generateSparklineData('ACTIVE_POS')

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatINR(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`
  if (n >= 1_000) return `₹${n.toLocaleString('en-IN')}`
  return `₹${n}`
}

// Watchlist skeleton row
function WatchlistSkeleton() {
  return (
    <div className='flex animate-pulse items-center gap-3 rounded-2xl bg-[var(--c-surface)] px-4 py-3'>
      <div className='h-8 w-8 shrink-0 rounded-xl bg-[var(--c-overlay-md)]' />
      <div className='flex-1 space-y-1.5'>
        <div className='h-3 w-20 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-2 w-8 rounded bg-[var(--c-overlay)]' />
      </div>
      <div className='h-8 w-[72px] rounded bg-[var(--c-overlay)]' />
      <div className='space-y-1 text-right'>
        <div className='h-3 w-16 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-2 w-10 rounded bg-[var(--c-overlay)]' />
      </div>
    </div>
  )
}

const Dashboard = () => {
  const firstName = useAuthStore((s) => s.firstName)
  const navigate = useNavigate()

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([])
  const [watchlistLoading, setWatchlistLoading]  = useState(true)

  // Quick-add state
  const [searchQuery, setSearchQuery]     = useState('')
  const [showSearch, setShowSearch]       = useState(false)
  const [addingSymbol, setAddingSymbol]   = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .get<{ symbol: string }[]>('/watchlist')
      .then((res) => {
        const symbols = res.data.map((item) => item.symbol).slice(0, 5)
        setWatchlistSymbols(symbols.length > 0 ? symbols : FALLBACK_SYMBOLS)
      })
      .catch(() => setWatchlistSymbols(FALLBACK_SYMBOLS))
      .finally(() => setWatchlistLoading(false))
  }, [])

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleAddToWatchlist(symbol: string) {
    if (watchlistSymbols.includes(symbol)) return
    setAddingSymbol(symbol)
    try {
      await api.post('/watchlist', { symbol })
      setWatchlistSymbols((prev) => [...prev, symbol].slice(0, 5))
    } catch { /* conflict */ }
    finally {
      setAddingSymbol(null)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const searchResults = searchQuery.length > 0
    ? NSE_STOCKS
        .filter((s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .filter((s) => !watchlistSymbols.includes(s.symbol))
        .slice(0, 5)
    : []

  const displayName = firstName ?? 'Trader'

  return (
    <div className='mx-auto max-w-[1600px] space-y-10'>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Overview</p>
          <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>
            {getGreeting()},{' '}
            <span className='bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent'>
              {displayName}
            </span>
          </h1>
          <p className='mt-2 text-[var(--c-text-2)]'>
            Monitor markets, portfolios, and trading performance in real time.
          </p>
        </div>

        <div className='flex items-center gap-3 pt-1'>
          <MarketStatusBadge />
          <button className='rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500'>
            New Trade
          </button>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className='grid gap-6 lg:grid-cols-2 2xl:grid-cols-4'>
        <DashboardCard
          title='Portfolio Value'
          value='₹12,45,000'
          change='+2.45%'
          positive
          sparkline={PORTFOLIO_SPARK}
          icon={<Briefcase size={18} />}
          accentColor='blue'
          numericValue={1245000}
          formatValue={formatINR}
        />
        <DashboardCard
          title='Daily P&L'
          value='₹18,240'
          change='+1.24%'
          positive
          sparkline={PNL_SPARK}
          icon={<TrendingUp size={18} />}
          accentColor='emerald'
          numericValue={18240}
          formatValue={formatINR}
        />
        <DashboardCard
          title='Active Positions'
          value='12'
          change='+3 Added'
          positive
          sparkline={POSITIONS_SPARK}
          icon={<LayoutList size={18} />}
          accentColor='violet'
          numericValue={12}
          formatValue={(n) => String(n)}
        />
        <DashboardCard
          title='Watchlist'
          value={String(watchlistSymbols.length)}
          change='+5 Today'
          positive
          icon={<BookMarked size={18} />}
          accentColor='amber'
          numericValue={watchlistLoading ? undefined : watchlistSymbols.length}
          formatValue={(n) => String(n)}
        />
      </div>

      {/* ── Chart + Watchlist ───────────────────────────────────── */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>

        {/* Market Overview Chart */}
        <div className='rounded-3xl bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6 xl:col-span-2'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Market Overview</h2>
              <p className='mt-1 text-sm text-[var(--c-text-2)]'>NSE & global indices performance</p>
            </div>
            <button
              onClick={() => navigate('/markets')}
              className='rounded-xl bg-[var(--c-overlay)] px-4 py-2 text-sm text-[var(--c-text-2)] transition hover:bg-[var(--c-overlay-md)]'
            >
              View All
            </button>
          </div>
          <div className='h-[320px] rounded-2xl bg-[var(--c-surface)] p-4'>
            <MarketOverviewChart />
          </div>
        </div>

        {/* Watchlist panel */}
        <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>

          {/* Panel header */}
          <div className='mb-4 flex items-start justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Watchlist</h2>
              <p className='mt-0.5 text-sm text-[var(--c-text-2)]'>Most tracked assets</p>
            </div>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                showSearch
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--c-overlay)] text-[var(--c-text-2)] hover:bg-[var(--c-overlay-md)] hover:text-[var(--c-text-1)]'
              }`}
              title='Add to watchlist'
            >
              {showSearch ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>

          {/* Quick-add search */}
          {showSearch && (
            <div ref={searchRef} className='relative mb-4'>
              <div className='flex items-center gap-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 focus-within:border-blue-500/50'>
                <Search size={13} className='shrink-0 text-[var(--c-text-3)]' />
                <input
                  autoFocus
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search stocks…'
                  className='flex-1 bg-transparent text-sm text-[var(--c-text-1)] placeholder-[var(--c-text-3)] outline-none'
                />
              </div>
              {searchResults.length > 0 && (
                <div className='absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] shadow-2xl'>
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleAddToWatchlist(stock.symbol)}
                      disabled={addingSymbol === stock.symbol}
                      className='flex w-full items-center justify-between px-4 py-2.5 transition hover:bg-[var(--c-overlay)] disabled:opacity-50'
                    >
                      <div className='text-left'>
                        <p className='text-sm font-semibold text-[var(--c-text-1)]'>{stock.symbol}</p>
                        <p className='text-xs text-[var(--c-text-3)]'>{stock.name}</p>
                      </div>
                      <Plus size={13} className='text-blue-400' />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rows */}
          <div className='space-y-3'>
            {watchlistLoading
              ? Array.from({ length: 5 }).map((_, i) => <WatchlistSkeleton key={i} />)
              : watchlistSymbols.map((symbol) => {
                  const meta     = getStockMeta(symbol)
                  const sparkline = generateSparklineData(symbol)
                  return (
                    <button
                      key={symbol}
                      onClick={() => navigate(`/markets/${symbol}`)}
                      className='flex w-full items-center justify-between rounded-2xl bg-[var(--c-surface)] px-4 py-3 text-left transition hover:bg-[var(--c-overlay)]'
                    >
                      <div className='flex items-center gap-2.5'>
                        <StockAvatar symbol={symbol} size='sm' />
                        <div>
                          <p className='font-medium text-[var(--c-text-1)]'>{symbol}</p>
                          <p className='text-xs text-[var(--c-text-3)]'>NSE</p>
                        </div>
                      </div>
                      <Sparkline data={sparkline} positive={meta.positive} />
                      <div className='text-right'>
                        <p className='text-sm font-semibold text-[var(--c-text-1)]'>{meta.price}</p>
                        <p className={`text-xs font-medium ${meta.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {meta.change}
                        </p>
                      </div>
                    </button>
                  )
                })
            }
          </div>

          {/* Footer link */}
          {!watchlistLoading && (
            <button
              onClick={() => navigate('/watchlist')}
              className='mt-4 w-full rounded-xl py-2 text-xs font-medium text-[var(--c-text-3)] transition hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-2)]'
            >
              Manage Watchlist →
            </button>
          )}
        </div>
      </div>

      {/* ── Top Movers + Recent Activity ───────────────────────── */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <div className='xl:col-span-2'>
          <TopMovers />
        </div>
        <RecentActivity />
      </div>

    </div>
  )
}

export default Dashboard
