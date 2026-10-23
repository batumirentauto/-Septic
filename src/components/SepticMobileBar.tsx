'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { Phone, Calculator } from 'lucide-react'

interface SepticMobileBarProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticMobileBar({ lead, isRu = false }: SepticMobileBarProps) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 px-4 shadow-2xl">
      <div className="flex items-center gap-3">
        {cleanPhone ? (
          <a
            href={`tel:${cleanPhone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-md active:scale-98 transition"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>{isRu ? 'Позвонить' : 'Call Now'}</span>
          </a>
        ) : null}

        <a
          href="#estimator"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm border border-slate-700 active:scale-98 transition"
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>{isRu ? 'Рассчитать' : 'Estimate Cost'}</span>
        </a>
      </div>
    </div>
  )
}
