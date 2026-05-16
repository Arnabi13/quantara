import { ArrowUpRight } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string
  change: string
}

const DashboardCard = ({
  title,
  value,
  change,
}: DashboardCardProps) => {
  return (
    <div className='group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] to-[#1E293B] p-7 shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10'>
      
      {/* Glow */}
      <div className='absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-all duration-300 group-hover:bg-blue-500/20'></div>

      <div className='relative z-10'>
        
        {/* Header */}
        <div className='mb-8 flex items-start justify-between'>
          
          <div>
            <p className='text-sm font-medium text-gray-400'>
              {title}
            </p>

            <h2 className='mt-4 text-4xl font-bold tracking-tight text-white'>
              {value}
            </h2>
          </div>

          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400'>
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center gap-3'>
          
          <span className='rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400'>
            {change}
          </span>

          <span className='text-sm text-gray-500'>
            vs yesterday
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard