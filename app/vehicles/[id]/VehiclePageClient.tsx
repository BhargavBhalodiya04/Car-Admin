"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Car, ChevronLeft, ChevronRight, Fuel, Navigation, Users, MapPin, Gauge, LayoutDashboard, Calendar, ShieldCheck, DollarSign, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registration_number: string
  price_per_day: number
  price_per_km: number
  status: string
  fuel_type: string
  transmission: string
  seating_capacity: number
  features: string[]
  partner_id: string
  partners?: {
    full_name: string
    email: string
    phone_number: string
  }
  car_images?: {
    image_url: string
    is_main: boolean
  }[]
}

const VehicleStatus = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string, label: string }> = {
    available: { color: 'text-emerald-500 border-emerald-500/50 bg-emerald-500/5', label: 'IN FLEET' },
    booked: { color: 'text-blue-500 border-blue-500/50 bg-blue-500/5', label: 'ON TRIP' },
    booked_pending: { color: 'text-amber-500 border-amber-500/50 bg-amber-500/5', label: 'RESERVED' },
    maintenance: { color: 'text-destructive border-destructive/50 bg-destructive/5', label: 'IN SHOP' },
    hidden: { color: 'text-muted-foreground border-border bg-muted', label: 'DECOMMISSIONED' },
  }

  const { color, label } = configs[status] || configs.available

  return (
    <span className={cn("px-3 py-1 text-xs font-black uppercase tracking-widest border", color)}>
      {label}
    </span>
  )
}

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params as { id: string }

  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const fetchVehicle = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*, partners(*), car_images(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) setVehicle(data as Vehicle)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchVehicle()
  }, [fetchVehicle])

  if (loading) return <div className="p-12 text-center animate-pulse font-mono tracking-widest text-muted-foreground uppercase">Scanning Fleet Databanks...</div>
  if (error || !vehicle) return <div className="p-12 text-center text-destructive font-mono uppercase">Asset Not Found <br /><span className="text-xs text-muted-foreground">{error}</span></div>

  const images = vehicle.car_images?.map(img => img.image_url) || []
  const hasImages = images.length > 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-4 uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Return_To_Inventory
          </button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{vehicle.make} <span className="text-primary italic">{vehicle.model}</span></h1>
            <VehicleStatus status={vehicle.status} />
          </div>
          <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm flex items-center gap-2">
            {vehicle.year} • ASSET_ID: {vehicle.id.split('-')[0]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="shard overflow-hidden relative group aspect-[16/9] flex items-center justify-center bg-black/50 border border-border">
            {hasImages ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain"
                  priority
                />

                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 font-mono text-xs uppercase border border-border text-foreground">
                    IMG_{currentImageIndex + 1}/{images.length}
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 backdrop-blur-md hover:bg-primary border border-border text-foreground hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/50 backdrop-blur-md hover:bg-primary border border-border text-foreground hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Car className="w-16 h-16 mb-4" />
                <span className="font-mono uppercase text-sm tracking-widest">No_Visuals_Available</span>
              </div>
            )}
          </div>

          {hasImages && images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-24 h-16 shrink-0 border-2 transition-all relative overflow-hidden",
                    currentImageIndex === idx ? "border-primary" : "border-background opacity-50 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Bento Box Data */}
        <div className="space-y-6">

          {/* Financials Bento */}
          <div className="shard p-6 border-primary/20 bg-primary/5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80 mb-4 flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Tariff_Matrix
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black tracking-tighter text-primary">₹{vehicle.price_per_day}</span>
              <span className="text-sm font-mono text-primary/70 uppercase">/ DAY</span>
            </div>
            {vehicle.price_per_km > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">₹{vehicle.price_per_km}</span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">/ Extra KM</span>
              </div>
            )}
          </div>

          {/* Core Specs Bento */}
          <div className="shard p-6">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-3 h-3" /> Core_Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-4">
              <SpecItem icon={<Fuel className="w-4 h-4" />} label="Fuel Type" value={vehicle.fuel_type || 'Unknown'} />
              <SpecItem icon={<Settings2 className="w-4 h-4" />} label="Transmission" value={vehicle.transmission || 'Unknown'} />
              <SpecItem icon={<Users className="w-4 h-4" />} label="Capacity" value={`${vehicle.seating_capacity || 5} Seats`} />
              <SpecItem icon={<ShieldCheck className="w-4 h-4" />} label="Plate ID" value={vehicle.registration_number} />
            </div>
          </div>

          {/* Owner Profile Bento */}
          <div className="shard p-6">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Registered_Owner
            </h3>
            {vehicle.partners ? (
              <div className="space-y-2">
                <p className="font-bold text-lg">{vehicle.partners.full_name}</p>
                <p className="text-sm text-muted-foreground font-mono">{vehicle.partners.email}</p>
                <p className="text-sm text-muted-foreground font-mono">{vehicle.partners.phone_number}</p>
                <Link
                  href={`/partners/${vehicle.partner_id}`}
                  className="mt-4 inline-flex w-full justify-center py-2 bg-secondary hover:bg-secondary/80 text-xs font-mono uppercase transition-colors tracking-widest"
                >
                  View_Profile
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No Partner Assigned (System Admin Owned)</p>
            )}
          </div>

          {/* Features Bento */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="shard p-6">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                <Gauge className="w-3 h-3" /> Asset_Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary text-xs font-medium border border-border">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} <span>{label}</span>
      </div>
      <p className="font-bold text-sm tracking-tight capitalize">{value}</p>
    </div>
  )
}
