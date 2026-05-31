import { NSE_STOCKS } from './nseStocks'
import { getStockMeta } from './stockDataGenerator'

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function symbolSeed(symbol: string): number {
  return symbol.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

export const SECTOR_MAP: Record<string, string> = {
  TCS: 'IT', INFY: 'IT', WIPRO: 'IT', HCLTECH: 'IT', TECHM: 'IT',
  LTIM: 'IT', PERSISTENT: 'IT', COFORGE: 'IT', MPHASIS: 'IT', LTTS: 'IT', KPITTECH: 'IT',

  HDFCBANK: 'Banking', ICICIBANK: 'Banking', KOTAKBANK: 'Banking', SBIN: 'Banking',
  AXISBANK: 'Banking', INDUSINDBK: 'Banking', BANKBARODA: 'Banking', CANBK: 'Banking',
  PNB: 'Banking', FEDERALBNK: 'Banking', IDFCFIRSTB: 'Banking', BANDHANBNK: 'Banking',
  RBLBANK: 'Banking', AUBANK: 'Banking',

  HINDUNILVR: 'FMCG', ITC: 'FMCG', NESTLEIND: 'FMCG', BRITANNIA: 'FMCG',
  DABUR: 'FMCG', GODREJCP: 'FMCG', MARICO: 'FMCG', TATACONSUM: 'FMCG',

  SUNPHARMA: 'Pharma', CIPLA: 'Pharma', DRREDDY: 'Pharma', DIVISLAB: 'Pharma', APOLLOHOSP: 'Pharma',

  MARUTI: 'Auto', HEROMOTOCO: 'Auto', EICHERMOT: 'Auto', BAJAJAUTO: 'Auto', MM: 'Auto',

  BAJFINANCE: 'Finance', BAJAJFINSV: 'Finance', HDFCLIFE: 'Finance', SBILIFE: 'Finance',
  CHOLAFIN: 'Finance', MUTHOOTFIN: 'Finance', LICHSGFIN: 'Finance',
  IRFC: 'Finance', RECLTD: 'Finance', PFC: 'Finance',

  RELIANCE: 'Energy', ONGC: 'Energy', BPCL: 'Energy', IOC: 'Energy',
  NTPC: 'Energy', POWERGRID: 'Energy', COALINDIA: 'Energy', VEDL: 'Energy',

  JSWSTEEL: 'Metal', TATASTEEL: 'Metal', HINDALCO: 'Metal', SAIL: 'Metal',
  JINDALSTEL: 'Metal', NMDC: 'Metal',

  LT: 'Infra', ADANIPORTS: 'Infra', ADANIENT: 'Infra', CONCOR: 'Infra',
  BEL: 'Infra', HAL: 'Infra', BHEL: 'Infra', SIEMENS: 'Infra', ABB: 'Infra',

  BHARTIARTL: 'Telecom',

  ASIANPAINT: 'Paints', BERGEPAINT: 'Paints', PIDILITIND: 'Paints',
  INDIGOPNTS: 'Paints', KANSAINER: 'Paints', UPL: 'Paints', PIIND: 'Paints', RALLIS: 'Paints',

  HAVELLS: 'Electricals', VOLTAS: 'Electricals', BLUESTARCO: 'Electricals',
  CROMPTON: 'Electricals', POLYCAB: 'Electricals',

  ZOMATO: 'New Age', NYKAA: 'New Age', PAYTM: 'New Age', POLICYBZR: 'New Age',
  DELHIVERY: 'New Age', IRCTC: 'New Age',

  TITAN: 'Consumer', ULTRACEMCO: 'Consumer',
  NIFTY50: 'Index',
}

export interface ExtendedStockData {
  symbol: string
  name: string
  sector: string
  price: string
  priceVal: number
  change: string
  changeVal: number
  positive: boolean
  openVal: number
  highVal: number
  lowVal: number
  volume: number
  volumeStr: string
  marketCap: string
  marketCapVal: number
  high52w: string
  low52w: string
  high52wVal: number
  low52wVal: number
  pe: string
  eps: string
  bookValue: string
}

function formatMarketCap(crores: number): string {
  if (crores >= 100_000) return `₹${(crores / 100_000).toFixed(2)}L Cr`
  return `₹${Math.round(crores).toLocaleString('en-IN')} Cr`
}

export function getExtendedStockData(symbol: string): ExtendedStockData {
  const meta = getStockMeta(symbol)
  const seed = symbolSeed(symbol)
  const stock = NSE_STOCKS.find((s) => s.symbol === symbol)

  const priceVal = meta.closeVal
  const changeVal = parseFloat(meta.change.replace('+', '').replace('%', ''))
  const volume = Math.floor(seededRandom(seed * 3 + 7) * 9_000_000 + 500_000)

  const tier = seededRandom(seed * 2 + 3)
  let marketCapVal: number
  if (tier > 0.65) {
    marketCapVal = 50_000 + seededRandom(seed + 101) * 1_950_000
  } else if (tier > 0.35) {
    marketCapVal = 5_000 + seededRandom(seed + 101) * 45_000
  } else {
    marketCapVal = 500 + seededRandom(seed + 101) * 4_500
  }

  const high52wVal = priceVal * (1 + 0.05 + seededRandom(seed * 5 + 10) * 0.40)
  const low52wVal = priceVal * (1 - 0.05 - seededRandom(seed * 5 + 11) * 0.35)

  const pe = 8 + seededRandom(seed * 7 + 20) * 42
  const eps = priceVal / pe
  const bookValue = priceVal * (0.3 + seededRandom(seed * 7 + 21) * 0.7)

  return {
    symbol,
    name: stock?.name ?? symbol,
    sector: SECTOR_MAP[symbol] ?? 'Other',
    price: meta.price,
    priceVal,
    change: meta.change,
    changeVal,
    positive: meta.positive,
    openVal: meta.openVal,
    highVal: meta.highVal,
    lowVal: meta.lowVal,
    volume,
    volumeStr: volume.toLocaleString('en-IN'),
    marketCap: formatMarketCap(marketCapVal),
    marketCapVal,
    high52w: `₹${high52wVal.toFixed(2)}`,
    low52w: `₹${low52wVal.toFixed(2)}`,
    high52wVal,
    low52wVal,
    pe: pe.toFixed(1),
    eps: `₹${eps.toFixed(2)}`,
    bookValue: `₹${bookValue.toFixed(2)}`,
  }
}

export const MARKET_INDICES = [
  { symbol: 'NIFTY50',   label: 'NIFTY 50' },
  { symbol: 'HDFCBANK',  label: 'SENSEX' },
  { symbol: 'KOTAKBANK', label: 'NIFTY BANK' },
  { symbol: 'TCS',       label: 'NIFTY IT' },
  { symbol: 'TITAN',     label: 'NIFTY MIDCAP' },
  { symbol: 'SUNPHARMA', label: 'NIFTY PHARMA' },
  { symbol: 'MARUTI',    label: 'NIFTY AUTO' },
] as const

export const TABLE_STOCKS = NSE_STOCKS.map((s) => s.symbol).filter((s) => s !== 'NIFTY50')

export const SECTOR_LIST = [
  'IT', 'Banking', 'Pharma', 'Auto', 'Energy', 'Finance',
  'FMCG', 'Metal', 'Infra', 'Telecom', 'Paints', 'Electricals', 'New Age', 'Consumer',
]

export const ALL_STOCKS_DATA: ExtendedStockData[] = TABLE_STOCKS.map(getExtendedStockData)
