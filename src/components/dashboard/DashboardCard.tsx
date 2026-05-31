import { type ReactNode } from 'react'
import Sparkline from '../charts/Sparkline'
import { useCountUp } from '../../hooks/useCountUp'

interface DashboardCardProps {
  title: string
  value: string
  change: string
  positive?: boolean
  sparkline?: { value: number }[]
  icon?: ReactNode
  accentColor?: 'blue' | 'emerald' | 'violet' | 'amber'
  /** When provided, animates a count-up from 0 to this number on mount */
  numericValue?: number
  /** How to format the animated number. Defaults to String(n). */
  formatValue?: (n: number) => string
}

const ACCENT = {
  blue: {
    bar:  'bg-blue-500',
    glow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    icon: 'bg-blue-500/15 text-blue-400',
    ring: 'shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)]',
  },
  emerald: {
    bar:  'bg-emerald-500',
    glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    icon: 'bg-emerald-500/15 text-emerald-400',
    ring: 'shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]',
  },
  violet: {
    bar:  'bg-violet-500',
    glow: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    icon: 'bg-violet-500/15 text-violet-400',
    ring: 'shadow-[inset_0_0_0_1px_rgba(139,92,246,0.15)]',
  },
  amber: {
    bar:  'bg-amber-500',
    glow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    icon: 'bg-amber-500/15 text-amber-400',
    ring: 'shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]',
  },
}

function AnimatedCardValue({
  numericValue,
  formatValue,
  fallback,
}: {
  numericValue: number
  formatValue: (n: number) => string
  fallback: string
}) {
  const animated = useCountUp(numericValue, 1200)
  return <>{animated === 0 ? fallback : formatValue(animated)}</>
}

const DashboardCard = ({
  title,
  value,
  change,
  positive = true,
  sparkline,
  icon,
  accentColor = 'blue',
  numericValue,
  formatValue,
}: DashboardCardProps) => {
  const a = ACCENT[accentColor]

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 ${a.ring}`}
    >
      {/* Colored top accent bar */}
      <div className={`absolute left-6 right-6 top-0 h-[2px] rounded-b-full opacity-70 ${a.bar}`} />

      {/* Corner glow */}
      <div className={`absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl transition-all duration-300 ${a.glow}`} />

      <div className='relative z-10'>
        {/* Header */}
        <div className='mb-5 flex items-start justify-between'>
          <p className='text-sm font-medium text-[var(--c-text-2)]'>{title}</p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${a.icon}`}>
            {icon}
          </div>
        </div>

        {/* Value + sparkline */}
        <div className='flex items-end justify-between gap-4'>
          <h2 className='text-3xl font-bold tracking-tight text-[var(--c-text-1)]'>
            {numericValue !== undefined && formatValue ? (
              <AnimatedCardValue
                numericValue={numericValue}
                formatValue={formatValue}
                fallback={value}
              />
            ) : (
              value
            )}
          </h2>
          {sparkline && (
            <div className='mb-1 shrink-0'>
              <Sparkline data={sparkline} positive={positive} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='mt-4 flex items-center gap-3'>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              positive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            {change}
          </span>
          <span className='text-xs text-[var(--c-text-3)]'>vs yesterday</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
