import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getLeadBySlug } from '@/data/septicLeads'
import seedSessions from './seedRadar.json'

export interface RadarEventItem {
  type: string
  label?: string
  at: string
}

export interface VisitorSession {
  sessionId: string
  visitorId?: string
  visitIndex?: number
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

export interface SingleVisitRecord {
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

export interface ContractorCard {
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

interface RadarStore {
  sessions: Record<string, VisitorSession>
}

declare global {
  // eslint-disable-next-line no-var
  var __septicRadarStore: RadarStore | undefined
}

const DATA_FILE_PRIMARY = path.join(process.cwd(), 'visitor_radar_log.json')
const DATA_FILE_TMP = '/tmp/septic_visitor_radar.json'

function loadStore(): RadarStore {
  if (globalThis.__septicRadarStore) {
    return globalThis.__septicRadarStore
  }

  for (const filePath of [DATA_FILE_PRIMARY, DATA_FILE_TMP]) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf8')
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.sessions === 'object' && Object.keys(parsed.sessions).length > 0) {
          globalThis.__septicRadarStore = parsed
          return parsed
        }
      }
    } catch {
      // ignore read errors
    }
  }

  const initialSessions: Record<string, VisitorSession> = {}
  if (seedSessions && typeof seedSessions === 'object') {
    Object.assign(initialSessions, seedSessions as Record<string, VisitorSession>)
  }

  globalThis.__septicRadarStore = { sessions: initialSessions }
  return globalThis.__septicRadarStore
}

function saveStore(store: RadarStore) {
  globalThis.__septicRadarStore = store
  const payload = JSON.stringify(store, null, 2)
  for (const filePath of [DATA_FILE_PRIMARY, DATA_FILE_TMP]) {
    try {
      fs.writeFileSync(/*turbopackIgnore: true*/ filePath, payload, 'utf8')
    } catch {
      // ignore write errors on read-only paths
    }
  }
}

function detectDevice(ua: string): VisitorSession['device'] {
  const lower = ua.toLowerCase()
  if (lower.includes('iphone')) return 'iPhone'
  if (lower.includes('ipad')) return 'iPad'
  if (lower.includes('android')) return 'Android'
  if (lower.includes('macintosh') || lower.includes('mac os x')) return 'Mac'
  if (lower.includes('windows')) return 'Windows'
  return 'Other'
}

function isBotUserAgent(ua: string): boolean {
  if (!ua) return true
  const botPatterns = [
    'facebot',
    'facebookexternalhit',
    'twitterbot',
    'slackbot',
    'whatsapp',
    'telegrambot',
    'discordbot',
    'linkedinbot',
    'applebot',
    'googlebot',
    'bingbot',
    'yandex',
    'baiduspider',
    'duckduckbot',
    'crawler',
    'spider',
    'headlesschrome',
    'lighthouse',
    'gtmetrix',
    'pingdom',
    'uptimerobot',
    'python-requests',
    'curl/',
    'wget/',
    'go-http-client',
    'axios/',
    'node-fetch'
  ]
  const lower = ua.toLowerCase()
  return botPatterns.some((pattern) => lower.includes(pattern))
}

function extractClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    return xff.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') || ''
    if (isBotUserAgent(ua)) {
      return NextResponse.json({ ok: true, ignored: 'bot' })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const store = loadStore()

    // Action: Clear all test sessions or purge completely
    if (body.action === 'purge_all' || body.action === 'clear_tests') {
      if (body.action === 'purge_all') {
        store.sessions = {}
      } else {
        for (const [id, s] of Object.entries(store.sessions)) {
          if (s.isOwnerTest || id.startsWith('test_')) {
            delete store.sessions[id]
          }
        }
      }
      saveStore(store)
      return NextResponse.json({ ok: true, message: 'Sessions cleared' })
    }

    const {
      sessionId,
      visitorId = '',
      visitIndex = 1,
      slug,
      eventType = 'heartbeat',
      eventLabel = '',
      durationSec = 0,
      maxScrollPct = 0,
      photoClicks = 0,
      ctaClicks = 0,
      calculatorClicks = 0,
      screen = '',
      timezone = '',
      language = '',
      referrer = ''
    } = body

    if (!sessionId || !slug) {
      return NextResponse.json({ ok: false, error: 'Missing sessionId or slug' }, { status: 400 })
    }

    const lead = getLeadBySlug(slug)
    const nowIso = new Date().toISOString()
    const ip = extractClientIp(req)
    const device = detectDevice(ua)

    const tzLower = String(timezone || '').toLowerCase()
    const langLower = String(language || '').toLowerCase()

    // STRICT Owner/Testing Detection:
    // Any visitor from Georgia, Russia, Europe, or with Russian/Georgian language
    // OR manual test IDs are classified as Owner Tests!
    const isOwnerTest =
      sessionId.startsWith('test_') ||
      tzLower.includes('tbilisi') ||
      tzLower.includes('moscow') ||
      tzLower.includes('europe/') ||
      tzLower.includes('asia/') ||
      langLower.startsWith('ru') ||
      langLower.startsWith('ka') ||
      ip.startsWith('178.134.') ||
      ip.startsWith('176.221.')

    const isUsVisitor =
      !isOwnerTest &&
      (tzLower.startsWith('america/') || tzLower.startsWith('us/') || langLower.startsWith('en'))

    const existing = store.sessions[sessionId]

    if (!existing) {
      store.sessions[sessionId] = {
        sessionId,
        visitorId,
        visitIndex,
        slug,
        companyName: lead?.name || slug,
        ownerName: lead?.ownerName || 'Owner',
        city: lead?.city || '',
        state: lead?.state || '',
        phone: lead?.phone || '',
        device,
        userAgent: ua,
        ip,
        referrer: String(referrer || ''),
        screen: String(screen || ''),
        timezone: String(timezone || ''),
        language: String(language || ''),
        isUsVisitor,
        isOwnerTest,
        firstSeenAt: body.firstSeenAt || nowIso,
        lastSeenAt: body.lastSeenAt || nowIso,
        durationSec: Math.max(1, Number(durationSec) || 1),
        maxScrollPct: Math.min(100, Math.max(0, Number(maxScrollPct) || 0)),
        photoClicks: Math.max(0, Number(photoClicks) || 0),
        ctaClicks: Math.max(0, Number(ctaClicks) || 0),
        calculatorClicks: Math.max(0, Number(calculatorClicks) || 0),
        events: [
          {
            type: eventType,
            label: eventLabel || 'Открыл витрину',
            at: nowIso
          }
        ]
      }
    } else {
      existing.lastSeenAt = nowIso
      existing.durationSec = Math.max(existing.durationSec, Number(durationSec) || 0)
      existing.maxScrollPct = Math.min(
        100,
        Math.max(existing.maxScrollPct, Number(maxScrollPct) || 0)
      )
      existing.photoClicks = Math.max(existing.photoClicks, Number(photoClicks) || 0)
      existing.ctaClicks = Math.max(existing.ctaClicks, Number(ctaClicks) || 0)
      existing.calculatorClicks = Math.max(
        existing.calculatorClicks,
        Number(calculatorClicks) || 0
      )
      if (visitorId && !existing.visitorId) existing.visitorId = visitorId
      if (visitIndex && !existing.visitIndex) existing.visitIndex = visitIndex

      if (eventType && eventType !== 'heartbeat') {
        existing.events.push({
          type: eventType,
          label: eventLabel,
          at: nowIso
        })
        if (existing.events.length > 40) {
          existing.events = existing.events.slice(-40)
        }
      }
    }

    saveStore(store)
    return NextResponse.json({ ok: true, session: store.sessions[sessionId] })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const store = loadStore()
  const includeTests = req.nextUrl.searchParams.get('includeTests') === '1'

  const allSessions = Object.values(store.sessions).sort(
    (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
  )

  const filteredSessions = includeTests
    ? allSessions
    : allSessions.filter((s) => !s.isOwnerTest && !s.sessionId.startsWith('test_'))

  // Aggregate by Contractor Slug
  const contractorsMap = new Map<string, VisitorSession[]>()
  for (const s of filteredSessions) {
    if (!contractorsMap.has(s.slug)) {
      contractorsMap.set(s.slug, [])
    }
    contractorsMap.get(s.slug)!.push(s)
  }

  const contractors: ContractorCard[] = []

  for (const [slug, sessList] of contractorsMap.entries()) {
    sessList.sort((a, b) => new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime())
    
    const lead = getLeadBySlug(slug)
    const companyName = lead?.name || sessList[0].companyName || slug
    const ownerName = lead?.ownerName || sessList[0].ownerName || 'Owner'
    const city = lead?.city || sessList[0].city || ''
    const state = lead?.state || sessList[0].state || ''
    const phone = lead?.phone || sessList[0].phone || ''
    const isOwnerTest = sessList.some((s) => s.isOwnerTest)
    const isUsVisitor = sessList.some((s) => s.isUsVisitor)

    const totalVisits = sessList.length
    const totalDurationSec = sessList.reduce((acc, s) => acc + (s.durationSec || 0), 0)
    const maxScrollPct = Math.max(...sessList.map((s) => s.maxScrollPct || 0))
    const firstSeenAt = sessList[0].firstSeenAt
    const lastSeenAt = sessList[sessList.length - 1].lastSeenAt
    const devices = Array.from(new Set(sessList.map((s) => s.device)))

    let leadScore: ContractorCard['leadScore'] = 'PEEK'
    let leadScoreLabel = '👀 Ознакомительный'
    let insight = 'Только открыл ссылку на несколько секунд. Пока присматривается.'

    if (totalVisits >= 2 || totalDurationSec >= 90 || maxScrollPct >= 80) {
      leadScore = 'HOT'
      leadScoreLabel = '🔥 Очень высокий'
      if (totalVisits >= 2) {
        insight = `Заходил ${totalVisits} раза! Общее время изучения: ${Math.round(totalDurationSec / 60)} мин. Внимательно проверяет сайт. Идеальный момент для оффера $2,500!`
      } else {
        insight = `Провел ${Math.round(totalDurationSec / 60)} мин и доскроллил до ${maxScrollPct}%. Изучил всю технику и отзывы!`
      }
    } else if (totalDurationSec >= 25 || maxScrollPct >= 50) {
      leadScore = 'WARM'
      leadScoreLabel = '⚡️ Теплый интерес'
      insight = `Внимательно просмотрел витрину (${totalDurationSec} сек, скролл ${maxScrollPct}%). Готов к уточняющему вопросу.`
    }

    const visits: SingleVisitRecord[] = sessList.map((s, idx) => ({
      sessionId: s.sessionId,
      visitNumber: idx + 1,
      firstSeenAt: s.firstSeenAt,
      lastSeenAt: s.lastSeenAt,
      durationSec: s.durationSec,
      maxScrollPct: s.maxScrollPct,
      device: s.device,
      screen: s.screen,
      photoClicks: s.photoClicks,
      ctaClicks: s.ctaClicks,
      calculatorClicks: s.calculatorClicks,
      events: s.events || []
    })).reverse()

    contractors.push({
      slug,
      companyName,
      ownerName,
      city,
      state,
      phone,
      isOwnerTest,
      isUsVisitor,
      totalVisits,
      totalDurationSec,
      maxScrollPct,
      firstSeenAt,
      lastSeenAt,
      leadScore,
      leadScoreLabel,
      insight,
      devices,
      visits
    })
  }

  contractors.sort((a, b) => {
    const scoreWeight = { HOT: 3, WARM: 2, PEEK: 1 }
    const diffScore = scoreWeight[b.leadScore] - scoreWeight[a.leadScore]
    if (diffScore !== 0) return diffScore
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
  })

  const totalSessions = filteredSessions.length
  const totalContractors = contractors.length
  const avgDurationSec =
    totalSessions > 0
      ? Math.round(
          filteredSessions.reduce((acc, s) => acc + (s.durationSec || 0), 0) / totalSessions
        )
      : 0
  const avgScrollPct =
    totalSessions > 0
      ? Math.round(
          filteredSessions.reduce((acc, s) => acc + (s.maxScrollPct || 0), 0) / totalSessions
        )
      : 0
  const mobileSessions = filteredSessions.filter(
    (s) => s.device === 'iPhone' || s.device === 'Android' || s.device === 'iPad'
  ).length

  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    summary: {
      totalContractors,
      totalSessions,
      avgDurationSec,
      avgScrollPct,
      mobileSessions,
      totalAllIncludingTests: allSessions.length
    },
    contractors,
    sessions: filteredSessions
  })
}
