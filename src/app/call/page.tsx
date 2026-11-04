'use client'

import React, { useState, useEffect } from 'react'
import rawCallLeads from '../../data/callLeads.json'

interface CallLead {
  slug: string
  company: string
  owner: string
  phone: string
  city: string
  state: string
  rating: number
  reviewCount: number
  hookAuthor: string
  hookText: string
}

type CallStatus = 'AGREED' | 'CALLBACK' | 'NO_ANSWER' | 'DECLINED' | 'WRONG_NUMBER' | 'UNTOUCHED'

export default function CallDispatcherPage() {
  const leads: CallLead[] = rawCallLeads as CallLead[]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<CallStatus | null>(null)
  const [note, setNote] = useState('')
  const [loggedCalls, setLoggedCalls] = useState<Record<string, { status: CallStatus; note: string }>>({})
  const [stats, setStats] = useState({ total: 0, agreed: 0, callback: 0, noAnswer: 0, declined: 0, wrongNumber: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [copiedHook, setCopiedHook] = useState(false)

  // Fetch logged calls on load
  useEffect(() => {
    fetch('/api/calls')
      .then((res) => res.json())
      .then((data) => {
        if (data.calls) {
          setLoggedCalls(data.calls)
          setStats(data.stats || stats)

          // Find first uncalled lead
          const firstUncalled = leads.findIndex((l) => !data.calls[l.phone])
          if (firstUncalled !== -1) {
            setCurrentIndex(firstUncalled)
          }
        }
      })
      .catch((err) => console.error('Failed to load call log:', err))
  }, [])

  const currentLead: CallLead | undefined = leads[currentIndex]

  // Sync state when index changes
  useEffect(() => {
    if (currentLead && loggedCalls[currentLead.phone]) {
      setSelectedStatus(loggedCalls[currentLead.phone].status)
      setNote(loggedCalls[currentLead.phone].note || '')
    } else {
      setSelectedStatus(null)
      setNote('')
    }
    setCopiedHook(false)
  }, [currentIndex, loggedCalls])

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">🎉 Все контакты обработаны!</h1>
          <p className="text-slate-400">Все 80 подрядчиков обзвонены.</p>
        </div>
      </div>
    )
  }

  const cleanPhone = currentLead.phone.replace(/[^0-9+]/g, '')
  const telHref = `tel:${cleanPhone}`

  // Message 2 / Showcase link SMS
  const smsBody = encodeURIComponent(
    `Here's the showcase for ${currentLead.company}: https://zonus.co/${currentLead.slug}\n\nTake 30 sec on your phone — does everything look accurate?`
  )
  const smsHref = `sms:${cleanPhone}&body=${smsBody}`

  const showcaseUrl = `https://zonus.co/${currentLead.slug}`

  // Hook speech helper in Russian/English
  const hookSpeechRu = currentLead.hookAuthor
    ? `«Привет, ${currentLead.owner || 'мужики'}! Увидел вашу работу в г. ${currentLead.city} и отзыв от ${currentLead.hookAuthor} — отличная работа!»`
    : `«Привет, ${currentLead.owner || 'мужики'}! Увидел ваши 5-звездочные отзывы в г. ${currentLead.city} — мощная репутация!»`

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookSpeechRu)
    setCopiedHook(true)
    setTimeout(() => setCopiedHook(false), 2000)
  }

  const handleSaveAndNext = async (statusOverride?: CallStatus) => {
    const finalStatus = statusOverride || selectedStatus
    if (!finalStatus) {
      alert('Выберите результат звонка (Согласился, Не ответил, Отказ и т.д.)')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentLead.phone,
          slug: currentLead.slug,
          company: currentLead.company,
          status: finalStatus,
          note: note.trim(),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setLoggedCalls((prev) => ({
          ...prev,
          [currentLead.phone]: { status: finalStatus, note: note.trim() },
        }))
        if (data.stats) setStats(data.stats)

        // Move to next
        if (currentIndex < leads.length - 1) {
          setCurrentIndex(currentIndex + 1)
        }
      }
    } catch (err) {
      console.error('Error saving call:', err)
      alert('Ошибка при сохранении статуса звонка')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* Top sticky progress header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Call Dispatcher CRM
            </div>
            <div className="text-sm font-bold text-white">
              Контакт #{currentIndex + 1} <span className="text-slate-400 font-normal">из {leads.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="bg-emerald-950 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded font-mono">
              🟢 {stats.agreed}
            </span>
            <span className="bg-amber-950 border border-amber-800/80 text-amber-300 px-2 py-0.5 rounded font-mono">
              🟡 {stats.callback}
            </span>
            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
              ⚪ {stats.noAnswer}
            </span>
            <span className="bg-rose-950 border border-rose-800/80 text-rose-300 px-2 py-0.5 rounded font-mono">
              🔴 {stats.declined}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / leads.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Call Card */}
      <main className="max-w-md w-full mx-auto p-4 flex-1 flex flex-col gap-4">
        {/* Company Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{currentLead.company}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <span>📍 {currentLead.city}, {currentLead.state}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">⭐ {currentLead.rating}</span>
                <span className="text-slate-500">({currentLead.reviewCount})</span>
              </div>
            </div>

            {currentLead.owner && (
              <span className="bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
                👤 {currentLead.owner}
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-slate-300">{cleanPhone}</span>
            <a
              href={showcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
            >
              👁 Открыть витрину ↗
            </a>
          </div>
        </div>

        {/* Cheat Sheet / Hook Box */}
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>🔥 Факт для зацепки (Первые 5 сек)</span>
            <button
              onClick={handleCopyHook}
              className="text-[10px] bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded transition"
            >
              {copiedHook ? '✓ Скопировано' : 'Копировать'}
            </button>
          </div>

          <div className="mt-2 text-sm text-slate-200 leading-snug">
            {hookSpeechRu}
          </div>

          {currentLead.hookText && (
            <div className="mt-2 pt-2 border-t border-emerald-900/50 text-[11px] text-emerald-300/80 italic">
              «{currentLead.hookText}»
              {currentLead.hookAuthor && <span className="font-semibold not-italic text-emerald-400"> — {currentLead.hookAuthor}</span>}
            </div>
          )}
        </div>

        {/* Primary Call & SMS Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={telHref}
            className="flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-base py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/50 active:scale-95 transition"
          >
            <span className="text-xl">📞</span>
            <span>Позвонить</span>
          </a>

          <a
            href={smsHref}
            className="flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-slate-950 font-black text-base py-3.5 px-4 rounded-xl shadow-lg shadow-sky-950/50 active:scale-95 transition"
          >
            <span className="text-xl">💬</span>
            <span>Скинуть SMS</span>
          </a>
        </div>

        {/* Call Result Selection (Single Tap) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Результат звонка:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedStatus('AGREED')}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                selectedStatus === 'AGREED'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>🟢</span>
              <div>
                <div>Согласился</div>
                <div className="text-[10px] opacity-75 font-normal">Ссылка отправлена</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus('CALLBACK')}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                selectedStatus === 'AGREED'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                  : selectedStatus === 'CALLBACK'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>🟡</span>
              <div>
                <div>Перезвонить</div>
                <div className="text-[10px] opacity-75 font-normal">Занят / позже</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus('NO_ANSWER')}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                selectedStatus === 'NO_ANSWER'
                  ? 'bg-slate-600 border-slate-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>⚪</span>
              <div>
                <div>Не ответил</div>
                <div className="text-[10px] opacity-75 font-normal">Гудки / автоответ</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus('DECLINED')}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                selectedStatus === 'DECLINED'
                  ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>🔴</span>
              <div>
                <div>Отказ</div>
                <div className="text-[10px] opacity-75 font-normal">Не нужно / нет</div>
              </div>
            </button>
          </div>

          <div className="mt-2">
            <button
              onClick={() => setSelectedStatus('WRONG_NUMBER')}
              className={`w-full p-2 rounded-xl text-center border text-[11px] font-medium transition ${
                selectedStatus === 'WRONG_NUMBER'
                  ? 'bg-purple-900 border-purple-500 text-purple-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:text-slate-400'
              }`}
            >
              🚫 Неверный номер / не в бизнесе
            </button>
          </div>

          {/* Note Input */}
          <div className="mt-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Короткая заметка (напр. 'перезвонить в 17:00')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Big Save & Next Button */}
        <button
          onClick={() => handleSaveAndNext()}
          disabled={isSaving || !selectedStatus}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition ${
            selectedStatus
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer active:scale-98'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Сохранение...' : '💾 Сохранить и следующий контакт ➔'}
        </button>

        {/* Manual prev/next navigation footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="hover:text-slate-300 disabled:opacity-30 p-2"
          >
            ← Предыдущий
          </button>
          <span>{currentIndex + 1} / {leads.length}</span>
          <button
            onClick={() => setCurrentIndex(Math.min(leads.length - 1, currentIndex + 1))}
            disabled={currentIndex === leads.length - 1}
            className="hover:text-slate-300 disabled:opacity-30 p-2"
          >
            Пропустить →
          </button>
        </div>
      </main>
    </div>
  )
}
