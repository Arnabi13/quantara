import { useCallback, useEffect, useRef, useState } from 'react'
import { api, API_BASE_URL } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export interface AppNotification {
  id: string
  symbol: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface AppAlert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  targetPrice: number
  isActive: boolean
  createdAt: string
  triggeredAt: string | null
}

export function useNotifications() {
  const token = useAuthStore((s) => s.token)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const esRef = useRef<EventSource | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<AppNotification[]>('/notifications')
      setNotifications(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    // Load existing notifications on mount
    refresh()

    if (!token) return

    // Open SSE stream — EventSource reconnects automatically on network drops
    const es = new EventSource(`${API_BASE_URL}/notifications/stream?token=${token}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const incoming = JSON.parse(e.data) as AppNotification
        setNotifications((prev) => {
          // Guard against duplicate delivery on reconnect
          if (prev.some((n) => n.id === incoming.id)) return prev
          return [incoming, ...prev]
        })
      } catch { /* malformed frame */ }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [token, refresh])

  const markRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }, [])

  const markAllRead = useCallback(async () => {
    await api.post('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const clearAll = useCallback(async () => {
    await api.delete('/notifications')
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return { notifications, unreadCount, markRead, markAllRead, clearAll, refresh }
}
