import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'US Septic Pro | National Septic System & Drain Field Network',
  description:
    'Comprehensive directory and verified showcases for top-rated, licensed septic tank pumping, drain field repair, and sewer line diagnostic specialists across all 50 US states.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#030712] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
