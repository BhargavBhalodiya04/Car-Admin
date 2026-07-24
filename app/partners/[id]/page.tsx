import PartnerPageClient from './PartnerPageClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <PartnerPageClient />
}
