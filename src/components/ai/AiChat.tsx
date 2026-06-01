import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot, ChevronDown, Send, Sparkles, Loader2, Zap,
  BarChart2, Trash2, TrendingUp, Globe, BookOpen, Activity,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: Role
  content: string
  toolCalls?: ToolCallBadge[]
  streaming?: boolean
}

interface ToolCallBadge {
  name: string
  args: Record<string, string>
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  get_price: 'Live price',
  get_24h_stats: '24h stats',
  get_market_overview: 'Market scan',
  get_order_book_pressure: 'Order book',
}

const SYMBOL_DISPLAY: Record<string, string> = {
  BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB',
  SOLUSDT: 'SOL', ADAUSDT: 'ADA', XRPUSDT: 'XRP', DOGEUSDT: 'DOGE',
}

const STARTERS = [
  { label: "BTC price now?",        icon: TrendingUp,  q: "What's Bitcoin's current price?" },
  { label: "ETH vs SOL",            icon: Activity,    q: 'Compare ETH and SOL performance today' },
  { label: 'Full market overview',  icon: Globe,       q: 'Give me an overview of all tracked cryptos' },
  { label: 'Order book pressure',   icon: BookOpen,    q: "What's the BTC order book pressure right now?" },
]

function uid() { return Math.random().toString(36).slice(2) }

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToolBadge({ tc, streaming }: { tc: ToolCallBadge; streaming?: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium
        ${streaming
          ? 'border-amber-500/30 bg-amber-500/8 text-amber-300 animate-pulse'
          : 'border-amber-500/20 bg-amber-500/5 text-amber-400'}`}
    >
      <BarChart2 size={9} />
      <span>{TOOL_LABELS[tc.name] ?? tc.name}</span>
      {tc.args?.symbol && (
        <span className='font-bold text-amber-300'>{SYMBOL_DISPLAY[tc.args.symbol] ?? tc.args.symbol}</span>
      )}
    </motion.span>
  )
}

function TypingDots() {
  return (
    <span className='flex items-center gap-1 px-1 py-1'>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className='h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce'
          style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AiChat() {
  const token = useAuthStore((s) => s.token)
  const firstName = useAuthStore((s) => s.firstName)
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy]       = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  const userInitial = (firstName?.[0] ?? 'U').toUpperCase()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    const history = messages
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }))

    const userMsg: ChatMessage   = { id: uid(), role: 'user', content: trimmed }
    const assistantId            = uid()
    const assistantMsg: ChatMessage = {
      id: assistantId, role: 'assistant', content: '', toolCalls: [], streaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('http://localhost:4000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string; content?: string; name?: string
              args?: Record<string, string>; message?: string
            }

            if (event.type === 'delta' && event.content) {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + event.content! } : m,
              ))
            } else if (event.type === 'tool_call' && event.name) {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId
                  ? { ...m, toolCalls: [...(m.toolCalls ?? []), { name: event.name!, args: event.args ?? {} }] }
                  : m,
              ))
            } else if (event.type === 'done') {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, streaming: false } : m,
              ))
            } else if (event.type === 'error') {
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: `⚠ ${event.message}`, streaming: false }
                  : m,
              ))
            }
          } catch { /* malformed */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Could not reach Quantara AI — is the backend running?', streaming: false }
            : m,
        ))
      }
    } finally {
      setBusy(false)
      abortRef.current = null
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId ? { ...m, streaming: false } : m,
      ))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className='fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-700/40'
        title='Quantara AI'
      >
        <AnimatePresence mode='wait'>
          {open
            ? <motion.span key='c' initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}><ChevronDown size={22} /></motion.span>
            : <motion.span key='b' initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}><Bot size={22} /></motion.span>
          }
        </AnimatePresence>
        {!open && (
          <span className='absolute inset-0 rounded-2xl ring-2 ring-blue-400/50 animate-ping' style={{ animationDuration: '2.8s' }} />
        )}
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key='panel'
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className='fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-3xl border border-[#1E293B] bg-[#080F1E] shadow-2xl shadow-black/60'
            style={{ width: 440, height: 620 }}
          >

            {/* Header */}
            <div className='relative flex items-center gap-3 overflow-hidden border-b border-[#1E293B] px-5 py-4'>
              {/* Subtle gradient backdrop */}
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/12 via-purple-600/6 to-transparent' />

              <div className='relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-blue-500/30'>
                <Sparkles size={17} className='text-blue-400' />
              </div>

              <div className='relative min-w-0'>
                <p className='text-sm font-bold tracking-tight text-white'>Quantara AI</p>
                <p className='mt-0.5 flex items-center gap-1.5 text-[10px] text-[#64748B]'>
                  {busy ? (
                    <><Loader2 size={9} className='animate-spin text-blue-400' /><span className='text-blue-400'>Analyzing market data…</span></>
                  ) : (
                    <><span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400' /><span>Live Binance · Groq LLaMA 3.3 70B</span></>
                  )}
                </p>
              </div>

              <div className='relative ml-auto flex items-center gap-2'>
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    title='Clear chat'
                    className='flex h-8 w-8 items-center justify-center rounded-xl text-[#475569] transition hover:bg-red-500/10 hover:text-red-400'
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className='flex items-center gap-1.5 rounded-lg bg-[#0B1120] px-2.5 py-1 ring-1 ring-[#1E293B]'>
                  <Zap size={10} className='text-amber-400' />
                  <span className='text-[9px] font-bold uppercase tracking-wider text-amber-400'>Free</span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className='flex-1 overflow-y-auto p-4 [scrollbar-color:#1E293B_transparent] [scrollbar-width:thin]'>

              {/* Empty state */}
              {messages.length === 0 && (
                <div className='flex h-full flex-col items-center justify-center gap-5 pb-2'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/10 ring-1 ring-blue-500/20'>
                    <Bot size={30} className='text-blue-400' />
                  </div>
                  <div className='text-center'>
                    <p className='text-base font-semibold text-white'>Ask me anything</p>
                    <p className='mt-1.5 max-w-[260px] text-xs leading-relaxed text-[#475569]'>
                      I have live Binance market data and can answer questions about BTC, ETH, BNB, SOL, ADA, XRP & DOGE
                    </p>
                  </div>
                  <div className='grid w-full grid-cols-2 gap-2'>
                    {STARTERS.map(({ label, icon: Icon, q }) => (
                      <motion.button
                        key={label}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => sendMessage(q)}
                        className='flex items-start gap-2 rounded-2xl border border-[#1E293B] bg-[#0B1120] px-3 py-2.5 text-left transition hover:border-blue-500/30 hover:bg-blue-600/5'
                      >
                        <Icon size={13} className='mt-0.5 shrink-0 text-blue-400' />
                        <span className='text-[11px] leading-snug text-[#94A3B8]'>{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              <div className='space-y-4'>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold mb-0.5
                        ${msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-blue-400 ring-1 ring-blue-500/20'}`}>
                        {msg.role === 'user' ? userInitial : <Bot size={13} />}
                      </div>

                      <div className={`flex max-w-[82%] flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Tool badges */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className='flex flex-wrap gap-1.5'>
                            {msg.toolCalls.map((tc, i) => (
                              <ToolBadge key={i} tc={tc} streaming={msg.streaming} />
                            ))}
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words
                            ${msg.role === 'user'
                              ? 'rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/20'
                              : 'rounded-bl-sm bg-[#0D1729] text-[#CBD5E1] ring-1 ring-[#1E293B]'
                            }`}
                        >
                          {msg.content
                            ? <>
                                {msg.content}
                                {msg.streaming && (
                                  <span className='ml-0.5 inline-block h-[14px] w-[2px] animate-pulse rounded-full bg-blue-400 align-middle' />
                                )}
                              </>
                            : msg.streaming
                              ? <TypingDots />
                              : null
                          }
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div ref={bottomRef} className='h-1' />
            </div>

            {/* Input area */}
            <div className='border-t border-[#1E293B] bg-[#080F1E] p-4'>
              <div className={`flex items-end gap-3 rounded-2xl border bg-[#0D1729] px-4 py-3 transition-all duration-200
                ${input.trim() ? 'border-blue-500/40 shadow-[0_0_24px_rgba(37,99,235,0.12)]' : 'border-[#1E293B]'}`}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Ask about prices, trends, market data…'
                  rows={1}
                  disabled={busy}
                  className='flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder:text-[#334155] outline-none [scrollbar-width:none] disabled:opacity-50'
                  style={{ maxHeight: '96px', overflowY: 'auto' }}
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || busy}
                  whileHover={input.trim() && !busy ? { scale: 1.1 } : {}}
                  whileTap={input.trim() && !busy ? { scale: 0.9 } : {}}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all
                    ${input.trim() && !busy
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/30 cursor-pointer'
                      : 'bg-[#1E293B] cursor-not-allowed opacity-40'}`}
                >
                  {busy ? <Loader2 size={15} className='animate-spin' /> : <Send size={15} />}
                </motion.button>
              </div>
              <p className='mt-2 text-center text-[9px] tracking-wide text-[#1E293B]'>
                Groq · LLaMA 3.3 70B · Real-time Binance WebSocket data
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
