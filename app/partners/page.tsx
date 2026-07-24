"use client"

import React from 'react'
import { DataTable } from '@/components/data-table'
import { MoreHorizontal, Clock, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Form from 'next/form'
import { Search } from 'lucide-react'

import { supabase } from '@/lib/supabase'

interface Partner {
  id: string
  full_name: string
  email: string
  phone_number: string
  document_status: string
  created_at: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string, icon: React.ElementType }> = {
    verified: { color: 'text-emerald-500 bg-emerald-500/10', icon: CheckCircle2 },
    pending: { color: 'text-amber-500 bg-amber-500/10', icon: Clock },
    submitted: { color: 'text-blue-500 bg-blue-500/10', icon: FileText },
    rejected: { color: 'text-destructive bg-destructive/10', icon: XCircle },
  }

  const { color, icon: Icon } = configs[status] || configs.pending

  return (
    <span className={cn("flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest", color)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}

export default function PartnersPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const [partners, setPartners] = React.useState<Partner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchPartners() {
      setLoading(true)
      let query = supabase
        .from('partners')
        .select('*')
      
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        setError(error.message)
      } else if (data) {
        setPartners(data)
      }
      setLoading(false)
    }
    fetchPartners()
  }, [searchQuery])

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("WARNING: This will permanently delete the partner, their auth account, their cars, and bookings. Proceed?")) return;
    
    try {
      const { error } = await supabase.rpc('delete_user', { user_id_param: id });
      if (error) throw error;
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete partner: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Partner <span className="text-primary italic">Network</span></h1>
          <p className="text-muted-foreground font-mono text-sm mt-1 uppercase tracking-widest">{">"} fleet_status: expanding</p>
        </div>

        <Form action="/partners" className="relative group max-w-sm w-full">
          <input 
            name="q"
            defaultValue={searchQuery}
            placeholder="FIND_PARTNER_BY_ID_OR_NAME..."
            className="w-full bg-secondary/50 border border-border/50 px-10 py-2 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all uppercase"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </Form>
      </div>

      {loading ? (
        <div className="shard p-12 text-center font-mono animate-pulse uppercase">
          Querying Network Nodes...
        </div>
      ) : error ? (
        <div className="shard p-12 text-center font-mono uppercase text-destructive border-destructive/10 bg-destructive/5 py-12 px-6">
          {">"} LINKAGE_FAILURE: {error}
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-4 text-[10px] underline hover:text-primary transition-colors"
          >
            Reconnect_Node
          </button>
        </div>
      ) : (
        <DataTable 
          title="Fleet Owners"
          description="Approved car rental partners and profile approvals"
          data={partners}
          columns={[
            { header: 'Partner Identity', accessorKey: (p: any) => (
              <div className="flex flex-col">
                <span className="font-bold">{p.full_name || p.name || 'Unknown Partner'}</span>
                <span className="text-xs text-muted-foreground font-mono lowercase">{p.email}</span>
              </div>
            )},
            { header: 'Contact', accessorKey: (p: any) => p.phone_number || p.phone || 'N/A', className: 'font-mono text-xs' },
            { header: 'Onboarded', accessorKey: (p: any) => new Date(p.created_at).toLocaleDateString(), className: 'font-mono text-xs' },
            { header: 'Status', accessorKey: (p: any) => <StatusBadge status={p.document_status || p.status || p.kyc_status || 'pending'} /> },
            { header: 'Actions', accessorKey: (p: Partner) => (
              <div className="flex justify-end gap-2 items-center">
                <Link 
                  href={`/partners/${p.id}`}
                  className="px-3 py-1 bg-secondary hover:bg-primary hover:text-white text-[10px] font-bold uppercase transition-all flex items-center gap-1 group"
                >
                  Review KYC
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Link>
                <button 
                  onClick={() => handleDeletePartner(p.id)}
                  className="p-1 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded transition-colors"
                  title="Delete Partner"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ), className: 'text-right' },
          ]}
        />
      )}

      {/* Connectivity Diagnostics */}
      <div className="mt-12 p-4 bg-secondary/20 border border-border/50 rounded-lg">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" />
          System Diagnostics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] font-mono uppercase">
          <div className="flex justify-between border-b border-border/30 pb-1">
            <span className="text-muted-foreground">Supabase URL:</span>
            <span>{process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] || 'NOT_CONFIGURED'}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-1">
            <span className="text-muted-foreground">Key Status:</span>
            <span className={cn(
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('sb_publishable_') ? "text-red-500 font-bold" : "text-emerald-500"
            )}>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('sb_publishable_') 
                ? 'DETECTED_STRIPE_KEY_ERROR' 
                : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                  ? 'CONFIGURED_OK' 
                  : 'MISSING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
