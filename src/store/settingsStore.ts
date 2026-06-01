import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultPage = '/' | '/markets' | '/watchlist' | '/portfolio'
export type MoversCount = 5 | 8 | 10
export type DefaultTimeframe = '1W' | '1M' | '3M' | '6M' | 'All'
export type PriceChangeFormat = 'percent' | 'absolute' | 'both'

interface SettingsState {
  defaultPage: DefaultPage
  moversCount: MoversCount
  defaultTimeframe: DefaultTimeframe
  priceChangeFormat: PriceChangeFormat

  notifyWatchlistMoves: boolean
  notifyMarketOpen: boolean
  notifyMarketClose: boolean

  setDefaultPage: (v: DefaultPage) => void
  setMoversCount: (v: MoversCount) => void
  setDefaultTimeframe: (v: DefaultTimeframe) => void
  setPriceChangeFormat: (v: PriceChangeFormat) => void
  toggleNotification: (key: 'notifyWatchlistMoves' | 'notifyMarketOpen' | 'notifyMarketClose') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultPage: '/',
      moversCount: 8,
      defaultTimeframe: '3M',
      priceChangeFormat: 'percent',

      notifyWatchlistMoves: true,
      notifyMarketOpen: false,
      notifyMarketClose: false,

      setDefaultPage: (v) => set({ defaultPage: v }),
      setMoversCount: (v) => set({ moversCount: v }),
      setDefaultTimeframe: (v) => set({ defaultTimeframe: v }),
      setPriceChangeFormat: (v) => set({ priceChangeFormat: v }),
      toggleNotification: (key) => set((s) => ({ [key]: !s[key] })),
    }),
    { name: 'quantara-settings' },
  ),
)
