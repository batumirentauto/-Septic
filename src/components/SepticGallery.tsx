'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { ActivePhoto } from './SepticPhotoModal'
import { ZoomIn, ShieldCheck, Camera, CheckCircle2 } from 'lucide-react'

interface SepticGalleryProps {
  lead: SepticLead
  isRu?: boolean
  onOpenPhoto?: (photo: ActivePhoto) => void
}

export function SepticGallery({ lead, isRu = false, onOpenPhoto }: SepticGalleryProps) {
  const gallery = lead.galleryPhotos && lead.galleryPhotos.length > 0 ? lead.galleryPhotos : []

  if (gallery.length === 0) return null

  return (
    <section className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase">
              <Camera className="w-3.5 h-3.5" />
              {isRu ? 'Фотохроника выполненных работ' : 'On-Site Job Documentation'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isRu
                ? 'Реальные объекты: от раскопок до чистовой сдачи'
                : 'Field Execution: Real Tanks, Drain Fields & Line Replacements'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {isRu
                ? `Все фотографии сделаны непосредственно мастерами ${lead.name} на объектах в г. ${lead.city}, ${lead.state}. Никаких шаблонных картинок из интернета.`
                : `Authentic jobsite photography captured by ${lead.name} crews throughout ${lead.city}, ${lead.state}. Zero stock illustrations.`}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isRu ? '100% Оригинальные фото объектов' : '100% Authentic Field Captures'}</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg cursor-pointer"
              onClick={() =>
                onOpenPhoto &&
                onOpenPhoto({
                  src: item.image,
                  title: isRu ? item.titleRu : item.title,
                  description: isRu ? item.descRu : item.desc,
                  tag: isRu ? item.tagRu : item.tag,
                })
              }
            >
              {/* Image with zoom hint */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={isRu ? item.titleRu : item.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-50 group-hover:opacity-20 transition" />

                {/* Tag pill */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                  {isRu ? item.tagRu : item.tag}
                </div>

                {/* Zoom icon */}
                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 opacity-80 group-hover:opacity-100 transition">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Text content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                    {isRu ? item.titleRu : item.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {isRu ? item.descRu : item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isRu ? 'Работа завершена и принята' : 'Completed to County Code'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
