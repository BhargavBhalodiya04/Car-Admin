import React from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  header: string
  accessorKey: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
}

export function DataTable<T extends { id: string | number }>({ data, columns, title, description }: DataTableProps<T>) {
  return (
    <div className="shard overflow-hidden">
      {(title || description) && (
        <div className="p-6 border-b border-border bg-secondary/30">
          {title && <h2 className="text-xl font-bold uppercase tracking-tight">{title}</h2>}
          {description && <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card">
              {columns.map((column, i) => (
                <th key={i} className={cn("p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-secondary/50 transition-colors group">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={cn("p-4 text-sm font-medium", column.className)}>
                    {typeof column.accessorKey === 'function' 
                      ? column.accessorKey(item) 
                      : (item[column.accessorKey as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-12 text-center text-muted-foreground font-mono uppercase text-sm italic">
          No records found in current sector.
        </div>
      )}
    </div>
  )
}
