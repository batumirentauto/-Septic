import QRCode from 'qrcode'
import type { SepticLead } from '../data/septicLeads'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function generateDecalSvg(lead: SepticLead, targetUrl?: string): Promise<string> {
  const url = targetUrl || `https://septic.up.railway.app/${lead.slug}?src=truck_qr`
  
  const qrSvg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  })

  const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 41 41'
  const qrInner = qrSvg
    .replace(/<\?xml.*?\?>/, '')
    .replace(/<svg.*?>/, '')
    .replace(/<\/svg>/, '')

  const companyName = escapeXml(lead.name.toUpperCase())
  const locationSubtitle = escapeXml(
    `SEPTIC SYSTEM SERVICE • ${(lead.city || 'LOCAL').toUpperCase()}, ${(lead.state || 'FL').toUpperCase()}`
  )
  const phone = escapeXml(lead.phone || '(800) 555-0199')
  const domainText = escapeXml(`${lead.slug}.com • 24/7 Priority Dispatch`)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="1100" viewBox="0 0 800 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="0" y="0" width="800" height="1100" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.15"/>
    </filter>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>

  <!-- Background Vinyl Sticker with Rounded Corners -->
  <rect x="15" y="15" width="770" height="1070" rx="36" fill="#FFFFFF" stroke="#047857" stroke-width="8"/>
  <rect x="27" y="27" width="746" height="1046" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Top Emergency Dispatch Badge -->
  <rect x="50" y="55" width="700" height="135" rx="20" fill="url(#headerGrad)"/>
  <text x="400" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
    ${companyName}
  </text>
  <text x="400" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#A7F3D0" text-anchor="middle" letter-spacing="2">
    ${locationSubtitle}
  </text>

  <!-- Big Call to Action Header -->
  <text x="400" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#0F172A" text-anchor="middle">
    NEED SEPTIC PUMPING OR REPAIR?
  </text>
  <text x="400" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#047857" text-anchor="middle">
    Scan with Your Phone Camera Below:
  </text>

  <!-- QR Code Frame & Box -->
  <rect x="150" y="315" width="500" height="500" rx="28" fill="#F8FAFC" stroke="#047857" stroke-width="6"/>
  <rect x="170" y="335" width="460" height="460" rx="16" fill="#FFFFFF"/>
  
  <!-- Embedded High-Res Vector QR Code -->
  <svg x="180" y="345" width="440" height="440" viewBox="${viewBox}">
    ${qrInner}
  </svg>

  <!-- Value Offer Pills -->
  <rect x="80" y="845" width="640" height="95" rx="16" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
  
  <text x="400" y="885" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#0F172A" text-anchor="middle">
    ⚡ INSTANT ESTIMATOR &amp; DISPATCH
  </text>
  <text x="400" y="920" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#475569" text-anchor="middle">
    Calculate tank pumping rates &amp; request service in 30 seconds
  </text>

  <!-- Bottom Direct Phone & Domain -->
  <rect x="50" y="965" width="700" height="85" rx="18" fill="#0F172A"/>
  <text x="400" y="1005" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" text-anchor="middle">
    CALL OR TEXT: ${phone}
  </text>
  <text x="400" y="1035" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="1">
    ${domainText}
  </text>
</svg>`
}
