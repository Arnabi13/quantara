import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Bitcoin,
  Settings,
} from 'lucide-react'

export const navigation = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Markets',
    icon: LineChart,
    path: '/markets',
  },
  {
    title: 'Crypto',
    icon: Bitcoin,
    path: '/crypto',
  },
  {
    title: 'Portfolio',
    icon: Wallet,
    path: '/portfolio',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
]