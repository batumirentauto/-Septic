'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { StarRating } from './StarRating'
import { ActivePhoto } from './SepticPhotoModal'
import {
  Phone,
  ShieldCheck,
  MapPin,
  Clock,
  ExternalLink,
  Wrench,
  ZoomIn,
  Users,
  AlertTriangle,
  Award,
  CheckCircle2,
  Truck,
} from 'lucide-react'

interface SepticHeroProps {
  lead: SepticLead
  isRu?: boolean
  onOpenPhoto?: (photo: ActivePhoto) => void
}

export function SepticHero({ lead, isRu = false, onOpenPhoto }: SepticHeroProps) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  const photoCaption = isRu
    ? lead.primaryFocus || 'Реальный объект и монтаж септической системы'
    : lead.primaryFocus
    ? `${lead.primaryFocus} — Verified Site Capture`
    : 'On-site septic installation & excavation'

  const handleHeroPhotoClick = () => {
    if (lead.heroImage && onOpenPhoto) {
      onOpenPhoto({
        src: lead.heroImage,
        title: `${lead.name} — ${photoCaption}`,
        description: isRu
          ? `Реальный снимок бригады во время выполнения работ в г. ${lead.city}, ${lead.state}. Подтвержденный объект с сохранением участка и соблюдением стандартов округа.`
          : `Actual jobsite documentation captured during field operations in ${lead.city}, ${lead.state}. Verified residential project completed to local county health code.`,
        tag: `${lead.city}, ${lead.state}`,
      })
    }
  }

  const crewLead = lead.crewMembers && lead.crewMembers.length > 0 ? lead.crewMembers[0] : null

  // Clean primary focus without english brackets and prevent repetitions
  const rawFocus = lead.primaryFocus || ''
  const cleanFocus = rawFocus.replace(/\s*\([a-zA-Z\s]+\)/g, '').trim()
  const locationLabel = lead.city ? `${lead.city}, ${lead.state}` : lead.state

  let headlineRu = `Капитальный монтаж, ремонт септиков и восстановление полей фильтрации в г. ${locationLabel}`
  let headlineEn = `Complete Septic System Installation, Drain Field Restoration & Excavation in ${locationLabel}`

  if (cleanFocus.toLowerCase().includes('монтаж') || cleanFocus.toLowerCase().includes('установк')) {
    headlineRu = `Капитальный монтаж и замена септических систем, земляные работы в г. ${locationLabel}`
    headlineEn = `Complete Septic System Installation, Tank Replacement & Excavation in ${locationLabel}`
  } else if (cleanFocus.toLowerCase().includes('дренаж') || cleanFocus.toLowerCase().includes('фильтрац')) {
    headlineRu = `Восстановление полей фильтрации, капитальный ремонт септиков и земляные работы в г. ${locationLabel}`
    headlineEn = `Drain Field Restoration, Heavy Septic Repair & Precision Excavation in ${locationLabel}`
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-20 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Main Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Top Badges & Value Props (no company name duplicate) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-100 border border-slate-700 font-bold shadow-sm">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRu ? 'Собственная спецтехника • Без посредников' : 'Owner-Operated Fleet • Direct Pricing'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRu ? 'Лицензированные мастера' : 'Licensed Septic Specialist'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <MapPin className="w-3.5 h-3.5" />
                {locationLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                {isRu ? 'Срочный выезд при аварии' : '24/7 Emergency Priority Dispatch'}
              </span>
            </div>

            {/* Powerful Commercial Offer Headline & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {isRu ? headlineRu : headlineEn}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
                {isRu
                  ? `Собственный парк тяжелой и мини-спецтехники в ${locationLabel}. Честные сметы напрямую от владельца без посредников, лазерный контроль уклона труб и 100% защита вашего участка.`
                  : `Direct owner-operated heavy machinery and mini-excavator fleet serving ${locationLabel}. Upfront fixed pricing with zero broker markup, laser-level slope grading, and 100% lawn protection pledge.`}
              </p>
            </div>

            {/* Google Maps Verified Rating Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white">{lead.rating.toFixed(1)}</span>
                  <StarRating rating={lead.rating} starClassName="w-5 h-5" />
                </div>
                <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                <span className="text-xs text-slate-400">
                  {isRu ? 'Официальный рейтинг в Google Maps' : 'Verified Google Maps Rating'} ({lead.reviewCount}{' '}
                  {isRu ? 'отзывов' : 'reviews'})
                </span>
              </div>

              {lead.mapsUrl && (
                <a
                  href={lead.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4 font-semibold"
                >
                  <span>{isRu ? 'Открыть в Google Maps' : 'View on Google Maps'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>{isRu ? `Позвонить мастеру: ${lead.phone}` : `Call Field Crew: ${lead.phone}`}</span>
                </a>
              )}

              <a
                href="#estimator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 transition-all"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>{isRu ? 'Рассчитать смету за 10 сек' : '10-Second Price Estimator'}</span>
              </a>
            </div>

            {/* 3 Key Trust Metrics Strip (Balances the height naturally!) */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-black text-white">
                  {lead.rating.toFixed(1)} ★
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  {isRu ? '100% честные отзывы' : '100% Top Reviews'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-black text-cyan-400">
                  {lead.ticketRange || '$3K–$18K'}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  {isRu ? 'Монтаж & Дренаж' : 'Full Systems & Line'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-black text-emerald-400">
                  45–60 {isRu ? 'мин' : 'min'}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  {isRu ? 'Аварийный выезд' : 'Emergency Arrival'}
                </div>
              </div>
            </div>

            {/* Micro guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-400 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Защитные настилы газона' : 'Turf Protection Mats'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Фиксированная смета' : 'Zero Hidden Dump Fees'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Видеокамера до и после' : 'Video Line Inspection'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean, Proud Photo & Dispatch Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="h-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Photo Showcase Container */}
              {lead.heroImage ? (
                <div
                  className="relative group cursor-pointer overflow-hidden flex-1 min-h-[280px] bg-slate-950"
                  onClick={handleHeroPhotoClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.heroImage}
                    alt={lead.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Verified Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isRu ? 'Реальное фото объекта' : '100% Real Jobsite Photo'}</span>
                  </div>

                  {/* Zoom Icon Hint */}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 opacity-80 group-hover:opacity-100 transition">
                    <ZoomIn className="w-4 h-4" />
                  </div>

                  {/* Photo Caption Overlay at bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-cyan-400 font-bold">
                      {lead.city}, {lead.state}
                    </span>
                    <p className="text-sm font-bold text-white leading-tight drop-shadow-md">
                      {photoCaption}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Bottom Integrated Dispatch & Field Crew Bar */}
              <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3">
                
                {/* Active Duty Status */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold uppercase tracking-wider text-emerald-400">
                      {isRu ? 'Дежурные мастера на линии' : 'Active Duty Dispatch'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {lead.state}-{lead.city ? lead.city.substring(0, 3).toUpperCase() : 'USA'}
                  </span>
                </div>

                {/* Lead operator / Crew line */}
                {crewLead && (
                  <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {isRu ? `Бригадир: ` : `Field Lead: `}
                      <strong className="text-white font-semibold">{crewLead}</strong>
                    </span>
                  </div>
                )}

                {/* Quick area & response summary */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    📍 {lead.city}, {lead.state}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {isRu ? 'Выезд 45–60 мин' : '45–60m dispatch'}
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Emergency Triage Callout Banner (Full-Width, Sleek & Urgent!) */}
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/30 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">
                {isRu
                  ? 'Аварийный засор или стоки поднимаются в сантехнику?'
                  : 'Emergency Sewage Backup or Surface Wastewater Pooling?'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isRu
                  ? 'Перекройте подачу воды в дом. Дежурная бригада готова к приоритетному выезду со спецтехникой.'
                  : 'Shut off your main water valve immediately. Priority dispatch is available for same-day heavy line clearance.'}
              </p>
            </div>
          </div>

          {cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-rose-600/20 transition hover:scale-[1.02]"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>{isRu ? 'Экстренный вызов' : 'Priority Emergency Line'}</span>
            </a>
          )}
        </div>

      </div>
    </section>
  )
}
