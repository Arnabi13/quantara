import {
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Moon,
  Sun,
} from 'lucide-react'

import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { api } from '../lib/api'

import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const Login = () => {
  const { isDark, toggleTheme } = useThemeStore()
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const login = useAuthStore(
    (state) => state.login,
  )

  const handleLogin = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      )

      const token =
        response.data.access_token

      login(token)

      navigate('/')
    } catch (error) {
      console.error(error)

      alert('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen bg-[var(--c-base)]'>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label='Toggle theme'
        className='absolute right-5 top-5 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-2)] transition hover:border-blue-500/40 hover:text-[var(--c-text-1)]'
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Left Section */}
      <div className='relative hidden flex-1 overflow-hidden border-r border-[var(--c-border)] bg-gradient-to-br from-[var(--c-sidebar-from)] via-[var(--c-surface)] to-[var(--c-base)] lg:flex'>

        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_35%)]' />

        <div className='relative z-10 flex flex-col justify-between p-12'>

          {/* Brand */}
          <div>
            <div className='mb-8 flex items-center gap-4'>

              <div className='flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500 shadow-lg shadow-blue-500/20'>
                <BarChart3
                  className='text-white'
                  size={28}
                />
              </div>

              <div>
                <h1 className='text-3xl font-semibold tracking-tight text-[var(--c-text-1)]'>
                  Quantara
                </h1>

                <p className='mt-1 text-[var(--c-text-3)]'>
                  Institutional Trading Workspace
                </p>
              </div>
            </div>

            <div className='max-w-lg'>

              <h2 className='text-5xl font-semibold leading-tight text-[var(--c-text-1)]'>
                Trade with precision and institutional intelligence.
              </h2>

              <p className='mt-6 text-lg leading-8 text-[var(--c-text-2)]'>
                Advanced portfolio analytics,
                market intelligence,
                and execution tools built
                for modern traders.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4'>

            <div className='rounded-3xl border border-[var(--c-border)] bg-[var(--c-overlay)] p-5 backdrop-blur-sm'>
              <TrendingUp
                className='mb-4 text-blue-400'
                size={22}
              />

              <p className='text-2xl font-semibold text-[var(--c-text-1)]'>
                +18.4%
              </p>

              <p className='mt-1 text-sm text-[var(--c-text-3)]'>
                Portfolio Growth
              </p>
            </div>

            <div className='rounded-3xl border border-[var(--c-border)] bg-[var(--c-overlay)] p-5 backdrop-blur-sm'>
              <ShieldCheck
                className='mb-4 text-emerald-400'
                size={22}
              />

              <p className='text-2xl font-semibold text-[var(--c-text-1)]'>
                Secure
              </p>

              <p className='mt-1 text-sm text-[var(--c-text-3)]'>
                Bank-grade protection
              </p>
            </div>

            <div className='rounded-3xl border border-[var(--c-border)] bg-[var(--c-overlay)] p-5 backdrop-blur-sm'>
              <BarChart3
                className='mb-4 text-violet-400'
                size={22}
              />

              <p className='text-2xl font-semibold text-[var(--c-text-1)]'>
                Real-time
              </p>

              <p className='mt-1 text-sm text-[var(--c-text-3)]'>
                Market intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className='flex w-full items-center justify-center px-6 lg:w-[480px]'>

        <div className='w-full max-w-md'>

          <div className='mb-10'>

            <p className='mb-3 text-sm uppercase tracking-[0.2em] text-blue-400'>
              Welcome Back
            </p>

            <h1 className='text-4xl font-semibold tracking-tight text-[var(--c-text-1)]'>
              Sign In
            </h1>

            <p className='mt-3 text-[var(--c-text-2)]'>
              Access your Quantara workspace
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className='space-y-5'
          >

            <div>
              <label className='mb-2 block text-sm text-[var(--c-text-2)]'>
                Email Address
              </label>

              <input
                type='email'
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder='you@example.com'
                className='w-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3.5 text-[var(--c-text-1)] outline-none transition-all placeholder:text-[var(--c-text-3)] focus:border-blue-500'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-[var(--c-text-2)]'>
                Password
              </label>

              <input
                type='password'
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder='••••••••'
                className='w-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3.5 text-[var(--c-text-1)] outline-none transition-all placeholder:text-[var(--c-text-3)] focus:border-blue-500'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full rounded-2xl bg-blue-500 py-3.5 font-medium text-white transition-all duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading
                ? 'Signing In...'
                : 'Sign In'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-[var(--c-text-2)]'>
            Don't have an account?{' '}
            <a
              href='/signup'
              className='font-medium text-blue-400 transition hover:text-blue-300'
            >
              Create one
            </a>
          </p>

          <p className='mt-6 text-sm text-[var(--c-text-3)]'>
            © 2026 Quantara.
            Institutional Trading Platform.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
