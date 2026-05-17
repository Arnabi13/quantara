import { NavLink } from 'react-router-dom'

interface SidebarItemProps {
  to: string
  label: string
  icon: React.ReactNode
}

const SidebarItem = ({
  to,
  label,
  icon,
}: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm transition-all duration-200 ${
          isActive
            ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
            : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
        }`
      }
    >
      <span className='transition-colors duration-200'>
        {icon}
      </span>

      <span className='font-normal tracking-[0.01em]'>
        {label}
      </span>
    </NavLink>
  )
}

export default SidebarItem