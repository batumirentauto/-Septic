'use client'

import React, { useState, useMemo } from 'react'
import { septicLeads, SepticLead } from '../data/septicLeads'
import { StarRating } from '../components/StarRating'
import {
  Search,
  MapPin,
  Phone,
  ExternalLink,
  ShieldCheck,
  Wrench,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react'

export default function SepticCatalogPage() {
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState<string>('ALL')
  const [selectedIssue, setSelectedIssue] = useState<string>('ALL')

  // Calculate states count
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    septicLeads.forEach((item) => {
      const st = item.state || 'Other'
      counts[st] = (counts[st] || 0) + 1
    })
    return counts
  }, [])

  const sortedStates = useMemo(() => {
    return Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([st]) => st)
  }, [stateCounts])

  // Filtered leads
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return septicLeads.filter((item) => {
      // State filter
      if (selectedState !== 'ALL' && item.state !== selectedState) {
        return false
      }
      // Issue filter
      if (selectedIssue !== 'ALL') {
        if (selectedIssue === 'NO_WEBSITE' && item.hasWebsite) return false
        if (selectedIssue === 'FACEBOOK' && !item.websiteIssue.includes('Facebook')) return false
        if (selectedIssue === 'BROKEN' && (!item.hasWebsite || item.websiteIssue.includes('Facebook'))) return false
      }
      // Search filter
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.websiteIssue.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      )
    })
  }, [search, selectedState, selectedIssue])

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[1000px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent blur-[160px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-white text-sm tracking-tight">
              US Septic Pro <span className="text-emerald-400 font-normal">| Directory</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden sm:inline font-mono">
              <strong className="text-white">{filteredLeads.length}</strong> / {septicLeads.length} Leads
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              4.6 – 5.0★ Verified
            </span>
          </div>
        </div>
      </header>

      {/* Hero Header & Search Section */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>National Qualified Lead Database (597 Contractors)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              US Septic Repair & Drain Field Network
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
              Comprehensive showcase portal of vetted septic service companies across 49 states. Filtered strictly to 4.6–5.0★ Google ratings with broken websites, Facebook-only pages, or no existing website.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Total Qualified Leads</div>
              <div className="text-2xl font-black text-white mt-1">597</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">States Covered</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">49 States</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Photos Harvested</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">1,883</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Verified Reviews</div>
              <div className="text-2xl font-black text-amber-400 mt-1">2,930</div>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 mt-1" />
            <input
              type="text"
              placeholder="Search by company name, city, state (e.g. TX, Orlando, Houston), phone number, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xl"
            />
          </div>

          {/* Issue Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Filter by Status:</span>
            {[
              { id: 'ALL', label: 'All Leads' },
              { id: 'NO_WEBSITE', label: 'No Website in Google' },
              { id: 'BROKEN', label: 'Broken / Inaccessible Site' },
              { id: 'FACEBOOK', label: 'Facebook Page Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedIssue(f.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  selectedIssue === f.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* States Horizontal Scroll Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Filter by State:</span>
              <span>{sortedStates.length} States</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <button
                onClick={() => setSelectedState('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  selectedState === 'ALL'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ALL ({septicLeads.length})
              </button>

              {sortedStates.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    selectedState === st
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[10px] opacity-70">({stateCounts[st]})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Main Grid of Companies */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((item) => {
              const cleanPhone = item.phone ? item.phone.replace(/[^\d+]/g, '') : ''
              return (
                <div
                  key={item.slug}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition shadow-lg group hover:shadow-emerald-500/5"
                >
                  <div className="space-y-3.5">
                    
                    {/* Top Row: Location & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <MapPin className="w-3 h-3" />
                        {item.state} • {item.city || 'Metro Area'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{item.rating.toFixed(1)}</span>
                        <StarRating rating={item.rating} starClassName="w-3.5 h-3.5" />
                        <span className="text-xs text-slate-400">({item.reviewCount})</span>
                      </div>
                    </div>

                    {/* Company Name */}
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                      <a href={`/${item.slug}`} className="hover:underline">
                        {item.name}
                      </a>
                    </h3>

                    {/* Address & Hours */}
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="line-clamp-1">📍 {item.address}</div>
                      <div className="line-clamp-1">🕒 {item.hours}</div>
                    </div>

                    {/* Website Issue Tag */}
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.websiteIssue}</span>
                      </span>
                    </div>

                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    {cleanPhone ? (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.phone}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">Phone upon inquiry</span>
                    )}

                    <a
                      href={`/${item.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition group-hover:scale-[1.02]"
                    >
                      <span>View Showcase</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 space-y-3">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No matching septic leads found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query, state filter, or website status criteria.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedState('ALL')
                setSelectedIssue('ALL')
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} US Septic Pro Network. 597 Verified Leads Across 49 States.</p>
      </footer>

    </div>
  )
}
