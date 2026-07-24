"use client"

import React from 'react'
import { DataTable } from '@/components/data-table'
import { 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  Search,
  CheckCircle2,
  Eye,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Entity {
  id: string
  full_name: string
  email: string
  phone_number: string
  document_status: string
  created_at: string
  aadhar_front_url?: string
  aadhar_back_url?: string
  pan_card_url?: string
  driving_license_url?: string
}

const DocumentThumbnail = ({ url, label }: { url?: string, label: string }) => {
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    if (url) {
      const { data } = supabase.storage.from('kyc-documents').getPublicUrl(url)
      if (data?.publicUrl) setSignedUrl(data.publicUrl)
    }
  }, [url])

  if (!url) return null

  return (
    <div className="relative group/doc cursor-pointer" title={label}>
      <div className="w-10 h-10 border border-border bg-secondary/50 overflow-hidden hover:border-primary transition-all">
        {signedUrl ? (
          <img src={signedUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />
          </div>
        )}
      </div>
      <a 
        href={signedUrl || '#'} 
        target="_blank" 
        rel="noreferrer"
        className="absolute inset-0 bg-primary/80 opacity-0 group-hover/doc:opacity-100 flex items-center justify-center transition-opacity"
      >
        <ExternalLink className="w-3 h-3 text-white" />
      </a>
    </div>
  )
}

export default function KYCQueuePage() {
  const [entities, setEntities] = React.useState<Entity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const fetchPendingKYC = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('partners')
        .select('*')
      
      const pendingPartners = (data || []).filter((p: any) => 
        ['submitted', 'pending'].includes(p.document_status || p.status || p.kyc_status)
      )

      const combined: Entity[] = pendingPartners.map(p => ({ 
        ...p, 
        full_name: p.full_name || p.name || 'Unknown Partner',
        document_status: p.document_status || p.status || p.kyc_status || 'pending'
      }))

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setEntities(combined)
    } catch (err) {
      console.error('KYC Transmission Error:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPendingKYC()
  }, [])

  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('partners')
        .update({ 
          document_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (!error) {
        setEntities(prev => prev.filter(e => e.id !== id))
      } else {
        console.error('Update Error:', error)
        alert('Failed to update status.')
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">KYC <span className="text-primary italic font-black">Queue</span></h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">{">"} status: awaiting_verification (Partners Only)</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchPendingKYC}
            className="shard bg-secondary/20 p-3 hover:bg-secondary/40 transition-all border border-border"
            title="REFRESH_SYSTEM"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <div className="shard bg-secondary/20 px-4 py-2 flex items-center gap-3 border border-border group focus-within:border-primary transition-all">
            <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="SEARCH_PARTNER..." 
              className="bg-transparent border-none outline-none text-xs font-mono uppercase w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="shard p-4 bg-blue-500/5 border-blue-500/20">
          <p className="text-[10px] font-bold uppercase text-blue-500 mb-1">Queue_Length</p>
          <p className="text-2xl font-black">{entities.length}</p>
        </div>
        <div className="shard p-4 bg-orange-500/5 border-orange-500/20">
          <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Avg_Wait_Time</p>
          <p className="text-2xl font-black text-orange-500">14.2H</p>
        </div>
        <div className="shard p-4 bg-secondary/30 border-border opacity-50">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Resolved_24H</p>
          <p className="text-2xl font-black">28</p>
        </div>
        <div className="shard p-4 bg-secondary/30 border-border opacity-50">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">System_Health</p>
          <p className="text-2xl font-black text-emerald-500">100%</p>
        </div>
      </div>

      <div className="shard overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-mono animate-pulse uppercase tracking-widest text-muted-foreground">
            Scanning Network Packets...
          </div>
        ) : entities.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto" />
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">All Identity Nodes Cleared</p>
          </div>
        ) : (
          <DataTable 
            data={entities}
            columns={[
              { header: 'Identity', accessorKey: (p: Entity) => (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center border border-border shrink-0 font-black text-[12px] relative overflow-hidden group">
                    {p.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs flex items-center gap-2">
                      {p.full_name}
                      <span className="text-[8px] px-1 border border-primary text-primary uppercase font-mono">
                        PARTNER
                      </span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono">{p.email}</div>
                  </div>
                </div>
              )},
              { header: 'Assets', accessorKey: (p: Entity) => (
                <div className="flex gap-1.5">
                  <DocumentThumbnail url={p.aadhar_front_url} label="AADHAR_FRONT" />
                  <DocumentThumbnail url={p.aadhar_back_url} label="AADHAR_BACK" />
                  <DocumentThumbnail url={p.pan_card_url} label="PAN_CARD" />
                  <DocumentThumbnail url={p.driving_license_url} label="DRIVING_LICENSE" />
                  {!p.aadhar_front_url && !p.aadhar_back_url && !p.pan_card_url && !p.driving_license_url && (
                    <span className="text-[10px] text-muted-foreground font-mono italic">NO_DOCS_DETECTED</span>
                  )}
                </div>
              )},
              { header: 'Status', accessorKey: (p: Entity) => (
                <div className={cn(
                  "px-2 py-0.5 text-[9px] font-bold uppercase border inline-block",
                  p.document_status === 'submitted' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                )}>
                  {p.document_status}
                </div>
              )},
              { header: 'Decision_Control', accessorKey: (p: Entity) => (
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => handleStatusUpdate(p.id, 'verified')}
                    disabled={actionLoading === p.id}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    COMPLETED_REVIEW
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(p.id, 'pending')}
                    disabled={actionLoading === p.id}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground hover:text-white border border-border text-[9px] font-black uppercase transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-3 h-3", actionLoading === p.id && "animate-spin")} />
                    PENDING_REVIEW
                  </button>
                  <Link 
                    href={`/partners/${p.id}`}
                    className="p-2 bg-secondary/50 hover:bg-primary hover:text-white border border-border transition-all"
                  >
                    <Eye className="w-3 h-3" />
                  </Link>
                </div>
              ), className: 'text-right' }
            ]}
          />
        )}
      </div>
    </div>
  )
}
