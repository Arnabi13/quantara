import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from '../lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TickerData {
  symbol: string
  price: number
  open: number
  high: number
  low: number
  volume: number
  change: number
  changePct: number
}

export interface KlineData {
  symbol: string
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  isClosed: boolean
}

export interface DepthData {
  symbol: string
  bids: [number, number][]
  asks: [number, number][]
}

export interface TradeData {
  symbol: string
  price: number
  qty: number
  isBuyerMaker: boolean
  time: number
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

// ── Singleton socket ─────────────────────────────────────────────────────────

let _socket: Socket | null = null

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(`${API_BASE_URL}/market`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })
  }
  return _socket
}

// ── useConnectionStatus ──────────────────────────────────────────────────────

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    const s = getSocket()
    const onConnect = () => setStatus('connected')
    const onDisconnect = () => setStatus('disconnected')
    const onConnectError = () => setStatus('disconnected')

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    s.on('connect_error', onConnectError)

    if (s.connected) setStatus('connected')

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
      s.off('connect_error', onConnectError)
    }
  }, [])

  return status
}

// ── useTickers ───────────────────────────────────────────────────────────────

export function useTickers(): { tickers: Record<string, TickerData>; status: ConnectionStatus } {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({})
  const status = useConnectionStatus()

  useEffect(() => {
    const s = getSocket()
    s.emit('subscribe', 'ticker')

    const onSnapshot = (data: TickerData[]) => {
      setTickers(Object.fromEntries(data.map((d) => [d.symbol, d])))
    }
    const onTicker = (data: TickerData) => {
      setTickers((prev) => ({ ...prev, [data.symbol]: data }))
    }

    s.on('ticker_snapshot', onSnapshot)
    s.on('ticker', onTicker)

    return () => {
      s.off('ticker_snapshot', onSnapshot)
      s.off('ticker', onTicker)
      s.emit('unsubscribe', 'ticker')
    }
  }, [])

  return { tickers, status }
}

// ── useKline ─────────────────────────────────────────────────────────────────

export function useKline(symbol: string, onCandle: (candle: KlineData) => void) {
  const onCandleRef = useRef(onCandle)
  onCandleRef.current = onCandle

  useEffect(() => {
    const room = `kline:${symbol}`
    const s = getSocket()
    s.emit('subscribe', room)

    const handler = (data: KlineData) => onCandleRef.current(data)
    s.on('kline', handler)

    return () => {
      s.off('kline', handler)
      s.emit('unsubscribe', room)
    }
  }, [symbol])
}

// ── useDepth ─────────────────────────────────────────────────────────────────

export function useDepth(symbol: string): DepthData | null {
  const [depth, setDepth] = useState<DepthData | null>(null)

  useEffect(() => {
    const room = `depth:${symbol}`
    const s = getSocket()
    s.emit('subscribe', room)

    const handler = (data: DepthData) => setDepth(data)
    s.on('depth', handler)

    return () => {
      s.off('depth', handler)
      s.emit('unsubscribe', room)
    }
  }, [symbol])

  return depth
}

// ── useTrades ────────────────────────────────────────────────────────────────

export function useTrades(symbol: string, maxLength = 40): TradeData[] {
  const [trades, setTrades] = useState<TradeData[]>([])

  useEffect(() => {
    const room = `trade:${symbol}`
    const s = getSocket()
    s.emit('subscribe', room)

    const handler = (data: TradeData) => {
      setTrades((prev) => [data, ...prev].slice(0, maxLength))
    }
    s.on('trade', handler)

    return () => {
      s.off('trade', handler)
      s.emit('unsubscribe', room)
    }
  }, [symbol, maxLength])

  return trades
}

// ── usePriceFlash ────────────────────────────────────────────────────────────
// Returns 'up' | 'down' | null for 300ms after each price change

export function usePriceFlash(price: number | undefined): 'up' | 'down' | null {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevRef = useRef<number | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFlash = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setFlash(null)
  }, [])

  useEffect(() => {
    if (price === undefined) return
    if (prevRef.current === undefined) {
      prevRef.current = price
      return
    }
    if (price === prevRef.current) return

    const dir = price > prevRef.current ? 'up' : 'down'
    prevRef.current = price

    clearFlash()
    setFlash(dir)
    timerRef.current = setTimeout(clearFlash, 300)
  }, [price, clearFlash])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return flash
}
