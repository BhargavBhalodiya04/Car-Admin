"use client"

import React from 'react'
import { DataTable } from '@/components/data-table'
import { MoreHorizontal, UserCheck, ShieldCheck, ExternalLink, Clock, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  full_name: string
  email: string
  phone_number: string
  created_at: string
  is_partner?: boolean
}

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const fetchClients = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (clientsError) throw clientsError

      const { data: partnersData } = await supabase
        .from('partners')
        .select('id')

      if (clientsData) {
        const partnerIds = new Set(partnersData?.map(p => p.id) || [])
        const enrichedClients = clientsData.map(c => ({
          ...c,
          is_partner: partnerIds.has(c.id)
        }))
        setClients(enrichedClients)
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("WARNING: This will permanently delete the client, their auth account, and all related data. Proceed?")) return;
    
    try {
      const { error } = await supabase.rpc('delete_user', { user_id_param: id });
      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete client: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Client <span className="text-primary italic">Manifest</span></h1>
          <p className="text-muted-foreground font-mono text-sm mt-1 uppercase tracking-widest">{">"} access_level: authorized</p>
        </div>
      </div>

      {loading ? (
        <div className="shard p-12 text-center font-mono animate-pulse uppercase">
          Querying Client Database...
        </div>
      ) : error ? (
        <div className="shard p-12 text-center font-mono uppercase text-destructive border-destructive/50 bg-destructive/5">
          {">"} MANIFEST_ERROR: {error}
          <button onClick={fetchClients} className="block mx-auto mt-4 text-[10px] underline hover:text-primary transition-colors">Retry_Sequence</button>
        </div>
      ) : (
        <DataTable 
          title="Active Clients"
          description="Verified users registered for car rentals"
          data={clients}
          columns={[
            { header: 'Full Name', accessorKey: (client: Client) => (
              <div className="flex items-center gap-2">
                <span>{client.full_name || 'Unknown Client'}</span>
                {client.is_partner && (
                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] uppercase font-bold tracking-wider rounded-sm border border-primary/30">
                    Partner
                  </span>
                )}
              </div>
            ) },
            { header: 'Contact', accessorKey: (client: Client) => (
              <div className="flex flex-col">
                <span>{client.email}</span>
                <span className="text-xs text-muted-foreground font-mono">{client.phone_number}</span>
              </div>
            )},
            { header: 'Joined', accessorKey: (client: Client) => new Date(client.created_at).toLocaleDateString(), className: 'font-mono text-xs' },
            { header: 'Actions', accessorKey: (client: Client) => (
              <div className="flex justify-end gap-2 items-center">
                <Link 
                  href={`/clients/${client.id}`}
                  className="px-3 py-1 bg-secondary hover:bg-primary hover:text-white text-[10px] font-bold uppercase transition-all flex items-center gap-1 group"
                >
                  View Profile
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Link>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="p-1 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded transition-colors"
                  title="Delete Client"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ), className: 'text-right' },
          ]}
        />
      )}
    </div>
  )
}
