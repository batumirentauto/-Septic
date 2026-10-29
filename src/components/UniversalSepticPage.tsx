'use client'

import React, { useState } from 'react'
import { SepticLead } from '../data/septicLeads'
import { SepticHeader } from './SepticHeader'
import { SepticHero } from './SepticHero'
import { SepticEquipment } from './SepticEquipment'
import { SepticGallery } from './SepticGallery'
import { SepticServices } from './SepticServices'
import { SepticCalculator } from './SepticCalculator'
import { SepticFears } from './SepticFears'
import { SepticReviews } from './SepticReviews'
import { SepticCoverage } from './SepticCoverage'
import { SepticFooter } from './SepticFooter'
import { SepticMobileBar } from './SepticMobileBar'
import { SepticPhotoModal, ActivePhoto } from './SepticPhotoModal'
import { SepticVisitorRadar } from './SepticVisitorRadar'
import { ArrowLeft, Globe } from 'lucide-react'

interface UniversalSepticPageProps {
  lead: SepticLead
  isRu?: boolean
}

export function UniversalSepticPage({ lead, isRu = false }: UniversalSepticPageProps) {
  const [activePhoto, setActivePhoto] = useState<ActivePhoto | null>(null)

  const enUrl = `/${lead.slug}`
  const ruUrl = `/${lead.slug}/ru`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased pb-20 lg:pb-0">
      {/* Header & Sticky Navigation Bar */}
      <SepticHeader lead={lead} isRu={isRu} />

      {/* Hero Section with Live Crew Visual */}
      <SepticHero lead={lead} isRu={isRu} onOpenPhoto={setActivePhoto} />

      {/* Fleet & Equipment Specs with Unique Equipment Photos */}
      <SepticEquipment lead={lead} isRu={isRu} onOpenPhoto={setActivePhoto} />

      {/* On-Site Job Documentation Gallery */}
      <SepticGallery lead={lead} isRu={isRu} onOpenPhoto={setActivePhoto} />

      {/* Services Section */}
      <SepticServices lead={lead} isRu={isRu} />

      {/* 10-Second Price Estimator */}
      <SepticCalculator lead={lead} isRu={isRu} />

      {/* Closing 5 Major Septic Fears */}
      <SepticFears lead={lead} isRu={isRu} />

      {/* Verified Customer Reviews with Customer-Uploaded Photos */}
      <SepticReviews lead={lead} isRu={isRu} onOpenPhoto={setActivePhoto} />

      {/* Regional Service & Coverage Area */}
      <SepticCoverage lead={lead} isRu={isRu} />

      {/* Footer */}
      <SepticFooter lead={lead} isRu={isRu} />

      {/* Sticky Mobile Floating Action Bar */}
      <SepticMobileBar lead={lead} isRu={isRu} />

      {/* Interactive High-Res Lightbox Modal */}
      <SepticPhotoModal
        activePhoto={activePhoto}
        onClose={() => setActivePhoto(null)}
        isRu={isRu}
      />

      {/* Real-Time Contractor Visitor Radar (Active on English Contractor Pages) */}
      <SepticVisitorRadar
        slug={lead.slug}
        isRu={isRu}
        activePhotoTitle={activePhoto?.title || null}
      />
    </div>
  )
}
