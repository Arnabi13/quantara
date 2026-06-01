import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTickers, usePriceFlash, type TickerData } from '../../hooks/useBinanceSocket'

const DISPLAY_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT']

const LABELS: Record<string, string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  BNBUSDT: 'BNB',
  SOLUSDT: 'SOL',
  ADAUSDT: 'ADA',
  XRPUSDT: 'XRP',
  DOGEUSDT: 'DOGE',
}

function formatPrice(price: number, symbol: string): string {
  if (symbol === 'DOGEUSDT' || symbol === 'ADAUSDT') {
    return `$${price.toFixed(4)}`
  }
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(3)}`
  return `$${price.toFixed(5)}`
}

function TickerItem({ ticker }: { ticker: TickerData }) {
  const flash = usePriceFlash(ticker.price)
  const positive = ticker.changePct >= 0

  return (
    <div
      className={`inline-flex shrink-0 items-center gap-3 border-r border-[var(--c-border-sub)] px-8 last:border-r-0 transition-colors duration-150 ${
        flash === 'up' ? 'bg-emerald-500/10' : flash === 'down' ? 'bg-red-500/10' : ''
      }`}
    >
      <span className='text-[11px] font-semibold uppercase tracking-widest text-blue-400'>
        {LABELS[ticker.symbol] ?? ticker.symbol}
      </span>
      <span
        className={`text-sm font-bold transition-colors duration-150 ${
          flash === 'up'
            ? 'text-emerald-400'
            : flash === 'down'
              ? 'text-red-400'
              : 'text-[var(--c-text-1)]'
        }`}
      >
        {formatPrice(ticker.price, ticker.symbol)}
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {positive ? '+' : ''}{ticker.changePct.toFixed(2)}%
      </span>
    </div>
  )
}

function SkeletonItem() {
  return (
    <div className='inline-flex shrink-0 animate-pulse items-center gap-3 border-r border-[var(--c-border-sub)] px-8'>
      <div className='h-3 w-8 rounded bg-[var(--c-overlay-md)]' />
      <div className='h-3 w-16 rounded bg-[var(--c-overlay-md)]' />
      <div className='h-3 w-10 rounded bg-[var(--c-overlay)]' />
    </div>
  )
}

export default function CryptoTicker() {
  const { tickers } = useTickers()

  const items = DISPLAY_SYMBOLS
    .map((sym) => tickers[sym])
    .filter(Boolean) as TickerData[]

  const hasData = items.length > 0
  const doubled = hasData ? [...items, ...items] : []

  return (
    <div className='overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]'>
      <style>{`
        @keyframes crypto-ticker {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .crypto-track {
          animation: crypto-ticker 45s linear infinite;
          will-change: transform;
          display: flex;
        }
        .crypto-track:hover { animation-play-state: paused; }
      `}</style>

      <div className='flex items-center overflow-hidden'>
        <div className='shrink-0 border-r border-[var(--c-border-sub)] px-4 py-3.5'>
          <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400'>
            LIVE
          </span>
          <span className='ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400' />
        </div>

        <div className='flex overflow-hidden py-3.5'>
          {hasData ? (
            <div className='crypto-track'>
              {doubled.map((ticker, i) => (
                <TickerItem key={`${ticker.symbol}-${i}`} ticker={ticker} />
              ))}
            </div>
          ) : (
            <div className='flex'>
              {DISPLAY_SYMBOLS.map((s) => <SkeletonItem key={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
