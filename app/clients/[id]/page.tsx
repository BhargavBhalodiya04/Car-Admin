import ClientPageClient from './ClientPageClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <ClientPageClient />
}
