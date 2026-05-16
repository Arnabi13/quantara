import { Bell, Search } from 'lucide-react'

const Topbar = () => {
  return (
    <header className='flex h-[86px] items-center justify-between border-b border-white/10 bg-[#0B1120] px-8'>
      
      {/* Search */}
      <div className='relative w-[420px]'>
        
        <div className='flex h-14 items-center rounded-2xl border border-white/10 bg-[#111827] transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)]'>
          
          <Search
            size={18}
            className='ml-4 text-gray-500'
          />

          <input
            type='text'
            placeholder='Search stocks, ETFs, indices...'
            className='h-full w-full bg-transparent pl-3 pr-4 text-sm text-white placeholder:text-gray-500 outline-none'
          />
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center gap-4'>
        
        <button className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#111827] text-gray-300 transition-all duration-200 hover:bg-[#1E293B] hover:text-white'>
          <Bell size={18} />
        </button>

        <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20'>
          A
        </div>
      </div>
    </header>
  )
}

export default Topbar