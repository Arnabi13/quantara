// src/layouts/MainLayout.tsx

import { Outlet } from 'react-router-dom'

import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

const MainLayout = () => {
  return (
    <div className='flex h-screen overflow-hidden bg-[#020817]'>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className='flex min-w-0 flex-1 flex-col'>
        
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto bg-[#020817] px-10 py-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout