'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { MapPin, Navigation, Clock, ShieldCheck, Phone } from 'lucide-react'

interface SepticCoverageProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticCoverage({ lead, isRu = false }: SepticCoverageProps) {
  const serviceAreas =
    lead.serviceAreaList && lead.serviceAreaList.length > 0
      ? lead.serviceAreaList
      : [
          lead.city || 'Metro Area',
          'North County',
          'South County',
          'East Suburbs',
          'West Communities',
          'Surrounding Rural Areas',
        ]

  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  return (
    <section className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Service Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase">
                <Navigation className="w-3.5 h-3.5" />
                {isRu ? 'Зона обслуживания и реагирования' : 'Service Coverage & Rapid Dispatch'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {isRu
                  ? `Оперативный выезд по г. ${lead.city} и округу ${lead.state}`
                  : `Serving ${lead.city}, ${lead.state} & Surrounding Communities`}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {isRu
                  ? `Бригады ${lead.name} укомплектованы мобильными мини-экскаваторами и вакуумными цистернами, готовыми к выезду в жилые и коммерческие районы.`
                  : `Field units from ${lead.name} are stationed across the region for rapid emergency dispatch to residential properties, subdivisions, and rural acreage.`}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <Clock className="w-4 h-4" />
                  <span>45–60 {isRu ? 'мин' : 'min'}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {isRu ? 'Среднее время прибытия при аварии' : 'Average Emergency Arrival'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% {isRu ? 'Гарантия' : 'Covered'}</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {isRu ? 'Лицензия и страхование работ' : 'Licensed, Bonded & Insured'}
                </div>
              </div>
            </div>

            {/* Direct dispatch button */}
            {cleanPhone && (
              <div className="pt-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>
                    {isRu
                      ? `Проверить выезд по вашему адресу: ${lead.phone}`
                      : `Check Service Availability: ${lead.phone}`}
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Area Tag Cloud */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{isRu ? 'Населенные пункты в зоне выезда' : 'Key Municipalities in Dispatch Zone'}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {lead.state} REGIONAL HUB
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {serviceAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:text-white transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">ℹ️</span>
                <span>
                  {isRu
                    ? `Не нашли свой населенный пункт в списке? Позвоните нам: мы регулярно обслуживаем прилегающие поселки и загородные дома в радиусе до 45 миль от базы.`
                    : `Property located just outside these towns? Call our dispatcher — our pump trucks and excavation rigs regularly service rural acreage up to 45 miles out.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
