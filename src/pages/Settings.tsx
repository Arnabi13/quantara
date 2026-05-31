import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

const Settings = () => {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <div className='mx-auto max-w-[1600px] space-y-8'>

      {/* Header */}
      <div>
        <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Account</p>
        <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>Settings</h1>
        <p className='mt-3 text-[var(--c-text-2)]'>
          Manage your preferences and account settings.
        </p>
      </div>

      {/* Appearance */}
      <div className='rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6'>
        <h2 className='mb-6 text-lg font-semibold text-[var(--c-text-1)]'>Appearance</h2>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400'>
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <p className='font-medium text-[var(--c-text-1)]'>Theme</p>
              <p className='text-sm text-[var(--c-text-2)]'>
                {isDark ? 'Dark mode' : 'Light mode'} is currently active
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            role='switch'
            aria-checked={isDark}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isDark ? 'bg-blue-600' : 'bg-[var(--c-border)]'
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
                isDark ? 'translate-x-8' : 'translate-x-1'
              }`}
            >
              {isDark ? (
                <Moon size={10} className='text-blue-600' />
              ) : (
                <Sun size={10} className='text-yellow-500' />
              )}
            </span>
          </button>
        </div>

        {/* Theme preview cards */}
        <div className='mt-8 grid grid-cols-2 gap-4'>
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              isDark
                ? 'border-blue-500 bg-[#020817]'
                : 'border-[var(--c-border)] bg-[#020817] opacity-60 hover:opacity-80'
            }`}
          >
            <div className='mb-3 flex items-center gap-2'>
              <Moon size={14} className='text-blue-400' />
              <span className='text-xs font-semibold text-white'>Dark</span>
              {isDark && (
                <span className='ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400'>
                  Active
                </span>
              )}
            </div>
            <div className='space-y-1.5'>
              <div className='h-2 w-3/4 rounded-full bg-white/20' />
              <div className='h-2 w-1/2 rounded-full bg-white/10' />
              <div className='h-2 w-2/3 rounded-full bg-white/15' />
            </div>
          </button>

          <button
            onClick={() => isDark && toggleTheme()}
            className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              !isDark
                ? 'border-blue-500 bg-[#F0F4F8]'
                : 'border-[var(--c-border)] bg-[#F0F4F8] opacity-60 hover:opacity-80'
            }`}
          >
            <div className='mb-3 flex items-center gap-2'>
              <Sun size={14} className='text-yellow-500' />
              <span className='text-xs font-semibold text-slate-900'>Light</span>
              {!isDark && (
                <span className='ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600'>
                  Active
                </span>
              )}
            </div>
            <div className='space-y-1.5'>
              <div className='h-2 w-3/4 rounded-full bg-slate-900/20' />
              <div className='h-2 w-1/2 rounded-full bg-slate-900/10' />
              <div className='h-2 w-2/3 rounded-full bg-slate-900/15' />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
