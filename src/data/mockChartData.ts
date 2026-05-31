import type { CandlestickData, Time } from 'lightweight-charts'

function generateCandles(
  basePrice: number,
  count: number,
  startTimestamp: number,
  intervalSeconds: number,
): CandlestickData[] {
  const candles: CandlestickData[] = []
  let price = basePrice

  for (let i = 0; i < count; i++) {
    const open = price
    const change = (Math.random() - 0.48) * price * 0.012
    const close = open + change
    const high = Math.max(open, close) + Math.random() * price * 0.005
    const low = Math.min(open, close) - Math.random() * price * 0.005

    candles.push({
      time: (startTimestamp + i * intervalSeconds) as Time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })

    price = close
  }

  return candles
}

const DAY = 86400
const BASE_TS = 1700000000

export const nifty50Candles = generateCandles(22500, 180, BASE_TS, DAY)

export const sparklineData: Record<string, { value: number }[]> = {
  RELIANCE: Array.from({ length: 30 }, (_, i) => ({
    value: parseFloat((2800 + Math.sin(i * 0.4) * 60 + Math.random() * 30).toFixed(2)),
  })),
  TCS: Array.from({ length: 30 }, (_, i) => ({
    value: parseFloat((3900 + Math.sin(i * 0.3) * 80 + Math.random() * 40).toFixed(2)),
  })),
  INFY: Array.from({ length: 30 }, (_, i) => ({
    value: parseFloat((1700 + Math.sin(i * 0.5) * 40 + Math.random() * 20).toFixed(2)),
  })),
  HDFCBANK: Array.from({ length: 30 }, (_, i) => ({
    value: parseFloat((1600 - Math.sin(i * 0.35) * 35 + Math.random() * 25).toFixed(2)),
  })),
  NIFTY50: Array.from({ length: 30 }, (_, i) => ({
    value: parseFloat((22500 + Math.sin(i * 0.25) * 300 + Math.random() * 150).toFixed(2)),
  })),
}

export const watchlistMeta: Record<string, { price: string; change: string; positive: boolean }> = {
  RELIANCE:  { price: '₹2,847', change: '+1.42%', positive: true },
  TCS:       { price: '₹3,921', change: '+0.87%', positive: true },
  INFY:      { price: '₹1,723', change: '-0.34%', positive: false },
  HDFCBANK:  { price: '₹1,612', change: '+0.61%', positive: true },
  NIFTY50:   { price: '₹22,643', change: '+0.95%', positive: true },
}
