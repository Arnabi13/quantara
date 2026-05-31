import { useEffect, useState } from 'react'
import DashboardCard from '../components/dashboard/DashboardCard'
import MarketOverviewChart from '../components/charts/MarketOverviewChart'
import Sparkline from '../components/charts/Sparkline'
import { StockAvatar } from '../components/ui/StockAvatar'
import { api } from '../lib/api'
import { generateSparklineData, getStockMeta } from '../data/stockDataGenerator'

const FALLBACK_SYMBOLS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'NIFTY50']

const Dashboard = () => {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(FALLBACK_SYMBOLS)

  useEffect(() => {
    api
      .get<{ symbol: string }[]>('/watchlist')
      .then((res) => {
        const symbols = res.data.map((item) => item.symbol).slice(0, 5)
        if (symbols.length > 0) setWatchlistSymbols(symbols)
      })
      .catch(() => {
        // keep fallback
      })
  }, [])

  return (
    <div className='mx-auto max-w-[1600px] space-y-10'>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>
            Overview
          </p>
          <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>
            Trading Dashboard
          </h1>
          <p className='mt-3 text-[var(--c-text-2)]'>
            Monitor markets, portfolios, and trading performance in real time.
          </p>
        </div>

        <button className='rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500'>
          New Trade
        </button>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 lg:grid-cols-2 2xl:grid-cols-4'>
        <DashboardCard title='Portfolio Value' value='₹12,45,000' change='+2.45%' />
        <DashboardCard title='Daily P&L'       value='₹18,240'    change='+1.24%' />
        <DashboardCard title='Active Positions' value='12'         change='+3 Added' />
        <DashboardCard title='Watchlist'        value={String(watchlistSymbols.length)} change='+5 Today' />
      </div>

      {/* Bottom Grid */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>

        {/* Market Overview Chart */}
        <div className='rounded-3xl bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6 xl:col-span-2'>
          <div className='mb-2 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Market Overview</h2>
              <p className='mt-1 text-sm text-[var(--c-text-2)]'>NSE & global indices performance</p>
            </div>
            <button className='rounded-xl bg-[var(--c-overlay)] px-4 py-2 text-sm text-[var(--c-text-2)] transition hover:bg-[var(--c-overlay-md)]'>
              View All
            </button>
          </div>

          <div className='h-[320px] rounded-2xl bg-[var(--c-surface)] p-4'>
            <MarketOverviewChart />
          </div>
        </div>

        {/* Watchlist */}
        <div className='rounded-3xl border bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-[var(--c-text-1)]'>Watchlist</h2>
            <p className='mt-1 text-sm text-[var(--c-text-2)]'>Most tracked assets</p>
          </div>

          <div className='space-y-3'>
            {watchlistSymbols.map((symbol) => {
              const meta = getStockMeta(symbol)
              const sparkline = generateSparklineData(symbol)
              return (
                <div
                  key={symbol}
                  className='flex items-center justify-between rounded-2xl bg-[var(--c-surface)] px-4 py-3 transition hover:bg-[var(--c-overlay)]'
                >
                  <div className='flex items-center gap-2.5'>
                    <StockAvatar symbol={symbol} size="sm" />
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
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
