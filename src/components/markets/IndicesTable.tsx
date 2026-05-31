import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react'
import { ALL_STOCKS_DATA, SECTOR_LIST, type ExtendedStockData } from '../../data/marketsData'
import { StockAvatar } from '../ui/StockAvatar'

type SortKey = 'symbol' | 'name' | 'priceVal' | 'changeVal' | 'volume' | 'marketCapVal'

interface Column {
  key: SortKey
  label: string
  align: 'left' | 'right'
}

const COLUMNS: Column[] = [
  { key: 'symbol',      label: 'Symbol',   align: 'left' },
  { key: 'name',        label: 'Company',  align: 'left' },
  { key: 'priceVal',    label: 'Price',    align: 'right' },
  { key: 'changeVal',   label: '% Change', align: 'right' },
  { key: 'volume',      label: 'Volume',   align: 'right' },
  { key: 'marketCapVal',label: 'Mkt Cap',  align: 'right' },
]

function SortIcon({
  col,
  sortBy,
  sortDir,
}: {
  col: SortKey
  sortBy: SortKey
  sortDir: 'asc' | 'desc'
}) {
  if (col !== sortBy) return <ChevronsUpDown size={11} className='text-[var(--c-text-3)]' />
  return sortDir === 'asc' ? (
    <ChevronUp size={11} className='text-blue-400' />
  ) : (
    <ChevronDown size={11} className='text-blue-400' />
  )
}

export default function IndicesTable({
  onSelect,
  selected,
}: {
  onSelect: (symbol: string) => void
  selected: string | null
}) {
  const [sortBy, setSortBy]           = useState<SortKey>('marketCapVal')
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('desc')
  const [query, setQuery]             = useState('')
  const [sectorFilter, setSectorFilter] = useState('All')

  function handleSort(col: SortKey) {
    if (col === sortBy) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const filtered = useMemo<ExtendedStockData[]>(() => {
    let data = ALL_STOCKS_DATA
    if (sectorFilter !== 'All') data = data.filter((s) => s.sector === sectorFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      data = data.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
      )
    }
    return [...data].sort((a, b) => {
      const av = a[sortBy] as string | number
      const bv = b[sortBy] as string | number
      const cmp =
        typeof av === 'string'
          ? (av as string).localeCompare(bv as string)
          : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [query, sectorFilter, sortBy, sortDir])

  return (
    <div className='flex flex-col rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)]'>
      {/* Controls */}
      <div className='flex flex-wrap items-center gap-3 border-b border-[var(--c-border)] p-5'>
        <div>
          <h3 className='text-base font-semibold text-[var(--c-text-1)]'>NSE Stocks</h3>
          <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>{filtered.length} results</p>
        </div>
        <div className='relative ml-auto'>
          <Search
            size={13}
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-3)]'
          />
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search…'
            className='w-44 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] py-2 pl-8 pr-3 text-sm text-[var(--c-text-1)] placeholder-[var(--c-text-3)] outline-none transition focus:border-blue-500/50'
          />
        </div>
      </div>

      {/* Sector chips */}
      <div className='flex gap-1.5 overflow-x-auto border-b border-[var(--c-border)] px-5 py-3 [scrollbar-width:none]'>
        {['All', ...SECTOR_LIST].map((sector) => (
          <button
            key={sector}
            onClick={() => setSectorFilter(sector)}
            className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition ${
              sectorFilter === sector
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--c-surface)] text-[var(--c-text-2)] hover:text-[var(--c-text-1)]'
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='max-h-[540px] overflow-auto [scrollbar-width:thin] [scrollbar-color:var(--c-border)_transparent]'>
        <table className='w-full min-w-[720px] text-sm'>
          <thead className='sticky top-0 z-10 bg-[var(--c-surface-2)]'>
            <tr className='border-b border-[var(--c-border)]'>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer select-none px-5 py-3 text-xs font-medium text-[var(--c-text-3)] transition hover:text-[var(--c-text-2)] ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${
                      col.align === 'right' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {col.label}
                    <SortIcon col={col.key} sortBy={sortBy} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className='px-5 py-3 text-right text-xs font-medium text-[var(--c-text-3)]'>
                52W Range
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((stock) => {
              const rangeSpan = stock.high52wVal - stock.low52wVal
              const pos =
                rangeSpan > 0
                  ? ((stock.priceVal - stock.low52wVal) / rangeSpan) * 100
                  : 50
              const clampedPos = Math.min(100, Math.max(0, pos))

              return (
                <tr
                  key={stock.symbol}
                  onClick={() => onSelect(stock.symbol)}
                  className={`cursor-pointer border-b border-[var(--c-border)]/40 transition-colors hover:bg-[var(--c-overlay)] ${
                    selected === stock.symbol ? 'bg-blue-950/30' : ''
                  }`}
                >
                  {/* Symbol + sector chip */}
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-2.5'>
                      <StockAvatar symbol={stock.symbol} size="sm" />
                      <div>
                        <p className='font-semibold text-[var(--c-text-1)]'>{stock.symbol}</p>
                        <span className='mt-0.5 inline-block rounded bg-blue-600/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400'>
                          {stock.sector}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Company name */}
                  <td className='max-w-[180px] px-5 py-3.5'>
                    <p className='truncate text-sm text-[var(--c-text-2)]'>{stock.name}</p>
                  </td>

                  {/* Price */}
                  <td className='px-5 py-3.5 text-right'>
                    <p className='font-semibold text-[var(--c-text-1)]'>{stock.price}</p>
                  </td>

                  {/* % Change */}
                  <td className='px-5 py-3.5 text-right'>
                    <span
                      className={`inline-flex items-center justify-end rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        stock.positive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {stock.change}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className='px-5 py-3.5 text-right text-sm text-[var(--c-text-2)]'>
                    {stock.volumeStr}
                  </td>

                  {/* Market Cap */}
                  <td className='px-5 py-3.5 text-right text-sm text-[var(--c-text-2)]'>
                    {stock.marketCap}
                  </td>

                  {/* 52W Range bar */}
                  <td className='px-5 py-3.5'>
                    <div className='flex flex-col items-end gap-1.5'>
                      <div className='relative h-[3px] w-20 rounded-full bg-[var(--c-overlay-md)]'>
                        <div
                          className='absolute top-1/2 h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.7)]'
                          style={{
                            left: `${clampedPos}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      </div>
                      <div className='flex w-20 justify-between text-[9px] text-[var(--c-text-3)]'>
                        <span>L</span>
                        <span>H</span>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className='py-12 text-center text-sm text-[var(--c-text-3)]'>
                  No stocks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
