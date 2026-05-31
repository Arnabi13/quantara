import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
}

const saved = localStorage.getItem('theme')
const initialDark = saved ? saved === 'dark' : true

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: initialDark,
  toggleTheme: () =>
    set((state) => {
      const isDark = !state.isDark
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
      return { isDark }
    }),
}))
