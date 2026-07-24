"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Settings
} from 'lucide-react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginAction(username, password)
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
        throw err
      }
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
      {/* Industrial Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 mb-6 relative group overflow-hidden border-4 border-black">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ShieldCheck className="w-10 h-10 text-black relative z-10" />
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black"></div>
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            GEAR <span className="text-orange-500">ADMIN</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px]">
            Operational Command Center v1.0
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 relative">
          {/* Form Corner Accents */}
          <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-orange-500"></div>
          <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-orange-500"></div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
                Security ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-none py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                  placeholder="ID Number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-none py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500 transition-colors font-mono"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 flex items-center justify-center gap-2 group transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  INITIALIZE SESSION
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-between text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest">Network Status: Secured</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest">Encryption: AES-256</span>
        </div>
      </div>
    </div>
  )
}
