import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  firstName: string | null
  lastName: string | null
  email: string | null

  login: (token: string) => Promise<void>
  logout: () => void
  updateProfile: (firstName: string, lastName: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  firstName: null,
  lastName: null,
  email: null,

  login: async (token) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
    try {
      const res = await api.get<{ firstName?: string; lastName?: string; email?: string }>(
        '/auth/profile',
        { headers: { Authorization: `Bearer ${token}` } },
      )
      set({
        firstName: res.data.firstName ?? null,
        lastName: res.data.lastName ?? null,
        email: res.data.email ?? null,
      })
    } catch {
      // profile fetch is non-critical
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, isAuthenticated: false, firstName: null, lastName: null, email: null })
  },

  updateProfile: async (firstName, lastName) => {
    await api.patch('/auth/profile', { firstName, lastName })
    set({ firstName, lastName })
  },

  refreshProfile: async () => {
    try {
      const res = await api.get<{ firstName?: string; lastName?: string; email?: string }>(
        '/auth/profile',
      )
      set({
        firstName: res.data.firstName ?? null,
        lastName: res.data.lastName ?? null,
        email: res.data.email ?? null,
      })
    } catch {
      // non-critical
    }
  },
}))

// Rehydrate profile on page refresh if a token already exists
const storedToken = localStorage.getItem('token')
if (storedToken) {
  api
    .get<{ firstName?: string; lastName?: string; email?: string }>('/auth/profile')
    .then((res) => {
      useAuthStore.setState({
        firstName: res.data.firstName ?? null,
        lastName: res.data.lastName ?? null,
        email: res.data.email ?? null,
      })
    })
    .catch(() => {})
}
