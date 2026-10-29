'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Smartphone,
  Monitor,
  Clock,
  Eye,
  MousePointerClick,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
  ArrowDownUp
} from 'lucide-react'

interface RadarEventItem {
  type: string
  label?: string
  at: string
}

interface VisitorSession {
  sessionId: string
  slug: string
  companyName: string
  ownerName: string
  city: string
  state: string
  phone: string
  device: 'iPhone' | 'iPad' | 'Android' | 'Mac' | 'Windows' | 'Other'
  userAgent: string
  ip: string
  referrer: string
  screen: string
  timezone: string
  language: string
  isUsVisitor: boolean
  isOwnerTest: boolean
  firstSeenAt: string
  lastSeenAt: string
  durationSec: number
  maxScrollPct: number
  photoClicks: number
  ctaClicks: number
  calculatorClicks: number
  events: RadarEventItem[]
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
  const [sessions, setSessions] = useState<VisitorSession[]>([])
  const [summary, setSummary] = useState<RadarSummary>({
    totalContractors: 0,
    totalSessions: 0,
    avgDurationSec: 0,
    avgScrollPct: 0,
    mobileSessions: 0,
    totalAllIncludingTests: 0
  })
  const [includeTests, setIncludeTests] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchRadar = async (showTests = includeTests) => {
    try {
      const res = await fetch(`/api/radar?includeTests=${showTests ? '1' : '0'}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data && data.ok) {
        setSessions(data.sessions || [])
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
    }, 5000)
    return () => window.clearInterval(timer)
  }, [includeTests])

  const clearTests = async () => {
    await fetch('/api/radar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_tests' })
    })
    fetchRadar(includeTests)
  }

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec} сек`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m} мин ${s} сек`
  }

  const formatTimeAgo = (iso: string) => {
    const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
    if (diffSec < 20) return '🟢 СЕЙЧАС НА САЙТЕ'
    if (diffSec < 60) return `${diffSec} сек назад`
    const min = Math.floor(diffSec / 60)
    if (min < 60) return `${min} мин назад`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} ч ${min % 60} мин назад`
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyFollowUp = (s: VisitorSession) => {
    const firstName =
      s.ownerName && !s.ownerName.toLowerCase().includes('owner')
        ? s.ownerName.split(' ')[0].replace(/[^a-zA-Z]/g, '')
        : ''
    const greeting = firstName ? `Hey ${firstName},` : `Hey there,`
    const text = `${greeting} saw the preview link loaded on your end — did the photos and layout come through okay on your phone?`
    navigator.clipboard.writeText(text)
    setCopiedId(s.sessionId)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ЖИВОЙ РАДАР ПРОСМОТРОВ (316 ВИТРИН)
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Статистика открытий витрин подрядчиками США
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Отсекает роботов iMessage/Facebook и русские превью (`/ru`). Записывает только живых людей, их устройство, время чтения и глубину скролла.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIncludeTests(!includeTests)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                includeTests
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {includeTests
                ? `Скрыть мои тесты (Всего записей: ${summary.totalAllIncludingTests})`
                : `Показать мои тесты (${Math.max(0, summary.totalAllIncludingTests - summary.totalSessions)})`}
            </button>

            {includeTests && (
              <button
                onClick={clearTests}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить тесты
              </button>
            )}

            <button
              onClick={() => fetchRadar(includeTests)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Обновить ({lastUpdated || '...'})
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Компаний открыло</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {summary.totalContractors}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Уникальных витрин</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Живых визитов</span>
              <Eye className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {summary.totalSessions}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Без учёта ботов iMessage</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Среднее время</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {formatDuration(summary.avgDurationSec)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Активного изучения</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Средний скролл</span>
              <ArrowDownUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {summary.avgScrollPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Просмотр страницы вниз</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>С телефона (iPhone/Android)</span>
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {summary.mobileSessions}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Переходы из SMS/iMessage</div>
          </div>
        </div>

        {/* Sessions Table / Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-lg text-white">
                Лента просмотров в реальном времени
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Автообновление каждые 5 секунд
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Загрузка данных радара...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="text-lg font-semibold text-slate-300">
                Пока нет зафиксированных визитов подрядчиков США
              </div>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Как только любой из подрядчиков нажмёт на ссылку в iMessage / SMS и откроет свою витрину, он мгновенно появится здесь и в вашем терминале на MacBook.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {sessions.map((s) => {
                const statusLabel = formatTimeAgo(s.lastSeenAt)
                const isOnline = statusLabel.includes('СЕЙЧАС')

                return (
                  <div
                    key={s.sessionId}
                    className={`p-5 transition ${
                      isOnline ? 'bg-emerald-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Company & Contractor Info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOnline
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {statusLabel}
                          </span>

                          {s.isOwnerTest ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🧪 Ваш тестовый вход ({s.timezone || s.language})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              🇺🇸 Подрядчик США ({s.timezone || 'US'})
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                            {s.device === 'iPhone' || s.device === 'Android' || s.device === 'iPad' ? (
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            {s.device} {s.screen ? `(${s.screen})` : ''}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <h3 className="text-lg font-bold text-white">{s.companyName}</h3>
                          <span className="text-sm text-emerald-400 font-medium">
                            👤 {s.ownerName}
                          </span>
                          <span className="text-sm text-slate-400">
                            📍 {s.city}, {s.state}
                          </span>
                          {s.phone && (
                            <span className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              📞 {s.phone}
                            </span>
                          )}
                        </div>

                        {/* Recent Actions Log */}
                        {s.events && s.events.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {s.events.slice(-4).map((ev, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                              >
                                {ev.label || ev.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Metrics & Quick Actions */}
                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[110px]">
                          <div className="text-[11px] text-slate-400">Время на сайте</div>
                          <div
                            className={`text-base font-extrabold ${
                              s.durationSec >= 20 ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {formatDuration(s.durationSec)}
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[120px]">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Скролл</span>
                            <span className="font-bold text-white">{s.maxScrollPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all"
                              style={{ width: `${s.maxScrollPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                          <div className="text-[11px] text-slate-400">Клики (Фото / Кнопки)</div>
                          <div className="text-base font-extrabold text-white flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-amber-400" />
                            <span>
                              {s.photoClicks + s.ctaClicks + s.calculatorClicks} (📷 {s.photoClicks} / 📞{' '}
                              {s.ctaClicks + s.calculatorClicks})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyFollowUp(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition"
                            title="Скопировать сообщение для iMessage"
                          >
                            {copiedId === s.sessionId ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Скопировано!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Дожим в iMessage
                              </>
                            )}
                          </button>

                          <Link
                            href={`/${s.slug}?notrack=1`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                            title="Открыть витрину без записи в статистику (?notrack=1)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Витрина
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
