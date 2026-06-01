import { useEffect, useRef, useState } from 'react'
import {
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
} from 'lightweight-charts'
import { generateCandlestickData } from '../../data/stockDataGenerator'
import { useThemeStore } from '../../store/themeStore'
import { useSettingsStore } from '../../store/settingsStore'

const TIMEFRAMES = ['1W', '1M', '3M', '6M', 'All'] as const
type Timeframe = (typeof TIMEFRAMES)[number]

const SLICE: Record<Timeframe, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 120,
  All: 180,
}

function chartOptions(isDark: boolean) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: isDark ? '#9CA3AF' : '#475569',
      fontFamily: 'Inter, sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
      horzLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: '#3B82F6', width: 1 as const, style: 3 as const, labelBackgroundColor: '#3B82F6' },
      horzLine: { color: '#3B82F6', width: 1 as const, style: 3 as const, labelBackgroundColor: '#3B82F6' },
    },
    rightPriceScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      textColor: isDark ? '#6B7280' : '#64748B',
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      timeVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    handleScroll: true,
    handleScale: true,
  }
}

export default function StockDetailChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const defaultTimeframe = useSettingsStore((s) => s.defaultTimeframe)
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe)
  const [lastCandle, setLastCandle] = useState<CandlestickData | null>(null)
  const isDark = useThemeStore((s) => s.isDark)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, chartOptions(isDark))

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    })

    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [symbol, isDark])

  useEffect(() => {
    if (!seriesRef.current) return
    const all = generateCandlestickData(symbol)
    const data = all.slice(-SLICE[timeframe])
    seriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
    setLastCandle(data[data.length - 1] ?? null)
  }, [timeframe, symbol])

  const isPositive = lastCandle ? lastCandle.close >= lastCandle.open : true
  const changePct = lastCandle
    ? (((lastCandle.close - lastCandle.open) / lastCandle.open) * 100).toFixed(2)
    : '0.00'

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-3 flex items-center justify-between'>
        {lastCandle && (
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{changePct}% this period
          </span>
        )}
        <div className='ml-auto flex gap-1'>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--c-text-2)] hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-1)]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className='flex-1' />
    </div>
  )
}
