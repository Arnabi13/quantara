import { TrendingDown, TrendingUp } from 'lucide-react'
import { MARKET_INDICES } from '../../data/marketsData'
import { getStockMeta } from '../../data/stockDataGenerator'

const items = MARKET_INDICES.map((idx) => ({ ...idx, ...getStockMeta(idx.symbol) }))
const doubled = [...items, ...items]

export default function TickerStrip() {
  return (
    <div className='overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]'>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .ticker-track {
          animation: ticker 40s linear infinite;
          will-change: transform;
          display: flex;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <div className='flex overflow-hidden py-3.5'>
        <div className='ticker-track'>
          {doubled.map((item, i) => (
            <div
              key={i}
              className='inline-flex shrink-0 items-center gap-3 border-r border-[var(--c-border-sub)] px-8 last:border-r-0'
            >
              <span className='text-[11px] font-semibold uppercase tracking-widest text-[var(--c-text-3)]'>
                {item.label}
              </span>
              <span className='text-sm font-bold text-[var(--c-text-1)]'>{item.price}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  item.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {item.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
