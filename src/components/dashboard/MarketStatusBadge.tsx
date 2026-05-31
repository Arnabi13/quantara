import { useEffect, useState } from 'react'

// NSE trading hours in IST: 09:15 – 15:30, Mon–Fri
function getISTDate(now: Date): { h: number; m: number; day: number } {
  // IST = UTC + 5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  return { h: ist.getHours(), m: ist.getMinutes(), day: ist.getDay() }
}

function isMarketOpen(now: Date): boolean {
  const { h, m, day } = getISTDate(now)
  if (day === 0 || day === 6) return false
  const mins = h * 60 + m
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30
}

function secondsUntilNext(now: Date): number {
  const { h, m, day } = getISTDate(now)
  const mins = h * 60 + m
  const open = 9 * 60 + 15
  const close = 15 * 60 + 30

  // weekend: count to Monday open
  if (day === 6) return ((2 * 24 * 60 + open - mins) * 60) - now.getSeconds()
  if (day === 0) return ((1 * 24 * 60 + open - mins) * 60) - now.getSeconds()

  if (mins < open) return ((open - mins) * 60) - now.getSeconds()
  if (mins < close) return ((close - mins) * 60) - now.getSeconds()
  // after close: count to tomorrow open (skip weekend)
  const daysAhead = day === 5 ? 3 : 1
  return ((daysAhead * 24 * 60 + open - mins) * 60) - now.getSeconds()
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

export default function MarketStatusBadge() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const open = isMarketOpen(now)
  const secs = Math.max(0, secondsUntilNext(now))
  const label = open ? 'closes in' : 'opens in'

  return (
    <div className='flex items-center gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] px-4 py-2.5'>
      {/* pulsing dot */}
      <span className='relative flex h-2.5 w-2.5 shrink-0'>
        {open && (
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60' />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-[var(--c-text-3)]'}`}
        />
      </span>

      <span className={`text-sm font-semibold ${open ? 'text-emerald-400' : 'text-[var(--c-text-2)]'}`}>
        NSE {open ? 'OPEN' : 'CLOSED'}
      </span>

      <span className='h-3.5 w-px bg-[var(--c-border)]' />

      <span className='text-xs text-[var(--c-text-3)]'>
        {label}{' '}
        <span className='font-mono font-semibold text-[var(--c-text-2)]'>{formatCountdown(secs)}</span>
      </span>
    </div>
  )
}
