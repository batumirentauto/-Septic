import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'
import { createBrowser, createBrowserContext, handleGoogleConsent } from '../src/utils/browser.js'
import { TARGET_CITIES_ALL_STATES } from '../src/data/targetCities.js'

const XLSX = XLSXModule.default || XLSXModule

const OUTPUT_DIR = path.resolve(process.cwd(), 'septic_low_rated')
const PROGRESS_FILE = path.join(OUTPUT_DIR, '_progress.json')
const XLSX_PATH = path.join(OUTPUT_DIR, 'low_rated_companies.xlsx')
const CSV_PATH = path.join(OUTPUT_DIR, 'low_rated_companies.csv')

function sanitizeFolderName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '').trim().substring(0, 80)
}

function cleanText(str) {
  if (!str) return null
  return str
    .replace(/[\uE000-\uF8FF]/g, '')
    .replace(/^[\s\r\n\t]+/, '')
    .replace(/[\s\r\n\t]+$/, '')
    .replace(/^[^a-zA-Z0-9+#]+/, '')
    .trim()
}

async function scrapeReviewsForPlace(page, maxReviews = 50) {
  const reviewsTabSelector = 'button[role="tab"][aria-label*="Reviews"], button[aria-label*="Reviews"]'
  const tabFound = await page.$(reviewsTabSelector)
  if (tabFound) {
    try {
      await tabFound.click()
      await page.waitForTimeout(2000)
    } catch {}
  }

  // Scroll reviews panel
  for (let s = 0; s < 6; s++) {
    await page.evaluate(() => {
      const scrollable =
        document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') ||
        document.querySelector('div.m6QErb[aria-label*="Reviews"]') ||
        document.querySelector('div.review-dialog-list') ||
        document.querySelector('div[role="feed"]')
      if (scrollable) scrollable.scrollBy(0, 1500)
    })
    await page.waitForTimeout(800)
  }

  // Expand "More" buttons
  try {
    const moreButtons = await page.$$('button.w8nwRe.kyuRq, button[aria-label="See more"]')
    for (const btn of moreButtons.slice(0, 15)) {
      try {
        await btn.click()
        await page.waitForTimeout(100)
      } catch {}
    }
  } catch {}

  const reviews = await page.evaluate((limit) => {
    const cards = Array.from(document.querySelectorAll('div.jftiEf, div.gws-localreviews__google-review'))
    const results = []

    for (const card of cards.slice(0, limit)) {
      const authorEl = card.querySelector('.d4r55, .TSUbDb a, .TSUbDb')
      const author = authorEl ? authorEl.innerText.trim() : 'Anonymous'

      const ratingEl = card.querySelector('span.kvMYJc, span.z3HNkc')
      let rating = 0
      if (ratingEl) {
        const aria = ratingEl.getAttribute('aria-label') || ''
        const m = aria.match(/([0-9.]+)/)
        if (m) rating = parseFloat(m[1])
      }

      const dateEl = card.querySelector('span.rsqaWe, span.dehysf')
      const date = dateEl ? dateEl.innerText.trim() : null

      const textEl = card.querySelector('span.wiI7pd, div.Jtu6Td, .review-full-text')
      const text = textEl ? textEl.innerText.trim() : ''

      results.push({ author, rating, date, text })
    }
    return results
  }, maxReviews)

  return reviews
}

async function updateTables(companyRecord) {
  await fs.ensureDir(OUTPUT_DIR)
  let rows = []
  if (await fs.pathExists(XLSX_PATH)) {
    try {
      const wb = XLSX.readFile(XLSX_PATH)
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
    } catch {}
  }

  // Update or append
  const idx = rows.findIndex((r) => r['Название'] === companyRecord['Название'])
  if (idx >= 0) {
    rows[idx] = companyRecord
  } else {
    rows.push(companyRecord)
  }

  const newWb = XLSX.utils.book_new()
  const newWs = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(newWb, newWs, 'Компании с низким рейтингом')
  XLSX.writeFile(newWb, XLSX_PATH)

  const csvContent = '\uFEFF' + XLSX.utils.sheet_to_csv(newWs)
  await fs.writeFile(CSV_PATH, csvContent, 'utf-8')
}

async function run() {
  await fs.ensureDir(OUTPUT_DIR)

  let progress = { processedPlaces: [], processedCities: [] }
  if (await fs.pathExists(PROGRESS_FILE)) {
    try {
      progress = await fs.readJson(PROGRESS_FILE)
    } catch {}
  }
  const processedUrls = new Set(progress.processedPlaces || [])

  // Priority states with high septic volume and repair demands
  const priorityStates = ['TX', 'FL', 'NC', 'GA', 'PA', 'OH', 'TN', 'CA', 'NY', 'VA', 'SC', 'AL', 'CO', 'IN', 'MI']
  const targetCities = TARGET_CITIES_ALL_STATES.filter((c) => priorityStates.includes(c.state))

  console.log(`[LowRatingHunter] Starting scan across ${targetCities.length} priority cities in top states...`)
  console.log(`[LowRatingHunter] Target: Septic repair/installation/drainfield with rating < 4.0 and >= 10 reviews.`)

  const browser = await createBrowser({ headless: true })
  const context = await createBrowserContext(browser)
  const page = await context.newPage()

  let totalCollected = 0

  for (const cityInfo of targetCities) {
    const cityKey = `${cityInfo.city}_${cityInfo.state}`
    if (progress.processedCities && progress.processedCities.includes(cityKey)) {
      continue
    }

    const query = `septic repair installation ${cityInfo.city} ${cityInfo.state}`
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`

    console.log(`\n======================================================`)
    console.log(`[City] 🔍 Searching: "${query}"`)

    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2000)
      await handleGoogleConsent(page)
      await page.waitForTimeout(1000)

      const feedSelector = 'div[role="feed"]'
      try {
        await page.waitForSelector(feedSelector, { timeout: 8000 })
      } catch {
        console.warn(`[Skip] Feed not found for ${cityInfo.city}, ${cityInfo.state}`)
        progress.processedCities.push(cityKey)
        await fs.writeJson(PROGRESS_FILE, progress, { spaces: 2 })
        continue
      }

      // Scroll to load places
      for (let s = 0; s < 6; s++) {
        await page.evaluate(() => {
          const feed = document.querySelector('div[role="feed"]')
          if (feed) feed.scrollBy(0, 1800)
        })
        await page.waitForTimeout(800)
      }

      // Collect cards
      const cards = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a.hfpxzc'))
        return anchors.map((a) => {
          const url = a.getAttribute('href') || ''
          const card = a.closest('div.Nv2PK') || a.parentElement
          const nameEl = card ? card.querySelector('.qBF1Pd, .fontHeadlineSmall') : null
          const name = nameEl ? nameEl.innerText.trim() : a.getAttribute('aria-label') || ''

          const ratingSpan = card ? card.querySelector('.MW4etd') : null
          const rating = ratingSpan ? parseFloat(ratingSpan.innerText.trim()) : 0

          const reviewCountSpan = card ? card.querySelector('.UY7F9') : null
          let reviewCount = 0
          if (reviewCountSpan) {
            const raw = reviewCountSpan.innerText.replace(/[^0-9]/g, '')
            reviewCount = parseInt(raw, 10) || 0
          }

          const catSpan = card ? card.querySelector('.W4Efsd:last-child .W4Efsd:first-child') : null
          const category = catSpan ? catSpan.innerText.trim() : ''

          return { url, name, rating, reviewCount, category }
        })
      })

      // Filter: rating < 4.0 (and > 1.0) AND reviewCount >= 10
      const lowRated = cards.filter((c) => {
        if (!c.url || processedUrls.has(c.url)) return false
        if (!c.rating || c.rating >= 4.0 || c.rating < 1.0) return false
        if (c.reviewCount < 10) return false

        // Check if name/category is repair/excavation/plumbing/septic
        const text = `${c.name} ${c.category}`.toLowerCase()
        const isPurePorta = text.includes('portable toilet') || text.includes('porta potty')
        if (isPurePorta && !text.includes('repair') && !text.includes('septic')) return false

        return true
      })

      console.log(`[Found] ${cards.length} total places | ${lowRated.length} low-rated (< 4.0★) candidates!`)

      for (const cand of lowRated) {
        console.log(`\n🚨 [SCRAPING LOW-RATED] ${cand.name} (${cand.rating}★, ${cand.reviewCount} reviews)`)
        processedUrls.add(cand.url)

        try {
          await page.goto(cand.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
          await page.waitForTimeout(2000)

          // Extract basic info
          const placeInfo = await page.evaluate(() => {
            const getText = (sel) => {
              const el = document.querySelector(sel)
              return el ? el.innerText.trim() : null
            }

            const phoneBtn = document.querySelector('button[data-tooltip*="phone" i], button[data-item-id*="phone:" i]')
            const phone = phoneBtn ? phoneBtn.innerText.trim() : null

            const addrBtn = document.querySelector('button[data-item-id="address"], button[data-tooltip*="address" i]')
            const address = addrBtn ? addrBtn.innerText.trim() : null

            const webAnchor = document.querySelector('a[data-item-id="authority"], a[data-tooltip*="website" i]')
            const website = webAnchor ? webAnchor.getAttribute('href') : null

            return { phone, address, website }
          })

          // Scrape reviews
          const reviews = await scrapeReviewsForPlace(page, 50)
          console.log(`  -> Scraped ${reviews.length} reviews (${reviews.filter(r => r.rating <= 2).length} negative <=2★)`)

          const folderName = sanitizeFolderName(cand.name)
          const compDir = path.join(OUTPUT_DIR, folderName)
          await fs.ensureDir(compDir)

          const fullCompanyData = {
            name: cand.name,
            rating: cand.rating,
            reviewCount: cand.reviewCount,
            category: cand.category,
            state: cityInfo.state,
            city: cityInfo.city,
            phone: placeInfo.phone,
            address: placeInfo.address,
            website: placeInfo.website,
            url: cand.url,
            totalReviewsSaved: reviews.length,
          }

          await fs.writeJson(path.join(compDir, 'company.json'), fullCompanyData, { spaces: 2 })
          await fs.writeJson(path.join(compDir, 'reviews.json'), reviews, { spaces: 2 })

          // Create overview.txt
          const badRevs = reviews.filter((r) => r.rating <= 2 && r.text.length > 20)
          const overviewText = `COMPANY: ${cand.name}
RATING: ${cand.rating}★ (${cand.reviewCount} reviews in Google)
CITY/STATE: ${cityInfo.city}, ${cityInfo.state}
PHONE: ${placeInfo.phone || 'N/A'}
ADDRESS: ${placeInfo.address || 'N/A'}
WEBSITE: ${placeInfo.website || 'N/A'}
GOOGLE MAPS: ${cand.url}

TOTAL REVIEWS SCRAPED: ${reviews.length}
NEGATIVE REVIEWS (<=2★): ${badRevs.length}

TOP COMPLAINTS PREVIEW:
${badRevs.slice(0, 5).map((r, i) => `[#${i + 1}] ${r.author} (${r.rating}★, ${r.date || ''}):\n"${r.text}"\n`).join('\n----------------------------------------\n')}
`
          await fs.writeFile(path.join(compDir, 'overview.txt'), overviewText, 'utf-8')

          // Update spreadsheet
          const record = {
            'Название': cand.name,
            'Штат': cityInfo.state,
            'Город': cityInfo.city,
            'Оценка': cand.rating,
            'Количество отзывов': cand.reviewCount,
            'Категория': cand.category,
            'Телефон': placeInfo.phone || '',
            'Адрес': placeInfo.address || '',
            'Сайт': placeInfo.website || '',
            'Ссылка Google Maps': cand.url,
            'Собрано отзывов': reviews.length,
            'Жалоб (1-2★)': badRevs.length,
            'Папка': folderName,
          }
          await updateTables(record)

          totalCollected++
        } catch (err) {
          console.warn(`  [Error scraping place]: ${err.message}`)
        }
      }

      progress.processedCities.push(cityKey)
      progress.processedPlaces = Array.from(processedUrls)
      await fs.writeJson(PROGRESS_FILE, progress, { spaces: 2 })

      // If we already collected 20-30 low rated companies with rich reviews across states, that is more than enough for market analysis!
      if (totalCollected >= 25) {
        console.log(`\n🎉 Reached milestone of ${totalCollected} low-rated companies with full review dossiers!`)
        break
      }
    } catch (err) {
      console.warn(`[City Error]: ${err.message}`)
    }
  }

  await context.close()
  await browser.close()
  console.log(`\n✅ Completed! Total low-rated companies collected: ${totalCollected}`)
}

run().catch(console.error)
