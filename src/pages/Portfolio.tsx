import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown, TrendingUp, ArrowUpRight, Briefcase,
  Plus, Download, Trash2, ArrowLeftRight, Loader2,
  LayoutGrid, History,
} from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import type { EnrichedPosition } from '../hooks/usePortfolio'
import { StockAvatar } from '../components/ui/StockAvatar'
import AddPositionModal from '../components/portfolio/AddPositionModal'
import PortfolioChart from '../components/portfolio/PortfolioChart'
import TransactionHistory from '../components/portfolio/TransactionHistory'
import RiskPanel from '../components/portfolio/RiskPanel'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number) {
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function exportCsv(positions: EnrichedPosition[]) {
  const header = 'Symbol,Name,Sector,Qty,Avg Buy (₹),LTP (₹),Invested (₹),Current Value (₹),P&L (₹),P&L (%),Day P&L (₹),Weight (%)'
  const rows = positions.map((h) =>
    [
      h.symbol, `"${h.name}"`, h.sector, h.qty,
      h.avgBuy.toFixed(2), h.priceVal.toFixed(2),
      h.invested.toFixed(2), h.currentVal.toFixed(2),
      h.pnl.toFixed(2), h.pnlPct.toFixed(2),
      h.dayPnl.toFixed(2), h.weight.toFixed(2),
    ].join(','),
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'quantara-portfolio.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sector colours ───────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  IT: '#3B82F6', Banking: '#8B5CF6', Finance: '#06B6D4', Pharma: '#10B981',
  Auto: '#F97316', Energy: '#EF4444', FMCG: '#F59E0B', Metal: '#6B7280',
  Infra: '#84CC16', Telecom: '#EC4899', Consumer: '#A78BFA', Paints: '#FCD34D',
  Electricals: '#F472B6', 'New Age': '#34D399',
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DONUT_R    = 54
const DONUT_CIRC = 2 * Math.PI * DONUT_R

function DonutChart({ positions }: { positions: EnrichedPosition[] }) {
  if (positions.length === 0) return null

  const totalValue = positions.reduce((s, p) => s + p.currentVal, 0)
  const sectorTotals: Record<string, number> = {}
  for (const p of positions) {
    sectorTotals[p.sector] = (sectorTotals[p.sector] ?? 0) + p.currentVal
  }
  const sectors = Object.entries(sectorTotals)
    .map(([s, v]) => ({ sector: s, pct: (v / totalValue) * 100 }))
    .sort((a, b) => b.pct - a.pct)

  let cum = 0
  return (
    <svg viewBox='0 0 160 160' className='mx-auto block w-full max-w-[180px]'>
      <g transform='rotate(-90 80 80)'>
        {sectors.map(({ sector, pct }) => {
          const len    = (pct / 100) * DONUT_CIRC
          const offset = -cum
          cum += len
          return (
            <circle
              key={sector}
              cx='80' cy='80' r={DONUT_R}
              fill='none'
              stroke={SECTOR_COLORS[sector] ?? '#6B7280'}
              strokeWidth='22'
              strokeDasharray={`${len} ${DONUT_CIRC}`}
              strokeDashoffset={offset}
            />
          )
        })}
      </g>
      <circle cx='80' cy='80' r='42' style={{ fill: 'var(--c-surface-2)' }} />
      <text x='80' y='76' textAnchor='middle' style={{ fill: 'var(--c-text-3)' }} fontSize='9' fontFamily='Inter, sans-serif'>
        {sectors.length} sectors
      </text>
      <text x='80' y='92' textAnchor='middle' style={{ fill: 'var(--c-text-1)' }} fontSize='13' fontWeight='700' fontFamily='Inter, sans-serif'>
        {positions.length} stocks
      </text>
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-[var(--c-border)] py-20 text-center'
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400'>
        <Briefcase size={28} />
      </div>
      <div>
        <p className='text-base font-semibold text-[var(--c-text-1)]'>No positions yet</p>
        <p className='mt-1 max-w-xs text-sm text-[var(--c-text-3)]'>
          Start building your portfolio by adding your first stock position
        </p>
      </div>
      <button
        onClick={onAdd}
        className='flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500'
      >
        <Plus size={15} /> Add First Position
      </button>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'transactions'

const Portfolio = () => {
  const { positions, loading, totals, addPosition, sellPosition, removePosition, fetchTransactions } = usePortfolio()
  const [tab, setTab]         = useState<Tab>('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSymbol, setModalSymbol] = useState<string | undefined>()
  const [modalDefaultTab, setModalDefaultTab] = useState<'BUY' | 'SELL'>('BUY')

  const { totalValue, totalInvested, totalPnl, totalPnlPct, totalDayPnl } = totals
  const totalPositive = totalPnl >= 0
  const dayPositive   = totalDayPnl >= 0
  const daysUp        = positions.filter((h) => h.dayPnl >= 0).length

  function openBuy(symbol?: string) {
    setModalSymbol(symbol)
    setModalDefaultTab('BUY')
    setModalOpen(true)
  }

  function openSell(symbol: string) {
    setModalSymbol(symbol)
    setModalDefaultTab('SELL')
    setModalOpen(true)
  }

  const sectorTotals: Record<string, number> = {}
  for (const h of positions) {
    sectorTotals[h.sector] = (sectorTotals[h.sector] ?? 0) + h.currentVal
  }
  const sectorAlloc = Object.entries(sectorTotals)
    .map(([sector, value]) => ({ sector, value, pct: (value / (totalValue || 1)) * 100 }))
    .sort((a, b) => b.pct - a.pct)

  const sortedByWeight = [...positions].sort((a, b) => b.weight - a.weight)
  const bestGainer     = [...positions].sort((a, b) => b.pnlPct - a.pnlPct)[0]
  const worstPerformer = [...positions].sort((a, b) => a.pnlPct - b.pnlPct)[0]
  const largestPos     = [...positions].sort((a, b) => b.currentVal - a.currentVal)[0]

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 size={24} className='animate-spin text-blue-400' />
      </div>
    )
  }

  return (
    <>
      <AddPositionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onBuy={addPosition}
        onSell={sellPosition}
        existingPositions={positions}
        defaultSymbol={modalSymbol}
        defaultTab={modalDefaultTab}
      />

      <div className='mx-auto max-w-[1600px] space-y-6'>

        {/* Header */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Overview</p>
            <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>Portfolio</h1>
            <p className='mt-3 text-[var(--c-text-3)]'>Your real holdings, persisted in PostgreSQL.</p>
          </div>
          <div className='flex items-center gap-2'>
            {positions.length > 0 && (
              <button
                onClick={() => exportCsv(positions)}
                className='flex items-center gap-2 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2 text-xs font-medium text-[var(--c-text-3)] transition hover:border-blue-500/30 hover:text-[var(--c-text-1)]'
              >
                <Download size={13} /> Export CSV
              </button>
            )}
            <button
              onClick={() => openBuy()}
              className='flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500'
            >
              <Plus size={13} /> Add Position
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className='flex gap-1 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-1 w-fit'>
          {([['overview', LayoutGrid, 'Overview'], ['transactions', History, 'Transactions']] as const).map(([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? 'bg-[var(--c-border)] text-[var(--c-text-1)]'
                  : 'text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode='wait'>
          {tab === 'overview' ? (
            <motion.div
              key='overview'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {positions.length === 0 ? (
                <EmptyState onAdd={() => openBuy()} />
              ) : (
                <>
                  {/* Hero value card */}
                  <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-7'>
                    <div className='flex flex-wrap items-start justify-between gap-6'>
                      <div>
                        <p className='text-sm text-[var(--c-text-3)]'>Total Portfolio Value</p>
                        <p className='mt-1 text-5xl font-bold tracking-tight text-[var(--c-text-1)]'>₹{fmt(totalValue)}</p>
                        <div className='mt-4 flex flex-wrap items-center gap-4'>
                          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${totalPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {totalPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {totalPositive ? '+' : '−'}₹{fmt(Math.abs(totalPnl))}
                            <span className='opacity-70'>({totalPositive ? '+' : ''}{totalPnlPct.toFixed(2)}%)</span>
                          </span>
                          <span className='text-sm text-[var(--c-text-3)]'>
                            Today:{' '}
                            <span className={`font-semibold ${dayPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {dayPositive ? '+' : '−'}₹{fmt(Math.abs(totalDayPnl))}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400'>
                        <Briefcase size={24} />
                      </div>
                    </div>

                    {/* Composition strip */}
                    <div className='mt-8'>
                      <p className='mb-2.5 text-xs font-medium text-[var(--c-text-3)]'>Composition by holding</p>
                      <div className='flex h-3 w-full overflow-hidden rounded-full'>
                        {sortedByWeight.map((h) => (
                          <div key={h.symbol} style={{ width: `${h.weight}%`, backgroundColor: h.color }} title={`${h.symbol}: ${h.weight.toFixed(1)}%`} />
                        ))}
                      </div>
                      <div className='mt-3 flex flex-wrap gap-x-5 gap-y-1.5'>
                        {sortedByWeight.map((h) => (
                          <div key={h.symbol} className='flex items-center gap-1.5'>
                            <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: h.color }} />
                            <span className='text-xs text-[var(--c-text-3)]'>
                              {h.symbol}<span className='ml-1 text-[var(--c-text-2)]'>{h.weight.toFixed(1)}%</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                    {[
                      { label: 'Invested', value: `₹${fmt(totalInvested)}`, colored: false, positive: true, sub: `${positions.length} active positions` },
                      { label: 'Current Value', value: `₹${fmt(totalValue)}`, colored: false, positive: true, sub: `${((totalValue / (totalInvested || 1) - 1) * 100).toFixed(1)}% overall return` },
                      { label: 'Total P&L', value: `${totalPositive ? '+' : '−'}₹${fmt(Math.abs(totalPnl))}`, colored: true, positive: totalPositive, sub: `${totalPositive ? '+' : ''}${totalPnlPct.toFixed(2)}% since entry` },
                      { label: "Day's P&L", value: `${dayPositive ? '+' : '−'}₹${fmt(Math.abs(totalDayPnl))}`, colored: true, positive: dayPositive, sub: `${daysUp}/${positions.length} positions up` },
                    ].map(({ label, value, colored, positive, sub }) => (
                      <div key={label} className='rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'>
                        <p className='text-xs font-medium text-[var(--c-text-3)]'>{label}</p>
                        <p className={`mt-2 text-xl font-bold ${colored ? (positive ? 'text-emerald-400' : 'text-red-400') : 'text-[var(--c-text-1)]'}`}>{value}</p>
                        <p className='mt-1 text-xs text-[var(--c-text-3)]'>{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Portfolio value chart */}
                  <PortfolioChart positions={positions} />

                  {/* Holdings + Allocation + Risk */}
                  <div className='grid gap-6 xl:grid-cols-3'>

                    {/* Holdings table */}
                    <div className='overflow-hidden rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] xl:col-span-2'>
                      <div className='border-b border-[var(--c-border)] px-6 py-4 flex items-center justify-between'>
                        <div>
                          <h2 className='text-base font-semibold text-[var(--c-text-1)]'>Holdings</h2>
                          <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>{positions.length} positions</p>
                        </div>
                      </div>
                      <div className='overflow-x-auto [scrollbar-color:var(--c-border)_transparent] [scrollbar-width:thin]'>
                        <table className='w-full min-w-[720px] text-sm'>
                          <thead>
                            <tr className='border-b border-[var(--c-border)]'>
                              {['Stock', 'Qty', 'Avg / LTP', 'P&L', "Day's P&L", 'Weight', ''].map((col, i) => (
                                <th key={col + i} className={`px-5 py-3 text-xs font-medium text-[var(--c-text-3)] ${i === 0 ? 'text-left' : i === 6 ? '' : 'text-right'}`}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedByWeight.map((h) => (
                              <tr key={h.symbol} className='border-b border-[var(--c-border)]/40 transition-colors hover:bg-[var(--c-overlay)]'>
                                <td className='px-5 py-3.5'>
                                  <div className='flex items-center gap-3'>
                                    <StockAvatar symbol={h.symbol} color={h.color} size='md' />
                                    <div>
                                      <Link to={`/markets/${h.symbol}`} className='font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400'>{h.symbol}</Link>
                                      <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>
                                        <span className='mr-1' style={{ color: SECTOR_COLORS[h.sector] }}>●</span>{h.sector}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className='px-5 py-3.5 text-right text-[var(--c-text-2)]'>{h.qty}</td>
                                <td className='px-5 py-3.5 text-right'>
                                  <p className='font-semibold text-[var(--c-text-1)]'>₹{fmt(h.priceVal)}</p>
                                  <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>avg ₹{fmt(h.avgBuy)}</p>
                                </td>
                                <td className='px-5 py-3.5 text-right'>
                                  <p className={`font-semibold ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {h.pnl >= 0 ? '+' : '−'}₹{fmt(Math.abs(h.pnl))}
                                  </p>
                                  <p className={`mt-0.5 text-xs ${h.pnl >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                                    {h.pnl >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                                  </p>
                                </td>
                                <td className='px-5 py-3.5 text-right'>
                                  <span className={`font-medium ${h.dayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {h.dayPnl >= 0 ? '+' : '−'}₹{fmt(Math.abs(h.dayPnl))}
                                  </span>
                                </td>
                                <td className='px-5 py-3.5 text-right'>
                                  <div className='flex flex-col items-end gap-1.5'>
                                    <span className='text-xs font-semibold text-[var(--c-text-2)]'>{h.weight.toFixed(1)}%</span>
                                    <div className='h-1.5 w-16 overflow-hidden rounded-full bg-[var(--c-border)]'>
                                      <div className='h-full rounded-full' style={{ width: `${h.weight}%`, backgroundColor: h.color }} />
                                    </div>
                                  </div>
                                </td>
                                <td className='px-4 py-3.5'>
                                  <div className='flex items-center gap-1'>
                                    <button
                                      onClick={() => openBuy(h.symbol)}
                                      title='Buy more'
                                      className='flex h-7 w-7 items-center justify-center rounded-lg text-[var(--c-text-3)] transition hover:bg-emerald-500/10 hover:text-emerald-400'
                                    >
                                      <Plus size={12} />
                                    </button>
                                    <button
                                      onClick={() => openSell(h.symbol)}
                                      title='Sell'
                                      className='flex h-7 w-7 items-center justify-center rounded-lg text-[var(--c-text-3)] transition hover:bg-amber-500/10 hover:text-amber-400'
                                    >
                                      <ArrowLeftRight size={12} />
                                    </button>
                                    <button
                                      onClick={() => removePosition(h.symbol)}
                                      title='Remove position'
                                      className='flex h-7 w-7 items-center justify-center rounded-lg text-[var(--c-text-3)] transition hover:bg-red-500/10 hover:text-red-400'
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sector allocation */}
                    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
                      <h2 className='text-base font-semibold text-[var(--c-text-1)]'>Allocation</h2>
                      <p className='mb-5 mt-0.5 text-xs text-[var(--c-text-3)]'>By sector</p>
                      <DonutChart positions={positions} />
                      <div className='mt-6 space-y-3.5'>
                        {sectorAlloc.map(({ sector, pct, value }) => (
                          <div key={sector}>
                            <div className='mb-1.5 flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: SECTOR_COLORS[sector] ?? '#6B7280' }} />
                                <span className='text-xs font-medium text-[var(--c-text-2)]'>{sector}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-[var(--c-text-3)]'>₹{fmt(value)}</span>
                                <span className='w-10 text-right text-xs font-semibold text-[var(--c-text-1)]'>{pct.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className='h-1 w-full overflow-hidden rounded-full bg-[var(--c-border)]'>
                              <div className='h-full rounded-full' style={{ width: `${pct}%`, backgroundColor: SECTOR_COLORS[sector] ?? '#6B7280' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risk panel */}
                  <RiskPanel positions={positions} />

                  {/* Performance spotlights */}
                  {bestGainer && worstPerformer && largestPos && (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                      {[
                        { label: 'Best Performer', stock: bestGainer, icon: TrendingUp, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', valueText: `${bestGainer.pnlPct >= 0 ? '+' : ''}${bestGainer.pnlPct.toFixed(2)}%`, valueColor: bestGainer.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400', sub: `${bestGainer.pnl >= 0 ? '+' : '−'}₹${fmt(Math.abs(bestGainer.pnl))} unrealised` },
                        { label: 'Underperformer', stock: worstPerformer, icon: TrendingDown, iconBg: 'bg-red-500/10', iconColor: 'text-red-400', valueText: `${worstPerformer.pnlPct >= 0 ? '+' : ''}${worstPerformer.pnlPct.toFixed(2)}%`, valueColor: worstPerformer.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400', sub: `${worstPerformer.pnl >= 0 ? '+' : '−'}₹${fmt(Math.abs(worstPerformer.pnl))} unrealised` },
                        { label: 'Largest Position', stock: largestPos, icon: ArrowUpRight, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400', valueText: `₹${fmt(largestPos.currentVal)}`, valueColor: 'text-[var(--c-text-1)]', sub: `${((largestPos.currentVal / (totalValue || 1)) * 100).toFixed(1)}% of portfolio` },
                      ].map(({ label, stock, icon: Icon, iconBg, iconColor, valueText, valueColor, sub }) => (
                        <div key={label} className='rounded-2xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-5'>
                          <div className='mb-4 flex items-center justify-between'>
                            <p className='text-xs font-medium text-[var(--c-text-3)]'>{label}</p>
                            <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}><Icon size={14} /></div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <StockAvatar symbol={stock.symbol} color={stock.color} size='lg' />
                            <div>
                              <Link to={`/markets/${stock.symbol}`} className='font-semibold text-[var(--c-text-1)] transition-colors hover:text-blue-400'>{stock.symbol}</Link>
                              <p className='text-xs text-[var(--c-text-3)]'>{stock.sector}</p>
                            </div>
                          </div>
                          <div className='mt-4'>
                            <p className={`text-2xl font-bold ${valueColor}`}>{valueText}</p>
                            <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>{sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key='transactions'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionHistory fetchTransactions={fetchTransactions} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Portfolio
