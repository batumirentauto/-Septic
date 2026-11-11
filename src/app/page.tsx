'use client'

import React, { useState, useMemo } from 'react'
import { septicLeads, SepticLead } from '../data/septicLeads'
import { StarRating } from '../components/StarRating'
import {
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
  AlertCircle,
  ChevronRight,
  Flame,
  Award,
  ExternalLink,
  Camera,
  CheckCircle2,
  SlidersHorizontal,
  Globe,
} from 'lucide-react'

export default function SepticCatalogPage() {
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState<string>('ALL')
  const [selectedPalette, setSelectedPalette] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'RATING' | 'REVIEWS' | 'NAME'>('RATING')

  // Calculate states count within the 108 leads
  const stateCounts = useMemo(() => {
    const countsMap: Record<string, number> = {}
    septicLeads.forEach((item) => {
      const st = item.state || 'Other'
      countsMap[st] = (countsMap[st] || 0) + 1
    })
    return countsMap
  }, [])

  const sortedStates = useMemo(() => {
    return Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([st]) => st)
  }, [stateCounts])

  // Palette counts
  const paletteCounts = useMemo(() => {
    const countsMap: Record<string, number> = {}
    septicLeads.forEach((item) => {
      const pal = item.palette || 'none'
      countsMap[pal] = (countsMap[pal] || 0) + 1
    })
    return countsMap
  }, [])

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result = septicLeads.filter((item) => {
      // State Filter
      if (selectedState !== 'ALL' && item.state !== selectedState) {
        return false
      }

      // Palette Filter
      if (selectedPalette !== 'ALL' && item.palette !== selectedPalette) {
        return false
      }

      // Search Query Filter
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.primaryFocus && item.primaryFocus.toLowerCase().includes(q)) ||
        (item.primaryFocusEn && item.primaryFocusEn.toLowerCase().includes(q))
      )
    })

    // Sort result
    if (sortBy === 'RATING') {
      result.sort((a, b) => b.rating - a.rating || (b.reviewCount || 0) - (a.reviewCount || 0))
    } else if (sortBy === 'REVIEWS') {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    } else if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [search, selectedState, selectedPalette, sortBy])

  // Helper for palette badges
  const paletteLabels: Record<string, { label: string; color: string; icon: string }> = {
    amber: { label: 'CAT Amber', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '🚜' },
    emerald: { label: 'Eco Emerald', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🌿' },
    blue: { label: 'Marine Blue', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '💧' },
    orange: { label: 'Fleet Orange', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '🏗️' },
    red: { label: 'Rapid Red', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: '🚨' },
    indigo: { label: 'Tech Indigo', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: '📐' },
    teal: { label: 'Clean Teal', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: '🌊' },
  }

  const layoutLabels: Record<string, string> = {
    split: 'Split 2-Col',
    centered: 'Centered Hero',
    industrial: 'Industrial Fleet',
    editorial: 'Editorial Review',
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[1000px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-transparent blur-[160px]" />
      </div>

      {/* Top Micro Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 py-3 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
              Каталог септических подрядчиков <span className="text-emerald-400 font-normal">| США</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden sm:inline font-mono text-xs">
              Всего в базе: <strong className="text-white">{septicLeads.length}</strong> (отфильтровано: <strong className="text-emerald-400">{filteredLeads.length}</strong>)
            </span>
            <a
              href="/call"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold transition text-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Звонилка CRM</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Header & Search Section */}
      <section className="relative pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>База сокращена строго до 108 проверенных компаний Gold Tier</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Каталог 108 проверенных подрядчиков: Монтаж, Экскавация и Ремонт
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
              Вся база очищена от низкочековых одиночек, сантехников и прочисток за $90. Здесь собраны только лицензированные компании с собственным парком техники, проверенные по отзывам Google Maps на монтаж септиков, замену емкостей, дренажные поля и экскавацию.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span>🏆 Gold Tier База</span>
                <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">$3K–$18K+</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {septicLeads.length} <span className="text-xs text-slate-400 font-normal">компаний</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Штаты США</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{sortedStates.length} штатов</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Дизайн-палитры</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">7 тем • 4 макета</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Рейтинг подрядчиков</div>
              <div className="text-2xl font-black text-amber-400 mt-1">4.6–5.0 ★ Google</div>
            </div>
          </div>

          {/* Search Bar & Sorting Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Поиск по названию, городу, штату (напр. Orlando, FL, TX, Tuscaloosa), услуге (Drain Field, Excavation)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 shadow-lg"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="RATING">По рейтингу (★ 5.0 → 4.6)</option>
                <option value="REVIEWS">По числу отзывов (по убыванию)</option>
                <option value="NAME">По названию (А → Я)</option>
              </select>
            </div>
          </div>

          {/* Palette Filter Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Фильтр по дизайн-палитре:</span>
              <span>7 стилей</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <button
                onClick={() => setSelectedPalette('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedPalette === 'ALL'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Все стили ({septicLeads.length})
              </button>

              {Object.entries(paletteLabels).map(([pKey, pInfo]) => (
                <button
                  key={pKey}
                  onClick={() => setSelectedPalette(pKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedPalette === pKey
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{pInfo.icon}</span>
                  <span>{pInfo.label}</span>
                  <span className="text-[10px] opacity-70 font-mono">({paletteCounts[pKey] || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* States Filter Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Фильтр по штату:</span>
              <span>{sortedStates.length} штатов</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <button
                onClick={() => setSelectedState('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  selectedState === 'ALL'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Все ({filteredLeads.length})
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
                  <span className="text-[10px] opacity-70 font-mono">({stateCounts[st]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Companies Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between pb-6 text-xs text-slate-400 border-b border-slate-800/60 mb-6">
          <div className="flex items-center gap-2">
            <span>Показано:</span>
            <strong className="text-white text-sm">{filteredLeads.length} компаний</strong>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
              🏆 100% High-Ticket (Монтаж / Дренаж / Экскавация)
            </span>
          </div>
          <div className="hidden sm:block text-slate-400 font-mono text-[11px]">
            Нажмите «🇷🇺 Русская версия» или «🇺🇸 English» для перехода
          </div>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((item) => {
              const cleanPhone = item.phone ? item.phone.replace(/[^\d+]/g, '') : ''
              const paletteInfo = item.palette && paletteLabels[item.palette]
                ? paletteLabels[item.palette]
                : { label: item.palette || 'Default', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: '🎨' }
              const layoutName = item.heroLayout ? layoutLabels[item.heroLayout] || item.heroLayout : 'Split'
              const hasRealPhotos = Boolean(item.heroImage || (item.equipmentPhotos && item.equipmentPhotos.some(e => e.image)))

              return (
                <div
                  key={item.slug}
                  className="rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 sm:p-6 flex flex-col justify-between space-y-4 transition shadow-lg group hover:border-amber-400 hover:shadow-amber-500/10 hover:scale-[1.01]"
                >
                  <div className="space-y-3">
                    {/* Top Row: Location & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.state} • {item.city || 'Metro Area'}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-black text-white">{item.rating.toFixed(1)}</span>
                        <StarRating rating={item.rating} starClassName="w-3.5 h-3.5" />
                        <span className="text-xs text-slate-400">({item.reviewCount})</span>
                      </div>
                    </div>

                    {/* Design Palette & Hero Layout Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${paletteInfo.color}`}>
                        <span>{paletteInfo.icon}</span>
                        <span>{paletteInfo.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <span>📐</span>
                        <span>{layoutName}</span>
                      </span>

                      {hasRealPhotos ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Camera className="w-3 h-3" />
                          <span>Фото</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800">
                          <span>Specs</span>
                        </span>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium">
                        {item.primaryFocus || item.primaryFocusEn || 'Septic System Installation & Excavation'}
                      </p>
                    </div>

                    {/* Ticket Range & Service Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-400 font-mono">{item.ticketRange || '$3K–$18K+'}</span>
                        <span className="text-slate-400 text-[11px]">Монтаж & Дренаж</span>
                      </div>
                      {item.reviewsSample && item.reviewsSample.length > 0 && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800/60">
                          &ldquo;{item.reviewsSample[0].text}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Phone & Address */}
                    <div className="text-xs text-slate-400 space-y-1 pt-1">
                      {cleanPhone && (
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      <div className="line-clamp-1 text-[11px] text-slate-500">📍 {item.address}</div>
                    </div>
                  </div>

                  {/* Dual-Language Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Russian Version Button */}
                      <a
                        href={`/${item.slug}/ru`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                        title="Открыть русскую версию лендинга"
                      >
                        <span>🇷🇺</span>
                        <span>Русская версия</span>
                      </a>

                      {/* English Original Version Button */}
                      <a
                        href={`/${item.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition hover:scale-[1.02] active:scale-[0.98]"
                        title="Открыть английскую версию лендинга (для клиента)"
                      >
                        <span>🇺🇸</span>
                        <span>English (US)</span>
                      </a>
                    </div>

                    {/* Google Maps Profile link */}
                    {item.mapsUrl && (
                      <div className="text-right">
                        <a
                          href={item.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition"
                        >
                          <span>Профиль в Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 space-y-3">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Компании не найдены</h3>
            <p className="text-xs text-slate-400">
              Попробуйте сбросить фильтры по штату или поисковому запросу.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedState('ALL')
                setSelectedPalette('ALL')
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>© {new Date().getFullYear()} US Septic Network. Каталог 108 проверенных подрядчиков Gold Tier по штатам США.</p>
        <p className="text-slate-600">Все 108 страниц доступны в двух версиях: оригинальный клиентский лендинг на английском и полный перевод на русский язык.</p>
      </footer>
    </div>
  )
}
