import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getLeadBySlug } from '../../../data/septicLeads'
import { generateDecalSvg } from '../../../lib/decalGenerator'

interface Props {
  params: Promise<{ filename: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const { filename } = await params

  // Match e.g. "first-call-septic-truck-decal.svg" or "first-call-septic-truck-decal.png"
  const cleanName = filename.replace(/\.(svg|png)$/, '')
  const slug = cleanName.replace(/-truck-decal$/, '')

  const lead = getLeadBySlug(slug)
  if (!lead) {
    return new NextResponse('Lead not found', { status: 404 })
  }

  const targetUrl = `https://septic.up.railway.app/${lead.slug}?src=truck_qr`

  if (filename.endsWith('.svg')) {
    const svg = await generateDecalSvg(lead, targetUrl)
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  }

  if (filename.endsWith('.png')) {
    // Return high-res standalone QR code PNG buffer
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 1200,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  }

  return new NextResponse('Unsupported file format', { status: 400 })
}
