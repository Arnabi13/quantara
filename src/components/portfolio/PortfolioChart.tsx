import { useEffect, useRef, useState } from 'react'
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type Time, ColorType } from 'lightweight-charts'
import type { EnrichedPosition } from '../../hooks/usePortfolio'
import { generateCandlestickData } from '../../data/stockDataGenerator'
import { useThemeStore } from '../../store/themeStore'

const TIMEFRAMES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
] as const

type TF = typeof TIMEFRAMES[number]['label']

function chartOptions(isDark: boolean) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: isDark ? '#475569' : '#64748B',
      fontFamily: 'Inter, sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
      horzLines: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
    },
    crosshair: { mode: 1 },
    rightPriceScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    },
    timeScale: {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      timeVisible: true,
    },
    handleScroll: false,
    handleScale: false,
  }
}

function buildSeries(positions: EnrichedPosition[], days: number) {
  if (positions.length === 0) return []

  const allCandles = positions.map((p) => ({
    qty: p.qty,
    candles: generateCandlestickData(p.symbol),
  }))

  const totalCandles = allCandles[0].candles.length
  const startIdx = Math.max(0, totalCandles - days)

  const result: { time: Time; value: number }[] = []

  for (let i = startIdx; i < totalCandles; i++) {
    const value = allCandles.reduce((sum, { qty, candles }) => {
      return sum + (candles[i]?.close ?? 0) * qty
    }, 0)
    result.push({ time: allCandles[0].candles[i].time, value: parseFloat(value.toFixed(2)) })
  }

  return result
}

interface Props {
  positions: EnrichedPosition[]
}

export default function PortfolioChart({ positions }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const seriesRef    = useRef<ISeriesApi<'Area'> | null>(null)
  const [tf, setTf]  = useState<TF>('3M')
  const [gain, setGain] = useState<{ value: number; pct: number } | null>(null)
  const isDark = useThemeStore((s) => s.isDark)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, chartOptions(isDark))

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#3B82F6',
      topColor: 'rgba(59, 130, 246, 0.2)',
      bottomColor: 'rgba(59, 130, 246, 0)',
      lineWidth: 2,
      priceFormat: { type: 'custom', formatter: (v: number) => `₹${v.toLocaleString('en-IN')}` },
    })

    chartRef.current = chart
    seriesRef.current = areaSeries

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
  }, [isDark])

  useEffect(() => {
    if (!seriesRef.current) return
    const days = TIMEFRAMES.find((t) => t.label === tf)!.days
    const data = buildSeries(positions, days)
    seriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()

    if (data.length >= 2) {
      const first = data[0].value
      const last  = data[data.length - 1].value
      setGain({ value: last - first, pct: first > 0 ? ((last - first) / first) * 100 : 0 })
    } else {
      setGain(null)
    }
  }, [positions, tf])

  const positive = gain ? gain.value >= 0 : true

  return (
    <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
      <div className='mb-4 flex items-start justify-between'>
        <div>
          <h2 className='text-base font-semibold text-[var(--c-text-1)]'>Portfolio Performance</h2>
          {gain && (
            <p className={`mt-1 text-sm font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? '+' : ''}₹{Math.abs(gain.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              <span className='ml-2 text-xs opacity-70'>
                ({positive ? '+' : ''}{gain.pct.toFixed(2)}%)
              </span>
            </p>
          )}
        </div>
        <div className='flex gap-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-1'>
          {TIMEFRAMES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setTf(label)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                tf === label
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {positions.length === 0 ? (
        <div className='flex h-48 items-center justify-center text-sm text-[var(--c-text-3)]'>
          Add positions to see performance chart
        </div>
      ) : (
        <div ref={containerRef} className='h-48 w-full' />
      )}
    </div>
  )
}
