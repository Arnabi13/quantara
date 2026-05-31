import {
  BarChart3,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { api } from '../lib/api'

import { useAuthStore } from '../store/authStore'

const Signup = () => {
  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [email, setEmail] = useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const navigate = useNavigate()

  const login = useAuthStore(
    (state) => state.login,
  )

  const handleSignup = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    try {
      setLoading(true)

      await api.post('/auth/signup', {
        firstName,
        lastName,
        email,
        password,
      })

      const loginResponse = await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      )

      const token =
        loginResponse.data.access_token

      login(token)

      navigate('/')
    } catch (error) {
      console.error(error)

      alert('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen bg-[var(--c-base)]'>

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
                Build your modern trading workspace.
              </h2>

              <p className='mt-6 text-lg leading-8 text-[var(--c-text-2)]'>
                Quantara provides institutional-grade
                portfolio analytics, execution
                systems, and market intelligence
                for next-generation traders.
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
      <div className='flex w-full items-center justify-center px-6 lg:w-[520px]'>

        <div className='w-full max-w-md'>

          <div className='mb-10'>

            <p className='mb-3 text-sm uppercase tracking-[0.2em] text-blue-400'>
              Create Account
            </p>

            <h1 className='text-4xl font-semibold tracking-tight text-[var(--c-text-1)]'>
              Get Started
            </h1>

            <p className='mt-3 text-[var(--c-text-2)]'>
              Create your Quantara workspace
            </p>
          </div>

          <form
            onSubmit={handleSignup}
            className='space-y-5'
          >

            <div className='grid grid-cols-2 gap-4'>

              <div>
                <label className='mb-2 block text-sm text-[var(--c-text-2)]'>
                  First Name
                </label>

                <input
                  type='text'
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value,
                    )
                  }
                  placeholder='Arnabi'
                  className='w-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3.5 text-[var(--c-text-1)] outline-none transition-all placeholder:text-[var(--c-text-3)] focus:border-blue-500'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm text-[var(--c-text-2)]'>
                  Last Name
                </label>

                <input
                  type='text'
                  value={lastName}
                  onChange={(e) =>
                    setLastName(
                      e.target.value,
                    )
                  }
                  placeholder='Mukherjee'
                  className='w-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3.5 text-[var(--c-text-1)] outline-none transition-all placeholder:text-[var(--c-text-3)] focus:border-blue-500'
                />
              </div>
            </div>

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
                ? 'Creating Account...'
                : 'Create Account'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-[var(--c-text-2)]'>
            Already have an account?{' '}
            <a
              href='/login'
              className='font-medium text-blue-400 transition hover:text-blue-300'
            >
              Sign in
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

export default Signup
