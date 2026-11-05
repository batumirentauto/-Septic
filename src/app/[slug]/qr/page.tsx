import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLeadBySlug } from '../../../data/septicLeads'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lead = getLeadBySlug(slug)
  if (!lead) return { title: 'Decal Not Found' }

  const ogImageUrl = `https://septic.up.railway.app/decals/${slug}-truck-decal.png`
  const title = `${lead.name} • Printable Fleet QR Decal`
  const description = `High-resolution 300 DPI printable vector QR decal for ${lead.name} truck doors and tank tailgates.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://septic.up.railway.app/${slug}/qr`,
      siteName: `${lead.name} Fleet Decals`,
      images: [
        {
          url: ogImageUrl,
          width: 1000,
          height: 1000,
          alt: `${lead.name} truck decal with QR code`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function DecalPage({ params }: Props) {
  const { slug } = await params
  const lead = getLeadBySlug(slug)

  if (!lead) {
    notFound()
  }

  const decalPng = `/decals/${slug}-truck-decal.png`
  const decalSvg = `/decals/${slug}-truck-decal.svg`

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Print-Ready 300 DPI Decal
        </div>

        {/* Company & Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {lead.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Vector QR Code Truck & Tank Decal
          </p>
        </div>

        {/* Card with Decal Image */}
        <div className="relative w-full aspect-square bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
          
          <img
            src={decalSvg}
            alt={`${lead.name} Truck Decal`}
            className="w-full h-full object-contain rounded-2xl shadow-lg border border-slate-800/80"
          />
        </div>

        {/* Usage note */}
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          Designed for truck cab doors and tanker tailgates. Homeowners and contractors on job sites can scan to book service directly.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <a
            href={decalPng}
            download={`${slug}-truck-decal.png`}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download 300 DPI Decal (PNG)
          </a>

          <a
            href={decalSvg}
            download={`${slug}-truck-decal.svg`}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700/80 font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Download Print-Shop Vector (SVG)
          </a>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href={`/${slug}`}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span> Back to {lead.name} Showcase
          </Link>
        </div>

      </div>
    </div>
  )
}
