"use client"

import React from 'react'
import { Settings, Shield, Bell, Database, Globe, Key } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">System <span className="text-primary italic">Config</span></h1>
          <p className="text-muted-foreground font-mono text-sm mt-1 uppercase tracking-widest">{">"} engine: secondary_only</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Database, name: 'Supabase Integration', desc: 'Manage database connection and real-time syncing' },
          { icon: Shield, name: 'Security & Auth', desc: 'Admin roles, permissions and MFA settings' },
          { icon: Bell, name: 'Notifications', desc: 'Configure FCM push and operational alerts' },
          { icon: Globe, name: 'Global Settings', desc: 'Locale, currency, and regional tax rules' },
          { icon: Key, name: 'API Credentials', desc: 'Secret keys for Stripe and Maps integration' },
          { icon: Settings, name: 'App Configuration', desc: 'Maintenance mode and global maintenance limits' },
        ].map((s, i) => (
          <div key={i} className="shard p-6 flex gap-4 items-start group hover:bg-secondary/50 cursor-pointer">
            <div className="p-3 bg-card border border-border group-hover:border-primary transition-all">
              <s.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight">{s.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
