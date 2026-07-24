"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  ClipboardList
} from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  full_name: string
  email: string
  phone_number: string
  avatar_url?: string
  created_at: string
}

export default function ClientProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [client, setClient] = React.useState<Client | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [bookings, setBookings] = React.useState<any[]>([])

  React.useEffect(() => {
    async function fetchClient() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!error && data) {
        setClient(data)
      }
      setLoading(false)
    }
    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, cars(*)')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setBookings(data)
      }
    }

    fetchClient()
    fetchBookings()
  }, [id])

  if (loading) return (
    <div className="shard p-12 text-center font-mono animate-pulse uppercase tracking-widest text-muted-foreground">
      Synchronizing Client Telemetry...
    </div>
  )

  if (!client) return (
    <div className="shard p-12 text-center font-mono uppercase text-red-500">
      Error: Client Entity Not Found
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Link 
            href="/clients" 
            className="text-xs font-mono uppercase text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-all"
          >
            <ArrowLeft className="w-3 h-3" /> back_to_manifest
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Client <span className="text-primary italic font-black">Profile</span></h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">{">"} renter_id: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="shard p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary flex items-center justify-center group overflow-hidden border border-border">
                {client.avatar_url ? (
                  <img src={client.avatar_url} alt="" className="w-full h-full object-cover group-hover:scale-125 transition-transform" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground opacity-20" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">{client.full_name || (client as any).name || 'Unknown Client'}</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mt-1">Role: Renter</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-wrap break-all">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs">{client.phone_number || (client as any).phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs">JOINED: {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary italic">Rental_History ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <div className="shard p-12 text-center text-[10px] font-mono uppercase text-muted-foreground italic border-dashed">
              No previous telemetry detected for this renter
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="shard p-4 bg-secondary/10 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {b.cars?.make} {b.cars?.model}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">
                        {new Date(b.created_at).toLocaleDateString()} • ${b.total_price}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter border border-current text-blue-500 border-blue-500/30">
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
