import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ manager: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  return [
    { manager: 'dinara' },
    { manager: 'dinariya' },
    { manager: 'dinara-today' },
    { manager: 'dinara-3' },
    { manager: 'dinara-warm' },
    { manager: 'dinara-followup' },
    { manager: 'dinara-closing' },
    { manager: 'dinara-4' },
    { manager: 'tatyana' },
    { manager: 'jayne' },
    { manager: 'jane' },
    { manager: 'test' },
    { manager: '100' },
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
