import { useState } from 'react'
import { BellPlus, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../lib/api'

interface Props {
  symbol: string
  currentPrice: number
  onCreated?: () => void
}

export function AlertForm({ symbol, currentPrice, onCreated }: Props) {
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [price, setPrice] = useState(currentPrice.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const targetPrice = parseFloat(price)
    if (isNaN(targetPrice) || targetPrice <= 0) {
      setError('Enter a valid price')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/alerts', { symbol, condition, targetPrice })
      setDone(true)
      onCreated?.()
      setTimeout(() => setDone(false), 3000)
    } catch {
      setError('Failed to set alert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className='flex flex-col gap-3'>
      {/* Condition toggle */}
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => setCondition('above')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
            condition === 'above'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-[var(--c-border)] text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
          }`}
        >
          <ChevronUp size={13} />
          Above
        </button>
        <button
          type='button'
          onClick={() => setCondition('below')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
            condition === 'below'
              ? 'border-red-500/40 bg-red-500/10 text-red-400'
              : 'border-[var(--c-border)] text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
          }`}
        >
          <ChevronDown size={13} />
          Below
        </button>
      </div>

      {/* Price input */}
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--c-text-3)]'>
            ₹
          </span>
          <input
            type='number'
            step='0.01'
            min='0.01'
            value={price}
            onChange={(e) => { setPrice(e.target.value); setError('') }}
            className='w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] py-2 pl-7 pr-3 text-sm text-[var(--c-text-1)] outline-none transition focus:border-blue-500/50'
          />
        </div>
        <button
          type='submit'
          disabled={loading || done}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-60 ${
            done
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {done ? (
            <>
              <Check size={12} />
              Set
            </>
          ) : (
            <>
              <BellPlus size={12} />
              {loading ? 'Setting…' : 'Set Alert'}
            </>
          )}
        </button>
      </div>

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </form>
  )
}
