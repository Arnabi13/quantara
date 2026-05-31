import {
  LayoutDashboard,
  ChartCandlestick,
  Star,
  Briefcase,
  Settings,
  BarChart3,
} from 'lucide-react'

import SidebarItem from './SidebarItem'

const Sidebar = () => {
  return (
    <aside className='flex h-screen min-w-[260px] w-[260px] shrink-0 flex-col border-r border-[var(--c-border-sub)] bg-gradient-to-b from-[var(--c-sidebar-from)] to-[var(--c-sidebar-to)] p-5'>

      {/* Logo */}
      <div className='mb-10'>
        <div className='flex items-center gap-3'>

          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20'>
            <BarChart3 size={22} className='text-white' />
          </div>

          <div>
            <h1 className='text-2xl font-bold tracking-tight text-[var(--c-text-1)]'>
              Quantara
            </h1>

            <p className='text-sm text-[var(--c-text-2)]'>
              Professional Trading
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='flex flex-1 flex-col gap-3 overflow-y-auto'>

        <SidebarItem
          to='/'
          label='Dashboard'
          icon={<LayoutDashboard size={20} />}
        />

        <SidebarItem
          to='/markets'
          label='Markets'
          icon={<ChartCandlestick size={20} />}
        />

        <SidebarItem
          to='/watchlist'
          label='Watchlist'
          icon={<Star size={20} />}
        />

        <SidebarItem
          to='/portfolio'
          label='Portfolio'
          icon={<Briefcase size={20} />}
        />

        <SidebarItem
          to='/settings'
          label='Settings'
          icon={<Settings size={20} />}
        />
      </div>

      {/* Bottom Card */}
      <div className='mt-5 rounded-3xl border border-[var(--c-border-sub)] bg-gradient-to-br from-[var(--c-surface-2)] to-[var(--c-base)] p-5'>

        <div className='mb-3 inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium tracking-wide text-blue-400'>
          QUANTARA PRO
        </div>

        <h3 className='mb-2 text-lg font-semibold text-[var(--c-text-1)]'>
          Institutional Tools
        </h3>

        <p className='text-sm leading-6 text-[var(--c-text-2)]'>
          Advanced analytics, market depth, and portfolio intelligence.
        </p>

        <button className='mt-5 w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-500'>
          Upgrade Plan
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
