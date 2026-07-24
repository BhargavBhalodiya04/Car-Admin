import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="shard p-6 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-secondary group-hover:bg-primary/20 group-hover:text-primary transition-all">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-mono px-2 py-1 bg-secondary",
            trend.positive ? "text-emerald-500" : "text-destructive"
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">{title}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
        <p className="text-xs text-muted-foreground mt-2 font-mono uppercase italic">{description}</p>
      </div>
    </div>
  )
}
