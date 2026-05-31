import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

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

const POLL_MS = 30_000

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<AppNotification[]>('/notifications')
      setNotifications(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

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
