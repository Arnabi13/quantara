import { NavLink } from 'react-router-dom'

interface SidebarItemProps {
  to: string
  label: string
  icon: React.ReactNode
}

const SidebarItem = ({ to, label, icon }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-2xl px-5 py-3 text-sm transition-all duration-200 ${
          isActive
            ? 'bg-blue-600/20 font-semibold text-blue-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]'
            : 'font-normal text-[var(--c-text-2)] hover:bg-[var(--c-overlay)] hover:text-[var(--c-text-1)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* left accent bar */}
          {isActive && (
            <span className='absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400' />
          )}
          <span className='transition-colors duration-200'>{icon}</span>
          <span className='tracking-[0.01em]'>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default SidebarItem
