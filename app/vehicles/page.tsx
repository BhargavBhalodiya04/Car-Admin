"use client"

import React from 'react'
import { DataTable } from '@/components/data-table'
import { Car, Settings2, Info, ExternalLink, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

import { supabase } from '@/lib/supabase'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registration_number: string
  price_per_day: number
  status: string
  fuel_type: string
  partner_id: string
  partners?: {
    full_name: string
  }
  car_images?: {
    image_url: string
  }[]
}

const VehicleStatus = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string, label: string }> = {
    available: { color: 'text-emerald-500 bg-emerald-500/10', label: 'In Fleet' },
    booked: { color: 'text-blue-500 bg-blue-500/10', label: 'On Trip' },
    booked_pending: { color: 'text-amber-500 bg-amber-500/10', label: 'Reserved' },
    maintenance: { color: 'text-destructive bg-destructive/10', label: 'In Shop' },
    hidden: { color: 'text-muted-foreground bg-muted', label: 'Decommissioned' },
  }

  const { color, label } = configs[status] || configs.available

  return (
    <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border border-current", color)}>
      {label}
    </span>
  )
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [viewingImages, setViewingImages] = React.useState<string[] | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const fetchVehicles = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*, partners(*), car_images(image_url)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setVehicles(data as any[])
    } catch (err: any) {
      console.error('Error fetching vehicles:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Inventory <span className="text-primary italic">Vault</span></h1>
          <p className="text-muted-foreground font-mono text-sm mt-1 uppercase tracking-widest">{">"} telemetry: engaged</p>
        </div>
      </div>

      {loading ? (
        <div className="shard p-12 text-center font-mono animate-pulse uppercase">
          Scanning Hangar Assets...
        </div>
      ) : error ? (
        <div className="shard p-12 text-center font-mono uppercase text-destructive border-destructive/50">
          Telemetry Failure: {error}
          <button 
            onClick={fetchVehicles}
            className="block mx-auto mt-4 text-[10px] underline hover:text-primary transition-colors"
          >
            Retry_Link
          </button>
        </div>
      ) : (
        <DataTable 
          title="Fleet Assets"
          description="Global vehicle inventory across all partners"
          data={vehicles}
          columns={[
            { header: 'Vehicle Matrix', accessorKey: (v: any) => (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 bg-secondary flex items-center justify-center shrink-0 border border-border group/thumbnail hover:border-primary transition-all overflow-hidden relative"
                  onClick={() => {
                    if (v.car_images && v.car_images.length > 0) {
                      setViewingImages(v.car_images.map((img: any) => img.image_url))
                      setCurrentImageIndex(0)
                    }
                  }}
                  style={{ cursor: v.car_images && v.car_images.length > 0 ? 'pointer' : 'default' }}
                >
                  {v.car_images && v.car_images.length > 0 ? (
                    <>
                      <Image
                        src={v.car_images[0].image_url}
                        alt="Vehicle Thumbnail"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4 text-primary" />
                      </div>
                    </>
                  ) : (
                    <Car className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-tight">{(v.make || v.brand || 'Unknown')} {(v.model || v.variant || 'Vehicle')}</span>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase italic">{v.year} • {v.fuel_type}</span>
                </div>
              </div>
            )},
            { header: 'Plate ID', accessorKey: 'registration_number', className: 'font-mono text-xs font-bold' },
            { header: 'Owner', accessorKey: (v: any) => (
              v.partners?.id ? (
                <Link href={`/partners/${v.partners.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                  {v.partners.full_name || v.partners.name || 'Individual'}
                  <ExternalLink className="w-2 h-2 opacity-50" />
                </Link>
              ) : (
                <span className="opacity-50 italic">Individual</span>
              )
            ), className: 'text-xs' },
            { header: 'Tariff', accessorKey: (v: any) => `$${Number(v.price_per_day).toFixed(2)}`, className: 'font-mono text-xs text-primary' },
            { header: 'Operational Status', accessorKey: (v: any) => <VehicleStatus status={v.status} /> },
            { header: 'Commands', accessorKey: (v: any) => (
              <div className="flex justify-end gap-2">
                <button className="p-2 hover:bg-secondary text-muted-foreground hover:text-primary">
                  <Settings2 className="w-4 h-4" />
                </button>
                <Link href={`/vehicles/${v.id}`} className="p-2 hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                  <Info className="w-4 h-4" />
                </Link>
              </div>
            ), className: 'text-right' },
          ]}
        />
      )}

      {viewingImages && viewingImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setViewingImages(null)}
        >
          <div 
            className="relative p-2 bg-secondary shard max-w-4xl max-h-[90vh] w-full flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewingImages(null)}
              className="absolute -top-4 -right-4 bg-destructive text-destructive-foreground p-2 shard hover:bg-destructive/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full border border-border bg-background p-2 flex flex-col gap-4 overflow-hidden">
              <div className="relative flex-1 flex flex-col items-center justify-center bg-black/5" style={{ minHeight: '50vh', maxHeight: '70vh' }}>
                <Image 
                  src={viewingImages[currentImageIndex]} 
                  alt={`Full Vehicle View ${currentImageIndex + 1}`} 
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-contain"
                  priority
                />

                {viewingImages.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded-sm uppercase">
                    {currentImageIndex + 1} / {viewingImages.length}
                  </div>
                )}

                {viewingImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? viewingImages.length - 1 : prev - 1) }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-primary hover:text-white border border-border text-foreground rounded-full transition-colors drop-shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === viewingImages.length - 1 ? 0 : prev + 1) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-primary hover:text-white border border-border text-foreground rounded-full transition-colors drop-shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {viewingImages.length > 1 && (
                <div className="flex gap-2 pb-2 px-2 overflow-x-auto justify-center shrink-0">
                  {viewingImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "w-16 h-16 shrink-0 border-2 transition-all relative overflow-hidden",
                        currentImageIndex === idx ? "border-primary ring-2 ring-primary/20 bg-primary/10" : "border-border opacity-50 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`Thumb ${idx}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
