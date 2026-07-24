"use client"

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { cn } from '@/lib/utils'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/login'

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSession = document.cookie.includes('admin_session=authorized')

      if (!hasSession && !isLoginPage) {
        router.push('/login')
      } else if (hasSession && isLoginPage) {
        router.push('/')
      }
    }
  }, [pathname, isLoginPage, router])

  const [checked, setChecked] = React.useState(false)

  React.useEffect(() => {
    setChecked(true)
  }, [])

  if (!checked) return null

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
