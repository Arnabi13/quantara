import { TrendingDown, TrendingUp, ArrowUpRight, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getExtendedStockData } from '../data/marketsData'
import { StockAvatar } from '../components/ui/StockAvatar'

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function symbolSeed(symbol: string): number {
  return symbol.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

function fmt(val: number) {
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Holdings ─────────────────────────────────────────────────────────────────

const RAW_HOLDINGS = [
  { symbol: 'RELIANCE',   qty: 50  },
  { symbol: 'TCS',        qty: 20  },
  { symbol: 'HDFCBANK',   qty: 100 },
  { symbol: 'INFY',       qty: 40  },
  { symbol: 'SUNPHARMA',  qty: 60  },
  { symbol: 'MARUTI',     qty: 10  },
  { symbol: 'TITAN',      qty: 30  },
  { symbol: 'BAJFINANCE', qty: 15  },
]

const HOLDING_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#06B6D4',
  '#F97316', '#EC4899', '#F59E0B', '#EF4444',
]

const HOLDINGS = RAW_HOLDINGS.map(({ symbol, qty }, idx) => {
  const stock   = getExtendedStockData(symbol)
  const seed    = symbolSeed(symbol)
  const buyMult = 0.80 + seededRandom(seed * 97 + 13) * 0.35
  const avgBuy  = parseFloat((stock.priceVal * buyMult).toFixed(2))
  const invested   = avgBuy * qty
  const currentVal = stock.priceVal * qty
  const pnl        = currentVal - invested
  const pnlPct     = (pnl / invested) * 100
  const dayPnl     = (stock.changeVal / 100) * currentVal
  return {
    ...stock,
    qty,
    avgBuy,
    invested,
    currentVal,
    pnl,
    pnlPct,
    pnlPositive: pnl >= 0,
    dayPnl,
    color: HOLDING_COLORS[idx % HOLDING_COLORS.length],
  }
})

// ─── Aggregates ───────────────────────────────────────────────────────────────

const totalInvested = HOLDINGS.reduce((s, h) => s + h.invested, 0)
const totalValue    = HOLDINGS.reduce((s, h) => s + h.currentVal, 0)
const totalPnl      = totalValue - totalInvested
const totalPnlPct   = (totalPnl / totalInvested) * 100
const totalDayPnl   = HOLDINGS.reduce((s, h) => s + h.dayPnl, 0)
const daysUp        = HOLDINGS.filter(h => h.dayPnl >= 0).length

const HOLDINGS_W = HOLDINGS
  .map(h => ({ ...h, weight: (h.currentVal / totalValue) * 100 }))
  .sort((a, b) => b.weight - a.weight)

// ─── Sector allocation ────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  IT: '#3B82F6', Banking: '#8B5CF6', Finance: '#06B6D4', Pharma: '#10B981',
  Auto: '#F97316', Energy: '#EF4444', FMCG: '#F59E0B', Metal: '#6B7280',
  Infra: '#84CC16', Telecom: '#EC4899', Consumer: '#A78BFA', Paints: '#FCD34D',
  Electricals: '#F472B6', 'New Age': '#34D399',
}

const sectorTotals: Record<string, number> = {}
for (const h of HOLDINGS) {
  sectorTotals[h.sector] = (sectorTotals[h.sector] ?? 0) + h.currentVal
}
const SECTOR_ALLOC = Object.entries(sectorTotals)
  .map(([sector, value]) => ({ sector, value, pct: (value / totalValue) * 100 }))
  .sort((a, b) => b.pct - a.pct)

// ─── Performers ───────────────────────────────────────────────────────────────

const bestGainer      = [...HOLDINGS].sort((a, b) => b.pnlPct - a.pnlPct)[0]
const worstPerformer  = [...HOLDINGS].sort((a, b) => a.pnlPct - b.pnlPct)[0]
const largestPosition = [...HOLDINGS].sort((a, b) => b.currentVal - a.currentVal)[0]

// ─── SVG Donut ────────────────────────────────────────────────────────────────

const DONUT_R    = 54
const DONUT_CIRC = 2 * Math.PI * DONUT_R

function DonutChart() {
  let cum = 0
  return (
    <svg viewBox="0 0 160 160" className="mx-auto block w-full max-w-[180px]">
      <g transform="rotate(-90 80 80)">
        {SECTOR_ALLOC.map(({ sector, pct }) => {
          const len    = (pct / 100) * DONUT_CIRC
          const offset = -cum
          cum += len
          return (
            <circle
              key={sector}
              cx="80"
              cy="80"
              r={DONUT_R}
              fill="none"
              stroke={SECTOR_COLORS[sector] ?? '#6B7280'}
              strokeWidth="22"
              strokeDasharray={`${len} ${DONUT_CIRC}`}
              strokeDashoffset={offset}
            />
          )
        })}
      </g>
      <circle cx="80" cy="80" r="42" style={{ fill: 'var(--c-surface)' }} />
      <text
        x="80" y="76"
        textAnchor="middle"
        style={{ fill: 'var(--c-text-3)', fontSize: '9px', fontFamily: 'Inter, sans-serif' }}
      >
        {SECTOR_ALLOC.length} sectors
      </text>
      <text
        x="80" y="92"
        textAnchor="middle"
        style={{ fill: 'var(--c-text-1)', fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
      >
        {HOLDINGS.length} stocks
      </text>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const Portfolio = () => {
  const totalPositive = totalPnl >= 0
  const dayPositive   = totalDayPnl >= 0

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-blue-400">Overview</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--c-text-1)]">Portfolio</h1>
          <p className="mt-3 text-[var(--c-text-2)]">Your simulated holdings across NSE equities.</p>
        </div>
        <span className="mt-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-1.5 text-xs font-medium text-[var(--c-text-3)]">
          Demo Portfolio
        </span>
      </div>

      {/* Hero value card */}
      <div className="rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-[var(--c-text-3)]">Total Portfolio Value</p>
            <p className="mt-1 text-5xl font-bold tracking-tight text-[var(--c-text-1)]">
              ₹{fmt(totalValue)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                  totalPositive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {totalPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {totalPositive ? '+' : '−'}₹{fmt(Math.abs(totalPnl))}
                <span className="opacity-70">({totalPositive ? '+' : ''}{totalPnlPct.toFixed(2)}%)</span>
              </span>
              <span className="text-sm text-[var(--c-text-3)]">
                Today:{' '}
                <span className={`font-semibold ${dayPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {dayPositive ? '+' : '−'}₹{fmt(Math.abs(totalDayPnl))}
                </span>
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Briefcase size={24} />
          </div>
        </div>

        {/* Composition strip */}
        <div className="mt-8">
          <p className="mb-2.5 text-xs font-medium text-[var(--c-text-3)]">Composition by holding</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {HOLDINGS_W.map(h => (
              <div
                key={h.symbol}
                style={{ width: `${h.weight}%`, backgroundColor: h.color }}
                title={`${h.symbol}: ${h.weight.toFixed(1)}%`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {HOLDINGS_W.map(h => (
              <div key={h.symbol} className="flex items-center gap-1.5">
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: h.color }} />
                <span className="text-xs text-[var(--c-text-3)]">
                  {h.symbol}
                  <span className="ml-1 text-[var(--c-text-2)]">{h.weight.toFixed(1)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Invested',
            value: `₹${fmt(totalInvested)}`,
            colored: false,
            positive: true,
            sub: `${HOLDINGS.length} active positions`,
          },
          {
            label: 'Current Value',
            value: `₹${fmt(totalValue)}`,
            colored: false,
            positive: true,
            sub: `${((totalValue / totalInvested - 1) * 100).toFixed(1)}% overall return`,
          },
          {
            label: 'Total P&L',
            value: `${totalPositive ? '+' : '−'}₹${fmt(Math.abs(totalPnl))}`,
            colored: true,
            positive: totalPositive,
            sub: `${totalPositive ? '+' : ''}${totalPnlPct.toFixed(2)}% since entry`,
          },
          {
            label: "Day's P&L",
            value: `${dayPositive ? '+' : '−'}₹${fmt(Math.abs(totalDayPnl))}`,
            colored: true,
            positive: dayPositive,
            sub: `${daysUp}/${HOLDINGS.length} positions up`,
          },
        ].map(({ label, value, colored, positive, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5"
          >
            <p className="text-xs font-medium text-[var(--c-text-3)]">{label}</p>
            <p
              className={`mt-2 text-xl font-bold ${
                colored
                  ? positive ? 'text-emerald-400' : 'text-red-400'
                  : 'text-[var(--c-text-1)]'
              }`}
            >
              {value}
            </p>
            <p className="mt-1 text-xs text-[var(--c-text-3)]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid: holdings table + allocation sidebar */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* Holdings table */}
        <div className="overflow-hidden rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] xl:col-span-2">
          <div className="border-b border-[var(--c-border)] px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--c-text-1)]">Holdings</h2>
            <p className="mt-0.5 text-xs text-[var(--c-text-3)]">{HOLDINGS.length} positions</p>
          </div>
          <div className="overflow-x-auto [scrollbar-color:var(--c-border)_transparent] [scrollbar-width:thin]">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  {['Stock', 'Qty', 'Avg / LTP', 'P&L', "Day's P&L", 'Weight'].map((col, i) => (
                    <th
                      key={col}
                      className={`px-5 py-3 text-xs font-medium text-[var(--c-text-3)] ${
                        i === 0 ? 'text-left' : 'text-right'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOLDINGS_W.map(h => (
                  <tr
                    key={h.symbol}
                    className="border-b border-[var(--c-border)]/40 transition-colors hover:bg-[var(--c-overlay)]"
                  >
                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <StockAvatar symbol={h.symbol} color={h.color} size="md" />
                        <div>
                          <Link
                            to={`/markets/${h.symbol}`}
                            className="font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400"
                          >
                            {h.symbol}
                          </Link>
                          <p className="mt-0.5 text-xs text-[var(--c-text-3)]">
                            <span className="mr-1" style={{ color: SECTOR_COLORS[h.sector] }}>●</span>
                            {h.sector}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="px-5 py-3.5 text-right text-[var(--c-text-2)]">{h.qty}</td>

                    {/* Avg / LTP */}
                    <td className="px-5 py-3.5 text-right">
                      <p className="font-semibold text-[var(--c-text-1)]">₹{fmt(h.priceVal)}</p>
                      <p className="mt-0.5 text-xs text-[var(--c-text-3)]">avg ₹{fmt(h.avgBuy)}</p>
                    </td>

                    {/* P&L */}
                    <td className="px-5 py-3.5 text-right">
                      <p className={`font-semibold ${h.pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.pnlPositive ? '+' : '−'}₹{fmt(Math.abs(h.pnl))}
                      </p>
                      <p className={`mt-0.5 text-xs ${h.pnlPositive ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                        {h.pnlPositive ? '+' : ''}{h.pnlPct.toFixed(2)}%
                      </p>
                    </td>

                    {/* Day's P&L */}
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-medium ${h.dayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.dayPnl >= 0 ? '+' : '−'}₹{fmt(Math.abs(h.dayPnl))}
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-semibold text-[var(--c-text-2)]">
                          {h.weight.toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--c-overlay-md)]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${h.weight}%`, backgroundColor: h.color }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector allocation sidebar */}
        <div className="rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6">
          <h2 className="text-base font-semibold text-[var(--c-text-1)]">Allocation</h2>
          <p className="mb-5 mt-0.5 text-xs text-[var(--c-text-3)]">By sector</p>

          <DonutChart />

          <div className="mt-6 space-y-3.5">
            {SECTOR_ALLOC.map(({ sector, pct, value }) => (
              <div key={sector}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: SECTOR_COLORS[sector] ?? '#6B7280' }}
                    />
                    <span className="text-xs font-medium text-[var(--c-text-2)]">{sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--c-text-3)]">₹{fmt(value)}</span>
                    <span className="w-10 text-right text-xs font-semibold text-[var(--c-text-1)]">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--c-overlay-md)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: SECTOR_COLORS[sector] ?? '#6B7280',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance spotlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Best performer */}
        <div className="rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--c-text-3)]">Best Performer</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StockAvatar symbol={bestGainer.symbol} color={bestGainer.color} size="lg" />
            <div>
              <Link
                to={`/markets/${bestGainer.symbol}`}
                className="font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400"
              >
                {bestGainer.symbol}
              </Link>
              <p className="text-xs text-[var(--c-text-3)]">{bestGainer.sector}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-bold ${bestGainer.pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {bestGainer.pnlPositive ? '+' : ''}{bestGainer.pnlPct.toFixed(2)}%
            </p>
            <p className="mt-0.5 text-xs text-[var(--c-text-3)]">
              {bestGainer.pnlPositive ? '+' : '−'}₹{fmt(Math.abs(bestGainer.pnl))} unrealised
            </p>
          </div>
        </div>

        {/* Underperformer */}
        <div className="rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--c-text-3)]">Underperformer</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <TrendingDown size={14} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StockAvatar symbol={worstPerformer.symbol} color={worstPerformer.color} size="lg" />
            <div>
              <Link
                to={`/markets/${worstPerformer.symbol}`}
                className="font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400"
              >
                {worstPerformer.symbol}
              </Link>
              <p className="text-xs text-[var(--c-text-3)]">{worstPerformer.sector}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-bold ${worstPerformer.pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {worstPerformer.pnlPositive ? '+' : ''}{worstPerformer.pnlPct.toFixed(2)}%
            </p>
            <p className="mt-0.5 text-xs text-[var(--c-text-3)]">
              {worstPerformer.pnlPositive ? '+' : '−'}₹{fmt(Math.abs(worstPerformer.pnl))} unrealised
            </p>
          </div>
        </div>

        {/* Largest position */}
        <div className="rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--c-text-3)]">Largest Position</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StockAvatar symbol={largestPosition.symbol} color={largestPosition.color} size="lg" />
            <div>
              <Link
                to={`/markets/${largestPosition.symbol}`}
                className="font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400"
              >
                {largestPosition.symbol}
              </Link>
              <p className="text-xs text-[var(--c-text-3)]">{largestPosition.sector}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-[var(--c-text-1)]">₹{fmt(largestPosition.currentVal)}</p>
            <p className="mt-0.5 text-xs text-[var(--c-text-3)]">
              {((largestPosition.currentVal / totalValue) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Portfolio
