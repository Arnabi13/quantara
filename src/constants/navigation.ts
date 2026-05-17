import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Newspaper,
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
    title: 'Portfolio',
    icon: Wallet,
    path: '/portfolio',
  },
  {
    title: 'News',
    icon: Newspaper,
    path: '/news',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
]