"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  UserSquare2, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  ClipboardList
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Bookings', icon: ClipboardList, href: '/bookings' },
  { name: 'Car Owners', icon: UserSquare2, href: '/partners' },
  { name: 'KYC Verification', icon: ShieldCheck, href: '/kyc' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Vehicles', icon: Car, href: '/vehicles' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const router = useRouter()

  return (
    <aside className="w-16 hover:w-64 transition-all duration-300 h-screen bg-card border-r border-border flex flex-col items-center py-8 group z-50 overflow-hidden">
      <div className="mb-12 px-4 w-full flex items-center justify-center group-hover:justify-start h-12 overflow-hidden">
        <img 
          src="/logo.png" 
          alt="BMT Logo" 
          className="h-full w-auto object-contain shrink-0 transition-all duration-300" 
        />
      </div>

      <nav className="flex-1 w-full space-y-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center p-3 text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
          >
            <item.icon className="w-6 h-6 shrink-0" />
            <span className="ml-4 font-medium hidden group-hover:block transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {item.name}
            </span>
            <ChevronRight className="ml-auto w-4 h-4 hidden group-hover:block opacity-0 group-hover:opacity-50" />
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-2 w-full">
        {/* Sign Out removed as per user request */}
      </div>
    </aside>
  )
}
