'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { StarRating } from './StarRating'
import { Phone, ShieldCheck, MapPin, Clock, ExternalLink, Wrench } from 'lucide-react'

interface SepticHeroProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticHero({ lead, isRu = false }: SepticHeroProps) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-20 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Left Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRu ? 'Лицензированная служба септиков' : 'Licensed & Insured Septic Specialist'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <MapPin className="w-3.5 h-3.5" />
                {lead.city ? `${lead.city}, ${lead.state}` : lead.state}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                {isRu ? '24/7 Срочная откачка' : '24/7 Emergency Pump-Out'}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {lead.name}
              </h1>
              <p className="mt-3 text-lg text-slate-300 font-medium">
                {isRu
                  ? `Профессиональная откачка, видеодиагностика труб и капитальный ремонт дренажных полей (drain fields) в ${lead.city || 'вашем районе'}, ${lead.state}.`
                  : `Heavy-duty septic pumping, video line camera diagnostics, and complete drain field restoration in ${lead.city || 'your area'}, ${lead.state}.`}
              </p>
            </div>

            {/* Google Maps Verified Rating Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">{lead.rating.toFixed(1)}</span>
                    <StarRating rating={lead.rating} starClassName="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {isRu ? 'Подтвержденные отзывы в Google Maps' : 'Verified Google Maps Reviews'} ({lead.reviewCount})
                  </span>
                </div>
              </div>

              {lead.mapsUrl && (
                <a
                  href={lead.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4"
                >
                  <span>{isRu ? 'Карточка в Google Maps' : 'View on Google Maps'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone className="w-5 h-5 fill-current" />
                  <span>{isRu ? `Позвонить: ${lead.phone}` : `Call Now: ${lead.phone}`}</span>
                </a>
              )}

              <a
                href="#estimator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>{isRu ? 'Рассчитать стоимость сметы' : 'Estimate Pumping & Repair'}</span>
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-400 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Защита газона (Turf-Mats)' : 'Lawn Protection Mats'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Фиксированная цена без скрытых сборов' : 'Zero Hidden Dump Fees'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Видеокамера до и после' : 'Full Video Camera Audit'}</span>
              </div>
            </div>

          </div>

          {/* Right Highlight Box / Quick Info Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {isRu ? 'Дежурная бригада на линии' : 'Active Duty Dispatch'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {lead.state}-{lead.city ? lead.city.substring(0, 3).toUpperCase() : 'USA'}
                </span>
              </div>

              {/* Specs snapshot */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-400">{isRu ? 'Адрес / База' : 'Address / Station'}:</span>
                  <span className="text-right font-medium text-slate-200">{lead.address}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-400">{isRu ? 'Категория' : 'Category'}:</span>
                  <span className="text-right font-medium text-slate-200">{lead.category}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-400">{isRu ? 'Часы работы' : 'Hours'}:</span>
                  <span className="text-right font-medium text-slate-200">{lead.hours}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-400">{isRu ? 'Спецтехника' : 'Fleet Specs'}:</span>
                  <span className="text-right font-medium text-emerald-400">
                    {isRu ? 'Вакуумные цистерны 3000–5000G, Hydro-Jetting' : '3,000–5,000 Gal Vacuum Tankers'}
                  </span>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300 flex items-start gap-3">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <strong className="block text-rose-200 font-semibold mb-0.5">
                    {isRu ? 'Засор или вода поднимается в дом?' : 'Sewage Backing Up or Pooling Over Drain Field?'}
                  </strong>
                  <span>
                    {isRu
                      ? 'Немедленно перекройте подачу воды и звоните напрямую дежурному диспетчеру для приоритетного выезда вакуумной цистерны.'
                      : 'Stop running water immediately and call our priority line to dispatch an emergency vacuum truck before structural backup occurs.'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
