// src/components/layout/SidebarItem.tsx

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
        `flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {icon}

      <span>{label}</span>
    </NavLink>
  )
}

export default SidebarItem