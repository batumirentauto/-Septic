'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { Phone, MapPin, ShieldCheck, ArrowUp } from 'lucide-react'

interface SepticFooterProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticFooter({ lead, isRu = false }: SepticFooterProps) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Business Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{lead.name}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {isRu
                ? `Профессиональная служба септиков и канализации в ${lead.city || 'вашем регионе'}, ${lead.state}. Регламентная вакуумная откачка, видеоинспекция магистралей и капитальный ремонт дренажных полей.`
                : `Engineered septic tank pumping, lateral line hydro-jetting, and drain field restoration serving ${lead.city || 'your community'}, ${lead.state}. Clean, insured, and compliant service.`}
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{isRu ? 'Сертифицированная утилизация стоков' : 'Certified Environmental Disposal'}</span>
            </div>
          </div>

          {/* Col 2: Service Location */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isRu ? 'Зона обслуживания' : 'Service Territory'}
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{lead.address}</span>
            </div>
            <p className="text-slate-500 text-[11px] pt-1">
              {isRu
                ? `Выезд вакуумных цистерн по всему округу ${lead.city ? `и пригородам ${lead.city}` : ''}.`
                : `Active tanker dispatch throughout county limits & surrounding municipalities.`}
            </p>
          </div>

          {/* Col 3: Direct Emergency Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              {isRu ? 'Диспетчерская служба' : 'Direct Dispatch'}
            </h4>
            {cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>{lead.phone}</span>
              </a>
            ) : (
              <span>{isRu ? 'По запросу на сайте' : 'Available upon inquiry'}</span>
            )}
            <p className="text-slate-500 text-[11px]">
              {lead.hours}
            </p>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © {new Date().getFullYear()} {lead.name}. {isRu ? 'Все права защищены.' : 'All rights reserved.'}
          </div>

          <div className="flex items-center gap-4">
            {isRu && (
              <a
                href="/"
                className="text-cyan-400 hover:text-cyan-300 transition font-medium"
              >
                ← Каталог всех бригад септиков
              </a>
            )}

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <span>{isRu ? 'Наверх' : 'Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}
