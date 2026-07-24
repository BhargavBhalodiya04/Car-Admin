import React from 'react'
import { UserCheck, ShieldAlert, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KYCItem {
  id: string
  full_name: string
  type: 'client' | 'partner'
  created_at: string
}

interface KYCQueueProps {
  items: KYCItem[]
}

export function KYCQueue({ items }: KYCQueueProps) {
  return (
    <div className="space-y-4">
      {items.length > 0 ? items.map((item) => (
        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-[#24272E]/50 border-l-2 border-[#FF6B00] group hover:bg-[#24272E] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0F1115] border border-[#24272E]">
              {item.type === 'partner' ? <ShieldAlert className="w-4 h-4 text-[#FF6B00]" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight">{item.full_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-[8px] font-mono uppercase px-1.5 py-0.5",
                  item.type === 'partner' ? "bg-[#FF6B00]/20 text-[#FF6B00]" : "bg-emerald-500/20 text-emerald-500"
                )}>
                  {item.type}
                </span>
                <span className="text-[8px] text-[#A0A0A0] font-mono flex items-center gap-1 uppercase">
                  <Clock className="w-2 h-2" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button className="text-[10px] font-bold uppercase text-[#FF6B00] hover:underline transition-all opacity-0 group-hover:opacity-100">
            Verify
          </button>
        </div>
      )) : (
        <p className="text-xs text-muted-foreground font-mono uppercase italic p-8 text-center bg-secondary/20">
          KYC stack cleared. No pending actions.
        </p>
      )}
    </div>
  )
}
