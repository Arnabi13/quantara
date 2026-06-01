import { useState } from 'react'
import {
  Moon, Sun, User, Lock, LayoutDashboard, BarChart2, Bell,
  Check, ChevronDown, Eye, EyeOff, Loader2,
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore, type DefaultPage, type MoversCount, type DefaultTimeframe, type PriceChangeFormat } from '../store/settingsStore'
import { api } from '../lib/api'

// ─── tiny reusable primitives ───────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-border)] p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='mb-6 flex items-center gap-3'>
      <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400'>
        {icon}
      </div>
      <h2 className='text-lg font-semibold text-[var(--c-text-1)]'>{children}</h2>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role='switch'
      aria-checked={checked}
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        checked ? 'bg-blue-600' : 'bg-[var(--c-border)]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function OptionPill<T extends string | number>({
  value, current, onChange, children,
}: { value: T; current: T; onChange: (v: T) => void; children: React.ReactNode }) {
  const active = value === current
  return (
    <button
      onClick={() => onChange(value)}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-[var(--c-overlay)] text-[var(--c-text-2)] hover:text-[var(--c-text-1)]'
      }`}
    >
      {children}
    </button>
  )
}

function InputField({
  label, type = 'text', value, onChange, placeholder, disabled, rightSlot,
}: {
  label: string
  type?: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  rightSlot?: React.ReactNode
}) {
  return (
    <div>
      <label className='mb-1.5 block text-sm font-medium text-[var(--c-text-2)]'>{label}</label>
      <div className='relative'>
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className='w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] px-4 py-2.5 text-sm text-[var(--c-text-1)] placeholder:text-[var(--c-text-3)] focus:border-blue-500 focus:outline-none disabled:opacity-50'
        />
        {rightSlot && (
          <div className='absolute inset-y-0 right-3 flex items-center'>{rightSlot}</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <p className={`mt-3 text-sm font-medium ${type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
      {message}
    </p>
  )
}

// ─── Profile section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const { firstName, lastName, email, updateProfile } = useAuthStore()
  const [first, setFirst] = useState(firstName ?? '')
  const [last, setLast] = useState(lastName ?? '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const dirty = first !== (firstName ?? '') || last !== (lastName ?? '')

  async function handleSave() {
    setLoading(true)
    setStatus(null)
    try {
      await updateProfile(first, last)
      setStatus({ type: 'success', msg: 'Profile updated.' })
    } catch {
      setStatus({ type: 'error', msg: 'Failed to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard>
      <SectionTitle icon={<User size={18} />}>Profile</SectionTitle>
      <div className='grid gap-4 sm:grid-cols-2'>
        <InputField label='First name' value={first} onChange={setFirst} placeholder='First name' />
        <InputField label='Last name' value={last} onChange={setLast} placeholder='Last name' />
        <InputField label='Email' value={email ?? ''} disabled />
      </div>
      <div className='mt-5 flex items-center gap-3'>
        <button
          onClick={handleSave}
          disabled={!dirty || loading}
          className='flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40'
        >
          {loading ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
          Save changes
        </button>
      </div>
      {status && <StatusBadge type={status.type} message={status.msg} />}
    </SectionCard>
  )
}

// ─── Change Password section ──────────────────────────────────────────────────

function ChangePasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleChange() {
    if (next !== confirm) {
      setStatus({ type: 'error', msg: 'New passwords do not match.' })
      return
    }
    if (next.length < 6) {
      setStatus({ type: 'error', msg: 'Password must be at least 6 characters.' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await api.patch('/auth/change-password', { currentPassword: current, newPassword: next })
      setStatus({ type: 'success', msg: 'Password updated successfully.' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to change password.'
      setStatus({ type: 'error', msg })
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type='button' onClick={toggle} className='text-[var(--c-text-3)] hover:text-[var(--c-text-2)]'>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <SectionCard>
      <SectionTitle icon={<Lock size={18} />}>Change Password</SectionTitle>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='sm:col-span-2'>
          <InputField
            label='Current password'
            type={showCurrent ? 'text' : 'password'}
            value={current}
            onChange={setCurrent}
            placeholder='••••••••'
            rightSlot={eyeBtn(showCurrent, () => setShowCurrent((v) => !v))}
          />
        </div>
        <InputField
          label='New password'
          type={showNext ? 'text' : 'password'}
          value={next}
          onChange={setNext}
          placeholder='Min. 6 characters'
          rightSlot={eyeBtn(showNext, () => setShowNext((v) => !v))}
        />
        <InputField
          label='Confirm new password'
          type={showNext ? 'text' : 'password'}
          value={confirm}
          onChange={setConfirm}
          placeholder='Repeat new password'
        />
      </div>
      <div className='mt-5'>
        <button
          onClick={handleChange}
          disabled={!current || !next || !confirm || loading}
          className='flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40'
        >
          {loading ? <Loader2 size={14} className='animate-spin' /> : <Lock size={14} />}
          Update password
        </button>
      </div>
      {status && <StatusBadge type={status.type} message={status.msg} />}
    </SectionCard>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <SectionCard>
      <SectionTitle icon={isDark ? <Moon size={18} /> : <Sun size={18} />}>Appearance</SectionTitle>

      <div className='flex items-center justify-between'>
        <div>
          <p className='font-medium text-[var(--c-text-1)]'>Theme</p>
          <p className='text-sm text-[var(--c-text-2)]'>
            {isDark ? 'Dark mode' : 'Light mode'} is currently active
          </p>
        </div>
        <Toggle checked={isDark} onChange={toggleTheme} />
      </div>

      <div className='mt-6 grid grid-cols-2 gap-4'>
        <button
          onClick={() => !isDark && toggleTheme()}
          className={`overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
            isDark ? 'border-blue-500 bg-[#020817]' : 'border-[var(--c-border)] bg-[#020817] opacity-60 hover:opacity-80'
          }`}
        >
          <div className='mb-3 flex items-center gap-2'>
            <Moon size={14} className='text-blue-400' />
            <span className='text-xs font-semibold text-white'>Dark</span>
            {isDark && <span className='ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400'>Active</span>}
          </div>
          <div className='space-y-1.5'>
            <div className='h-2 w-3/4 rounded-full bg-white/20' />
            <div className='h-2 w-1/2 rounded-full bg-white/10' />
            <div className='h-2 w-2/3 rounded-full bg-white/15' />
          </div>
        </button>

        <button
          onClick={() => isDark && toggleTheme()}
          className={`overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
            !isDark ? 'border-blue-500 bg-[#F0F4F8]' : 'border-[var(--c-border)] bg-[#F0F4F8] opacity-60 hover:opacity-80'
          }`}
        >
          <div className='mb-3 flex items-center gap-2'>
            <Sun size={14} className='text-yellow-500' />
            <span className='text-xs font-semibold text-slate-900'>Light</span>
            {!isDark && <span className='ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600'>Active</span>}
          </div>
          <div className='space-y-1.5'>
            <div className='h-2 w-3/4 rounded-full bg-slate-900/20' />
            <div className='h-2 w-1/2 rounded-full bg-slate-900/10' />
            <div className='h-2 w-2/3 rounded-full bg-slate-900/15' />
          </div>
        </button>
      </div>
    </SectionCard>
  )
}

// ─── Dashboard Preferences section ───────────────────────────────────────────

const PAGE_OPTIONS: { value: DefaultPage; label: string }[] = [
  { value: '/', label: 'Dashboard' },
  { value: '/markets', label: 'Markets' },
  { value: '/watchlist', label: 'Watchlist' },
  { value: '/portfolio', label: 'Portfolio' },
]

const TF_OPTIONS: { value: DefaultTimeframe; label: string }[] = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'All', label: 'All' },
]

function DashboardPrefsSection() {
  const { defaultPage, moversCount, defaultTimeframe, setDefaultPage, setMoversCount, setDefaultTimeframe } = useSettingsStore()

  return (
    <SectionCard>
      <SectionTitle icon={<LayoutDashboard size={18} />}>Dashboard Preferences</SectionTitle>

      <div className='space-y-6'>
        <div>
          <p className='mb-3 text-sm font-medium text-[var(--c-text-2)]'>Default landing page</p>
          <div className='flex flex-wrap gap-2'>
            {PAGE_OPTIONS.map((o) => (
              <OptionPill key={o.value} value={o.value} current={defaultPage} onChange={setDefaultPage}>
                {o.label}
              </OptionPill>
            ))}
          </div>
        </div>

        <div>
          <p className='mb-3 text-sm font-medium text-[var(--c-text-2)]'>Market Movers list size</p>
          <div className='flex gap-2'>
            {([5, 8, 10] as MoversCount[]).map((n) => (
              <OptionPill key={n} value={n} current={moversCount} onChange={setMoversCount}>
                {n} stocks
              </OptionPill>
            ))}
          </div>
        </div>

        <div>
          <p className='mb-3 text-sm font-medium text-[var(--c-text-2)]'>Default chart timeframe</p>
          <div className='flex gap-2'>
            {TF_OPTIONS.map((o) => (
              <OptionPill key={o.value} value={o.value} current={defaultTimeframe} onChange={setDefaultTimeframe}>
                {o.label}
              </OptionPill>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Data & Display section ───────────────────────────────────────────────────

const FORMAT_OPTIONS: { value: PriceChangeFormat; label: string; desc: string }[] = [
  { value: 'percent', label: 'Percent', desc: '+1.23%' },
  { value: 'absolute', label: 'Absolute', desc: '+₹15.40' },
  { value: 'both', label: 'Both', desc: '+1.23% · +₹15.40' },
]

function DataDisplaySection() {
  const { priceChangeFormat, setPriceChangeFormat } = useSettingsStore()

  return (
    <SectionCard>
      <SectionTitle icon={<BarChart2 size={18} />}>Data & Display</SectionTitle>

      <div>
        <p className='mb-3 text-sm font-medium text-[var(--c-text-2)]'>Price change format</p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {FORMAT_OPTIONS.map((o) => {
            const active = o.value === priceChangeFormat
            return (
              <button
                key={o.value}
                onClick={() => setPriceChangeFormat(o.value)}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  active ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--c-border)] hover:border-blue-500/40'
                }`}
              >
                <p className={`mb-1 text-sm font-semibold ${active ? 'text-blue-400' : 'text-[var(--c-text-1)]'}`}>
                  {o.label}
                </p>
                <p className='font-mono text-xs text-emerald-400'>{o.desc}</p>
                {active && <Check size={14} className='mt-2 text-blue-400' />}
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────

const NOTIF_ROWS: {
  key: 'notifyWatchlistMoves' | 'notifyMarketOpen' | 'notifyMarketClose'
  label: string
  desc: string
}[] = [
  { key: 'notifyWatchlistMoves', label: 'Watchlist price moves', desc: 'Alert when a watchlist stock moves more than 2%' },
  { key: 'notifyMarketOpen', label: 'Market open', desc: 'Remind at 09:15 IST when NSE opens' },
  { key: 'notifyMarketClose', label: 'Market close', desc: 'Remind at 15:30 IST when NSE closes' },
]

function NotificationsSection() {
  const { notifyWatchlistMoves, notifyMarketOpen, notifyMarketClose, toggleNotification } = useSettingsStore()
  const values = { notifyWatchlistMoves, notifyMarketOpen, notifyMarketClose }

  return (
    <SectionCard>
      <SectionTitle icon={<Bell size={18} />}>Notifications</SectionTitle>
      <div className='space-y-4'>
        {NOTIF_ROWS.map((row) => (
          <div key={row.key} className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-[var(--c-text-1)]'>{row.label}</p>
              <p className='text-xs text-[var(--c-text-3)]'>{row.desc}</p>
            </div>
            <Toggle checked={values[row.key]} onChange={() => toggleNotification(row.key)} />
          </div>
        ))}
      </div>
      <p className='mt-5 text-xs text-[var(--c-text-3)]'>
        Notification delivery is coming soon. Your preferences will be saved.
      </p>
    </SectionCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Settings = () => {
  return (
    <div className='mx-auto max-w-[1600px] space-y-8'>
      <div>
        <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>Account</p>
        <h1 className='text-4xl font-bold tracking-tight text-[var(--c-text-1)]'>Settings</h1>
        <p className='mt-3 text-[var(--c-text-2)]'>Manage your preferences and account settings.</p>
      </div>

      <ProfileSection />
      <ChangePasswordSection />
      <AppearanceSection />
      <DashboardPrefsSection />
      <DataDisplaySection />
      <NotificationsSection />
    </div>
  )
}

export default Settings
