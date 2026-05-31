const IST_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}

/** Formats a UTC ISO string as a human-readable IST date-time, e.g. "31 May 2026, 11:45 AM" */
export function formatIST(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', IST_OPTS)
    .format(new Date(iso))
    .replace(/\//g, ' ')
}

/** Relative "X ago" label — timezone-independent (pure duration) */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
