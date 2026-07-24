import VehiclePageClient from './VehiclePageClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <VehiclePageClient />
}
