import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Search, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { NSE_STOCKS } from '../../data/nseStocks'
import { getExtendedStockData } from '../../data/marketsData'
import type { EnrichedPosition } from '../../hooks/usePortfolio'

interface Props {
  open: boolean
  onClose: () => void
  onBuy: (symbol: string, qty: number, price: number) => Promise<void>
  onSell: (symbol: string, qty: number, price: number) => Promise<void>
  existingPositions: EnrichedPosition[]
  defaultSymbol?: string
  defaultTab?: 'BUY' | 'SELL'
}

export default function AddPositionModal({
  open, onClose, onBuy, onSell, existingPositions, defaultSymbol, defaultTab = 'BUY',
}: Props) {
  const [tab, setTab]         = useState<'BUY' | 'SELL'>(defaultTab)
  const [search, setSearch]   = useState(defaultSymbol ?? '')
  const [symbol, setSymbol]   = useState(defaultSymbol ?? '')
  const [qty, setQty]         = useState('')
  const [price, setPrice]     = useState('')
  const [showDrop, setShowDrop] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [err, setErr]         = useState('')
  const searchRef             = useRef<HTMLInputElement>(null)
  const dropRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setTab(defaultTab)
      setSymbol(defaultSymbol ?? '')
      setSearch(defaultSymbol ?? '')
      setQty('')
      setPrice('')
      setErr('')
      setTimeout(() => searchRef.current?.focus(), 150)
    }
  }, [open, defaultSymbol, defaultTab])

  useEffect(() => {
    if (symbol) {
      const stock = getExtendedStockData(symbol)
      setPrice(stock.priceVal.toFixed(2))
    }
  }, [symbol])

  const filtered = search.length >= 1
    ? NSE_STOCKS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase()),
      ).slice(0, 8)
    : []

  const selectedStock = symbol ? getExtendedStockData(symbol) : null
  const heldPosition  = existingPositions.find((p) => p.symbol === symbol)
  const qtyNum        = parseFloat(qty)
  const priceNum      = parseFloat(price)
  const totalValue    = !isNaN(qtyNum) && !isNaN(priceNum) ? qtyNum * priceNum : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!symbol) { setErr('Select a stock'); return }
    if (!qtyNum || qtyNum <= 0) { setErr('Enter a valid quantity'); return }
    if (!priceNum || priceNum <= 0) { setErr('Enter a valid price'); return }
    if (tab === 'SELL') {
      if (!heldPosition) { setErr('You don\'t hold this stock'); return }
      if (qtyNum > heldPosition.qty) { setErr(`You only hold ${heldPosition.qty} shares`); return }
    }
    try {
      setBusy(true)
      if (tab === 'BUY') await onBuy(symbol, qtyNum, priceNum)
      else await onSell(symbol, qtyNum, priceNum)
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setErr(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className='relative z-10 w-full max-w-md rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[var(--c-border)] px-6 py-4'>
              <h2 className='text-base font-bold text-[var(--c-text-1)]'>Manage Position</h2>
              <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded-xl text-[var(--c-text-3)] hover:bg-[var(--c-border)] hover:text-[var(--c-text-1)] transition'>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {/* BUY / SELL tabs */}
              <div className='flex rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-1'>
                {(['BUY', 'SELL'] as const).map((t) => (
                  <button
                    key={t}
                    type='button'
                    onClick={() => { setTab(t); setErr('') }}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                      tab === t
                        ? t === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 shadow'
                          : 'bg-red-500/20 text-red-400 shadow'
                        : 'text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
                    }`}
                  >
                    {t === 'BUY' ? <TrendingUp size={13} className='inline mr-1.5' /> : <TrendingDown size={13} className='inline mr-1.5' />}
                    {t}
                  </button>
                ))}
              </div>

              {/* Stock search */}
              <div className='relative' ref={dropRef}>
                <label className='mb-1.5 block text-xs font-medium text-[var(--c-text-3)]'>Stock</label>
                <div className='flex items-center gap-2 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2.5'>
                  <Search size={14} className='shrink-0 text-[var(--c-text-3)]' />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setSymbol(''); setShowDrop(true) }}
                    onFocus={() => setShowDrop(true)}
                    placeholder='Search symbol or company…'
                    className='flex-1 bg-transparent text-sm text-[var(--c-text-1)] placeholder:text-[var(--c-text-3)] outline-none'
                  />
                  {symbol && <span className='rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400'>{symbol}</span>}
                </div>
                {showDrop && filtered.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] shadow-xl'
                  >
                    {filtered.map((s) => (
                      <button
                        key={s.symbol}
                        type='button'
                        className='flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--c-border)]'
                        onClick={() => { setSymbol(s.symbol); setSearch(s.symbol); setShowDrop(false) }}
                      >
                        <span className='w-24 shrink-0 text-xs font-bold text-[var(--c-text-1)]'>{s.symbol}</span>
                        <span className='truncate text-xs text-[var(--c-text-3)]'>{s.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Selected stock preview */}
              {selectedStock && (
                <div className='flex items-center justify-between rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3'>
                  <div>
                    <p className='text-xs text-[var(--c-text-3)]'>{selectedStock.name}</p>
                    <p className='text-sm font-bold text-[var(--c-text-1)]'>{selectedStock.sector}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-bold text-[var(--c-text-1)]'>₹{selectedStock.priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-medium ${selectedStock.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedStock.change}
                    </p>
                  </div>
                </div>
              )}

              {/* Held position info for SELL */}
              {tab === 'SELL' && heldPosition && (
                <div className='rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300'>
                  You hold <span className='font-bold'>{heldPosition.qty}</span> shares · avg ₹{heldPosition.avgBuy.toFixed(2)}
                </div>
              )}

              {/* Qty + Price */}
              <div className='grid grid-cols-2 gap-3'>
                {[
                  { label: 'Quantity', value: qty, setter: setQty, placeholder: '0', step: '1' },
                  { label: 'Price (₹)', value: price, setter: setPrice, placeholder: '0.00', step: '0.01' },
                ].map(({ label, value, setter, placeholder, step }) => (
                  <div key={label}>
                    <label className='mb-1.5 block text-xs font-medium text-[var(--c-text-3)]'>{label}</label>
                    <input
                      type='number'
                      min='0'
                      step={step}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className='w-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2.5 text-sm text-[var(--c-text-1)] placeholder:text-[var(--c-text-3)] outline-none focus:border-blue-500/40 transition'
                    />
                  </div>
                ))}
              </div>

              {/* Total preview */}
              {totalValue !== null && (
                <div className='flex items-center justify-between rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3'>
                  <span className='text-xs text-[var(--c-text-3)]'>Total {tab === 'BUY' ? 'invested' : 'proceeds'}</span>
                  <span className='text-sm font-bold text-[var(--c-text-1)]'>
                    ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Error */}
              {err && (
                <div className='flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400'>
                  <AlertCircle size={13} />
                  {err}
                </div>
              )}

              {/* Submit */}
              <button
                type='submit'
                disabled={busy}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50 ${
                  tab === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-600/20 hover:from-emerald-400 hover:to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-600/20 hover:from-red-400 hover:to-red-500'
                }`}
              >
                {busy && <Loader2 size={14} className='animate-spin' />}
                {busy ? 'Processing…' : tab === 'BUY' ? 'Confirm Buy' : 'Confirm Sell'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
