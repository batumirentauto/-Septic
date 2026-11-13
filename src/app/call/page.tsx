'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
  palette?: string
}

type CallStatus = 'AGREED' | 'CALLBACK' | 'NO_ANSWER' | 'DECLINED' | 'WRONG_NUMBER' | 'UNTOUCHED'

interface ManagerConfig {
  id: string
  name: string
  nameRu: string
  startIndex: number
  endIndex: number
  leadCount: number
}

const MANAGERS: Record<string, ManagerConfig> = {
  dinara: {
    id: 'dinara',
    name: 'Dinara',
    nameRu: 'Динара (Менеджер 1)',
    startIndex: 0,
    endIndex: 35,
    leadCount: 35,
  },
  tatyana: {
    id: 'tatyana',
    name: 'Tatyana',
    nameRu: 'Татьяна (Менеджер 2)',
    startIndex: 35,
    endIndex: 70,
    leadCount: 35,
  },
  jane: {
    id: 'jane',
    name: 'Jane',
    nameRu: 'Jane (Менеджер 3)',
    startIndex: 70,
    endIndex: 105,
    leadCount: 35,
  },
  all: {
    id: 'all',
    name: 'All Leads',
    nameRu: 'Все контакты (108)',
    startIndex: 0,
    endIndex: rawCallLeads.length,
    leadCount: rawCallLeads.length,
  },
}

function CallDispatcherContent() {
  const searchParams = useSearchParams()
  const initialManagerParam = (searchParams.get('manager') || searchParams.get('m') || 'dinara').toLowerCase()
  const initialManagerKey = MANAGERS[initialManagerParam] ? initialManagerParam : 'dinara'

  const [activeManager, setActiveManager] = useState<string>(initialManagerKey)
  const [lang, setLang] = useState<'EN' | 'RU'>('EN')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<CallStatus | null>(null)
  const [note, setNote] = useState('')
  const [loggedCalls, setLoggedCalls] = useState<
    Record<string, { status: CallStatus; note: string; slug?: string; company?: string; manager?: string; updatedAt?: string }>
  >({})
  const [stats, setStats] = useState({ total: 0, agreed: 0, callback: 0, noAnswer: 0, declined: 0, wrongNumber: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'CALL1' | 'SMS' | 'CALL2' | 'OBJECTIONS'>('CALL1')
  const [activeObjection, setActiveObjection] = useState<string | null>(null)

  const managerCfg = MANAGERS[activeManager] || MANAGERS.dinara
  const managerLeads: CallLead[] = useMemo(() => {
    return (rawCallLeads as CallLead[]).slice(managerCfg.startIndex, managerCfg.endIndex)
  }, [managerCfg])

  const storageKey = `call_crm_${activeManager}_v3`

  // Fetch logged calls on load & merge with localStorage
  useEffect(() => {
    let localCalls: Record<string, any> = {}
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) localCalls = JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to read localStorage:', e)
    }

    fetch('/api/calls')
      .then((res) => res.json())
      .then((data) => {
        const serverCalls = data.calls || {}
        const merged = { ...serverCalls, ...localCalls }
        setLoggedCalls(merged)

        // Calculate stats for current manager subset
        let mgrStats = { total: 0, agreed: 0, callback: 0, noAnswer: 0, declined: 0, wrongNumber: 0 }
        for (const lead of managerLeads) {
          const item = merged[lead.phone]
          if (item) {
            mgrStats.total++
            if (item.status === 'AGREED') mgrStats.agreed++
            else if (item.status === 'CALLBACK') mgrStats.callback++
            else if (item.status === 'NO_ANSWER') mgrStats.noAnswer++
            else if (item.status === 'DECLINED') mgrStats.declined++
            else if (item.status === 'WRONG_NUMBER') mgrStats.wrongNumber++
          }
        }
        setStats(mgrStats)

        // Auto-navigate to first uncalled lead
        const firstUncalled = managerLeads.findIndex((l) => !merged[l.phone])
        if (firstUncalled !== -1) {
          setCurrentIndex(firstUncalled)
        }
      })
      .catch((err) => {
        console.error('Failed to load call log from server:', err)
        if (Object.keys(localCalls).length > 0) {
          setLoggedCalls(localCalls)
        }
      })
  }, [activeManager, managerLeads, storageKey])

  const currentLead: CallLead | undefined = managerLeads[currentIndex]

  // Sync state when index changes
  useEffect(() => {
    if (currentLead && loggedCalls[currentLead.phone]) {
      setSelectedStatus(loggedCalls[currentLead.phone].status)
      setNote(loggedCalls[currentLead.phone].note || '')
    } else {
      setSelectedStatus(null)
      setNote('')
    }
    setCopiedField(null)
  }, [currentIndex, currentLead, loggedCalls])

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2200)
  }

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-black mb-2">{lang === 'EN' ? 'All Leads Completed!' : 'Все контакты обработаны!'}</h1>
          <p className="text-slate-400 text-sm mb-4">
            {lang === 'EN'
              ? `You have reached the end of the 35 leads assigned to ${managerCfg.name}.`
              : `Вы завершили прозвон 35 контактов, назначенных менеджеру ${managerCfg.nameRu}.`}
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            {lang === 'EN' ? 'Review from #1' : 'Вернуться к контакту №1'}
          </button>
        </div>
      </div>
    )
  }

  const cleanPhone = currentLead.phone.replace(/[^0-9+]/g, '')
  const telHref = `tel:${cleanPhone}`
  const sipHref = `sip:${cleanPhone}`
  const showcaseUrl = `https://zonus.co/${currentLead.slug}`
  const callerName = managerCfg.name

  // Adapted Dynamic Scripts
  const hookScriptEn = `“Hey ${currentLead.owner ? currentLead.owner : currentLead.company}, this is ${callerName}. Quick call — we actually put together a custom website specifically for ${currentLead.company}.\n\nIt already has your real customer reviews, your phone number, and your exact services.\n\nWanted to text you the link so you can double-check if we got all your details right, and see if you have any photos of your trucks or crew you'd want added in. Is this cell good to text?”`

  const hookScriptRu = `«Здравствуйте, ${currentLead.owner ? currentLead.owner : currentLead.company}, это ${callerName}. Буквально на секунду — мы собрали готовый сайт специально под ${currentLead.company}.\n\nТам уже стоят ваши реальные отзывы клиентов, ваш прямой телефон и точный список услуг.\n\nХочу скинуть ссылку в смс, чтобы вы проверили, всё ли мы указали правильно, и если у вас есть фото ваших траков или бригады — мы их сразу добавим. Сюда можно скинуть ссылку?»`

  const exitScriptEn = `Caller: “Got it, sending it over right now. Take a quick look tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30 to see what you think. Sound good?”\nOwner: “Sounds good.”\nCaller: “Appreciate it, ${currentLead.owner || 'sir'}. Talk to you tomorrow morning!” [HANG UP]`

  // Separated SMS Templates (For Rich Preview Generation in iMessage/Android)
  const smsIntroText = `Hey ${currentLead.owner || 'there'}, ${callerName} here! Here's the custom page we put together for ${currentLead.company}:`
  const smsLinkText = showcaseUrl
  const smsActionText = `Take a quick scroll tonight to make sure we got your services and contact info right. If you have any truck or crew photos you want added, we can plug them right in! I'll give you a quick buzz tomorrow morning around 9:30 AM.`
  const smsCombinedBody = encodeURIComponent(`${smsIntroText}\n\n${smsLinkText}\n\n${smsActionText}`)
  const smsAppHref = `sms:${cleanPhone}&body=${smsCombinedBody}`

  // Call 2 Script
  const call2ScriptEn = `“Morning ${currentLead.owner || currentLead.company}, ${callerName} checking back as promised. Did you get a chance to open that link last night? Did we get all your services and info right, or is there anything we should tweak?”\n\n[PITCH $2,500]: “We do the full turnkey setup for a flat $2,500 — we connect your official dot-com domain, set up Google indexing, fast mobile hosting, and zero monthly fees. In your business, literally one single drain field replacement or tank job brings in $6,000 to $10,000+, so it pays for itself on the first serious call. If you text me those photos today, we can have your official site fully live within 24 hours. Want us to lock this in for you?”\n\n[DOWNSELL 50/50]: “Understood. We can split it: $1,250 today to launch within 24 hours, and $1,250 in 30 days after you start taking calls through it. Fair enough?”`

  // Objections Dictionary
  const OBJECTIONS_DATA: Record<string, { label: string; script: string; why: string }> = {
    price: {
      label: '«How much is this?» (Сколько стоит?)',
      script: `“It’s completely free to check out the preview — zero obligation. If you like it and want to launch it under your official domain, it’s a flat one-time setup with zero monthly fees. Just wanted to see if you like what we put together first. Is this cell good to text?”`,
      why: 'Снимает страх цены до показа ценности. Фиксирует отсутствие абонентки.',
    },
    busy: {
      label: '«I’m busy / driving» (Я за рулем / занят)',
      script: `“100%, I won't hold you. I'll just text the link right now. Take a 15-second scroll tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30. Sound good?”`,
      why: 'Уважает время рабочего человека. Фиксирует отправку ссылки и утренний звонок.',
    },
    have_site: {
      label: '«We already have a site» (У нас есть сайт)',
      script: `“Got it. Most contractors we work with already had an old site from 10 years ago or a slow Facebook page that takes forever on phones. Ours is built specifically for 1-tap emergency mobile calls. Take 15 seconds tonight just to compare. Fair enough to text it over?”`,
      why: 'Не оскорбляет старый сайт. Предлагает сравнить со сверхбыстрой мобильной версией.',
    },
    word_of_mouth: {
      label: '«Word-of-mouth only» (Только сарафан)',
      script: `“100% respect on 20 years — word-of-mouth is the best business there is. The only reason we put this together: younger homeowners moving into ${currentLead.city} don't know the local names yet. When their tank backs up, they search Google on their phone. Mind if I text it over to take a look?”`,
      why: 'Уважает репутацию и бьет по факту: новые жильцы города не знают старых мастеров и ищут через телефон.',
    },
    booked: {
      label: '«Fully booked» (Завал работы)',
      script: `“That’s a great problem to have! This isn't about getting 50 small pump-outs — it’s about filtering for the high-dollar $8,000 to $12,000 drain field replacements. Take a look tonight, and you have it in your back pocket. Good to text to this number?”`,
      why: 'Позиционирует сайт как фильтр на высокочековые объекты по $10,000+.',
    },
    email: {
      label: '«Just send an email» (Скиньте на email)',
      script: `“Happy to send an email as well! But since it’s built specifically for smartphones, it looks best right on your cell screen. I’ll text the link so you have it in one tap, and drop an email too. What's your best email address?”`,
      why: 'Соглашается на email, но обосновывает важность мобильного SMS.',
    },
    expensive: {
      label: '«$2,500 is too expensive» (Звонок 2: Дорого)',
      script: `“Understood. But in the septic business, literally one single tank replacement or drain field job brings in $6,000 to $10,000+. So this pays for itself on your very first big call. Plus, zero monthly fees. If $2,500 is tight, we can split it: $1,250 now to launch within 24 hours, and $1,250 in 30 days. Fair enough?”`,
      why: 'Привязка к 1 объекту ($8k) + сплит 50/50 за 24 часа.',
    },
    no_time: {
      label: '«Didn’t look at it yet» (Звонок 2: Не успел)',
      script: `“Totally understand, long day yesterday! Tell you what — pull it up right now on your phone while I'm on the line, takes literally 15 seconds to scroll... Let me know when it opens.”`,
      why: 'Вместе открываем прямо на линии на громкой связи.',
    },
    wife: {
      label: '«Talk to wife / partner» (Звонок 2: Спрошу жену)',
      script: `“100%, definitely want everyone on the same page. Just forward that text with the link to them: ${showcaseUrl}. What do you think is the main question they'll have? ... Got it. I’ll follow up tomorrow at 10 AM after you look it over together. Sound good?”`,
      why: 'Уважение к партнерам + вскрытие скрытых сомнений.',
    },
    fees: {
      label: '«Any monthly fees?» (Звонок 2: Абонентка?)',
      script: `“Zero monthly fees. Traditional agencies charge $500 every single month. With us, it’s a flat one-time $2,500, we launch it within 24 hours, and it’s 100% yours forever. No recurring bills.”`,
      why: 'Четкое конкурентное преимущество против агентств.',
    },
  }

  const handleSaveAndNext = async (statusOverride?: CallStatus) => {
    const finalStatus = statusOverride || selectedStatus
    if (!finalStatus) {
      alert(lang === 'EN' ? 'Please select a call result (Agreed, Callback, No Answer, Declined)' : 'Выберите результат звонка')
      return
    }

    setIsSaving(true)

    const updatedItem = {
      status: finalStatus,
      note: note.trim(),
      slug: currentLead.slug,
      company: currentLead.company,
      manager: activeManager,
      updatedAt: new Date().toISOString(),
    }

    const updatedCalls = {
      ...loggedCalls,
      [currentLead.phone]: updatedItem,
    }

    setLoggedCalls(updatedCalls)

    // 1. Immediately persist in browser localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedCalls))
    } catch (e) {
      console.warn('LocalStorage save failed:', e)
    }

    // 2. Send to server & Telegram notification
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
          manager: activeManager,
        }),
      })
      const data = await res.json()
      if (data.stats) {
        // Recalculate manager stats
        let mgrStats = { total: 0, agreed: 0, callback: 0, noAnswer: 0, declined: 0, wrongNumber: 0 }
        for (const lead of managerLeads) {
          const item = updatedCalls[lead.phone]
          if (item) {
            mgrStats.total++
            if (item.status === 'AGREED') mgrStats.agreed++
            else if (item.status === 'CALLBACK') mgrStats.callback++
            else if (item.status === 'NO_ANSWER') mgrStats.noAnswer++
            else if (item.status === 'DECLINED') mgrStats.declined++
            else if (item.status === 'WRONG_NUMBER') mgrStats.wrongNumber++
          }
        }
        setStats(mgrStats)
      }
    } catch (err) {
      console.error('Error saving call to server:', err)
    } finally {
      setIsSaving(false)
      // Advance to next lead
      if (currentIndex < managerLeads.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top sticky header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 py-2.5 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Manager Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold overflow-x-auto">
            {Object.values(MANAGERS).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveManager(m.id)
                  setCurrentIndex(0)
                }}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  activeManager === m.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.name} ({m.leadCount})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zadarma Webphone Quick Link */}
            <a
              href="https://my.zadarma.com/webphone/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              title="Открыть Webphone в my.zadarma.com"
            >
              🌐 Zadarma
            </a>

            {/* Language toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px] font-bold">
              <button
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 rounded-md transition ${lang === 'EN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('RU')}
                className={`px-2 py-0.5 rounded-md transition ${lang === 'RU' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                RU
              </button>
            </div>

            {/* History Drawer toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition"
              title="Журнал звонков"
            >
              📋 {stats.total}
            </button>
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="max-w-xl mx-auto grid grid-cols-4 gap-1.5 mt-2 text-[11px] text-center">
          <div className="bg-slate-950/70 border border-emerald-900/60 rounded-lg py-1 px-1.5">
            <span className="text-emerald-400 font-bold">🟢 {stats.agreed}</span>
            <span className="block text-[9px] text-slate-400 uppercase">{lang === 'EN' ? 'Agreed' : 'Да (SMS)'}</span>
          </div>
          <div className="bg-slate-950/70 border border-amber-900/60 rounded-lg py-1 px-1.5">
            <span className="text-amber-400 font-bold">🟡 {stats.callback}</span>
            <span className="block text-[9px] text-slate-400 uppercase">{lang === 'EN' ? 'Callback' : 'Позже'}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg py-1 px-1.5">
            <span className="text-slate-400 font-bold">⚪ {stats.noAnswer}</span>
            <span className="block text-[9px] text-slate-400 uppercase">{lang === 'EN' ? 'No Ans' : 'Молчат'}</span>
          </div>
          <div className="bg-slate-950/70 border border-rose-900/60 rounded-lg py-1 px-1.5">
            <span className="text-rose-400 font-bold">🔴 {stats.declined}</span>
            <span className="block text-[9px] text-slate-400 uppercase">{lang === 'EN' ? 'Declined' : 'Отказ'}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-xl mx-auto mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / managerLeads.length) * 100}%` }}
          />
        </div>
      </header>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[80vh] rounded-2xl flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                📋 {lang === 'EN' ? 'Call History' : 'Журнал звонков'} — {managerCfg.name} ({stats.total}/{managerLeads.length})
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white text-sm p-1">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 my-3 space-y-2 pr-1">
              {managerLeads.filter((l) => loggedCalls[l.phone]).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {lang === 'EN' ? 'No calls logged for this manager yet.' : 'Звонков пока нет.'}
                </div>
              ) : (
                managerLeads
                  .filter((l) => loggedCalls[l.phone])
                  .map((lead) => {
                    const item = loggedCalls[lead.phone]
                    return (
                      <div key={lead.phone} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white">{lead.company}</div>
                          <div className="text-slate-400 font-mono text-[10px]">{lead.phone} • {lead.city}, {lead.state}</div>
                          {item.note && <div className="text-emerald-400 text-[11px] mt-1 italic">“{item.note}”</div>}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'AGREED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          item.status === 'CALLBACK' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          item.status === 'DECLINED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    )
                  })
              )}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition"
            >
              {lang === 'EN' ? 'Close' : 'Закрыть'}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto p-3.5 flex-1 flex flex-col gap-3">
        {/* Company Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                {lang === 'EN' ? `Lead #${currentIndex + 1} of ${managerLeads.length}` : `Контакт #${currentIndex + 1} из ${managerLeads.length}`}
              </div>
              <h2 className="text-lg font-black text-white leading-tight">{currentLead.company}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span>📍 {currentLead.city}, {currentLead.state}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">⭐ {currentLead.rating}</span>
                <span className="text-slate-500">({currentLead.reviewCount} reviews)</span>
              </div>
            </div>

            {currentLead.owner ? (
              <span className="bg-sky-950 border border-sky-800 text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
                👤 {currentLead.owner}
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded">Owner/Crew</span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-white font-bold text-sm">{cleanPhone}</span>
              <button
                onClick={() => copyToClipboard(cleanPhone, 'phone')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded transition"
              >
                {copiedField === 'phone' ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <a
              href={showcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
            >
              👁 {lang === 'EN' ? 'Preview Live Site ↗' : 'Открыть витрину ↗'}
            </a>
          </div>
        </div>

        {/* Zadarma Primary Calling & Softphone Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* 1. tel: Link (Triggers Zadarma App / OS Dialer) */}
          <a
            href={telHref}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm py-2.5 px-3 rounded-xl shadow-lg active:scale-95 transition"
          >
            <span>📞</span>
            <span>{lang === 'EN' ? 'Zadarma Call' : 'Позвонить'}</span>
          </a>

          {/* 2. SIP Link */}
          <a
            href={sipHref}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs py-2.5 px-2 rounded-xl transition"
          >
            <span>☎️</span>
            <span>SIP Call</span>
          </a>

          {/* 3. Copy Number for Webphone */}
          <button
            onClick={() => copyToClipboard(cleanPhone, 'phone_btn')}
            className="flex items-center justify-center gap-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 font-bold text-xs py-2.5 px-2 rounded-xl transition"
          >
            <span>📋</span>
            <span>{copiedField === 'phone_btn' ? '✓ Copied!' : 'Copy for Webphone'}</span>
          </button>
        </div>

        {/* Mode Navigation Tabs (Call 1, SMS Preview, Call 2, Objections) */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('CALL1')}
            className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'CALL1' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            ⚡ Call #1 (Hook)
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'SMS' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            💬 SMS (Preview Card)
          </button>
          <button
            onClick={() => setActiveTab('CALL2')}
            className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'CALL2' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            🎯 Call #2 ($2.5k)
          </button>
          <button
            onClick={() => setActiveTab('OBJECTIONS')}
            className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'OBJECTIONS' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            🛡️ Objections (10)
          </button>
        </div>

        {/* TAB 1: CALL 1 HOOK */}
        {activeTab === 'CALL1' && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <span>🔥 15-Sec Opening Hook (Tailored for {currentLead.company})</span>
              <button
                onClick={() => copyToClipboard(lang === 'EN' ? hookScriptEn : hookScriptRu, 'hook')}
                className="text-[10px] bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded transition"
              >
                {copiedField === 'hook' ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-line font-mono bg-slate-950/60 p-3 rounded-xl border border-emerald-900/40">
              {lang === 'EN' ? hookScriptEn : hookScriptRu}
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-900/50">
              <div className="text-[11px] font-bold text-amber-400 mb-1">
                🚪 Post-Agreement Exit (Locking 9:30 AM Tomorrow Callback):
              </div>
              <div className="text-xs text-slate-300 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 leading-snug whitespace-pre-line">
                {exitScriptEn}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SMS DELIVERY (2-STEP DISPATCH FOR RICH CARD) */}
        {activeTab === 'SMS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-xs text-slate-400">
              💡 <strong className="text-emerald-400">Секрет красивого превью:</strong> Отправляйте ссылку <strong className="text-white">отдельным сообщением</strong> (Шаг 2). Тогда iMessage и Android сразу сгенерируют крупную визуальную карточку с фото трака и 5★ рейтингом!
            </div>

            {/* Step 1: Intro */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center gap-2">
              <div className="text-xs text-slate-200 font-mono flex-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Step 1: Intro Text</span>
                {smsIntroText}
              </div>
              <button
                onClick={() => copyToClipboard(smsIntroText, 'sms1')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition"
              >
                {copiedField === 'sms1' ? '✓ Copied' : 'Copy Step 1'}
              </button>
            </div>

            {/* Step 2: Standalone Link */}
            <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-3 flex justify-between items-center gap-2">
              <div className="text-xs text-emerald-300 font-mono font-bold flex-1 truncate">
                <span className="text-[10px] text-emerald-500 uppercase block font-bold">Step 2: Bare Link (Triggers Rich Preview Card)</span>
                {smsLinkText}
              </div>
              <button
                onClick={() => copyToClipboard(smsLinkText, 'sms2')}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition"
              >
                {copiedField === 'sms2' ? '✓ Copied Link' : 'Copy Link 🔗'}
              </button>
            </div>

            {/* Step 3: Action Prompt */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center gap-2">
              <div className="text-xs text-slate-200 font-mono flex-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Step 3: Verification & Morning Call Note</span>
                {smsActionText}
              </div>
              <button
                onClick={() => copyToClipboard(smsActionText, 'sms3')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition"
              >
                {copiedField === 'sms3' ? '✓ Copied' : 'Copy Step 3'}
              </button>
            </div>

            {/* Combined SMS Link Fallback */}
            <a
              href={smsAppHref}
              className="text-center bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-200 font-bold py-2 rounded-xl text-xs transition"
            >
              💬 Open SMS App (Combined Text Fallback)
            </a>
          </div>
        )}

        {/* TAB 3: CALL 2 CLOSING SCRIPT */}
        {activeTab === 'CALL2' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <span>🎯 Next-Morning Closing Call (9:30 AM US Time)</span>
              <button
                onClick={() => copyToClipboard(call2ScriptEn, 'call2')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded transition"
              >
                {copiedField === 'call2' ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-xs text-slate-200 font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
              {call2ScriptEn}
            </div>
          </div>
        )}

        {/* TAB 4: OBJECTIONS CHEAT SHEET */}
        {activeTab === 'OBJECTIONS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              🛡️ Tap any objection to see the instant response:
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(OBJECTIONS_DATA).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setActiveObjection(activeObjection === key ? null : key)}
                  className={`text-left p-2 rounded-xl border text-[11px] font-bold transition truncate ${
                    activeObjection === key
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {activeObjection && OBJECTIONS_DATA[activeObjection] && (
              <div className="mt-2 bg-slate-950 border border-emerald-900 rounded-xl p-3">
                <div className="text-xs font-bold text-emerald-400 mb-1">
                  {OBJECTIONS_DATA[activeObjection].label}
                </div>
                <div className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {OBJECTIONS_DATA[activeObjection].script}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 italic">
                  💡 Смысл: {OBJECTIONS_DATA[activeObjection].why}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outcome Recording Section (One-Tap & Note) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            {lang === 'EN' ? 'Record Call Outcome:' : 'Зафиксировать результат звонка:'}
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
                <div>{lang === 'EN' ? 'Agreed (SMS Sent)' : 'Согласен (SMS отправлено)'}</div>
                <div className="text-[10px] opacity-75 font-normal">Next morning callback</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus('CALLBACK')}
              className={`p-2.5 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                selectedStatus === 'CALLBACK'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>🟡</span>
              <div>
                <div>{lang === 'EN' ? 'Callback / Wife' : 'Перезвонить / Жена'}</div>
                <div className="text-[10px] opacity-75 font-normal">Busy on jobsite / Driving</div>
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
                <div>{lang === 'EN' ? 'No Answer' : 'Не ответил / Гудки'}</div>
                <div className="text-[10px] opacity-75 font-normal">Voicemail / Busy</div>
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
                <div>{lang === 'EN' ? 'Declined' : 'Отказ / Не интересно'}</div>
                <div className="text-[10px] opacity-75 font-normal">Not interested / Retiring</div>
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
              🚫 {lang === 'EN' ? 'Wrong Number / Disconnected' : 'Неверный номер / не в бизнесе'}
            </button>
          </div>

          {/* Quick Note Input */}
          <div className="mt-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === 'EN' ? "Quick note (e.g. 'Wife took note', 'Call at 9:30 AM')..." : "Заметка (напр. 'ответила жена, набрать утром')..."}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Big Save & Advance Button */}
        <button
          onClick={() => handleSaveAndNext()}
          disabled={isSaving || !selectedStatus}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition ${
            selectedStatus
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer active:scale-98'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (lang === 'EN' ? 'Saving to Database...' : 'Сохранение в базу...') : (lang === 'EN' ? '💾 Save & Next Lead ➔' : '💾 Сохранить и следующий контакт ➔')}
        </button>

        {/* Bottom index navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="hover:text-slate-300 disabled:opacity-30 p-2"
          >
            ← {lang === 'EN' ? 'Previous' : 'Предыдущий'}
          </button>
          <span>{currentIndex + 1} / {managerLeads.length}</span>
          <button
            onClick={() => setCurrentIndex(Math.min(managerLeads.length - 1, currentIndex + 1))}
            disabled={currentIndex === managerLeads.length - 1}
            className="hover:text-slate-300 disabled:opacity-30 p-2"
          >
            {lang === 'EN' ? 'Skip →' : 'Пропустить →'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default function CallDispatcherPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-6">Loading Dialer CRM...</div>}>
      <CallDispatcherContent />
    </Suspense>
  )
}
