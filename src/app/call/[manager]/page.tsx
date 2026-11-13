import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ manager: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  return [
    { manager: 'dinara' },
    { manager: 'tatyana' },
    { manager: 'jane' },
    { manager: '1' },
    { manager: '2' },
    { manager: '3' },
  ]
}

export default async function ManagerDirectCallPage({ params }: Props) {
  const { manager } = await params
  const normalized = (manager || 'dinara').toLowerCase()
  redirect(`/call?manager=${normalized}`)
}
