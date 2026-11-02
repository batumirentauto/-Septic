'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Smartphone,
  Clock,
  Eye,
  MousePointerClick,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Zap,
  Calendar,
  Layers,
  QrCode
} from 'lucide-react'

interface RadarEventItem {
  type: string
  label?: string
  at: string
}

interface SingleVisitRecord {
  sessionId: string
  visitNumber: number
  firstSeenAt: string
  lastSeenAt: string
  durationSec: number
  maxScrollPct: number
  device: string
  screen: string
  photoClicks: number
  ctaClicks: number
  calculatorClicks: number
  events: RadarEventItem[]
}

interface ContractorCard {
  slug: string
  companyName: string
  ownerName: string
  city: string
  state: string
  phone: string
  isOwnerTest: boolean
  isUsVisitor: boolean
  totalVisits: number
  totalDurationSec: number
  maxScrollPct: number
  firstSeenAt: string
  lastSeenAt: string
  leadScore: 'HOT' | 'WARM' | 'PEEK'
  leadScoreLabel: string
  insight: string
  devices: string[]
  visits: SingleVisitRecord[]
}

interface RadarSummary {
  totalContractors: number
  totalSessions: number
  avgDurationSec: number
  avgScrollPct: number
  mobileSessions: number
  totalAllIncludingTests: number
}

export default function RadarStatsPage() {
  const [contractors, setContractors] = useState<ContractorCard[]>([])
  const [summary, setSummary] = useState<RadarSummary>({
    totalContractors: 0,
    totalSessions: 0,
    avgDurationSec: 0,
    avgScrollPct: 0,
    mobileSessions: 0,
    totalAllIncludingTests: 0
  })
  const [includeTests, setIncludeTests] = useState<boolean>(true) // default to true so user sees their tests immediately
  const [activeTab, setActiveTab] = useState<'all' | 'us' | 'repeats' | 'hot'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const fetchRadar = async (showTests = includeTests) => {
    try {
      const res = await fetch(`/api/radar?includeTests=${showTests ? '1' : '0'}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data && data.ok) {
        setContractors(data.contractors || [])
        setSummary(data.summary)
        setLastUpdated(new Date().toLocaleTimeString('ru-RU'))
      }
    } catch {
      // ignore fetch error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRadar(includeTests)
    const timer = window.setInterval(() => {
      fetchRadar(includeTests)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [includeTests])

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug]
    }))
  }

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec} сек`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return s > 0 ? `${m} мин ${s} сек` : `${m} мин`
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    // Format in local Russian locale
    const localStr = d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
    // Format US EST time
    const usStr = d.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return { localStr, usStr }
  }

  const formatRelativeTime = (iso: string) => {
    const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
    if (diffSec < 25) return '🟢 ПРЯМО СЕЙЧАС НА САЙТЕ'
    if (diffSec < 60) return `${diffSec} сек назад`
    const min = Math.floor(diffSec / 60)
    if (min < 60) return `${min} мин назад`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} ч назад`
    const days = Math.floor(hr / 24)
    return `${days} дн назад`
  }

  const copyFollowUp = (c: ContractorCard) => {
    const firstName =
      c.ownerName && !c.ownerName.toLowerCase().includes('owner')
        ? c.ownerName.split(' ')[0].replace(/[^a-zA-Z]/g, '')
        : ''
    const greeting = firstName ? `Hey ${firstName},` : `Hey there,`
    let text = `${greeting} saw you checking out the mobile showcase — did the equipment photos and pricing estimator come through clearly on your phone?`
    if (c.totalVisits >= 2) {
      text = `${greeting} noticed you checked back into the showcase — let me know if you want me to tweak any of the service areas or rates before we lock it in!`
    }
    navigator.clipboard.writeText(text)
    setCopiedSlug(c.slug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  // Filter contractors
  const filteredContractors = contractors.filter((c) => {
    if (activeTab === 'us' && c.isOwnerTest) return false
    if (activeTab === 'repeats' && c.totalVisits < 2) return false
    if (activeTab === 'hot' && c.leadScore !== 'HOT') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = c.companyName.toLowerCase().includes(q)
      const matchOwner = c.ownerName.toLowerCase().includes(q)
      const matchCity = c.city.toLowerCase().includes(q)
      const matchPhone = c.phone.toLowerCase().includes(q)
      return matchName || matchOwner || matchCity || matchPhone
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ЖИВОЙ РАДАР ВИТРИН (ONLINE COMMAND CENTER)
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Статистика посещений и вовлеченности
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Точные даты заходов, количество визитов каждого подрядчика, время изучения и готовые рекомендации
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={includeTests}
                  onChange={(e) => setIncludeTests(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 bg-slate-900"
                />
                <span>Показывать тестовые заходы (Тбилиси/Батуми)</span>
              </label>

              <button
                onClick={() => fetchRadar()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Обновлено: {lastUpdated || 'сейчас'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Подрядчиков открыло</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary.totalContractors}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">уникальных компаний</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Всего визитов (сессий)</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary.totalSessions}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">с повторными заходами</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Среднее время</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatDuration(summary.avgDurationSec)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">на одного посетителя</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Глубина скролла</span>
                <Smartphone className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary.avgScrollPct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">в среднем по витрине</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Все подрядчики ({contractors.length})
            </button>

            <button
              onClick={() => setActiveTab('hot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeTab === 'hot'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Горячие (HOT)
            </button>

            <button
              onClick={() => setActiveTab('repeats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeTab === 'repeats'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <RepeatIcon className="w-3.5 h-3.5" />
              Повторные заходы (2+ раза)
            </button>

            <button
              onClick={() => setActiveTab('us')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                activeTab === 'us'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              🇺🇸 Только клиенты из США
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по компании, имени, городу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Contractors List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-300">Загружаем данные радара...</div>
            </div>
          ) : filteredContractors.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <div className="text-base font-bold text-slate-300">Пока нет переходов по выбранному фильтру</div>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Включите чекбокс «Показывать тестовые заходы» в правом верхнем углу, чтобы увидеть ваши собственные визиты.
              </p>
            </div>
          ) : (
            filteredContractors.map((c) => {
              const isExpanded = !!expandedSlugs[c.slug]
              const latestTime = formatDateTime(c.lastSeenAt)
              const firstTime = formatDateTime(c.firstSeenAt)

              return (
                <div
                  key={c.slug}
                  className={`bg-slate-900/80 border rounded-2xl transition-all shadow-lg overflow-hidden ${
                    c.leadScore === 'HOT'
                      ? 'border-amber-500/40 shadow-amber-500/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Contractor Main Header Card */}
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Lead Identity */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Score Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              c.leadScore === 'HOT'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : c.leadScore === 'WARM'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {c.leadScore === 'HOT' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                            {c.leadScore === 'WARM' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                            {c.leadScoreLabel}
                          </span>

                          {/* Repeats Badge */}
                          {c.totalVisits >= 2 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              <RepeatIcon className="w-3 h-3" />
                              {c.totalVisits} визита на сайт!
                            </span>
                          )}

                          {/* Status Time */}
                          <span className="text-xs font-semibold text-emerald-400">
                            {formatRelativeTime(c.lastSeenAt)}
                          </span>

                          {/* Test indicator */}
                          {c.isOwnerTest && (
                            <span className="text-[11px] bg-slate-800/90 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                              Тестовый вход (Тбилиси/Батуми)
                            </span>
                          )}
                        </div>

                        {/* Company Name & Owner */}
                        <div className="flex flex-wrap items-baseline gap-2 pt-1">
                          <h2 className="text-xl font-extrabold text-white">
                            {c.companyName}
                          </h2>
                          <span className="text-sm font-semibold text-emerald-400">
                            ({c.ownerName})
                          </span>
                          <span className="text-xs text-slate-400">
                            • {c.city ? `${c.city}, ${c.state}` : c.state}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            • {c.phone}
                          </span>
                        </div>

                        {/* Exact Timestamps */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Последний заход: <strong className="text-slate-200">{latestTime.localStr}</strong> (в США: {latestTime.usStr} EST)</span>
                          </div>
                          {c.totalVisits > 1 && (
                            <span className="text-slate-500">
                              (Первый заход: {firstTime.localStr})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Key Stats Summary */}
                      <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        {/* Total Duration */}
                        <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 min-w-[120px] text-center">
                          <div className="text-[11px] text-slate-400">Суммарно на сайте</div>
                          <div
                            className={`text-lg font-black ${
                              c.totalDurationSec >= 30 ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {formatDuration(c.totalDurationSec)}
                          </div>
                        </div>

                        {/* Max Scroll */}
                        <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 min-w-[110px] text-center">
                          <div className="text-[11px] text-slate-400">Макс скролл</div>
                          <div className="text-lg font-black text-white">
                            {c.maxScrollPct}%
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyFollowUp(c)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20"
                            title="Скопировать готовый текст дожима в SMS/iMessage"
                          >
                            {copiedSlug === c.slug ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Скопировано!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Дожим в SMS</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/${c.slug}?notrack=1`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            title="Открыть витрину (?notrack=1)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Витрина</span>
                          </Link>

                          <Link
                            href={`/${c.slug}/qr`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                            title="Открыть QR-наклейку"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Actionable Insight Box (Какую информацию почерпнуть) */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                          Вывод и рекомендация для закрытия:
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {c.insight}
                        </p>
                      </div>
                    </div>

                    {/* Expand/Collapse Visit Timeline Button */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleExpand(c.slug)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Скрыть историю посещений</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Показать все заходы ({c.visits.length} визита) с таймлайном действий ▼</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Visit History Timeline */}
                  {isExpanded && (
                    <div className="bg-slate-950/90 border-t border-slate-800/80 p-5 space-y-3">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Хронология каждого визита (с точностью до секунды):
                      </div>

                      <div className="space-y-2.5">
                        {c.visits.map((v, idx) => {
                          const vTime = formatDateTime(v.firstSeenAt)
                          return (
                            <div
                              key={idx}
                              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                                    Визит #{v.visitNumber}
                                  </span>
                                  <span className="text-slate-300 font-semibold">
                                    {vTime.localStr}
                                  </span>
                                  <span className="text-slate-500">
                                    (в США: {vTime.usStr} EST)
                                  </span>
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    • {v.device} ({v.screen})
                                  </span>
                                </div>

                                {/* Events List */}
                                {v.events && v.events.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] text-slate-500">Действия:</span>
                                    {v.events.map((ev, eIdx) => (
                                      <span
                                        key={eIdx}
                                        className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                                      >
                                        {ev.label || ev.type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div>
                                  <span className="text-slate-400">Провел: </span>
                                  <strong className="text-emerald-400">{formatDuration(v.durationSec)}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Скролл: </span>
                                  <strong className="text-white">{v.maxScrollPct}%</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Клики: </span>
                                  <strong className="text-amber-400">
                                    {v.photoClicks + v.ctaClicks + v.calculatorClicks}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

function RepeatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}
