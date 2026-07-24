"use client"

import React from 'react'
import { supabase } from "@/lib/supabase"
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Activity,
  Edit3,
  Trash2,
  Plus
} from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { BookingModal } from "@/components/booking-modal"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  created_at: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending' | 'confirmed' | 'picked_up' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed'
  pickup_location: string
  dropoff_location: string
  trip_type: string
  client_id: string
  car_id: string
  clients: {
    full_name: string
    email: string
  }
  cars: {
    make: string
    model: string
    registration_number: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)

  const fetchBookings = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (full_name, email),
          cars (make, model, registration_number)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (err: unknown) {
      const error = err as Error
      console.error('Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('CAUTION: PERMANENT_REMOVAL_REQUESTED. Proceed?')) return
    
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id)
      if (error) throw error
      fetchBookings()
    } catch (err: unknown) {
      const error = err as Error
      alert('DELETE_FAILURE: ' + error.message)
    }
  }

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedBooking(null)
    setIsModalOpen(true)
  }

  React.useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      b.clients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cars?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cars?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cars?.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: bookings.length,
    running: bookings.filter(b => b.status === 'picked_up').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    pending: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-none border border-emerald-500/50 text-emerald-500 text-[10px] font-mono uppercase bg-emerald-500/5">Completed</span>
      case 'picked_up':
        return <span className="px-2 py-1 rounded-none border border-blue-500/50 text-blue-500 text-[10px] font-mono uppercase bg-blue-500/5">Running</span>
      case 'cancelled':
        return <span className="px-2 py-1 rounded-none border border-red-500/50 text-red-500 text-[10px] font-mono uppercase bg-red-500/5">Cancelled</span>
      case 'confirmed':
        return <span className="px-2 py-1 rounded-none border border-amber-500/50 text-amber-500 text-[10px] font-mono uppercase bg-amber-500/5">Confirmed</span>
      case 'pending':
        return <span className="px-2 py-1 rounded-none border border-slate-500/50 text-slate-500 text-[10px] font-mono uppercase bg-slate-500/5">Pending</span>
      default:
        return <span className="px-2 py-1 rounded-none border border-border text-muted-foreground text-[10px] font-mono uppercase">{status}</span>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 rounded-none border border-emerald-500/50 text-emerald-500 text-[10px] font-mono uppercase bg-emerald-500/5">Paid</span>
      case 'unpaid':
        return <span className="px-2 py-1 rounded-none border border-rose-500/50 text-rose-500 text-[10px] font-mono uppercase bg-rose-500/5">Unpaid</span>
      case 'refunded':
        return <span className="px-2 py-1 rounded-none border border-orange-500/50 text-orange-500 text-[10px] font-mono uppercase bg-orange-500/5">Refunded</span>
      case 'failed':
        return <span className="px-2 py-1 rounded-none border border-red-500/50 text-red-500 text-[10px] font-mono uppercase bg-red-500/5">Failed</span>
      default:
        return <span className="px-2 py-1 rounded-none border border-border text-muted-foreground text-[10px] font-mono uppercase">{status || 'Unpaid'}</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic">Booking <span className="text-primary not-italic">Registry</span></h1>
          <p className="text-muted-foreground font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {">"} operational_log: bookings_v2
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Active Records: {filteredBookings.length}/{bookings.length}</p>
            <button 
              onClick={fetchBookings}
              className="text-[10px] font-mono uppercase text-primary hover:underline mt-1"
            >
              Refresh_Feed
            </button>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-6 py-2 bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase text-xs transition-all tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
          >
            <Plus className="w-4 h-4" />
            New_Booking
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Registry" value={stats.total} description="All recorded bookings" icon={ClipboardList} />
        <StatsCard title="Running" value={stats.running} description="Vehicles currently out" icon={Activity} />
        <StatsCard title="Completed" value={stats.completed} description="Successful trips" icon={CheckCircle2} />
        <StatsCard title="Cancelled" value={stats.cancelled} description="Failed/Voided" icon={XCircle} />
        <StatsCard title="Waitlist" value={stats.pending} description="Upcoming/Pending" icon={Clock} />
      </div>

      {/* Search and Filters */}
      <div className="shard p-4 flex flex-col md:flex-row gap-4 items-center bg-secondary/20 border-border/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by client, car, or registration..." 
            className="w-full bg-background border border-border p-2 pl-10 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="bg-background border border-border p-2 text-sm font-mono focus:outline-none focus:border-primary transition-colors flex-1 md:flex-none uppercase"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="picked_up">Running</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="shard overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/50 border-b border-border">
              <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <th className="p-4 font-bold border-r border-border/50">Booking_ID</th>
                <th className="p-4 font-bold border-r border-border/50">Client_Reference</th>
                <th className="p-4 font-bold border-r border-border/50">Vehicle_Unit</th>
                <th className="p-4 font-bold border-r border-border/50">Operational_Dates</th>
                <th className="p-4 font-bold border-r border-border/50">Financials</th>
                <th className="p-4 font-bold border-r border-border/50">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-mono text-xs uppercase animate-pulse text-muted-foreground">
                    Synchronizing tactical booking stream...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-mono text-xs uppercase text-destructive bg-destructive/5">
                    Linkage Failure: {error}
                    <button onClick={fetchBookings} className="block mx-auto mt-2 underline hover:text-primary">Retry_Sync</button>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/30 transition-colors group border-b border-border/50 last:border-0 font-mono">
                    <td className="p-4 text-[10px] text-muted-foreground border-r border-border/50">
                      {b.id.substring(0, 8)}...
                    </td>
                    <td className="p-4 border-r border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-white font-bold text-xs">
                          {b.clients?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase">{b.clients?.full_name || 'Anonymous'}</p>
                          <p className="text-[9px] text-muted-foreground">{b.clients?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-border/50">
                      <div>
                        <p className="text-xs font-bold uppercase">{b.cars?.make} {b.cars?.model}</p>
                        <p className="text-[9px] text-muted-foreground tracking-widest">{b.cars?.registration_number}</p>
                      </div>
                    </td>
                    <td className="p-4 border-r border-border/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span>{new Date(b.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{new Date(b.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-border/50">
                      <p className="text-xs font-bold text-emerald-500">${b.total_price.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">GROSS_REVENUE</p>
                    </td>
                    <td className="p-4 border-r border-border/50 space-y-2">
                      <div>{getStatusBadge(b.status)}</div>
                      <div>{getPaymentBadge(b.payment_status)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(b)}
                          className="p-2 hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20"
                          title="EDIT_ENTRY"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="p-2 hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                          title="DELETE_ENTRY"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-mono text-xs uppercase text-muted-foreground bg-secondary/10">
                    No matching records found in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBookings}
        booking={selectedBooking}
      />
    </div>
  )
}
