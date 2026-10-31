import fs from 'fs-extra'
import path from 'path'
import QRCode from 'qrcode'

// Target URL: either Railway preview or direct domain
const TARGET_URL = 'https://septic.up.railway.app/stones-pumping?src=truck_qr'

async function generateSvgDecal() {
  const outDir = path.resolve('./public/decals')
  await fs.ensureDir(outDir)

  // Generate QR code SVG string (Level H for maximum resilience outdoors)
  const qrSvg = await QRCode.toString(TARGET_URL, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#0f172a', // Slate 900
      light: '#ffffff'
    }
  })

  // Extract path or inner SVG
  const qrInner = qrSvg.replace(/<\?xml.*?\?>/, '').replace(/<svg.*?>/, '').replace(/<\/svg>/, '')

  // Create full Vector SVG Truck Decal Sticker Layout (800x1100 px, scalable to any truck size)
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="1100" viewBox="0 0 800 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Definitions -->
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
  <text x="400" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">
    STONE'S PUMPING
  </text>
  <text x="400" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#A7F3D0" text-anchor="middle" letter-spacing="3">
    SEPTIC SYSTEM SERVICE • ROANE &amp; RHEA COUNTIES
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
  
  <!-- Embedded High-Res QR Code -->
  <g transform="translate(180, 345) scale(10.47)">
    ${qrInner}
  </g>

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
    CALL OR TEXT: (423) 458-5606
  </text>
  <text x="400" y="1035" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="1">
    stones-pumping.com • 24/7 Priority Emergency
  </text>
</svg>`

  const svgPath = path.join(outDir, 'stones-pumping-truck-decal.svg')
  await fs.writeFile(svgPath, fullSvg, 'utf8')
  console.log(`✅ Generated Vector SVG Decal: ${svgPath}`)

  return svgPath
}

generateSvgDecal().catch(console.error)
