"use client"

import React from 'react'
import { supabase } from "@/lib/supabase"

import { 
  DollarSign, 
  Car, 
  Users, 
  Activity,
  ArrowUpRight,
  ClipboardList,
  ShieldAlert,
  CalendarCheck,
  Search,
  Bell
} from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { RevenueChart } from "@/components/revenue-chart"
import { FleetDistribution } from "@/components/fleet-distribution"
import { KYCQueue } from "@/components/kyc-queue"
import { cn } from "@/lib/utils"

interface DashboardStats {
  revenue: number
  activeRentals: number
  partnersCount: number
  clientsCount: number
  totalCars: number
  totalBookings: number
  pendingKycCount: number
}

interface ActivityItem {
  id: string
  created_at: string
  total_amount: number
  status: string
  cars: { make: string, model: string }
  partners: { full_name: string }
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats>({
    revenue: 0,
    activeRentals: 0,
    partnersCount: 0,
    clientsCount: 0,
    totalCars: 0,
    totalBookings: 0,
    pendingKycCount: 0
  })
  const [activities, setActivities] = React.useState<ActivityItem[]>([])
  const [revenueHistory, setRevenueHistory] = React.useState<any[]>([])
  const [fleetStatus, setFleetStatus] = React.useState<any[]>([])
  const [kycQueue, setKycQueue] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      setError(null)
      try {
        console.log('--- ADMIN DASHBOARD: START FETCHING ---')
        
        // Diagnostic: Check if env variables are present at runtime
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase configuration missing in environment. Check .env.local')
        }

        console.log('Fetching tactical dashboard data via RPC...')
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats')

        if (rpcError) {
          console.error('RPC call error detail:', rpcError)
          throw new Error(`RPC call failed: ${rpcError.message} (Code: ${rpcError.code})`)
        }
        
        if (!rpcData) {
          console.warn('RPC returned empty or null data')
          throw new Error('No tactical data received from command center')
        }

        console.log('Tactical data received:', rpcData)

        const { 
          stats: fetchedStats, 
          recent_activities: fetchedActivities,
          revenue_history: fetchedRevenue,
          fleet_status: fetchedFleet,
          kyc_queue: fetchedKYC
        } = rpcData

        setStats({
          revenue: fetchedStats?.revenue || 0,
          activeRentals: fetchedStats?.active_rentals || 0,
          partnersCount: fetchedStats?.partners_count || 0,
          clientsCount: fetchedStats?.clients_count || 0,
          totalCars: fetchedStats?.total_cars || 0,
          totalBookings: fetchedStats?.total_bookings || 0,
          pendingKycCount: fetchedStats?.pending_kyc_count || 0
        })

        setRevenueHistory(fetchedRevenue || [])
        setFleetStatus(fetchedFleet || [])
        setKycQueue(fetchedKYC || [])
        
        if (fetchedActivities && fetchedActivities.length > 0) {
          setActivities(fetchedActivities.map((b: any) => {
            const car = b.cars || {}
            const make = car.make || car.brand || car.name || 'Unknown'
            const model = car.model || car.variant || car.type || 'Vehicle'
            
            return {
              id: b.id,
              created_at: b.created_at,
              total_amount: b.total_amount,
              status: b.status,
              cars: { make, model },
              partners: { full_name: b.partners?.full_name || 'Individual' }
            }
          }))
        }
      } catch (err: any) {
        console.error('CRITICAL DASHBOARD ERROR:', err)
        setError(err.message || 'System linkage failure')
      } finally {
        setLoading(false)
        console.log('--- ADMIN DASHBOARD: FETCHING COMPLETE ---')
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Command <span className="text-primary italic">Center</span></h1>
          <p className="text-muted-foreground font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {">"} operational_status: {loading ? 'scanning' : 'optimal'}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
            <Search className="w-3 h-3" />
            <span>Search System [CTRL+K]</span>
          </div>
          <Bell className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
          <div className="text-right hidden md:block border-l border-border pl-6">
            <p className="text-xs text-muted-foreground font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className={cn("text-[10px] font-mono uppercase tracking-widest mt-1", error ? "text-red-500" : "text-primary")}>
              {loading ? 'Initializing Stream...' : error ? `Linkage Error: ${error}` : 'Supabase Live: Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard 
          title="Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          description="Gross earnings"
          icon={DollarSign}
        />
        <StatsCard 
          title="Active" 
          value={stats.activeRentals} 
          description="Vehicles on road"
          icon={Car}
        />
        <StatsCard 
          title="Fleet" 
          value={stats.totalCars} 
          description="Total inventory"
          icon={ClipboardList}
        />
        <StatsCard 
          title="Bookings" 
          value={stats.totalBookings} 
          description="Life-time total"
          icon={CalendarCheck}
        />
        <StatsCard 
          title="Partners" 
          value={stats.partnersCount} 
          description="Fleet owners"
          icon={Users}
        />
        <StatsCard 
          title="KYC Queue" 
          value={stats.pendingKycCount} 
          description="Awaiting review"
          icon={ShieldAlert}
          trend={stats.pendingKycCount > 0 ? { value: stats.pendingKycCount, positive: false } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics */}
        <div className="lg:col-span-2 shard p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold uppercase tracking-tight flex items-center">
              Financial Metrics
              <span className="ml-3 text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5">Live_Stream</span>
            </h2>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-primary" />
              <div className="w-2 h-2 bg-secondary" />
            </div>
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase animate-pulse">
                Syncing ledger data...
              </div>
            ) : (
              <RevenueChart data={revenueHistory} />
            )}
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="shard p-6 flex flex-col">
          <h2 className="text-lg font-bold uppercase tracking-tight mb-8">Fleet Status</h2>
          <div className="flex-1">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase animate-pulse">
                Scanning inventory...
              </div>
            ) : (
              <FleetDistribution data={fleetStatus} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="shard p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold uppercase tracking-tight flex items-center">
              Recent Ops
              <ArrowUpRight className="ml-2 w-4 h-4 text-primary" />
            </h2>
            <button className="text-[10px] font-mono text-primary uppercase hover:underline">Full_Registry</button>
          </div>
          <div className="space-y-4 flex-1">
            {activities.length > 0 ? activities.map((item) => (
              <div key={item.id} className="flex gap-4 items-center p-3 bg-secondary/30 border border-transparent hover:border-border transition-colors">
                <div className="w-10 h-10 bg-secondary flex items-center justify-center text-primary font-bold">
                  {item.cars?.make?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase">
                    {item.cars?.make} {item.cars?.model}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                    {item.partners?.full_name} • ${item.total_amount}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[8px] font-mono uppercase px-2 py-0.5 border",
                    item.status === 'completed' ? "border-emerald-500/50 text-emerald-500" : 
                    item.status === 'pending' ? "border-orange-500/50 text-orange-500" :
                    "border-primary/50 text-primary"
                  )}>
                    {item.status}
                  </span>
                  <p className="text-[8px] text-muted-foreground font-mono mt-1 uppercase">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground font-mono uppercase italic p-8 text-center bg-secondary/10">
                Waiting for tactical updates...
              </p>
            )}
          </div>
        </div>

        {/* KYC Queue */}
        <div className="shard p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold uppercase tracking-tight flex items-center">
              KYC Approval Queue
              <ShieldAlert className="ml-2 w-4 h-4 text-primary" />
            </h2>
            <button className="text-[10px] font-mono text-primary uppercase hover:underline">View_All</button>
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase animate-pulse">
                Accessing personnel records...
              </div>
            ) : (
              <KYCQueue items={kycQueue} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
