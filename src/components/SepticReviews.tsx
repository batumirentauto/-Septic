'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { StarRating } from './StarRating'
import { ActivePhoto } from './SepticPhotoModal'
import { ExternalLink, MessageSquare, Camera, ZoomIn, ShieldCheck } from 'lucide-react'

interface SepticReviewsProps {
  lead: SepticLead
  isRu?: boolean
  onOpenPhoto?: (photo: ActivePhoto) => void
}

export function SepticReviews({ lead, isRu = false, onOpenPhoto }: SepticReviewsProps) {
  const reviews = lead.reviewsSample && lead.reviewsSample.length > 0 ? lead.reviewsSample : []

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              {isRu ? 'Реальный опыт жителей' : 'Verified Google Reviews & Photos'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isRu
                ? `Что говорят клиенты о бригаде ${lead.name}`
                : `Verified Client Feedback for ${lead.name}`}
            </h2>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl font-black text-white">{lead.rating.toFixed(1)}</span>
              <StarRating rating={lead.rating} starClassName="w-5 h-5" />
              <span className="text-sm text-slate-400 font-medium">
                {isRu
                  ? `Оценка ${lead.rating} из 5 на основе ${lead.reviewCount} отзывов Google`
                  : `Rated ${lead.rating} out of 5 based on ${lead.reviewCount} Google reviews`}
              </span>
            </div>
          </div>

          {lead.mapsUrl && (
            <a
              href={lead.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 text-xs font-semibold transition"
            >
              <span>{isRu ? 'Смотреть все отзывы в Google Maps' : 'View All on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r, idx) => {
              const hasPhotos = r.photos && r.photos.length > 0
              return (
                <div
                  key={idx}
                  className={`rounded-2xl bg-slate-900/70 border p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition ${
                    hasPhotos ? 'border-cyan-500/40 bg-slate-900/90 shadow-lg' : 'border-slate-800/80'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top rating + date row */}
                    <div className="flex items-center justify-between">
                      <StarRating rating={r.rating} starClassName="w-4 h-4" />
                      <span className="text-xs text-slate-500 font-mono">{r.date || ''}</span>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-slate-300 italic leading-relaxed whitespace-pre-line">
                      &ldquo;{r.text}&rdquo;
                    </p>

                    {/* Customer Attached Photos Strip */}
                    {hasPhotos && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                          <Camera className="w-3.5 h-3.5" />
                          <span>
                            {isRu
                              ? `Фото клиента к отзыву (${r.photos!.length}):`
                              : `Customer attached jobsite photo${r.photos!.length > 1 ? 's' : ''} (${r.photos!.length}):`}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {r.photos!.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950"
                              onClick={() =>
                                onOpenPhoto &&
                                onOpenPhoto({
                                  src: photoUrl,
                                  title: isRu
                                    ? `Фото к отзыву: ${r.author}`
                                    : `Verified Job Photo from ${r.author}'s Review`,
                                  description: r.text.substring(0, 140) + '...',
                                  tag: isRu ? 'Фото клиента в Google Maps' : 'Google Maps Client Photo',
                                })
                              }
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photoUrl}
                                alt={`Review photo by ${r.author}`}
                                className="w-full h-full object-cover transition group-hover:scale-110"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review author footer */}
                  <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{r.author}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.authorMeta || (isRu ? 'Клиент из Google Maps' : 'Verified Google Reviewer')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isRu ? 'Проверен' : 'Verified'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm">
              {isRu
                ? `Компания ${lead.name} имеет подтвержденный рейтинг ${lead.rating}★ на основе ${lead.reviewCount} оценок клиентов в Google Maps.`
                : `${lead.name} holds a verified ${lead.rating}★ Google Maps reputation with ${lead.reviewCount} customer reviews.`}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
