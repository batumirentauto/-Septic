import fs from 'fs-extra'
import path from 'path'
import { handleGoogleConsent, createBrowserContext } from '../utils/browser.js'
import { scrapePlace } from './placeScraper.js'
import { auditCompanyWebsite } from '../utils/websiteAuditor.js'
import { TARGET_CITIES_ALL_STATES } from '../data/targetCities.js'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

/**
 * Searches a city for septic repair businesses, screens candidates by:
 * - Rating: 4.6 to 5.0
 * - Reviews: 25 to 200
 * - Website: None, Facebook, or Broken/Inaccessible
 */
export async function findSepticLeadsForCity(page, cityInfo, options = {}) {
  const outputBaseDir = options.outputDir || path.resolve(process.cwd(), 'septic_repair')
  const maxPhotos = options.photos !== undefined ? options.photos : 100
  const maxReviews = options.reviews !== undefined ? options.reviews : 250
  const processedUrls = options.processedUrls || new Set()

  const query = `septic repair ${cityInfo.city} ${cityInfo.state}`
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`

  console.log(`\n======================================================`)
  console.log(`[LeadHunter] 🔍 Searching: "${query}"`)
  console.log(`[LeadHunter] Navigating to: ${searchUrl}`)

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
  } catch (err) {
    console.warn(`[LeadHunter] Initial goto note: ${err.message}. Retrying with commit...`)
    await page.goto(searchUrl, { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
  }

  await page.waitForTimeout(2000)
  await handleGoogleConsent(page)
  await page.waitForTimeout(1500)

  const feedSelector = 'div[role="feed"]'
  try {
    await page.waitForSelector(feedSelector, { timeout: 12000 })
  } catch {
    console.warn(`[LeadHunter] Results feed not found for "${query}". Skipping city.`)
    return []
  }

  // Scroll feed to collect cards
  console.log(`[LeadHunter] Scrolling feed to collect candidate businesses...`)
  for (let s = 0; s < 10; s++) {
    const endReached = await page.evaluate(() => {
      const el = document.querySelector('.HlvSq')
      return Boolean(el)
    })
    if (endReached) break

    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]')
      if (feed) feed.scrollBy(0, 1800)
    })
    await page.waitForTimeout(800)
  }

  // Extract all business cards from feed
  const rawCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('div[role="feed"] > div > div:has(a.hfpxzc)')
    const items = []

    cards.forEach((card) => {
      const linkEl = card.querySelector('a.hfpxzc')
      if (!linkEl) return

      const url = linkEl.getAttribute('href')
      const name = linkEl.getAttribute('aria-label') || card.querySelector('.qBF1Pd')?.innerText?.trim()

      let rating = null
      let reviewCount = 0

      const ratingEl = card.querySelector('span.MW4etd')
      if (ratingEl) {
        rating = parseFloat(ratingEl.innerText.replace(',', '.'))
      }

      const reviewCountEl = card.querySelector('span.UY7F9')
      if (reviewCountEl) {
        const match = reviewCountEl.innerText.replace(/[(),]/g, '').match(/\d+/)
        if (match) reviewCount = parseInt(match[0], 10)
      }

      // Check website button
      const webBtn = card.querySelector('a[aria-label*="website" i], a[data-value="Website" i]')
      const website = webBtn ? webBtn.getAttribute('href') : null

      if (name && url) {
        items.push({ name, url, rating, reviewCount, website })
      }
    })

    return items
  })

  console.log(`[LeadHunter] Found ${rawCards.length} businesses in "${cityInfo.city}, ${cityInfo.state}" feed.`)

  // Filter 1: Rating >= 4.6 and <= 5.0
  // Filter 2: Reviews 25 to 200
  // Filter 3: Unprocessed & Deduplicated
  const seenCandidateKeys = new Set()
  const preFiltered = rawCards.filter((c) => {
    if (processedUrls.has(c.url) || processedUrls.has(c.name)) return false
    const key = `${c.name}_${c.url}`
    if (seenCandidateKeys.has(key) || seenCandidateKeys.has(c.name)) return false
    seenCandidateKeys.add(key)
    seenCandidateKeys.add(c.name)

    if (!c.rating || c.rating < 4.6 || c.rating > 5.0) return false
    if (c.reviewCount < 25 || c.reviewCount > 200) return false
    return true
  })

  console.log(`[LeadHunter] Candidates matching rating (4.6-5.0) & reviews (25-200): ${preFiltered.length}`)

  const matchedLeads = []

  // Filter 4: Audit website (No website OR Facebook OR Broken site)
  for (const candidate of preFiltered) {
    const webDisplay = candidate.website ? candidate.website : 'Нет ссылки на сайт'
    process.stdout.write(`  -> Checking [${candidate.name}] (${candidate.rating}★, ${candidate.reviewCount} rev): ${webDisplay}... `)
    const audit = await auditCompanyWebsite(candidate.website)

    if (audit.isValidTarget) {
      console.log(`\n  🎯 [MATCH!] ${audit.issueDescription}`)
      matchedLeads.push({
        ...candidate,
        audit,
      })
    } else {
      console.log(`[Skipped: ${audit.issueDescription}]`)
    }
  }

  console.log(`\n[LeadHunter] City "${cityInfo.city}, ${cityInfo.state}" yielded ${matchedLeads.length} qualified leads!`)

  // Scrape full place page, all reviews, and all photos for each matched lead
  for (let i = 0; i < matchedLeads.length; i++) {
    const lead = matchedLeads[i]
    console.log(`\n------------------------------------------------------`)
    console.log(`[Scraping Lead ${i + 1}/${matchedLeads.length}]: ${lead.name}`)
    console.log(`  Issue: ${lead.audit.issueDescription}`)

    try {
      await scrapePlace(page, lead.url, {
        photos: maxPhotos,
        reviews: maxReviews,
        outputDir: outputBaseDir,
        state: cityInfo.state,
        city: cityInfo.city,
        website: lead.website,
        websiteIssue: lead.audit.issueDescription,
      })

      processedUrls.add(lead.url)
      processedUrls.add(lead.name)
    } catch (err) {
      console.error(`[Error] Failed scraping lead "${lead.name}": ${err.message}`)
    }

    await page.waitForTimeout(2000)
  }

  return matchedLeads
}

/**
 * Main automated pipeline across all target cities with resilient session recycling
 */
export async function runFullSepticLeadGeneration(browser, options = {}) {
  const outputBaseDir = options.outputDir || path.resolve(process.cwd(), 'septic_repair')
  await fs.ensureDir(outputBaseDir)

  const progressFilePath = path.join(outputBaseDir, '_progress.json')
  let progress = { processedCities: [], collectedLeadsCount: 0 }
  if (await fs.pathExists(progressFilePath)) {
    try {
      progress = await fs.readJson(progressFilePath)
    } catch {
      // ignore
    }
  }

  const processedUrls = new Set()
  try {
    const xlsxPath = path.join(outputBaseDir, 'companies.xlsx')
    if (await fs.pathExists(xlsxPath)) {
      const wb = XLSX.readFile(xlsxPath)
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      rows.forEach((r) => {
        if (r['Ссылка на Google Maps']) processedUrls.add(r['Ссылка на Google Maps'])
        if (r['Название']) processedUrls.add(r['Название'])
      })
      console.log(`[LeadHunter] Resuming session with ${processedUrls.size} existing leads in table.`)
    }
  } catch {
    // ignore
  }

  let totalCollected = progress.collectedLeadsCount || 0
  const citiesToProcess = options.cities || TARGET_CITIES_ALL_STATES

  let context = await createBrowserContext(browser)
  let page = await context.newPage()
  let citiesInCurrentContext = 0

  try {
    for (let i = 0; i < citiesToProcess.length; i++) {
      const cityInfo = citiesToProcess[i]
      const cityKey = `${cityInfo.city}_${cityInfo.state}`
      if (progress.processedCities.includes(cityKey)) {
        continue
      }

      // Recycle context every 8 cities to keep Google Maps fast and prevent rate limits
      if (citiesInCurrentContext >= 8) {
        console.log(`[LeadHunter] 🔄 Refreshing browser session to keep Google Maps responsive...`)
        await page.close().catch(() => {})
        await context.close().catch(() => {})
        context = await createBrowserContext(browser)
        page = await context.newPage()
        citiesInCurrentContext = 0
      }

      console.log(`\n======================================================`)
      console.log(`[PROGRESS] Processing city ${i + 1}/${citiesToProcess.length}: ${cityInfo.city}, ${cityInfo.state} (Total Leads So Far: ${totalCollected})`)

      try {
        const leads = await findSepticLeadsForCity(page, cityInfo, {
          ...options,
          outputDir: outputBaseDir,
          processedUrls,
        })

        totalCollected += leads.length
        progress.processedCities.push(cityKey)
        progress.collectedLeadsCount = totalCollected
        await fs.writeJson(progressFilePath, progress, { spaces: 2 })

        citiesInCurrentContext++
        console.log(`[PROGRESS] City complete. Total qualified leads in database: ${totalCollected}`)
      } catch (err) {
        console.error(`[LeadHunter Error in ${cityInfo.city}, ${cityInfo.state}]: ${err.message}`)
        // If error occurred, recreate page for next city
        try {
          await page.close().catch(() => {})
          page = await context.newPage()
        } catch {}
      }

      await page.waitForTimeout(2500)
    }
  } finally {
    await page.close().catch(() => {})
    await context.close().catch(() => {})
  }

  console.log(`\n======================================================`)
  console.log(`[HUNT COMPLETED] Successfully collected ${totalCollected} qualified septic repair leads!`)
  console.log(`[OUTPUT DIRECTORY] ${outputBaseDir}`)
  console.log(`  ├── companies.xlsx`)
  console.log(`  ├── companies.csv`)
  console.log(`  └── <Company Folders>/`)
}
