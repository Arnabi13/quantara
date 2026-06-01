import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from 'lightweight-charts'
import { TrendingDown, TrendingUp, Wifi, WifiOff, ArrowUp, ArrowDown, Activity, BarChart2 } from 'lucide-react'
import {
  useTickers,
  useKline,
  useDepth,
  useTrades,
  usePriceFlash,
  useConnectionStatus,
  type TickerData,
  type KlineData,
  type DepthData,
  type TradeData,
} from '../hooks/useBinanceSocket'
import { useThemeStore } from '../store/themeStore'

// ── Constants ────────────────────────────────────────────────────────────────

const CHART_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const
type ChartSymbol = (typeof CHART_SYMBOLS)[number]

const ALL_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT']

const LABELS: Record<string, string> = {
  BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB',
  SOLUSDT: 'SOL', ADAUSDT: 'ADA', XRPUSDT: 'XRP', DOGEUSDT: 'DOGE',
}

const NAMES: Record<string, string> = {
  BTCUSDT: 'Bitcoin', ETHUSDT: 'Ethereum', BNBUSDT: 'BNB',
  SOLUSDT: 'Solana', ADAUSDT: 'Cardano', XRPUSDT: 'XRP', DOGEUSDT: 'Dogecoin',
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
type TF = (typeof TIMEFRAMES)[number]

const TF_LIMIT: Record<TF, number> = {
  '1m': 200, '5m': 200, '15m': 200, '1h': 200, '4h': 200, '1d': 200,
}

// Offset UTC unix-second timestamps to local time so the chart shows local clock
const TZ_OFFSET_SEC = -new Date().getTimezoneOffset() * 60

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(price: number, symbol: string): string {
  if (symbol === 'DOGEUSDT' || symbol === 'ADAUSDT') return `$${price.toFixed(4)}`
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(3)}`
  return `$${price.toFixed(5)}`
}

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toFixed(2)
}

function chartOptions(isDark: boolean) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: isDark ? '#9CA3AF' : '#475569',
      fontFamily: 'Inter, sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
      horzLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: '#3B82F6', width: 1 as const, style: 3 as const, labelBackgroundColor: '#3B82F6' },
      horzLine: { color: '#3B82F6', width: 1 as const, style: 3 as const, labelBackgroundColor: '#3B82F6' },
    },
    rightPriceScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      textColor: isDark ? '#6B7280' : '#64748B',
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    handleScroll: true,
    handleScale: true,
  }
}

// ── ConnectionBadge ──────────────────────────────────────────────────────────

function ConnectionBadge() {
  const status = useConnectionStatus()
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${
      status === 'connected'
        ? 'bg-emerald-500/10 text-emerald-400'
        : status === 'disconnected'
          ? 'bg-red-500/10 text-red-400'
          : 'bg-amber-500/10 text-amber-400'
    }`}>
      {status === 'connected'
        ? <><span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400' /><Wifi size={12} /> LIVE</>
        : status === 'disconnected'
          ? <><span className='h-1.5 w-1.5 rounded-full bg-red-400' /><WifiOff size={12} /> OFFLINE</>
          : <><span className='h-1.5 w-1.5 animate-ping rounded-full bg-amber-400' /> CONNECTING</>
      }
    </div>
  )
}

// ── PriceCard ────────────────────────────────────────────────────────────────

function PriceCard({ ticker, selected, onClick }: {
  ticker: TickerData | undefined
  symbol: string
  selected: boolean
  onClick: () => void
}) {
  const flash = usePriceFlash(ticker?.price)
  const positive = (ticker?.changePct ?? 0) >= 0

  if (!ticker) {
    return (
      <div className='flex animate-pulse flex-col gap-2 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4'>
        <div className='h-3 w-10 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-5 w-24 rounded bg-[var(--c-overlay-md)]' />
        <div className='h-3 w-14 rounded bg-[var(--c-overlay)]' />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-blue-500/50 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
          : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-sub)] hover:bg-[var(--c-surface-2)]'
      } ${
        flash === 'up' ? 'shadow-[0_0_12px_rgba(16,185,129,0.25)]' : flash === 'down' ? 'shadow-[0_0_12px_rgba(239,68,68,0.25)]' : ''
      }`}
    >
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold uppercase tracking-wider text-[var(--c-text-3)]'>
          {LABELS[ticker.symbol]}
        </span>
        {positive
          ? <TrendingUp size={12} className='text-emerald-400' />
          : <TrendingDown size={12} className='text-red-400' />}
      </div>
      <p className={`text-base font-bold transition-colors duration-150 ${
        flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-red-400' : 'text-[var(--c-text-1)]'
      }`}>
        {fmtPrice(ticker.price, ticker.symbol)}
      </p>
      <p className={`text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? '+' : ''}{ticker.changePct.toFixed(2)}%
      </p>
    </button>
  )
}

// ── LiveChart ────────────────────────────────────────────────────────────────

function LiveChart({ symbol, timeframe }: { symbol: ChartSymbol; timeframe: TF }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const isDark = useThemeStore((s) => s.isDark)
  const [loading, setLoading] = useState(true)

  // Build chart once
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, chartOptions(isDark))
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', downColor: '#EF4444',
      borderUpColor: '#10B981', borderDownColor: '#EF4444',
      wickUpColor: '#10B981', wickDownColor: '#EF4444',
    })
    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null }
  }, [isDark])

  // Fetch historical klines whenever symbol or timeframe changes
  useEffect(() => {
    if (!seriesRef.current) return
    setLoading(true)
    const limit = TF_LIMIT[timeframe]

    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`)
      .then((r) => r.json())
      .then((raw: unknown[][]) => {
        if (!seriesRef.current) return
        const candles: CandlestickData[] = raw.map((k) => ({
          time: (Math.floor((k[0] as number) / 1000) + TZ_OFFSET_SEC) as Time,
          open: parseFloat(k[1] as string),
          high: parseFloat(k[2] as string),
          low: parseFloat(k[3] as string),
          close: parseFloat(k[4] as string),
        }))
        seriesRef.current.setData(candles)
        chartRef.current?.timeScale().fitContent()
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [symbol, timeframe])

  // Stream live 1m updates (only meaningful when timeframe === '1m')
  useKline(symbol, useCallback((candle: KlineData) => {
    if (!seriesRef.current || timeframe !== '1m') return
    seriesRef.current.update({
      time: (candle.time + TZ_OFFSET_SEC) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })
  }, [timeframe]))

  return (
    <div className='relative flex-1'>
      {loading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--c-surface)]/60 backdrop-blur-sm'>
          <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
        </div>
      )}
      <div ref={containerRef} className='h-full w-full' />
    </div>
  )
}

// ── OrderBook ────────────────────────────────────────────────────────────────

function OrderBook({ symbol }: { symbol: string }) {
  const depth = useDepth(symbol) as DepthData | null

  const maxQty = depth
    ? Math.max(...depth.bids.map(([, q]) => q), ...depth.asks.map(([, q]) => q), 0.001)
    : 1

  if (!depth) {
    return (
      <div className='flex flex-col gap-1'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className='flex animate-pulse gap-2'>
            <div className='h-5 flex-1 rounded bg-[var(--c-overlay)]' />
            <div className='h-5 flex-1 rounded bg-[var(--c-overlay)]' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-0.5 text-xs font-mono'>
      <div className='mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>
        <span>Price (USDT)</span>
        <span>Quantity</span>
      </div>

      {/* Asks (sells) — top, red — shown in reverse so lowest ask is closest to spread */}
      {[...depth.asks].reverse().map(([price, qty], i) => (
        <div key={`ask-${i}`} className='relative flex items-center justify-between rounded px-2 py-0.5'>
          <div
            className='absolute inset-y-0 right-0 rounded bg-red-500/10 transition-all duration-300'
            style={{ width: `${(qty / maxQty) * 100}%` }}
          />
          <span className='relative text-red-400'>{price.toFixed(2)}</span>
          <span className='relative text-[var(--c-text-2)]'>{qty.toFixed(4)}</span>
        </div>
      ))}

      {/* Spread indicator */}
      {depth.bids[0] && depth.asks[0] && (
        <div className='my-1 flex justify-center text-[10px] font-semibold text-blue-400'>
          Spread: ${(depth.asks[0][0] - depth.bids[0][0]).toFixed(2)}
        </div>
      )}

      {/* Bids (buys) — bottom, green */}
      {depth.bids.map(([price, qty], i) => (
        <div key={`bid-${i}`} className='relative flex items-center justify-between rounded px-2 py-0.5'>
          <div
            className='absolute inset-y-0 right-0 rounded bg-emerald-500/10 transition-all duration-300'
            style={{ width: `${(qty / maxQty) * 100}%` }}
          />
          <span className='relative text-emerald-400'>{price.toFixed(2)}</span>
          <span className='relative text-[var(--c-text-2)]'>{qty.toFixed(4)}</span>
        </div>
      ))}
    </div>
  )
}

// ── TradeFeed ────────────────────────────────────────────────────────────────

function TradeFeed({ symbol }: { symbol: string }) {
  const trades = useTrades(symbol, 30) as TradeData[]

  if (trades.length === 0) {
    return (
      <div className='flex flex-col gap-1'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='flex animate-pulse justify-between gap-2 py-1'>
            <div className='h-4 w-20 rounded bg-[var(--c-overlay)]' />
            <div className='h-4 w-14 rounded bg-[var(--c-overlay)]' />
            <div className='h-4 w-10 rounded bg-[var(--c-overlay)]' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-0.5 overflow-y-auto text-xs font-mono [scrollbar-width:none]'>
      <div className='mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
      </div>
      {trades.map((trade, i) => {
        const isBuy = !trade.isBuyerMaker
        const t = new Date(trade.time)
        const ts = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`
        return (
          <div
            key={i}
            className='flex items-center justify-between rounded py-0.5 px-1 transition-colors duration-200 hover:bg-[var(--c-overlay)]'
          >
            <span className={isBuy ? 'text-emerald-400' : 'text-red-400'}>
              {trade.price.toFixed(2)}
            </span>
            <span className='text-[var(--c-text-2)]'>{fmtVol(trade.qty)}</span>
            <span className='text-[var(--c-text-3)]'>{ts}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── PressureBar ──────────────────────────────────────────────────────────────

function PressureBar({ symbol }: { symbol: string }) {
  const depth = useDepth(symbol) as DepthData | null
  if (!depth) return null

  const bidTotal = depth.bids.reduce((sum, [, q]) => sum + q, 0)
  const askTotal = depth.asks.reduce((sum, [, q]) => sum + q, 0)
  const total    = bidTotal + askTotal || 1
  const buyPct   = (bidTotal / total) * 100
  const sellPct  = 100 - buyPct
  const buyDom   = buyPct >= 50

  const segments = [
    { pct: buyPct,  color: '#10B981' },
    { pct: sellPct, color: '#EF4444' },
  ]

  return (
    <div className='mt-3 rounded-xl bg-[var(--c-overlay)] px-4 py-3'>
      {/* Header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>
          Order Book Pressure
        </span>
        <span className={`flex items-center gap-1 text-[10px] font-bold ${buyDom ? 'text-emerald-400' : 'text-red-400'}`}>
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${buyDom ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {buyDom ? 'Buy' : 'Sell'} Pressure
        </span>
      </div>

      {/* Segmented bar */}
      <div className='flex h-3 overflow-hidden rounded-full'>
        {segments.map((seg, i) => (
          <div
            key={i}
            className='transition-all duration-500'
            style={{ width: `${seg.pct}%`, background: seg.color + (i === 0 ? 'cc' : '99') }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className='mt-2 flex items-center justify-between text-[10px]'>
        <div className='flex items-center gap-1.5'>
          <span className='h-2 w-2 rounded-sm bg-emerald-400' />
          <span className='text-emerald-400 font-semibold'>Bids {buyPct.toFixed(1)}%</span>
          <span className='text-[var(--c-text-3)]'>({bidTotal.toFixed(3)} {symbol.replace('USDT', '')})</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='text-[var(--c-text-3)]'>({askTotal.toFixed(3)} {symbol.replace('USDT', '')})</span>
          <span className='text-red-400 font-semibold'>Asks {sellPct.toFixed(1)}%</span>
          <span className='h-2 w-2 rounded-sm bg-red-400' />
        </div>
      </div>
    </div>
  )
}

// ── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({ sym, ticker }: { sym: string; ticker: TickerData }) {
  const flash = usePriceFlash(ticker.price)
  const positive = ticker.changePct >= 0
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    setHistory((prev) => [...prev.slice(-49), ticker.price])
  }, [ticker.price])

  const sparkPath = useMemo(() => {
    if (history.length < 2) return ''
    const W = 100, H = 32
    const min = Math.min(...history)
    const max = Math.max(...history)
    const range = max - min || 1
    const pts = history.map((p, i) => {
      const x = (i / (history.length - 1)) * W
      const y = H - ((p - min) / range) * (H - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return `M ${pts.join(' L ')}`
  }, [history])

  const rangePos = ticker.high > ticker.low
    ? Math.min(100, Math.max(0, ((ticker.price - ticker.low) / (ticker.high - ticker.low)) * 100))
    : 50

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
      flash === 'up'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : flash === 'down'
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-[var(--c-border)] bg-[var(--c-surface)]'
    }`}>
      {/* Header */}
      <div className='mb-2 flex items-start justify-between gap-1'>
        <div>
          <p className='text-xs font-bold text-[var(--c-text-1)]'>{LABELS[sym]}</p>
          <p className='text-[10px] text-[var(--c-text-3)]'>{NAMES[sym]}</p>
        </div>
        <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
          positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {positive ? '+' : ''}{ticker.changePct.toFixed(2)}%
        </span>
      </div>

      {/* Price */}
      <p className={`text-sm font-bold transition-colors duration-150 ${
        flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-red-400' : 'text-[var(--c-text-1)]'
      }`}>
        {fmtPrice(ticker.price, sym)}
      </p>

      {/* Sparkline */}
      <div className='my-2 h-8'>
        {sparkPath ? (
          <svg viewBox='0 0 100 32' className='h-full w-full' preserveAspectRatio='none'>
            <defs>
              <linearGradient id={`sg-${sym}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity='0.3' />
                <stop offset='100%' stopColor={positive ? '#10B981' : '#EF4444'} stopOpacity='0' />
              </linearGradient>
            </defs>
            <path
              d={`${sparkPath} V 32 H 0 Z`}
              fill={`url(#sg-${sym})`}
            />
            <path
              d={sparkPath}
              fill='none'
              stroke={positive ? '#10B981' : '#EF4444'}
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        ) : (
          <div className='h-full w-full animate-pulse rounded bg-[var(--c-overlay)]' />
        )}
      </div>

      {/* 24h range bar */}
      <div>
        <div className='relative h-1 rounded-full bg-[var(--c-overlay-md)]'>
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${positive ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}
            style={{ width: `${rangePos}%` }}
          />
          <div
            className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--c-surface)] shadow transition-all duration-300 ${positive ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ left: `${rangePos}%` }}
          />
        </div>
        <div className='mt-1 flex justify-between text-[9px] text-[var(--c-text-3)]'>
          <span>{fmtPrice(ticker.low, sym)}</span>
          <span>{fmtPrice(ticker.high, sym)}</span>
        </div>
      </div>

      {/* Volume */}
      <p className='mt-2 border-t border-[var(--c-border)] pt-2 text-[10px] text-[var(--c-text-3)]'>
        Vol <span className='font-semibold text-blue-400'>{fmtVol(ticker.volume)}</span>
      </p>
    </div>
  )
}

// ── Crypto page ──────────────────────────────────────────────────────────────

export default function Crypto() {
  const { tickers } = useTickers()
  const [chartSymbol, setChartSymbol] = useState<ChartSymbol>('BTCUSDT')
  const [timeframe, setTimeframe] = useState<TF>('1m')

  const activeTicker = tickers[chartSymbol]

  return (
    <div className='mx-auto max-w-[1600px] space-y-8'>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Real-Time</p>
          <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>
            Crypto{' '}
            <span className='bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent'>
              Markets
            </span>
          </h1>
          <p className='mt-2 text-[var(--c-text-2)]'>
            Live data streamed directly from Binance WebSocket — zero delay.
          </p>
        </div>
        <div className='flex items-center gap-3 pt-1'>
          <ConnectionBadge />
        </div>
      </div>

      {/* ── Price Cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
        {ALL_SYMBOLS.map((sym) => (
          <PriceCard
            key={sym}
            symbol={sym}
            ticker={tickers[sym]}
            selected={chartSymbol === sym && CHART_SYMBOLS.includes(sym as ChartSymbol)}
            onClick={() => {
              if (CHART_SYMBOLS.includes(sym as ChartSymbol)) {
                setChartSymbol(sym as ChartSymbol)
              }
            }}
          />
        ))}
      </div>

      {/* ── Chart + Sidebar ─────────────────────────────────────────── */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>

        {/* Chart panel */}
        <div className='flex flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5 xl:col-span-2'>
          {/* Chart header */}
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              {/* Symbol selector */}
              <div className='flex gap-1 rounded-xl bg-[var(--c-overlay)] p-1'>
                {CHART_SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setChartSymbol(sym)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      chartSymbol === sym
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-[var(--c-text-2)] hover:text-[var(--c-text-1)]'
                    }`}
                  >
                    {LABELS[sym]}
                  </button>
                ))}
              </div>
              {activeTicker && (
                <div className='flex items-baseline gap-2'>
                  <span className='text-xl font-bold text-[var(--c-text-1)]'>
                    {fmtPrice(activeTicker.price, chartSymbol)}
                  </span>
                  <span className={`text-sm font-semibold ${activeTicker.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {activeTicker.changePct >= 0 ? '+' : ''}{activeTicker.changePct.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            {/* Timeframe selector */}
            <div className='flex gap-1'>
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--c-text-2)] hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-1)]'
                  }`}
                >
                  {tf}
                  {tf === '1m' && <span className='ml-1 text-[8px] font-bold text-blue-300 opacity-80'>●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className='h-[460px] overflow-hidden rounded-2xl bg-[var(--c-surface)] p-3'>
            <div className='flex h-full flex-col'>
              <LiveChart symbol={chartSymbol} timeframe={timeframe} />
            </div>
          </div>

          {/* Stats row */}
          {activeTicker && (() => {
            const pctFromHigh = ((activeTicker.price - activeTicker.high) / activeTicker.high) * 100
            const pctFromLow  = ((activeTicker.price - activeTicker.low)  / activeTicker.low)  * 100
            const changeFromOpen = activeTicker.price - activeTicker.open
            const volUsd = activeTicker.volume * activeTicker.price
            const rangePos = activeTicker.high > activeTicker.low
              ? Math.min(100, Math.max(0, ((activeTicker.price - activeTicker.low) / (activeTicker.high - activeTicker.low)) * 100))
              : 50

            return (
              <>
                <div className='mt-3 grid grid-cols-4 gap-3'>
                  {/* 24h High */}
                  <div className='rounded-xl bg-[var(--c-overlay)] p-3'>
                    <div className='mb-1.5 flex items-center gap-1.5'>
                      <span className='flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400'>
                        <ArrowUp size={11} />
                      </span>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>24h High</p>
                    </div>
                    <p className='text-sm font-bold text-emerald-400'>{fmtPrice(activeTicker.high, chartSymbol)}</p>
                    <p className='mt-1 text-[10px] text-red-400'>{pctFromHigh.toFixed(2)}% from now</p>
                  </div>

                  {/* 24h Low */}
                  <div className='rounded-xl bg-[var(--c-overlay)] p-3'>
                    <div className='mb-1.5 flex items-center gap-1.5'>
                      <span className='flex h-5 w-5 items-center justify-center rounded-md bg-red-500/15 text-red-400'>
                        <ArrowDown size={11} />
                      </span>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>24h Low</p>
                    </div>
                    <p className='text-sm font-bold text-red-400'>{fmtPrice(activeTicker.low, chartSymbol)}</p>
                    <p className='mt-1 text-[10px] text-emerald-400'>+{pctFromLow.toFixed(2)}% from now</p>
                  </div>

                  {/* 24h Open */}
                  <div className='rounded-xl bg-[var(--c-overlay)] p-3'>
                    <div className='mb-1.5 flex items-center gap-1.5'>
                      <span className='flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-400'>
                        <Activity size={11} />
                      </span>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>24h Open</p>
                    </div>
                    <p className='text-sm font-bold text-[var(--c-text-1)]'>{fmtPrice(activeTicker.open, chartSymbol)}</p>
                    <p className={`mt-1 text-[10px] font-semibold ${changeFromOpen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {changeFromOpen >= 0 ? '+' : ''}{fmtPrice(Math.abs(changeFromOpen), chartSymbol)} chg
                    </p>
                  </div>

                  {/* Volume */}
                  <div className='rounded-xl bg-[var(--c-overlay)] p-3'>
                    <div className='mb-1.5 flex items-center gap-1.5'>
                      <span className='flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/15 text-violet-400'>
                        <BarChart2 size={11} />
                      </span>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>Volume</p>
                    </div>
                    <p className='text-sm font-bold text-blue-400'>{fmtVol(activeTicker.volume)}</p>
                    <p className='mt-1 text-[10px] text-[var(--c-text-3)]'>≈ ${fmtVol(volUsd)}</p>
                  </div>
                </div>

                {/* 24h range bar */}
                <div className='mt-3 rounded-xl bg-[var(--c-overlay)] px-4 py-3'>
                  <div className='mb-2 flex items-center justify-between text-[10px] text-[var(--c-text-3)]'>
                    <span className='font-semibold text-red-400'>Low {fmtPrice(activeTicker.low, chartSymbol)}</span>
                    <span className='font-semibold uppercase tracking-wider'>24h Range</span>
                    <span className='font-semibold text-emerald-400'>High {fmtPrice(activeTicker.high, chartSymbol)}</span>
                  </div>
                  <div className='relative h-2 rounded-full bg-gradient-to-r from-red-500/30 via-amber-500/20 to-emerald-500/30'>
                    <div
                      className='absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300'
                      style={{ left: `${rangePos}%` }}
                    />
                  </div>
                  <p className='mt-2 text-center text-[10px] font-semibold text-blue-400'>
                    {fmtPrice(activeTicker.price, chartSymbol)} — {rangePos.toFixed(1)}% of daily range
                  </p>
                </div>
              </>
            )
          })()}

          <PressureBar symbol={chartSymbol} />
        </div>

        {/* Order book + Trade feed */}
        <div className='flex flex-col gap-5'>
          {/* Order Book */}
          <div className='flex flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-[var(--c-text-1)]'>Order Book</h3>
              <span className='text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-3)]'>
                {LABELS[chartSymbol] ?? chartSymbol} / USDT
              </span>
            </div>
            <OrderBook symbol={chartSymbol} />
          </div>

          {/* Trade Feed */}
          <div className='flex flex-1 flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-[var(--c-text-1)]'>Live Trades</h3>
              <div className='flex items-center gap-1.5'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-blue-400'>
                  Streaming
                </span>
              </div>
            </div>
            <div className='flex-1 overflow-hidden'>
              <TradeFeed symbol={chartSymbol} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Full width info grid ─────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
        {ALL_SYMBOLS.map((sym) => {
          const t = tickers[sym]
          if (!t) return null
          return <SummaryCard key={sym} sym={sym} ticker={t} />
        })}
      </div>

    </div>
  )
}
