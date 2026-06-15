import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { getExtendedStockData } from '../data/marketsData'

export interface Position {
  id: string
  symbol: string
  qty: number
  avgBuy: number
  createdAt: string
}

export interface EnrichedPosition extends Position {
  name: string
  sector: string
  priceVal: number
  changeVal: number
  positive: boolean
  currentVal: number
  invested: number
  pnl: number
  pnlPct: number
  dayPnl: number
  color: string
  weight: number
}

export interface Transaction {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  qty: number
  price: number
  executedAt: string
}

export interface TxPage {
  items: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#06B6D4',
  '#F97316', '#EC4899', '#F59E0B', '#EF4444',
  '#84CC16', '#A78BFA', '#34D399', '#F472B6',
]

function enrich(positions: Position[]): EnrichedPosition[] {
  const totalVal = positions.reduce((s, p) => {
    const stock = getExtendedStockData(p.symbol)
    return s + stock.priceVal * p.qty
  }, 0)

  return positions.map((p, i) => {
    const stock = getExtendedStockData(p.symbol)
    const currentVal = stock.priceVal * p.qty
    const invested = p.avgBuy * p.qty
    const pnl = currentVal - invested
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
    const dayPnl = (stock.changeVal / 100) * currentVal
    return {
      ...p,
      name: stock.name,
      sector: stock.sector,
      priceVal: stock.priceVal,
      changeVal: stock.changeVal,
      positive: stock.positive,
      currentVal,
      invested,
      pnl,
      pnlPct,
      dayPnl,
      color: COLORS[i % COLORS.length],
      weight: totalVal > 0 ? (currentVal / totalVal) * 100 : 0,
    }
  })
}

export function usePortfolio() {
  const [positions, setPositions] = useState<EnrichedPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const res = await api.get<Position[]>('/portfolio')
      setPositions(enrich(res.data))
    } catch {
      setError('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const addPosition = useCallback(async (symbol: string, qty: number, price: number) => {
    await api.post('/portfolio', { symbol, qty, price })
    await refresh()
  }, [refresh])

  const sellPosition = useCallback(async (symbol: string, qty: number, price: number) => {
    await api.post('/portfolio/sell', { symbol, qty, price })
    await refresh()
  }, [refresh])

  const removePosition = useCallback(async (symbol: string) => {
    await api.delete(`/portfolio/${symbol}`)
    await refresh()
  }, [refresh])

  const fetchTransactions = useCallback(async (page: number, limit = 15): Promise<TxPage> => {
    const res = await api.get<TxPage>(`/portfolio/transactions?page=${page}&limit=${limit}`)
    return res.data
  }, [])

  const totalValue    = positions.reduce((s, p) => s + p.currentVal, 0)
  const totalInvested = positions.reduce((s, p) => s + p.invested, 0)
  const totalPnl      = totalValue - totalInvested
  const totalPnlPct   = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
  const totalDayPnl   = positions.reduce((s, p) => s + p.dayPnl, 0)

  return {
    positions,
    loading,
    error,
    refresh,
    addPosition,
    sellPosition,
    removePosition,
    fetchTransactions,
    totals: { totalValue, totalInvested, totalPnl, totalPnlPct, totalDayPnl },
  }
}
