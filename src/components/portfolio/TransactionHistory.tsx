import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { TxPage } from '../../hooks/usePortfolio'

interface Props {
  fetchTransactions: (page: number, limit?: number) => Promise<TxPage>
}

const LIMIT = 10

export default function TransactionHistory({ fetchTransactions }: Props) {
  const [page, setPage]   = useState(1)
  const [data, setData]   = useState<TxPage | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetchTransactions(p, LIMIT)
      setData(res)
    } finally {
      setLoading(false)
    }
  }, [fetchTransactions])

  useEffect(() => { load(page) }, [page, load])

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)]'>
      <div className='border-b border-[var(--c-border)] px-6 py-4 flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold text-[var(--c-text-1)]'>Transaction History</h2>
          <p className='mt-0.5 text-xs text-[var(--c-text-3)]'>
            {data ? `${data.total} total transactions` : 'Loading…'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className='flex h-40 items-center justify-center'>
          <Loader2 size={20} className='animate-spin text-blue-400' />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className='flex h-40 items-center justify-center text-sm text-[var(--c-text-3)]'>
          No transactions yet — buy your first position
        </div>
      ) : (
        <>
          <div className='overflow-x-auto [scrollbar-width:thin] [scrollbar-color:var(--c-border)_transparent]'>
            <table className='w-full min-w-[540px] text-sm'>
              <thead>
                <tr className='border-b border-[var(--c-border)]'>
                  {['Type', 'Symbol', 'Qty', 'Price', 'Value', 'Date'].map((col, i) => (
                    <th
                      key={col}
                      className={`px-5 py-3 text-xs font-medium text-[var(--c-text-3)] ${i === 0 || i === 1 ? 'text-left' : 'text-right'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <AnimatePresence mode='wait'>
                <motion.tbody
                  key={page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {data.items.map((tx) => {
                    const isBuy = tx.type === 'BUY'
                    return (
                      <tr key={tx.id} className='border-b border-[var(--c-border)]/40 hover:bg-[var(--c-overlay)] transition-colors'>
                        <td className='px-5 py-3.5'>
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isBuy
                              ? <TrendingUp size={9} />
                              : <TrendingDown size={9} />
                            }
                            {tx.type}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 font-semibold text-[var(--c-text-1)]'>{tx.symbol}</td>
                        <td className='px-5 py-3.5 text-right text-[var(--c-text-2)]'>{tx.qty}</td>
                        <td className='px-5 py-3.5 text-right text-[var(--c-text-2)]'>₹{fmt(tx.price)}</td>
                        <td className='px-5 py-3.5 text-right font-medium text-[var(--c-text-1)]'>
                          ₹{fmt(tx.qty * tx.price)}
                        </td>
                        <td className='px-5 py-3.5 text-right text-[var(--c-text-3)]'>{fmtDate(tx.executedAt)}</td>
                      </tr>
                    )
                  })}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className='flex items-center justify-between border-t border-[var(--c-border)] px-6 py-3'>
              <span className='text-xs text-[var(--c-text-3)]'>
                Page {data.page} of {data.totalPages}
              </span>
              <div className='flex gap-1'>
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className='flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--c-border)] text-[var(--c-text-3)] transition hover:border-blue-500/40 hover:text-[var(--c-text-1)] disabled:opacity-30 disabled:cursor-not-allowed'
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === data.totalPages}
                  className='flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--c-border)] text-[var(--c-text-3)] transition hover:border-blue-500/40 hover:text-[var(--c-text-1)] disabled:opacity-30 disabled:cursor-not-allowed'
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
