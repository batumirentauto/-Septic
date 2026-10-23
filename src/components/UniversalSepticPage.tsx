'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { SepticHero } from './SepticHero'
import { SepticEquipment } from './SepticEquipment'
import { SepticServices } from './SepticServices'
import { SepticCalculator } from './SepticCalculator'
import { SepticFears } from './SepticFears'
import { SepticReviews } from './SepticReviews'
import { SepticFooter } from './SepticFooter'
import { SepticMobileBar } from './SepticMobileBar'
import { ArrowLeft, Globe } from 'lucide-react'

interface UniversalSepticPageProps {
  lead: SepticLead
  isRu?: boolean
}

export function UniversalSepticPage({ lead, isRu = false }: UniversalSepticPageProps) {
  const enUrl = `/${lead.slug}`
  const ruUrl = `/${lead.slug}/ru`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased pb-20 lg:pb-0">
      
      {/* Top Utility Bar (Rule 4: All Crews & Language Switcher) */}
      <div className="bg-slate-950 border-b border-slate-800/80 text-xs py-2 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition text-xs border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isRu ? 'Все бригады' : 'All Crews'}</span>
          </a>

          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <a
              href={enUrl}
              className={`px-2 py-0.5 rounded font-bold transition ${
                !isRu
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={ruUrl}
              className={`px-2 py-0.5 rounded font-bold transition ${
                isRu
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RU
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <SepticHero lead={lead} isRu={isRu} />

      {/* Fleet & Equipment Specs */}
      <SepticEquipment lead={lead} isRu={isRu} />

      {/* Services Section */}
      <SepticServices lead={lead} isRu={isRu} />

      {/* 10-Second Price Estimator */}
      <SepticCalculator lead={lead} isRu={isRu} />

      {/* Closing 5 Major Septic Fears */}
      <SepticFears lead={lead} isRu={isRu} />

      {/* Verified Customer Reviews */}
      <SepticReviews lead={lead} isRu={isRu} />

      {/* Footer */}
      <SepticFooter lead={lead} isRu={isRu} />

      {/* Sticky Mobile Floating Action Bar */}
      <SepticMobileBar lead={lead} isRu={isRu} />

    </div>
  )
}
