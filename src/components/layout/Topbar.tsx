import { useEffect, useRef, useState } from 'react'
import { Search, LogOut, User, Sun, Moon, Wifi, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { api } from '../../lib/api'
import NotificationBell from './NotificationBell'
import { useConnectionStatus } from '../../hooks/useBinanceSocket'

interface ProfileResponse {
  firstName?: string
  lastName?: string
  email: string
}

const Topbar = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggleTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const status = useConnectionStatus()

  useEffect(() => {
    api.get<ProfileResponse>('/auth/profile').then((res) => setProfile(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = profile
    ? profile.firstName
      ? `${profile.firstName[0]}${profile.lastName?.[0] ?? ''}`.toUpperCase()
      : profile.email[0].toUpperCase()
    : 'U'

  const displayName = profile
    ? profile.firstName
      ? `${profile.firstName} ${profile.lastName ?? ''}`.trim()
      : profile.email
    : ''

  return (
    <header className='flex h-[86px] items-center justify-between border-b border-[var(--c-border-sub)] bg-[var(--c-surface)] px-8 shadow-[0_1px_12px_rgba(0,0,0,0.15)]'>

      {/* Search */}
      <div className='relative w-[420px]'>
        <div className='flex h-14 items-center rounded-2xl border border-[var(--c-border-sub)] bg-[var(--c-surface-2)] transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)]'>
          <Search size={18} className='ml-4 text-[var(--c-text-3)]' />
          <input
            type='text'
            placeholder='Search stocks, ETFs, indices...'
            className='h-full w-full bg-transparent pl-3 pr-4 text-sm text-[var(--c-text-1)] placeholder:text-[var(--c-text-3)] outline-none'
          />
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center gap-4'>

        {/* Live connection badge */}
        <button
          onClick={() => navigate('/crypto')}
          title='Go to Crypto Markets'
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            status === 'connected'
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : status === 'disconnected'
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          {status === 'connected'
            ? <><span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400' /><Wifi size={11} /> LIVE</>
            : status === 'disconnected'
              ? <><span className='h-1.5 w-1.5 rounded-full bg-red-400' /><WifiOff size={11} /> OFFLINE</>
              : <><span className='h-1.5 w-1.5 animate-ping rounded-full bg-amber-400' /> CONN…</>
          }
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className='flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--c-border-sub)] bg-[var(--c-surface-2)] text-[var(--c-text-2)] transition-all duration-200 hover:bg-[var(--c-border)] hover:text-[var(--c-text-1)]'
          aria-label='Toggle theme'
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        {/* Avatar + Dropdown */}
        <div ref={dropdownRef} className='relative'>
          <button
            onClick={() => setOpen((v) => !v)}
            className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500'
          >
            {initials}
          </button>

          {open && (
            <div className='absolute right-0 top-[56px] z-50 w-56 overflow-hidden rounded-2xl border border-[var(--c-border-sub)] bg-[var(--c-surface-2)] shadow-2xl shadow-black/20'>

              {/* User info */}
              <div className='flex items-center gap-3 border-b border-[var(--c-border-sub)] px-4 py-4'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white'>
                  {initials}
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-[var(--c-text-1)]'>{displayName}</p>
                  <p className='truncate text-xs text-[var(--c-text-3)]'>{profile?.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className='p-2'>
                <button
                  onClick={() => { setOpen(false); navigate('/settings') }}
                  className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--c-text-2)] transition hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-1)]'
                >
                  <User size={15} />
                  Profile & Settings
                </button>

                <button
                  onClick={handleLogout}
                  className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300'
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
