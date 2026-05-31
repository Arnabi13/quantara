import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Clock, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { formatIST } from '../lib/formatDate'
import StockDetailChart from '../components/charts/StockDetailChart'
import { getExtendedStockData } from '../data/marketsData'
import { StockAvatar } from '../components/ui/StockAvatar'
import { AlertForm } from '../components/ui/AlertForm'
import { api } from '../lib/api'
import type { AppAlert } from '../hooks/useNotifications'

export default function StockDetail() {
  const { symbol = '' } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const sym = symbol.toUpperCase()

  const stock = getExtendedStockData(sym)

  const [isInWatchlist, setIsInWatchlist]   = useState(false)
  const [watchlistReady, setWatchlistReady] = useState(false)
  const [showAlertForm, setShowAlertForm]   = useState(false)
  const [alerts, setAlerts]                 = useState<AppAlert[]>([])

  useEffect(() => {
    api
      .get<{ symbol: string }[]>('/watchlist')
      .then((res) => { setIsInWatchlist(res.data.some((item) => item.symbol === sym)) })
      .catch(() => {})
      .finally(() => setWatchlistReady(true))
  }, [sym])

  function loadAlerts() {
    api.get<AppAlert[]>('/alerts').then((res) => {
      setAlerts(res.data.filter((a) => a.symbol === sym && a.isActive))
    }).catch(() => {})
  }

  useEffect(() => { loadAlerts() }, [sym])

  async function toggleWatchlist() {
    try {
      if (isInWatchlist) {
        await api.delete(`/watchlist/${sym}`)
        setIsInWatchlist(false)
      } else {
        await api.post('/watchlist', { symbol: sym })
        setIsInWatchlist(true)
      }
    } catch {
      // ignore conflict
    }
  }

  const primaryStats = [
    { label: 'Open',       value: `₹${stock.openVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Day High',   value: `₹${stock.highVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Day Low',    value: `₹${stock.lowVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: 'Close',      value: stock.price },
    { label: 'Volume',     value: stock.volumeStr },
    { label: 'Market Cap', value: stock.marketCap },
    { label: '52W High',   value: stock.high52w },
    { label: '52W Low',    value: stock.low52w },
  ]

  const fundamentals = [
    { label: 'P/E Ratio',   value: stock.pe },
    { label: 'EPS',         value: stock.eps },
    { label: 'Book Value',  value: stock.bookValue },
  ]

  return (
    <div className='mx-auto max-w-[1600px] space-y-6'>
      {/* Back nav */}
      <button
        onClick={() => navigate('/markets')}
        className='flex items-center gap-2 text-sm text-[var(--c-text-3)] transition hover:text-[var(--c-text-1)]'
      >
        <ArrowLeft size={15} />
        Back to Markets
      </button>

      {/* Stock header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='rounded-lg bg-blue-600/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-400'>
              NSE
            </span>
            <span className='text-sm text-[var(--c-text-3)]'>{stock.sector}</span>
          </div>
          <div className='mt-2 flex items-center gap-3'>
            <StockAvatar symbol={sym} size="xl" />
            <div>
              <h1 className='text-4xl font-bold text-[var(--c-text-1)]'>{sym}</h1>
              <p className='mt-0.5 text-[var(--c-text-2)]'>{stock.name}</p>
            </div>
          </div>
          <div className='mt-3 flex items-baseline gap-3'>
            <span className='text-3xl font-bold text-[var(--c-text-1)]'>{stock.price}</span>
            <span
              className={`flex items-center gap-1 text-lg font-semibold ${
                stock.positive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {stock.positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {stock.change}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={toggleWatchlist}
            disabled={!watchlistReady}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
              isInWatchlist
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            <Star size={16} className={isInWatchlist ? 'fill-red-400' : ''} />
            {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
          <button
            onClick={() => setShowAlertForm((v) => !v)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition ${
              showAlertForm
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            {showAlertForm ? <BellOff size={16} /> : <Bell size={16} />}
            {showAlertForm ? 'Cancel Alert' : 'Set Price Alert'}
          </button>
        </div>
      </div>

      {/* Alert form */}
      {showAlertForm && (
        <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
          <h3 className='mb-4 text-sm font-semibold text-[var(--c-text-1)]'>Price Alert for {sym}</h3>
          <div className='max-w-sm'>
            <AlertForm
              symbol={sym}
              currentPrice={stock.priceVal}
              onCreated={() => { setShowAlertForm(false); loadAlerts() }}
            />
          </div>
          {alerts.length > 0 && (
            <div className='mt-5 border-t border-[var(--c-border)] pt-4'>
              <p className='mb-2 text-xs font-medium text-[var(--c-text-3)]'>Active alerts</p>
              <div className='flex flex-col gap-1.5'>
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between gap-4 rounded-xl bg-[var(--c-surface)] px-3 py-2.5'
                  >
                    <span className={`text-xs font-semibold ${a.condition === 'above' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {a.condition === 'above' ? '↑ Above' : '↓ Below'} ₹{a.targetPrice.toLocaleString('en-IN')}
                    </span>
                    <span className='flex items-center gap-1 text-[10px] text-[var(--c-text-3)]'>
                      <Clock size={10} />
                      {formatIST(a.createdAt)}
                    </span>
                    <button
                      onClick={async () => {
                        await api.delete(`/alerts/${a.id}`)
                        loadAlerts()
                      }}
                      className='shrink-0 text-[10px] text-[var(--c-text-3)] transition hover:text-red-400'
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candlestick chart */}
      <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
        <div className='h-[400px] rounded-2xl bg-[var(--c-surface)] p-4'>
          <StockDetailChart symbol={sym} />
        </div>
      </div>

      {/* Stats grid */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {primaryStats.map(({ label, value }) => (
          <div
            key={label}
            className='rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'
          >
            <p className='text-xs font-medium text-[var(--c-text-3)]'>{label}</p>
            <p className='mt-1.5 text-xl font-bold text-[var(--c-text-1)]'>{value}</p>
          </div>
        ))}
      </div>

      {/* Fundamentals */}
      <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
        <h3 className='mb-4 text-base font-semibold text-[var(--c-text-1)]'>Key Fundamentals</h3>
        <div className='grid grid-cols-3 gap-4'>
          {fundamentals.map(({ label, value }) => (
            <div key={label} className='rounded-xl bg-[var(--c-surface)] p-5'>
              <p className='text-xs text-[var(--c-text-3)]'>{label}</p>
              <p className='mt-1.5 text-2xl font-bold text-[var(--c-text-1)]'>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
