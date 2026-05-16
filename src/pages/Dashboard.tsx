import DashboardCard from '../components/dashboard/DashboardCard'

const Dashboard = () => {
  return (
    <div className='mx-auto max-w-[1600px] space-y-10'>
      
      {/* Header */}
      <div className='flex items-center justify-between'>
        
        <div>
          <p className='mb-2 text-sm uppercase tracking-[0.2em] text-blue-400'>
            Overview
          </p>

          <h1 className='text-4xl font-bold tracking-tight text-white'>
            Trading Dashboard
          </h1>

          <p className='mt-3 text-gray-400'>
            Monitor markets, portfolios, and trading performance in real time.
          </p>
        </div>

        <button className='rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500'>
          New Trade
        </button>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 lg:grid-cols-2 2xl:grid-cols-4'>
        
        <DashboardCard
          title='Portfolio Value'
          value='₹12,45,000'
          change='+2.45%'
        />

        <DashboardCard
          title='Daily P&L'
          value='₹18,240'
          change='+1.24%'
        />

        <DashboardCard
          title='Active Positions'
          value='12'
          change='+3 Added'
        />

        <DashboardCard
          title='Watchlist'
          value='48'
          change='+5 Today'
        />
      </div>

      {/* Bottom Grid */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        
        {/* Market Overview */}
        <div className='rounded-3xl bg-gradient-to-br from-[#111827] to-[#1E293B] p-6 xl:col-span-2'>
          
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-white'>
                Market Overview
              </h2>

              <p className='mt-1 text-sm text-gray-400'>
                NSE & global indices performance
              </p>
            </div>

            <button className='rounded-xl bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10'>
              View All
            </button>
          </div>

          <div className='flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0B1120]'>
            <p className='text-gray-500'>
              Trading chart container coming tomorrow
            </p>
          </div>
        </div>

        {/* Watchlist */}
        <div className='rounded-3xl border  bg-gradient-to-br from-[#111827] to-[#1E293B] p-6'>
          
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-white'>
              Watchlist
            </h2>

            <p className='mt-1 text-sm text-gray-400'>
              Most tracked assets
            </p>
          </div>

          <div className='space-y-4'>
            
            {[
              'RELIANCE',
              'TCS',
              'INFY',
              'HDFCBANK',
              'NIFTY50',
            ].map((stock) => (
              <div
                key={stock}
                className='flex items-center justify-between rounded-2xl bg-[#0B1120] px-4 py-4 transition hover:bg-white/5'
              >
                <div>
                  <p className='font-medium text-white'>
                    {stock}
                  </p>

                  <p className='text-xs text-gray-500'>
                    NSE
                  </p>
                </div>

                <div className='text-right'>
                  <p className='font-medium text-emerald-400'>
                    +1.42%
                  </p>

                  <p className='text-xs text-gray-500'>
                    Today
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard