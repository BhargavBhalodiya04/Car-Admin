"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  Car,
  ClipboardList
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Partner {
  id: string
  full_name: string
  email: string
  phone_number: string
  avatar_url?: string
  document_status: string
  rejection_reason?: string
  created_at: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_card_url?: string
  driving_license_url?: string
}

const DocumentCard = ({ title, url, label }: { title: string, url?: string, label: string }) => {
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    if (url) {
      async function getUrl() {
        // Try public URL since we made the bucket public to fix visibility
        const { data } = supabase.storage.from('kyc-documents').getPublicUrl(url as string)
        if (data?.publicUrl) setSignedUrl(data.publicUrl)
      }
      getUrl()
    }
  }, [url])

  return (
    <div className="shard overflow-hidden group">
      <div className="bg-secondary/50 px-4 py-2 border-b border-border flex justify-between items-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</span>
        {signedUrl && (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[10px] font-mono flex items-center gap-1">
            VIEW ASSET <ExternalLink className="w-2 h-2" />
          </a>
        )}
      </div>
      <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
        {signedUrl ? (
          <img 
            src={signedUrl} 
            alt={title} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/20 italic">
            <Clock className="w-8 h-8 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-tighter">Asset Offline / Loading</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-secondary/20">
        <h4 className="text-xs font-bold uppercase tracking-tight">{title}</h4>
      </div>
    </div>
  )
}

export default function PartnerReviewPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [partner, setPartner] = React.useState<Partner | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [showRejectionForm, setShowRejectionForm] = React.useState(false)
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [bookings, setBookings] = React.useState<any[]>([])

  React.useEffect(() => {
    async function fetchPartner() {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        setError(error.message)
      } else if (data) {
        setPartner(data)
      }
      setLoading(false)
    }
    async function fetchVehicles() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('partner_id', id)
      
      if (!error && data) {
        setVehicles(data)
        // Fetch bookings for these vehicles
        if (data.length > 0) {
          const vehicleIds = data.map(v => v.id)
          const { data: bData, error: bError } = await supabase
            .from('bookings')
            .select('*, clients(full_name), cars(make, model)')
            .in('car_id', vehicleIds)
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (!bError && bData) {
            setBookings(bData)
          }
        }
      }
    }

    fetchPartner()
    fetchVehicles()
  }, [id])

  const handleAction = async (status: string) => {
    if (status === 'rejected' && !rejectionReason) {
      alert('Please provide a rejection reason.')
      return
    }

    setActionLoading(true)
    const updateData: any = { 
      document_status: status,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
      updated_at: new Date().toISOString()
    }

    // Update alternative status columns if they exist in the record to ensure system-wide synchronization
    if ((partner as any)?.status !== undefined) updateData.status = status
    if ((partner as any)?.kyc_status !== undefined) updateData.kyc_status = status

    const { error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id)

    if (!error) {
      // Refetch data locally
      const { data } = await supabase.from('partners').select('*').eq('id', id).single()
      if (data) setPartner(data)
      setShowRejectionForm(false)
      setRejectionReason('')
    } else {
      alert('FAILED_TO_UPDATE_KYC: ' + error.message)
    }
    setActionLoading(false)
  }

  if (loading) return (
    <div className="shard p-12 text-center font-mono animate-pulse uppercase tracking-widest text-muted-foreground">
      Synchronizing Identity Nodes...
    </div>
  )

  if (!partner) return (
    <div className="shard p-12 text-center font-mono uppercase text-red-500 border-red-500/30 bg-red-500/5 space-y-4">
      <div className="text-xl font-bold italic">Identity Registry Failure</div>
      <div className="text-xs">{error || 'Partner Entity Not Found'}</div>
      <div className="text-[10px] text-muted-foreground opacity-50">NODE_ID: {id}</div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Link 
            href="/partners" 
            className="text-xs font-mono uppercase text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-all"
          >
            <ArrowLeft className="w-3 h-3" /> back_to_network
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Review <span className="text-primary italic font-black">Identity</span></h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">{">"} node_id: {id}</p>
        </div>
        
        <div className={cn(
          "px-4 py-2 text-[10px] font-bold uppercase tracking-widest border",
          (partner.document_status || (partner as any).status || (partner as any).kyc_status) === 'verified' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          (partner.document_status || (partner as any).status || (partner as any).kyc_status) === 'rejected' && "bg-red-500/10 text-red-500 border-red-500/30",
          (partner.document_status || (partner as any).status || (partner as any).kyc_status) === 'pending' && "bg-orange-500/10 text-orange-500 border-orange-500/30",
          (partner.document_status || (partner as any).status || (partner as any).kyc_status) === 'submitted' && "bg-blue-500/10 text-blue-500 border-blue-500/30",
        )}>
          {partner.document_status || (partner as any).status || (partner as any).kyc_status || 'NOT_STARTED'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="shard p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary flex items-center justify-center group overflow-hidden border border-border">
                {partner.avatar_url ? (
                  <img src={partner.avatar_url} alt="" className="w-full h-full object-cover group-hover:scale-125 transition-transform" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground opacity-20" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">{partner.full_name || (partner as any).name || 'Unknown Partner'}</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mt-1">Status: Operational</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-wrap break-all">{partner.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs">{partner.phone_number || (partner as any).phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs">JOINED: {new Date(partner.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="shard p-6 bg-secondary/10 border border-orange-500/20">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-orange-500 italic">Command_Controls</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleAction('verified')}
                disabled={actionLoading}
                className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-500 font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Identity
              </button>
              
              {!showRejectionForm ? (
                <button 
                  onClick={() => setShowRejectionForm(true)}
                  disabled={actionLoading}
                  className="w-full py-3 bg-zinc-800 hover:bg-red-900 border border-zinc-700 text-white font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Partner
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 border-t border-orange-500/10 pt-3 mt-3">
                  <textarea 
                    placeholder="ENTER REJECTION REASON..."
                    className="w-full bg-black border border-zinc-800 p-4 text-[10px] font-mono focus:border-red-500 outline-none h-28 uppercase placeholder:text-muted-foreground/30 text-white leading-relaxed"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('rejected')}
                      className="flex-[2] py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    >
                      Confirm Reject
                    </button>
                    <button 
                      onClick={() => setShowRejectionForm(false)}
                      className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold uppercase text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {partner.rejection_reason && (
              <div className="mt-6 p-4 bg-red-500/5 border-l-2 border-red-500">
                <p className="text-[10px] font-bold uppercase text-red-500 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Last Rejection Reason
                </p>
                <p className="text-xs text-muted-foreground font-mono uppercase">{partner.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard 
              label="Asset_01: UID_FRONT"
              title="Aadhar Card (Front)" 
              url={partner.aadhar_front_url}
            />
            <DocumentCard 
              label="Asset_02: UID_BACK"
              title="Aadhar Card (Back)" 
              url={partner.aadhar_back_url}
            />
            <DocumentCard 
              label="Asset_03: TAX_ID"
              title="PAN Card" 
              url={partner.pan_card_url}
            />
            <DocumentCard 
              label="Asset_04: OPS_AUTH"
              title="Driving License" 
              url={partner.driving_license_url}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary italic">Fleet_Assets ({vehicles.length})</h3>
            {vehicles.length === 0 ? (
              <div className="shard p-6 text-center text-[10px] font-mono uppercase text-muted-foreground italic border-dashed">
                No active assets detected in this node's sector
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="shard p-4 bg-secondary/10 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-tight">{v.make} {v.model}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">{v.registration_number}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter border border-current",
                      v.status === 'available' ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"
                    )}>
                      {v.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary italic">Recent_Activity ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <div className="shard p-12 text-center text-[10px] font-mono uppercase text-muted-foreground italic border-dashed">
                No active telemetry detected from this fleet cluster
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="shard p-4 bg-secondary/10 flex items-center justify-between group border-l-2 border-primary/20 hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary flex items-center justify-center border border-border">
                        <ClipboardList className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">
                          {b.cars?.make} {b.cars?.model} • {b.clients?.full_name || 'Anonymous Renter'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                          {new Date(b.created_at).toLocaleDateString()} • REVENUE: ${b.total_price}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 text-[8px] font-black uppercase tracking-widest border",
                      b.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      b.status === 'confirmed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-orange-500/10 text-orange-500 border-orange-500/20"
                    )}>
                      {b.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shard p-8 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <AlertCircle className="w-10 h-10 mb-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-[0.3em]">Historical_Audit_Tail</span>
            <p className="text-[10px] mt-2 uppercase">No previous audit logs detected for this entity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
