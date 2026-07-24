"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { cn } from '@/lib/utils'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <main className={cn("flex-1 overflow-y-auto bg-background relative", !isLoginPage && "p-8")}>
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay"></div>
        {children}
      </main>
    </>
  )
}
