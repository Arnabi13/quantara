import type { CandlestickData, Time } from 'lightweight-charts'

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function symbolSeed(symbol: string): number {
  return symbol.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

export function generateSparklineData(symbol: string): { value: number }[] {
  const seed = symbolSeed(symbol)
  const basePrice = 200 + (seed % 3500)
  const result: { value: number }[] = []
  let price = basePrice
  for (let i = 0; i < 30; i++) {
    price += (seededRandom(seed * 7 + i * 13) - 0.47) * basePrice * 0.015
    result.push({ value: Math.max(10, price) })
  }
  return result
}

export interface StockMeta {
  price: string
  change: string
  positive: boolean
  openVal: number
  highVal: number
  lowVal: number
  closeVal: number
  volumeStr: string
}

export function getStockMeta(symbol: string): StockMeta {
  const seed = symbolSeed(symbol)
  const sparkline = generateSparklineData(symbol)
  const firstValue = sparkline[0].value
  const lastValue = sparkline[sparkline.length - 1].value
  const changeRaw = ((lastValue - firstValue) / firstValue) * 100
  const positive = changeRaw >= 0
  const close = lastValue
  const open = firstValue
  const high = Math.max(open, close) * (1 + seededRandom(seed * 3 + 5) * 0.012)
  const low = Math.min(open, close) * (1 - seededRandom(seed * 3 + 6) * 0.012)
  const volume = Math.floor(seededRandom(seed * 3 + 7) * 9_000_000 + 500_000)
  return {
    price: `₹${close.toFixed(2)}`,
    change: `${positive ? '+' : ''}${changeRaw.toFixed(2)}%`,
    positive,
    openVal: parseFloat(open.toFixed(2)),
    highVal: parseFloat(high.toFixed(2)),
    lowVal: parseFloat(low.toFixed(2)),
    closeVal: parseFloat(close.toFixed(2)),
    volumeStr: volume.toLocaleString('en-IN'),
  }
}

const BASE_TS = 1_700_000_000
const DAY = 86_400

export function generateCandlestickData(symbol: string): CandlestickData[] {
  const seed = symbolSeed(symbol)
  const candles: CandlestickData[] = []
  let price = 200 + (seed % 3500)
  for (let i = 0; i < 180; i++) {
    const daySeed = seed * 11 + i * 7
    const open = price
    const change = (seededRandom(daySeed) - 0.48) * price * 0.018
    const close = Math.max(10, open + change)
    const high = Math.max(open, close) + seededRandom(daySeed + 1) * price * 0.006
    const low = Math.min(open, close) - seededRandom(daySeed + 2) * price * 0.006
    candles.push({
      time: (BASE_TS + i * DAY) as Time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(Math.max(1, low).toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })
    price = close
  }
  return candles
}
