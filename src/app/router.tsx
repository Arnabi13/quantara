import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import Markets from '../pages/Markets'
import Watchlist from '../pages/Watchlist'
import Portfolio from '../pages/Portfolio'
import Settings from '../pages/Settings'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'markets',
        element: <Markets />,
      },
      {
        path: 'watchlist',
        element: <Watchlist />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])