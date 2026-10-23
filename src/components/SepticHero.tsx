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
} from 'lucide-react'

interface SepticHeroProps {
  lead: SepticLead
  isRu?: boolean
  onOpenPhoto?: (photo: ActivePhoto) => void
}

export function SepticHero({ lead, isRu = false, onOpenPhoto }: SepticHeroProps) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  const handleHeroPhotoClick = () => {
    if (lead.heroImage && onOpenPhoto) {
      onOpenPhoto({
        src: lead.heroImage,
        title: isRu
          ? `${lead.name} — Монтаж дренажного поля и защита газона`
          : `${lead.name} — Precision Leach Field Trench & Lawn Protection`,
        description: isRu
          ? `Реальный снимок бригады во время восстановления дренажной системы в г. ${lead.city}, ${lead.state}. Газон сохранен, траншея подготовлена под лазерный уровень.`
          : `Actual jobsite documentation during leach field restoration in ${lead.city}, ${lead.state}. Clean turf edges, laser-graded trench, zero structural yard damage.`,
        tag: `${lead.city}, ${lead.state}`,
      })
    }
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-20 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRu ? 'Лицензированные специалисты по септикам' : 'Licensed & Insured Septic Specialist'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <MapPin className="w-3.5 h-3.5" />
                {lead.city ? `${lead.city}, ${lead.state}` : lead.state}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                {isRu ? 'Срочный выезд при засоре' : 'Emergency Priority Dispatch'}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {lead.name}
              </h1>
              <p className="mt-3 text-lg text-slate-300 font-medium leading-relaxed">
                {isRu
                  ? `Откачка септиков без повреждения газона, лазерная укладка полей фильтрации, замена чугунных выпусков на ПВХ и срочный аварийный ремонт в ${lead.city || 'вашем районе'}, ${lead.state}.`
                  : `Heavy-duty septic pumping with zero yard damage, laser-graded leach field installations, cast-iron-to-PVC sewer upgrades, and 24/7 backup relief across ${lead.city || 'your area'}, ${lead.state}.`}
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
                    {isRu ? 'Официальный рейтинг в Google Maps' : 'Verified Google Maps Reputation'} ({lead.reviewCount}{' '}
                    {isRu ? 'отзыва' : 'reviews'})
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
                  <span>{isRu ? 'Открыть карточку в Google Maps' : 'View Verified Google Profile'}</span>
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
                  <span>{isRu ? `Позвонить мастеру: ${lead.phone}` : `Call Field Crew: ${lead.phone}`}</span>
                </a>
              )}

              <a
                href="#estimator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all"
              >
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>{isRu ? 'Рассчитать смету за 10 сек' : '10-Second Price Estimator'}</span>
              </a>
            </div>

            {/* Iron Facts / Zero-Fluff Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-400 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Защитные полимерные трапы' : 'Turf Protection Mats'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Без скрытых сборов за утилизацию' : 'Zero Hidden Dump Fees'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isRu ? 'Видеокамера до и после' : 'Video Diagnostic Before Digging'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl space-y-4">
              {/* Photo Container */}
              {lead.heroImage ? (
                <div
                  className="relative group cursor-pointer overflow-hidden aspect-[4/3] bg-slate-950"
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

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isRu ? 'Реальное фото объекта' : '100% Real Jobsite Photo'}</span>
                  </div>

                  {/* Zoom Icon Hint */}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 opacity-80 group-hover:opacity-100 transition">
                    <ZoomIn className="w-4 h-4" />
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-bold">
                      {lead.city}, {lead.state}
                    </span>
                    <p className="text-sm font-bold text-white leading-tight drop-shadow-md">
                      {isRu
                        ? 'Лазерная укладка дренажной траншеи с сохранением дерна'
                        : 'Laser-Graded Drain Field Installation & Turf Preservation'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Crew & Specs Summary Container */}
              <div className="p-5 sm:p-6 pt-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {isRu ? 'Дежурные мастера на линии' : 'Active Crew Dispatch'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {lead.state}-{lead.city ? lead.city.substring(0, 3).toUpperCase() : 'USA'}
                  </span>
                </div>

                {/* Crew Members if available */}
                {lead.crewMembers && lead.crewMembers.length > 0 && (
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isRu ? 'Состав бригады на объектах:' : 'On-Site Field Operators:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {lead.crewMembers.map((member, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 font-medium"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specs list */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{isRu ? 'Зона обслуживания:' : 'Service Coverage:'}</span>
                    <span className="font-semibold text-slate-200">
                      {lead.city}, {lead.state} & Upstate
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{isRu ? 'Срочный выезд:' : 'Emergency Dispatch:'}</span>
                    <span className="font-semibold text-emerald-400">
                      {isRu ? 'В течение 45–60 мин' : 'Within 45–60 mins'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{isRu ? 'Прямой контакт:' : 'Direct Dispatch Line:'}</span>
                    <span className="font-mono text-cyan-300 font-bold">{lead.phone}</span>
                  </div>
                </div>

                {/* Emergency prompt */}
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 flex items-start gap-2.5">
                  <span className="text-base leading-none">⚠️</span>
                  <div>
                    <strong className="block text-rose-200 font-semibold mb-0.5">
                      {isRu ? 'Запах или застой воды на участке?' : 'Wastewater Pooling in Yard or Backing Up?'}
                    </strong>
                    <span>
                      {isRu
                        ? 'Перекройте воду и звоните дежурному мастеру для приоритетного выезда экскаватора и цистерны.'
                        : 'Shut off main water supply and call immediately to halt wastewater overflow and arrange priority inspection.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
