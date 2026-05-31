import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import './styles/global.css'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { store } from './app/store'
import { router } from './app/router'
import { useThemeStore } from './store/themeStore'

// Apply saved theme class before first paint to avoid flash
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'light') {
  document.documentElement.classList.add('light')
}

function ThemeSync() {
  const isDark = useThemeStore((s) => s.isDark)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <ThemeSync />
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </>
  </React.StrictMode>,
)
