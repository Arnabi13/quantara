import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  firstName: string | null

  login: (token: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  firstName: null,

  login: async (token) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
    try {
      const res = await api.get<{ firstName?: string }>('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ firstName: res.data.firstName ?? null })
    } catch {
      // profile fetch is non-critical
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, isAuthenticated: false, firstName: null })
  },
}))

// Rehydrate firstName on page refresh if a token already exists
const storedToken = localStorage.getItem('token')
if (storedToken) {
  api
    .get<{ firstName?: string }>('/auth/profile')
    .then((res) => {
      useAuthStore.setState({ firstName: res.data.firstName ?? null })
    })
    .catch(() => {})
}
