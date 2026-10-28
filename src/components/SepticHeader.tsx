'use client'

import React, { useState } from 'react'
import { SepticLead } from '../data/septicLeads'
import { StarRating } from './StarRating'
import {
  Phone,
  ArrowLeft,
  Globe,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Wrench,
  Calculator,
  Camera,
  Star,
  Truck,
} from 'lucide-react'

interface SepticHeaderProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticHeader({ lead, isRu = false }: SepticHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''
  const enUrl = `/${lead.slug}`
  const ruUrl = `/${lead.slug}/ru`

  const navLinks = [
    { label: isRu ? 'Услуги' : 'Services', href: '#services', icon: Wrench },
    { label: isRu ? 'Спецтехника' : 'Equipment', href: '#equipment', icon: Truck },
    { label: isRu ? 'Объекты' : 'Gallery', href: '#gallery', icon: Camera },
    { label: isRu ? 'Калькулятор' : 'Estimator', href: '#calculator', icon: Calculator },
    { label: isRu ? 'Отзывы' : 'Reviews', href: '#reviews', icon: Star },
    { label: isRu ? 'Зона выезда' : 'Service Area', href: '#coverage', icon: MapPin },
  ]

  const rawFocus = lead.primaryFocus || ''
  const cleanFocus = rawFocus.replace(/\s*\([a-zA-Z\s]+\)/g, '').trim()

  const serviceTagline = isRu
    ? (cleanFocus ? `${cleanFocus} • Земляные работы` : 'Монтаж, ремонт септиков и земляные работы')
    : (cleanFocus ? `${cleanFocus} & Precision Excavation` : 'Septic Installation, Drain Field Restoration & Excavation')

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl transition-all">
      {/* 1. Top Micro Bar: Status, Google Maps Rating, Back Button, Language */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 text-xs py-1.5 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          
          {/* Left: Back to directory + Active Status */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition text-[11px] border border-slate-700/80 shrink-0"
              title={isRu ? 'Вернуться в каталог всех бригад' : 'Back to all crews'}
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">{isRu ? 'Все бригады' : 'All Crews'}</span>
              <span className="sm:hidden">{isRu ? 'Каталог' : 'All'}</span>
            </a>

            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-400 text-[11px] sm:text-xs tracking-wide uppercase truncate">
                {isRu ? 'Дежурные мастера на линии 24/7' : '24/7 Priority Emergency Dispatch'}
              </span>
              <span className="text-slate-700 hidden md:inline shrink-0">•</span>
              <span className="text-slate-400 hidden lg:inline text-[11px] truncate">
                {lead.city ? `${lead.city}, ${lead.state}` : lead.state} (выезд 45–60 мин)
              </span>
            </div>
          </div>

          {/* Right: Google Maps Profile Link & Language Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {lead.mapsUrl && (
              <a
                href={lead.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-400 transition shrink-0 group"
                title="Google Maps Verified Profile"
              >
                <span className="font-bold text-white text-xs flex items-center gap-1">
                  <span className="text-emerald-400 font-extrabold">{lead.rating.toFixed(1)}</span>
                  <span className="text-amber-400">★</span>
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline group-hover:text-slate-200 transition">
                  ({lead.reviewCount || lead.reviewsCount} {isRu ? 'отзывов' : 'reviews'})
                </span>
              </a>
            )}

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-[11px] font-bold bg-slate-900 border border-slate-700/80 rounded-md p-0.5">
              <Globe className="w-3 h-3 text-slate-400 ml-1 hidden xs:inline" />
              <a
                href={enUrl}
                className={`px-1.5 py-0.5 rounded transition ${
                  !isRu
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </a>
              <a
                href={ruUrl}
                className={`px-1.5 py-0.5 rounded transition ${
                  isRu
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RU
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Row: Brand Logo, Nav Links, Call Button, Mobile Toggle */}
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Brand identity */}
        <a href="#hero" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 pr-2">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10 shrink-0 group-hover:border-emerald-400 transition-colors">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate">
              {lead.name}
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block truncate max-w-xs lg:max-w-md">
              {serviceTagline}
            </p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action: Phone Button & Quick Estimate */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-slate-950 shrink-0 fill-current" />
              <span>{lead.phone}</span>
            </a>
          )}

          <a
            href="#calculator"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-3 py-2 text-xs border border-slate-700 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRu ? 'Смета' : 'Estimate'}</span>
          </a>

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 shrink-0 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/98 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-sm font-semibold text-slate-200 hover:text-emerald-400 hover:border-slate-700 transition"
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 text-sm shadow-md"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>{lead.phone}</span>
              </a>
            )}
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 text-xs border border-slate-700"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isRu ? 'Рассчитать смету онлайн' : 'Instant 10-Second Estimator'}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
