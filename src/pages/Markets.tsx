import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import TickerStrip from '../components/markets/TickerStrip'
import IndicesTable from '../components/markets/IndicesTable'
import MarketMovers from '../components/markets/MarketMovers'
import SectorHeatmap from '../components/markets/SectorHeatmap'
import StockSidePanel from '../components/markets/StockSidePanel'

const Markets = () => {
  const [selected, setSelected]               = useState<string | null>(null)
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([])

  useEffect(() => {
    api
      .get<{ symbol: string }[]>('/watchlist')
      .then((res) => setWatchlistSymbols(res.data.map((item) => item.symbol)))
      .catch(() => {})
  }, [])

  async function handleToggleWatchlist(symbol: string, add: boolean) {
    try {
      if (add) {
        await api.post('/watchlist', { symbol })
        setWatchlistSymbols((prev) => [...prev, symbol])
      } else {
        await api.delete(`/watchlist/${symbol}`)
        setWatchlistSymbols((prev) => prev.filter((s) => s !== symbol))
      }
    } catch {
      // conflict or not found — ignore
    }
  }

  return (
    <div className='mx-auto max-w-[1600px] space-y-6'>
      {/* Page header */}
      <div>
        <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Live</p>
        <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>Markets</h1>
        <p className='mt-3 text-[var(--c-text-2)]'>
          Real-time NSE indices, stock performance, and sector breakdown.
        </p>
      </div>

      {/* Ticker strip */}
      <TickerStrip />

      {/* Main grid: table (2/3) + movers (1/3) */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <div className='xl:col-span-2'>
          <IndicesTable onSelect={setSelected} selected={selected} />
        </div>
        <div>
          <MarketMovers onSelect={setSelected} />
        </div>
      </div>

      {/* Sector heatmap */}
      <SectorHeatmap onSelect={setSelected} />

      {/* Backdrop */}
      {selected && (
        <div
          className='fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]'
          onClick={() => setSelected(null)}
        />
      )}

      {/* Slide-in stock detail panel */}
      <AnimatePresence>
        {selected && (
          <StockSidePanel
            key={selected}
            symbol={selected}
            watchlistSymbols={watchlistSymbols}
            onClose={() => setSelected(null)}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Markets
