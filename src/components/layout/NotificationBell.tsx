import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useNotifications, type AppNotification } from '../../hooks/useNotifications'
import { StockAvatar } from '../ui/StockAvatar'
import { timeAgo } from '../../lib/formatDate'

function NotifRow({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const isUp = n.message.includes('rose above')
  return (
    <button
      onClick={() => !n.isRead && onRead(n.id)}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--c-overlay)] ${
        !n.isRead ? 'bg-blue-950/20' : ''
      }`}
    >
      <div className='relative mt-0.5 shrink-0'>
        <StockAvatar symbol={n.symbol} size='sm' />
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ${
            isUp ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {isUp ? (
            <TrendingUp size={8} className='text-white' />
          ) : (
            <TrendingDown size={8} className='text-white' />
          )}
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs leading-snug text-[var(--c-text-1)]'>{n.message}</p>
        <p className='mt-0.5 text-[10px] text-[var(--c-text-3)]'>{timeAgo(n.createdAt)}</p>
      </div>
      {!n.isRead && <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400' />}
    </button>
  )
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen((v) => !v)}
        className='relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--c-border-sub)] bg-[var(--c-surface-2)] text-[var(--c-text-2)] transition-all duration-200 hover:bg-[var(--c-border)] hover:text-[var(--c-text-1)]'
        aria-label='Notifications'
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className='absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 top-[56px] z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-[var(--c-border-sub)] bg-[var(--c-surface-2)] shadow-2xl shadow-black/20'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-[var(--c-border-sub)] px-4 py-3'>
            <div>
              <p className='text-sm font-semibold text-[var(--c-text-1)]'>Notifications</p>
              {unreadCount > 0 && (
                <p className='text-[10px] text-[var(--c-text-3)]'>{unreadCount} unread</p>
              )}
            </div>
            <div className='flex gap-1'>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className='flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-[var(--c-text-3)] transition hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-2)]'
                  title='Mark all read'
                >
                  <CheckCheck size={11} />
                  All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className='flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-[var(--c-text-3)] transition hover:bg-red-500/10 hover:text-red-400'
                  title='Clear all'
                >
                  <Trash2 size={11} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className='max-h-[360px] overflow-y-auto p-2 [scrollbar-width:thin] [scrollbar-color:var(--c-border)_transparent]'>
            {notifications.length === 0 ? (
              <div className='py-10 text-center'>
                <Bell size={24} className='mx-auto mb-2 text-[var(--c-text-3)]' />
                <p className='text-xs text-[var(--c-text-3)]'>No notifications yet</p>
                <p className='mt-1 text-[10px] text-[var(--c-text-3)]'>
                  Set price alerts on any stock to get notified
                </p>
              </div>
            ) : (
              <div className='space-y-0.5'>
                {notifications.map((n) => (
                  <NotifRow key={n.id} n={n} onRead={markRead} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
