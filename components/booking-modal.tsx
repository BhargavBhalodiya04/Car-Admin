"use client"

import React from 'react'
import { X, Calendar, User, Car, DollarSign, MapPin, Navigation, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  full_name: string
  email: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  registration_number: string
}

interface Booking {
  id?: string
  client_id: string
  car_id: string
  start_date: string
  end_date: string
  total_price: number
  status: string
  payment_status: string
  pickup_location: string
  dropoff_location: string
  trip_type: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  booking?: Booking | null
}

export function BookingModal({ isOpen, onClose, onSuccess, booking }: BookingModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [clients, setClients] = React.useState<Client[]>([])
  const [cars, setCars] = React.useState<Vehicle[]>([])
  const [fetchLoading, setFetchLoading] = React.useState(true)

  const [formData, setFormData] = React.useState<Booking>({
    client_id: '',
    car_id: '',
    start_date: '',
    end_date: '',
    total_price: 0,
    status: 'pending',
    payment_status: 'unpaid',
    pickup_location: '',
    dropoff_location: '',
    trip_type: 'round_trip'
  })

  React.useEffect(() => {
    if (isOpen) {
      fetchData()
      if (booking) {
        setFormData({
          client_id: booking.client_id || '',
          car_id: booking.car_id || '',
          start_date: booking.start_date ? new Date(booking.start_date).toISOString().split('T')[0] : '',
          end_date: booking.end_date ? new Date(booking.end_date).toISOString().split('T')[0] : '',
          total_price: booking.total_price || 0,
          status: booking.status || 'pending',
          payment_status: booking.payment_status || 'unpaid',
          pickup_location: booking.pickup_location || '',
          dropoff_location: booking.dropoff_location || '',
          trip_type: booking.trip_type || 'round_trip'
        })
      } else {
        setFormData({
          client_id: '',
          car_id: '',
          start_date: '',
          end_date: '',
          total_price: 0,
          status: 'pending',
          payment_status: 'unpaid',
          pickup_location: '',
          dropoff_location: '',
          trip_type: 'round_trip'
        })
      }
    }
  }, [isOpen, booking])

  const fetchData = async () => {
    setFetchLoading(true)
    try {
      const { data: clientsData } = await supabase.from('clients').select('id, full_name, email').order('full_name')
      const { data: carsData } = await supabase.from('cars').select('id, make, model, registration_number').order('make')
      if (clientsData) setClients(clientsData)
      if (carsData) setCars(carsData)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (booking?.id) {
        // UPDATE
        const { error } = await supabase
          .from('bookings')
          .update({
            ...formData,
            rental_price: formData.total_price, // fallback constraint
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id)
        if (error) throw error
      } else {
        // CREATE
        const { error } = await supabase
          .from('bookings')
          .insert([{
            ...formData,
            rental_price: formData.total_price, // fallback constraint
            trip_fee: 0,
            insurance_fee: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        if (error) throw error
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const error = err as Error
      console.error('Booking Operation Error:', error)
      alert('MANIFEST_FAILURE: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="shard w-full max-w-2xl bg-background border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.1)] overflow-hidden">
        {/* Header */}
        <div className="bg-secondary/50 px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">
              {booking ? 'Edit' : 'New'} <span className="text-primary not-italic">Booking_Entry</span>
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">{">"} protocol: registry_modification</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary/20 transition-colors text-muted-foreground hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Client Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3 text-primary" /> Target_Client
              </label>
              <select 
                required
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">-- SELECT_CLIENT --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            {/* Car Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Car className="w-3 h-3 text-primary" /> Vehicle_Unit
              </label>
              <select 
                required
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                value={formData.car_id}
                onChange={(e) => setFormData({...formData, car_id: e.target.value})}
              >
                <option value="">-- SELECT_VEHICLE --</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.make} {c.model} - {c.registration_number}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary" /> Start_Timestamp
              </label>
              <input 
                type="date" 
                required
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary" /> End_Timestamp
              </label>
              <input 
                type="date" 
                required
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" /> Pickup_Sector
              </label>
              <input 
                type="text" 
                placeholder="Sector/Location ID"
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase placeholder:opacity-30"
                value={formData.pickup_location}
                onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" /> Dropoff_Sector
              </label>
              <input 
                type="text" 
                placeholder="Sector/Location ID"
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase placeholder:opacity-30"
                value={formData.dropoff_location}
                onChange={(e) => setFormData({...formData, dropoff_location: e.target.value})}
              />
            </div>

            {/* Financials & Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-primary" /> Gross_Revenue_Target
              </label>
              <input 
                type="number" 
                required
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
                value={formData.total_price}
                onChange={(e) => setFormData({...formData, total_price: parseFloat(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" /> Operational_Status
              </label>
              <select 
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="picked_up">Running</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-primary" /> Payment_Status
              </label>
              <select 
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Navigation className="w-3 h-3 text-primary" /> Trip_Strategy
              </label>
              <select 
                className="w-full bg-secondary/30 border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                value={formData.trip_type}
                onChange={(e) => setFormData({...formData, trip_type: e.target.value})}
              >
                <option value="round_trip">Round_Trip</option>
                <option value="one_way">One_Way</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-secondary/50 hover:bg-secondary text-muted-foreground font-bold uppercase text-xs transition-all tracking-widest"
            >
              Cancel_Transmission
            </button>
            <button 
              type="submit" 
              disabled={loading || fetchLoading}
              className="flex-[2] py-3 bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase text-xs transition-all tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.2)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {booking ? 'Commit_Changes' : 'Initialize_Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
