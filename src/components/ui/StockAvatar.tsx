import { useState } from 'react'
import { STOCK_DOMAINS } from '../../data/stockDomains'

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#6366f1',
]

export function symbolColor(symbol: string): string {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

const SIZE: Record<string, string> = {
  sm: 'h-8 w-8 rounded-lg text-[10px]',
  md: 'h-9 w-9 rounded-xl text-xs',
  lg: 'h-10 w-10 rounded-xl text-sm',
  xl: 'h-12 w-12 rounded-2xl text-sm',
}

interface StockAvatarProps {
  symbol: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function StockAvatar({ symbol, color, size = 'md', className = '' }: StockAvatarProps) {
  const [failed, setFailed] = useState(false)
  const domain = STOCK_DOMAINS[symbol]
  const sizeClass = SIZE[size]
  const bg = color ?? symbolColor(symbol)

  if (!domain || failed) {
    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center font-bold text-white ${className}`}
        style={{ backgroundColor: bg }}
      >
        {symbol.slice(0, 2)}
      </div>
    )
  }

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-lg bg-white ${className}`}>
      <img
        src={`https://img.logo.dev/${domain}?token=${import.meta.env.VITE_LOGO_DEV_KEY}&size=80&format=png`}
        alt={symbol}
        className="h-full w-full object-contain p-[3px]"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
