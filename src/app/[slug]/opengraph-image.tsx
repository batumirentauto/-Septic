import { ImageResponse } from 'next/og'
import { getLeadBySlug } from '../../data/septicLeads'

export const runtime = 'nodejs'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lead = getLeadBySlug(slug)

  const name = lead?.name || 'Septic & Excavation'
  const city = lead?.city ? `${lead.city}, ${lead.state}` : 'Service Area'
  const rating = lead?.rating ? `${lead.rating}★` : '5.0★'
  const reviews = lead?.reviewCount ? `(${lead.reviewCount} Reviews)` : ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#020617',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle glow / border accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#10b981',
          }}
        />

        {/* Top bar: Badge & Location */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#064e3b',
              color: '#34d399',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Verified Field Showcase
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {city}
          </div>
        </div>

        {/* Middle: Contractor Company Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            Septic Installation • Emergency Pumping • Drain Field Excavation
          </div>
        </div>

        {/* Bottom row: Ratings & Fast Dispatch badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid #1e293b',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#fbbf24',
              }}
            >
              {rating}
            </div>
            <div
              style={{
                fontSize: 22,
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            >
              {reviews} Google Verified
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '10px 24px',
              color: '#10b981',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            ⚡ Mobile Crew Showcase
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
