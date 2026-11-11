import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as XLSXModule from 'xlsx'

const execFileAsync = promisify(execFile)
const XLSX = XLSXModule.default || XLSXModule

const EXCEL_316_PATH = path.resolve('./outreach_316_high_ticket.xlsx')
const MAIN_EXCEL_PATH = path.resolve('./septic_repair/companies.xlsx')
const SENT_LOG_PATH = path.resolve('./outreach_sent_log.json')
const CACHE_JSON_PATH = path.resolve('./outreach_enriched_contacts.json')
const FOLLOWUP_XLSX_PATH = path.resolve('./outreach_green_sms_followup.xlsx')
const FOLLOWUP_CSV_PATH = path.resolve('./outreach_green_sms_followup.csv')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function normalizeDigits10(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return ''
}

function formatUsPhone(digits10) {
  if (!digits10 || digits10.length !== 10) return ''
  return `+1 ${digits10.slice(0, 3)}-${digits10.slice(3, 6)}-${digits10.slice(6)}`
}

function extractFacebookUrls(html) {
  const matches = [...html.matchAll(/href="(https?:\/\/(?:www\.|m\.)?facebook\.com\/[^"#?]+(?:\?id=\d+)?)/gi)].map(
    (m) => decodeHtmlEntities(m[1])
  )

  const valid = []
  for (let url of matches) {
    url = url.replace(/\/+$/, '')
    const lower = url.toLowerCase()
    if (
      lower.includes('/sharer') ||
      lower.includes('/login') ||
      lower.includes('/help') ||
      lower.includes('/policies') ||
      lower.includes('/privacy') ||
      lower.includes('/watch') ||
      lower.includes('/Reel') ||
      lower.includes('/reel/') ||
      lower.includes('/events/') ||
      lower.includes('/groups/') ||
      lower.includes('/marketplace') ||
      lower.includes('/public/') ||
      lower.includes('/directory/')
    ) {
      continue
    }
    // Strip trailing /mentions, /about, /photos, /videos, /posts so we get the clean page URL
    url = url.replace(/\/(mentions|about|photos|videos|posts|reviews|community)$/i, '')
    if (!valid.includes(url)) {
      valid.push(url)
    }
  }

  // Prefer /p/... or named business page URLs over raw numeric paths
  valid.sort((a, b) => {
    const aScore = a.includes('/p/') ? 3 : /facebook\.com\/[A-Za-z]/.test(a) ? 2 : 1
    const bScore = b.includes('/p/') ? 3 : /facebook\.com\/[A-Za-z]/.test(b) ? 2 : 1
    return bScore - aScore
  })

  return valid
}

function extractEmails(cleanText) {
  const rawEmails = [...cleanText.matchAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,10}\b/g)].map((m) =>
    m[0].toLowerCase()
  )

  const blacklistDomains = [
    'example.com',
    'brave.com',
    'sentry.io',
    'wixpress.com',
    'schema.org',
    'googleapis.com',
    'w3.org',
    'facebook.com',
    'fb.com',
    'yellowpages.com',
    'yelp.com',
    'angi.com',
    'homeadvisor.com',
    'bbb.org',
    'manta.com',
    'mapquest.com',
    'thumbtack.com',
    'nextdoor.com',
    'birdeye.com',
    'datanyze.com',
    'rocketreach.co',
    'zoominfo.com',
  ]

  const valid = []
  for (const email of rawEmails) {
    if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(email)) continue
    if (blacklistDomains.some((d) => email.endsWith(`@${d}`) || email.endsWith(`.${d}`))) continue
    // Filter out masked emails like j***@gmail.com
    if (email.includes('*')) continue
    if (!valid.includes(email)) {
      valid.push(email)
    }
  }

  return valid
}

function extractAltPhones(cleanText, primaryPhoneRaw) {
  const primary10 = normalizeDigits10(primaryPhoneRaw)
  const primaryArea = primary10.slice(0, 3)

  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s](\d{3})[-.\s](\d{4})\b/g
  const found = []

  for (const match of cleanText.matchAll(phoneRegex)) {
    const d10 = `${match[1]}${match[2]}${match[3]}`
    if (d10 === primary10) continue
    if (d10 === '8005551212' || d10.startsWith('800') || d10.startsWith('888') || d10.startsWith('877') || d10.startsWith('866') || d10.startsWith('855')) {
      continue
    }
    const formatted = formatUsPhone(d10)
    if (!found.some((x) => x.d10 === d10)) {
      found.push({
        d10,
        formatted,
        sameAreaCode: d10.slice(0, 3) === primaryArea,
      })
    }
  }

  // Sort phones sharing the same area code first (most likely owner's cell or second shop line)
  found.sort((a, b) => Number(b.sameAreaCode) - Number(a.sameAreaCode))
  return found.map((x) => x.formatted)
}

async function queryBraveSearch(query) {
  const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`
  try {
    const { stdout } = await execFileAsync(
      'curl',
      [
        '-4',
        '-sL',
        '--max-time',
        '8',
        '-A',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        '-H',
        'Accept-Language: en-US,en;q=0.9',
        url,
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    )
    return stdout || ''
  } catch {
    return ''
  }
}

function buildDirectOutreachMessage(row) {
  const company = row['Компания (Company)']
  const rawOwner = row['Имя владельца (Owner)'] || ''
  const owner = rawOwner && !rawOwner.includes('Hey there') ? rawOwner : ''
  const city = row['Город']
  const ratingStr = String(row['Рейтинг'] || '5.0★').split(' ')[0]
  const enUrl = row['Ссылка для клиента (EN)']
  const greeting = owner ? `Hey ${owner}!` : `Hey ${company} team!`

  return `${greeting} I tried texting your main shop number earlier, didn't realize it might be a landline :)

Saw your ${ratingStr} reviews in ${city} and put together a quick showcase website preview for ${company} with your real machinery & work photos:

👉 ${enUrl}

Takes 10 seconds to scroll on your phone. Totally zero pressure — just wanted to put the finished result in front of you first.

If you want to claim it for your business (can easily swap any photos, services, or text), we can transfer it to your domain for a flat one-time fee, no monthly retainers. If not, no worries at all!

Let me know what you think!
— Heorhii (+1 302-213-0266)`
}

async function main() {
  const limitArg = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0)

  const wb = XLSX.readFile(EXCEL_316_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const sentLog = (await fs.pathExists(SENT_LOG_PATH)) ? await fs.readJson(SENT_LOG_PATH) : { history: {} }
  const cache = (await fs.pathExists(CACHE_JSON_PATH)) ? await fs.readJson(CACHE_JSON_PATH) : {}

  // Сортируем очередь обогащения:
  // 1) Сначала те, кому сегодня ушло ЗЕЛЁНОЕ SMS (чтобы сразу дать по ним Facebook / Email / доп. мобильный)
  // 2) Затем остальные из Топ-100 и все 316
  const prioritized = [...allRows].sort((a, b) => {
    const phoneA = '+1' + normalizeDigits10(a['Телефон (Phone)'])
    const phoneB = '+1' + normalizeDigits10(b['Телефон (Phone)'])
    const isGreenA = sentLog.history[phoneA]?.channel === 'GREEN_SMS' || sentLog.history[phoneA]?.channel?.startsWith('SKIPPED') ? 1 : 0
    const isGreenB = sentLog.history[phoneB]?.channel === 'GREEN_SMS' || sentLog.history[phoneB]?.channel?.startsWith('SKIPPED') ? 1 : 0
    return isGreenB - isGreenA
  })

  const totalToProcess = limitArg > 0 ? Math.min(limitArg, prioritized.length) : prioritized.length
  console.log(`🔍 Запуск обогащения (Facebook + Email + Доп. телефоны) для ${totalToProcess} компаний...`)

  let processedNow = 0
  for (let i = 0; i < totalToProcess; i++) {
    const row = prioritized[i]
    const company = row['Компания (Company)']
    const city = row['Город']
    const state = row['Штат']
    const phone = row['Телефон (Phone)']
    const key = `${company}__${city}__${state}`

    if (cache[key] && (cache[key].facebook || cache[key].email || cache[key].checkedAt)) {
      continue
    }

    const q1 = `${company} ${city} ${state} facebook email phone`
    const html1 = await queryBraveSearch(q1)
    const clean1 = decodeHtmlEntities(
      html1
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
    )

    let fbUrls = extractFacebookUrls(html1)
    let emails = extractEmails(clean1)
    let altPhones = extractAltPhones(clean1, phone)

    // Если с первого запроса не нашли ни email, ни Facebook — делаем точечный второй запрос по номеру телефона и владельцу
    if (fbUrls.length === 0 && emails.length === 0) {
      await sleep(1500)
      const ownerName = row['Имя владельца (Owner)'] && !row['Имя владельца (Owner)'].includes('Hey there') ? row['Имя владельца (Owner)'] : ''
      const q2 = `"${company}" ${city} ${state} ${ownerName} "@gmail.com" OR "facebook.com"`
      const html2 = await queryBraveSearch(q2)
      const clean2 = decodeHtmlEntities(
        html2
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
      )
      fbUrls = [...new Set([...fbUrls, ...extractFacebookUrls(html2)])]
      emails = [...new Set([...emails, ...extractEmails(clean2)])]
      altPhones = [...new Set([...altPhones, ...extractAltPhones(clean2, phone)])]
    }

    cache[key] = {
      company,
      city,
      state,
      primaryPhone: phone,
      facebook: fbUrls[0] || '',
      facebookAll: fbUrls.slice(0, 3),
      email: emails[0] || '',
      emailsAll: emails.slice(0, 3),
      altPhone: altPhones[0] || '',
      altPhonesAll: altPhones.slice(0, 3),
      checkedAt: new Date().toISOString(),
    }

    processedNow++
    console.log(
      `[${i + 1}/${totalToProcess}] ${company} (${city}, ${state}) -> FB: ${cache[key].facebook || '—'} | Email: ${cache[key].email || '—'} | Доп.тел: ${cache[key].altPhone || '—'}`
    )

    if (processedNow % 5 === 0 || i === totalToProcess - 1) {
      await fs.writeJson(CACHE_JSON_PATH, cache, { spaces: 2 })
      await exportEnrichedTables(allRows, sentLog, cache)
    }

    await sleep(2200)
  }

  await fs.writeJson(CACHE_JSON_PATH, cache, { spaces: 2 })
  await exportEnrichedTables(allRows, sentLog, cache)
  console.log(`\n✅ Обогащение завершено! Таблицы обновлены: ${FOLLOWUP_XLSX_PATH}`)
}

async function exportEnrichedTables(allRows, sentLog, cache) {
  const enrichedRows = allRows.map((r) => {
    const key = `${r['Компания (Company)']}__${r['Город']}__${r['Штат']}`
    const info = cache[key] || {}
    const phoneE164 = '+1' + normalizeDigits10(r['Телефон (Phone)'])
    const sentEntry = sentLog.history?.[phoneE164]
    return {
      ...r,
      'Статус SMS сегодня': sentEntry ? sentEntry.channel : 'Ожидает очереди',
      'Facebook страница': info.facebook || '',
      'Email владельца': info.email || '',
      'Доп. телефон (Мобильный/2-й)': (info.altPhonesAll || []).join(', '),
      'Готовое сообщение для Facebook / Email': buildDirectOutreachMessage(r),
    }
  })

  // Отдельная вкладка по тем, кому ушли Зелёные SMS сегодня (чтобы удобно написать им в Facebook / Email)
  const greenTodayRows = enrichedRows.filter(
    (r) => r['Статус SMS сегодня'] === 'GREEN_SMS' || String(r['Статус SMS сегодня']).startsWith('SKIPPED')
  )

  const followupWb = XLSX.utils.book_new()
  const wsGreen = XLSX.utils.json_to_sheet(greenTodayRows)
  XLSX.utils.book_append_sheet(followupWb, wsGreen, 'Зелёные SMS (FB + Email)')
  const wsAll = XLSX.utils.json_to_sheet(enrichedRows)
  XLSX.utils.book_append_sheet(followupWb, wsAll, 'Все 316 (С контактами)')
  XLSX.writeFile(followupWb, FOLLOWUP_XLSX_PATH)
  await fs.writeFile(FOLLOWUP_CSV_PATH, '\uFEFF' + XLSX.utils.sheet_to_csv(wsGreen), 'utf8')
}

main().catch(console.error)
