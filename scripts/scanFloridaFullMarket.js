import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'
import { createBrowser, createBrowserContext, handleGoogleConsent } from '../src/utils/browser.js'

const XLSX = XLSXModule.default || XLSXModule

const OUTPUT_DIR = path.resolve(process.cwd(), 'florida_market_analysis')
const JSON_OUT = path.join(OUTPUT_DIR, 'florida_septic_full_market.json')
const CSV_OUT = path.join(OUTPUT_DIR, 'florida_septic_full_market.csv')
const PROGRESS_FILE = path.join(OUTPUT_DIR, '_scan_progress.json')

const TARGET_REGIONS = [
  { city: 'Ocala', state: 'FL', label: 'Central / Marion (Septic Capital)' },
  { city: 'Jacksonville', state: 'FL', label: 'North FL / Duval' },
  { city: 'Orlando', state: 'FL', label: 'Central FL / Orange & Seminole' },
  { city: 'Tampa', state: 'FL', label: 'Tampa Bay / Hillsborough' },
  { city: 'Pensacola', state: 'FL', label: 'Panhandle / Escambia' },
  { city: 'Fort Myers', state: 'FL', label: 'Southwest FL / Lee' },
  { city: 'Tallahassee', state: 'FL', label: 'Northwest FL / Capital' },
  { city: 'Lakeland', state: 'FL', label: 'Polk County' },
  { city: 'Sarasota', state: 'FL', label: 'Gulf Coast / Sarasota' },
  { city: 'Gainesville', state: 'FL', label: 'North Central / Alachua' },
  { city: 'Port St. Lucie', state: 'FL', label: 'Treasure Coast' },
  { city: 'Deltona', state: 'FL', label: 'Volusia County' },
]

async function verifyWebsite(url) {
  if (!url) return { status: 'NO_SITE', httpCode: null }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)
    if (res.ok) return { status: 'ACTIVE', httpCode: res.status }
    return { status: 'ERROR', httpCode: res.status }
  } catch (err) {
    return { status: 'DEAD_OR_TIMEOUT', error: err.message }
  }
}

async function run() {
  await fs.ensureDir(OUTPUT_DIR)

  let progress = { completedCities: [], companies: {} }
  if (await fs.pathExists(PROGRESS_FILE)) {
    try {
      progress = await fs.readJson(PROGRESS_FILE)
    } catch {}
  }

  const browser = await createBrowser({ headless: true })
  const context = await createBrowserContext(browser)
  const page = await context.newPage()

  console.log(`[FloridaScanner] Starting full Florida market scan across ${TARGET_REGIONS.length} key septic hubs...`)

  for (const region of TARGET_REGIONS) {
    const regionKey = `${region.city}_${region.state}`
    if (progress.completedCities.includes(regionKey)) {
      console.log(`[Skip] Already completed ${region.city}, FL`)
      continue
    }

    const query = `septic service ${region.city} FL`
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`

    console.log(`\n======================================================`)
    console.log(`[Hub: ${region.city}, FL] 🔍 Searching: "${query}"`)

    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 35000 })
      await page.waitForTimeout(2000)
      await handleGoogleConsent(page)
      await page.waitForTimeout(1000)

      // Scroll to load all cards
      for (let s = 0; s < 7; s++) {
        await page.evaluate(() => {
          const feed = document.querySelector('div[role="feed"]')
          if (feed) feed.scrollBy(0, 2000)
        })
        await page.waitForTimeout(700)
      }

      // Collect raw cards
      const rawCards = await page.evaluate((cityName) => {
        const list = Array.from(document.querySelectorAll('div.Nv2PK'))
        return list.map((card) => {
          const anchor = card.querySelector('a.hfpxzc')
          const name = anchor ? anchor.getAttribute('aria-label') : (card.querySelector('.qBF1Pd')?.innerText || '')
          const placeUrl = anchor ? anchor.getAttribute('href') : ''

          const ratingEl = card.querySelector('.MW4etd')
          const rating = ratingEl ? parseFloat(ratingEl.innerText.trim()) : null

          const revEl = card.querySelector('.UY7F9')
          const revText = revEl ? revEl.innerText.replace(/[^0-9]/g, '') : null
          const reviewsCount = revText ? parseInt(revText, 10) : 0

          // Info lines
          const infoLines = Array.from(card.querySelectorAll('.W4Efsd')).map((el) => el.innerText.trim())
          const category = infoLines[0]?.split('·')[0]?.trim() || ''

          const webBtn = card.querySelector('a[data-value="Website"], a[aria-label*="website" i]')
          const websiteOnCard = webBtn ? webBtn.getAttribute('href') : null

          return {
            name,
            placeUrl,
            rating,
            reviewsCount,
            category,
            websiteOnCard,
            sourceCity: cityName,
          }
        })
      }, region.city)

      console.log(`  -> Found ${rawCards.length} cards in ${region.city}, FL`)

      // Deduplicate and process cards
      for (const card of rawCards) {
        if (!card.name || card.name.length < 2) continue
        const normKey = card.name.toLowerCase().replace(/[^a-z0-9]/g, '')

        if (!progress.companies[normKey]) {
          progress.companies[normKey] = {
            ...card,
            phone: null,
            address: null,
            website: card.websiteOnCard,
            websiteStatus: null,
            latestReviewDate: null,
            scrapedAt: new Date().toISOString(),
          }
        }
      }

      progress.completedCities.push(regionKey)
      await fs.writeJson(PROGRESS_FILE, progress, { spaces: 2 })
    } catch (err) {
      console.error(`[Error] Failed scanning ${region.city}:`, err.message)
    }
  }

  // Now, for all collected companies: enrich phone & exact website by quick detail inspection if missing
  console.log(`\n======================================================`)
  const totalUnique = Object.keys(progress.companies).length
  console.log(`[Details] Total unique Florida companies collected: ${totalUnique}`)
  console.log(`[Details] Inspecting places to extract phones, addresses and latest reviews...`)

  let processedCount = 0
  for (const [key, comp] of Object.entries(progress.companies)) {
    processedCount++
    if (comp.inspected) continue

    if (comp.placeUrl) {
      try {
        console.log(`[${processedCount}/${totalUnique}] ${comp.name} (${comp.sourceCity})`)
        await page.goto(comp.placeUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
        await page.waitForTimeout(1200)

        const details = await page.evaluate(() => {
          const phoneBtn = document.querySelector('button[data-tooltip*="phone" i], button[data-item-id*="phone:" i]')
          const phone = phoneBtn ? phoneBtn.innerText.trim() : null

          const addrBtn = document.querySelector('button[data-item-id="address"], button[data-tooltip*="address" i]')
          const address = addrBtn ? addrBtn.innerText.trim() : null

          const webAnchor = document.querySelector('a[data-item-id="authority"], a[data-tooltip*="website" i]')
          const website = webAnchor ? webAnchor.getAttribute('href') : null

          // Try to get latest review date snippet
          const reviewDateEl = document.querySelector('span.rsqaWe, span.dehysf')
          const latestReviewDate = reviewDateEl ? reviewDateEl.innerText.trim() : null

          return { phone, address, website, latestReviewDate }
        })

        comp.phone = details.phone
        comp.address = details.address
        if (details.website) comp.website = details.website
        comp.latestReviewDate = details.latestReviewDate
      } catch (e) {
        // Continue if single place times out
      }
    }

    // Verify website status
    const siteCheck = await verifyWebsite(comp.website)
    comp.websiteStatus = siteCheck.status
    comp.httpCode = siteCheck.httpCode || null
    comp.inspected = true

    if (processedCount % 10 === 0) {
      await fs.writeJson(PROGRESS_FILE, progress, { spaces: 2 })
    }
  }

  await browser.close()

  // Save final JSON and CSV
  const finalCompaniesList = Object.values(progress.companies)
  await fs.writeJson(JSON_OUT, finalCompaniesList, { spaces: 2 })

  const rows = finalCompaniesList.map((c, i) => ({
    '№': i + 1,
    'Компания': c.name,
    'Город': c.sourceCity,
    'Телефон': c.phone || 'Не указан',
    'Адрес': c.address || '',
    'Рейтинг': c.rating ? `${c.rating}★` : 'Нет',
    'Кол-во отзывов': c.reviewsCount || 0,
    'Категория': c.category || '',
    'Сайт': c.website || 'НЕТ САЙТА',
    'Статус сайта': c.websiteStatus,
    'Последний отзыв': c.latestReviewDate || 'Не определен',
    'Google Maps URL': c.placeUrl,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Florida Septic Market')
  const csvContent = '\uFEFF' + XLSX.utils.sheet_to_csv(ws)
  await fs.writeFile(CSV_OUT, csvContent, 'utf-8')

  console.log(`\n======================================================`)
  console.log(`✅ [COMPLETE] Florida Market Scan Finished!`)
  console.log(`Saved ${finalCompaniesList.length} companies to:`)
  console.log(`- ${JSON_OUT}`)
  console.log(`- ${CSV_OUT}`)
}

run().catch(console.error)
