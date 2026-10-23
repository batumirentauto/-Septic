'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { StarRating } from './StarRating'
import { ExternalLink, Quote, MessageSquare } from 'lucide-react'

interface SepticReviewsProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticReviews({ lead, isRu = false }: SepticReviewsProps) {
  const reviews = lead.reviewsSample && lead.reviewsSample.length > 0 ? lead.reviewsSample : []

  return (
    <section className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              {isRu ? 'Реальный опыт клиентов' : 'Verified Google Reviews'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isRu ? `Что говорят жители ${lead.city || lead.state}` : `What Property Owners Say About ${lead.name}`}
            </h2>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl font-black text-white">{lead.rating.toFixed(1)}</span>
              <StarRating rating={lead.rating} starClassName="w-5 h-5" />
              <span className="text-sm text-slate-400 font-medium">
                {isRu ? `Всего отзывов: ${lead.reviewCount}` : `Based on ${lead.reviewCount} Google reviews`}
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
              <span>{isRu ? 'Смотреть все отзывы в Google' : 'Read All on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StarRating rating={r.rating} starClassName="w-4 h-4" />
                    <span className="text-xs text-slate-500 font-mono">{r.date || ''}</span>
                  </div>

                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="font-semibold text-white">{r.author}</div>
                  <span className="text-slate-500">{r.authorMeta || (isRu ? 'Проверенный отзыв' : 'Verified customer')}</span>
                </div>
              </div>
            ))}
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
