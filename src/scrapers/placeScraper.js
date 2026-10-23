import fs from 'fs-extra'
import path from 'path'
import { sanitizeFolderName, toHighResUrl, downloadImage } from '../utils/downloader.js'
import { handleGoogleConsent } from '../utils/browser.js'
import { appendOrUpdateCompanyInTable, extractState, extractCity } from '../utils/tableExporter.js'

/**
 * Clean icon glyphs and formatting artefacts from text
 */
function cleanText(str) {
  if (!str) return null
  return str
    .replace(/[\uE000-\uF8FF]/g, '') // remove Material icons PUA
    .replace(/^[\s\r\n\t]+/, '')
    .replace(/[\s\r\n\t]+$/, '')
    .replace(/^[^a-zA-Z0-9+#]+/, '') // remove leading symbols
    .trim()
}

/**
 * Scrape all details, all reviews, and all high-res photos from a single Google Maps place page
 */
export async function scrapePlace(page, rawPlaceUrl, options = {}) {
  const maxPhotos = options.photos !== undefined ? options.photos : 100
  const maxReviews = options.reviews !== undefined ? options.reviews : 250
  const outputBaseDir = options.outputDir || path.resolve(process.cwd(), 'septic_repair')

  // Force English locale on Google Maps so selectors and days of week are consistent
  let targetUrl = rawPlaceUrl
  try {
    const parsed = new URL(rawPlaceUrl)
    parsed.searchParams.set('hl', 'en')
    targetUrl = parsed.toString()
  } catch {
    targetUrl = rawPlaceUrl.includes('?') ? `${rawPlaceUrl}&hl=en` : `${rawPlaceUrl}?hl=en`
  }

  console.log(`\n======================================================`)
  console.log(`[PlaceScraper] Loading: ${targetUrl}`)

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(2500)
  await handleGoogleConsent(page)
  await page.waitForTimeout(1500)

  // 1. Basic Company Information
  const companyInfo = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector)
      return el ? el.innerText.trim() : null
    }

    // Business Name
    const name =
      getText('h1.DUwDvf') ||
      getText('h1') ||
      getText('.x3AX1-LfntMc-header-title-title') ||
      'Unknown_Company'

    // Rating & Review count
    let rating = null
    const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"]')
    if (ratingEl) {
      rating = parseFloat(ratingEl.innerText.replace(',', '.'))
    }

    let reviewCount = null
    const fnice = document.querySelector('div.F7nice')
    if (fnice) {
      const match = fnice.innerText.match(/\(([0-9\s,.]+)\)/)
      if (match) {
        reviewCount = parseInt(match[1].replace(/[^\d]/g, ''), 10)
      }
    }
    if (reviewCount === null) {
      const spans = Array.from(document.querySelectorAll('div.F7nice span, span[aria-label*="review"], span[aria-label*="отзыв"]'))
      for (const span of spans) {
        const txt = span.innerText || span.getAttribute('aria-label') || ''
        const m = txt.match(/\(([0-9\s,.]+)\)/) || txt.match(/(\d+[\d\s,.]*)\s*(?:reviews?|отзыв)/i)
        if (m) {
          const num = parseInt(m[1].replace(/[^\d]/g, ''), 10)
          if (!isNaN(num)) {
            reviewCount = num
            break
          }
        }
      }
    }

    // Category
    const category = getText('button.DkEaL') || getText('.fontBodyMedium [jsaction*="category"]')

    // Address
    const addressBtn = document.querySelector('button[data-item-id="address"]')
    const address = addressBtn ? addressBtn.innerText.trim() : null

    // Phone
    const phoneBtn = document.querySelector('button[data-item-id*="phone"]')
    const phone = phoneBtn ? phoneBtn.innerText.trim() : null
    const phoneRaw = phone ? phone.replace(/[^\d+]/g, '') : null

    // Website
    const websiteBtn = document.querySelector('a[data-item-id="authority"]')
    const website = websiteBtn ? websiteBtn.getAttribute('href') : null

    // Plus code
    const plusCodeBtn = document.querySelector('button[data-item-id="oloc"]')
    const plusCode = plusCodeBtn ? plusCodeBtn.innerText.trim() : null

    return {
      name,
      rating,
      reviewCount,
      category,
      address,
      phone,
      phoneRaw,
      website,
      plusCode,
      url: window.location.href,
    }
  })

  // Clean strings
  companyInfo.name = cleanText(companyInfo.name)
  companyInfo.address = cleanText(companyInfo.address)
  companyInfo.phone = cleanText(companyInfo.phone)
  companyInfo.category = cleanText(companyInfo.category)
  companyInfo.plusCode = cleanText(companyInfo.plusCode)

  if (options.state) companyInfo.state = options.state
  if (options.city) companyInfo.city = options.city
  if (options.websiteIssue) companyInfo.websiteIssue = options.websiteIssue
  if (options.website) companyInfo.website = options.website

  // Determine state & city from address if not set
  if (!companyInfo.state) companyInfo.state = extractState(companyInfo.address, options.state)
  if (!companyInfo.city) companyInfo.city = extractCity(companyInfo.address, options.city)

  // 2. Working Hours
  try {
    const hoursBtn = await page.$(
      'div[data-item-id*="oh"], [aria-label*="Hours"], [aria-label*="Часы работы"], button[aria-label*="hours"]'
    )
    if (hoursBtn) {
      await hoursBtn.click()
      await page.waitForTimeout(600)
    }
  } catch {
    // Ignore dropdown click error
  }

  const hours = await page.evaluate(() => {
    const hoursTable = document.querySelector('table.eKjh7, table.y0skOb, table')
    if (!hoursTable) return []
    const rows = hoursTable.querySelectorAll('tr')
    const list = []
    rows.forEach((row) => {
      const day = row.querySelector('td:first-child')?.innerText?.trim()
      const time = row.querySelector('td:last-child')?.innerText?.trim()
      if (day && time) {
        list.push({ day, hours: time.replace(/[\uE000-\uF8FF]/g, '').trim() })
      }
    })
    return list
  })
  companyInfo.hours = hours

  console.log(`[PlaceScraper] Company: "${companyInfo.name}" (${companyInfo.city || ''}, ${companyInfo.state || ''})`)
  console.log(`[PlaceScraper] Rating: ${companyInfo.rating || 'N/A'}★ (${companyInfo.reviewCount || 0} reviews)`)
  console.log(`[PlaceScraper] Phone: ${companyInfo.phone || 'N/A'}`)
  console.log(`[PlaceScraper] Address: ${companyInfo.address || 'N/A'}`)
  console.log(`[PlaceScraper] Website: ${companyInfo.website || 'N/A'} [${companyInfo.websiteIssue || ''}]`)

  // Dedicated Folder for this Company
  const folderName = sanitizeFolderName(`${companyInfo.name}`)
  const companyDir = path.join(outputBaseDir, folderName)
  const photosOwnerDir = path.join(companyDir, 'photos', 'owner')
  const photosReviewsDir = path.join(companyDir, 'photos', 'reviews')

  await fs.ensureDir(companyDir)
  await fs.ensureDir(photosOwnerDir)
  await fs.ensureDir(photosReviewsDir)

  companyInfo.companyDir = companyDir
  companyInfo.folderName = folderName

  // 3. Extract ALL Reviews
  const reviews = []
  if (maxReviews > 0) {
    try {
      console.log(`[PlaceScraper] 📋 Navigating to Reviews tab to collect reviews (up to ${maxReviews})...`)

      const reviewsTab =
        (await page.$('button[role="tab"]:has-text("Reviews")')) ||
        (await page.$('button[role="tab"][data-tab-index="1"]')) ||
        (await page.$('button[role="tab"]:has-text("Отзывы")')) ||
        (await page.$('button[aria-label*="Reviews"]'))

      if (reviewsTab) {
        await reviewsTab.click()
        await page.waitForTimeout(2000)

        const targetReviewsCount = Math.min(companyInfo.reviewCount || maxReviews, maxReviews)
        let previousReviewsCount = 0
        let noProgressRounds = 0

        for (let round = 0; round < 25; round++) {
          await page.evaluate(() => {
            const cards = document.querySelectorAll('div.jftiEf')
            if (cards.length > 0) {
              const lastCard = cards[cards.length - 1]
              lastCard.scrollIntoView({ behavior: 'instant', block: 'end' })
              let p = lastCard.parentElement
              while (p && p !== document.body) {
                if (p.scrollHeight > p.clientHeight && p.clientHeight > 200) {
                  p.scrollTop = p.scrollHeight
                  break
                }
                p = p.parentElement
              }
            }
          })
          await page.waitForTimeout(900)

          const currentCount = await page.$$eval('div.jftiEf', (els) => els.length)
          if (currentCount >= targetReviewsCount) break

          if (currentCount === previousReviewsCount) {
            noProgressRounds++
            if (noProgressRounds >= 3) break
          } else {
            noProgressRounds = 0
            previousReviewsCount = currentCount
          }
        }

        // Click all "More" buttons to expand full review text
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button.w8nwRe, button'))
          buttons.forEach((b) => {
            const txt = b.innerText || ''
            if (txt.includes('More') || txt.includes('Ещё')) {
              try { b.click() } catch {}
            }
          })
        })
        await page.waitForTimeout(600)

        // Parse extracted reviews from DOM
        const scrapedReviews = await page.evaluate((limit) => {
          const cards = Array.from(document.querySelectorAll('div.jftiEf')).slice(0, limit)
          return cards.map((card) => {
            const author = card.querySelector('.d4r55')?.innerText?.trim() || 'Anonymous'
            const authorMeta = card.querySelector('.RfnDt')?.innerText?.trim() || ''

            const starsEl = card.querySelector('span.kvMYJc')
            let rating = 5
            if (starsEl) {
              const aria = starsEl.getAttribute('aria-label') || ''
              const match = aria.match(/(\d+)/)
              if (match) rating = parseInt(match[1], 10)
            }

            const date = card.querySelector('.rsqaWe')?.innerText?.trim() || ''
            const text = card.querySelector('.wiI7pd')?.innerText?.trim() || ''

            // Extract review photos if attached
            const photoEls = card.querySelectorAll('button.Tya61d, div.KtCyie button')
            const photos = []
            photoEls.forEach((p) => {
              const bg = p.style.backgroundImage || ''
              const match = bg.match(/url\(["']?(https:[^"']+)["']?\)/)
              if (match) photos.push(match[1])
            })

            return { author, authorMeta, rating, date, text, photos }
          })
        }, maxReviews)

        reviews.push(...scrapedReviews)
        console.log(`[PlaceScraper] Successfully collected ${reviews.length} reviews.`)
      } else {
        console.log('[PlaceScraper] Reviews tab button not found or place has no reviews.')
      }
    } catch (err) {
      console.warn(`[PlaceScraper] Reviews extraction note: ${err.message}`)
    }
  }

  // 4. Extract & Download ALL Photos
  const downloadedPhotos = {
    owner: [],
    reviews: [],
  }

  if (maxPhotos > 0) {
    try {
      console.log(`[PlaceScraper] 📸 Navigating to Photos gallery (target: up to ${maxPhotos} photos)...`)

      // Check button ending in Photos (e.g., "96 Photos" or "Photos" tab)
      let photosBtn =
        (await page.$('button[role="tab"]:has-text("Photos")')) ||
        (await page.$('button[role="tab"]:has-text("Фото")')) ||
        (await page.$('button:has-text("Photos")')) ||
        (await page.$('button:has-text("Фото")')) ||
        (await page.$('button.aoRNLd')) ||
        (await page.$('button[jsaction*="heroHeaderImage"]')) ||
        (await page.$('div.Z6GXfc button'))

      if (photosBtn) {
        await photosBtn.click()
        await page.waitForTimeout(2000)

        // Scroll gallery to reveal photos
        for (let i = 0; i < 15; i++) {
          await page.evaluate(() => {
            const gallery =
              document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') ||
              document.querySelector('div[role="feed"]') ||
              document.querySelector('div.m6QErb[tabindex="-1"]')
            if (gallery) gallery.scrollBy(0, 1800)
            else window.scrollBy(0, 1800)
          })
          await page.waitForTimeout(500)
        }

        // Extract photo URLs
        const photoUrls = await page.evaluate((limit) => {
          const results = new Set()

          const isValidPhoto = (u) => {
            if (!u) return false
            const isGoogle = u.includes('googleusercontent.com') || u.includes('ggpht.com')
            const isAvatar = u.includes('/a/') || u.includes('/a-/') || u.includes('=s48') || u.includes('=w36') || u.includes('=w32')
            const isMapTile = u.includes('/maps/vt/') || u.includes('streetview') || u.includes('staticmap') || u.includes('data:image')
            return isGoogle && !isAvatar && !isMapTile
          }

          document.querySelectorAll('*').forEach((el) => {
            const bg = el.style && el.style.backgroundImage ? el.style.backgroundImage : ''
            const match = bg.match(/url\(["']?(https?:?\/\/[^"']+)["']?\)/)
            if (match && isValidPhoto(match[1])) {
              const fullUrl = match[1].startsWith('//') ? 'https:' + match[1] : match[1]
              results.add(fullUrl)
            }
            if (el.tagName === 'IMG' && el.src && isValidPhoto(el.src)) {
              const fullUrl = el.src.startsWith('//') ? 'https:' + el.src : el.src
              results.add(fullUrl)
            }
          })

          return Array.from(results).slice(0, limit)
        }, maxPhotos)

        console.log(`[PlaceScraper] Found ${photoUrls.length} high-res photos to download...`)

        // Fast concurrent download using ArrayBuffer
        const downloadTasks = photoUrls.map((rawUrl, idx) => {
          const highResUrl = toHighResUrl(rawUrl)
          const fileName = `photo_${String(idx + 1).padStart(3, '0')}.jpg`
          const destPath = path.join(photosOwnerDir, fileName)
          return { highResUrl, fileName, destPath, index: idx + 1 }
        })

        const pLimit = 8
        for (let i = 0; i < downloadTasks.length; i += pLimit) {
          const chunk = downloadTasks.slice(i, i + pLimit)
          await Promise.all(
            chunk.map(async (t) => {
              const savedPath = await downloadImage(t.highResUrl, t.destPath)
              if (savedPath) {
                downloadedPhotos.owner.push({
                  index: t.index,
                  file: t.fileName,
                  relativePath: path.relative(companyDir, t.destPath),
                  originalUrl: t.highResUrl,
                })
              }
            })
          )
        }
        console.log(`  -> Successfully downloaded ${downloadedPhotos.owner.length} photos.`)
      }
    } catch (err) {
      console.warn(`[PlaceScraper] Photos extraction note: ${err.message}`)
    }
  }

  // Download review photos if any with concurrency
  const reviewTasks = []
  let reviewPhotoIdx = 1
  for (const rev of reviews) {
    if (rev.photos && rev.photos.length > 0) {
      for (const pUrl of rev.photos) {
        if (reviewPhotoIdx > maxPhotos) break
        const fileName = `review_photo_${String(reviewPhotoIdx).padStart(3, '0')}.jpg`
        const destPath = path.join(photosReviewsDir, fileName)
        reviewTasks.push({ pUrl, fileName, destPath, author: rev.author })
        reviewPhotoIdx++
      }
    }
  }

  for (let i = 0; i < reviewTasks.length; i += 8) {
    const chunk = reviewTasks.slice(i, i + 8)
    await Promise.all(
      chunk.map(async (t) => {
        const saved = await downloadImage(t.pUrl, t.destPath)
        if (saved) {
          downloadedPhotos.reviews.push({
            author: t.author,
            file: t.fileName,
            relativePath: path.relative(companyDir, t.destPath),
          })
        }
      })
    )
  }

  // 5. Save Structured Output Files
  companyInfo.totalPhotosDownloaded = downloadedPhotos.owner.length + downloadedPhotos.reviews.length
  companyInfo.totalReviewsScraped = reviews.length
  companyInfo.photos = downloadedPhotos

  // company.json
  const companyJsonPath = path.join(companyDir, 'company.json')
  await fs.writeJson(companyJsonPath, companyInfo, { spaces: 2 })

  // reviews.json
  const reviewsJsonPath = path.join(companyDir, 'reviews.json')
  await fs.writeJson(reviewsJsonPath, reviews, { spaces: 2 })

  // overview.txt (human-readable brief)
  const overviewContent = `=====================================================
COMPANY OVERVIEW: ${companyInfo.name}
=====================================================
State:           ${companyInfo.state || 'N/A'}
City:            ${companyInfo.city || 'N/A'}
Category:        ${companyInfo.category || 'Septic system service'}
Google Rating:   ${companyInfo.rating || 'N/A'} (${companyInfo.reviewCount || 0} reviews)
Phone:           ${companyInfo.phone || 'N/A'}
Website:         ${companyInfo.website || 'N/A'}
Website Status:  ${companyInfo.websiteIssue || (companyInfo.website ? 'Active' : 'No Website')}
Address:         ${companyInfo.address || 'N/A'}
Google Maps URL: ${companyInfo.url}

WORKING HOURS:
${companyInfo.hours && companyInfo.hours.length > 0 ? companyInfo.hours.map((h) => `  ${h.day.padEnd(12)} : ${h.hours}`).join('\n') : '  Not specified'}

PHOTOS DOWNLOADED:
  Gallery:       ${downloadedPhotos.owner.length} photos in ./photos/owner/
  From Reviews:  ${downloadedPhotos.reviews.length} photos in ./photos/reviews/
  Total:         ${companyInfo.totalPhotosDownloaded} high-res images

TOP REVIEWS PREVIEW (${reviews.length} total saved):
${reviews
  .slice(0, 10)
  .map(
    (r, i) =>
      `-----------------------------------------------------\n[#${i + 1}] ${r.author} (${r.rating}★, ${r.date})\n"${r.text}"`
  )
  .join('\n\n')}
`
  const overviewTxtPath = path.join(companyDir, 'overview.txt')
  await fs.writeFile(overviewTxtPath, overviewContent, 'utf-8')

  console.log(`\n[SUCCESS] Completed scraping for "${companyInfo.name}"`)
  console.log(`[OUTPUT FOLDER] ${companyDir}`)
  console.log(`  ├── company.json`)
  console.log(`  ├── reviews.json (${reviews.length} reviews)`)
  console.log(`  ├── overview.txt`)
  console.log(`  └── photos/ (${companyInfo.totalPhotosDownloaded} high-res images)`)

  // Automatically update summary spreadsheet (.xlsx and .csv)
  try {
    const tableRes = await appendOrUpdateCompanyInTable(companyInfo, outputBaseDir)
    if (tableRes) {
      console.log(`  └── [TABLE UPDATED] companies.xlsx & companies.csv (${tableRes.rowCount} total leads in table)`)
    }
  } catch (tableErr) {
    console.warn(`[TableExporter] Warning: Could not update table: ${tableErr.message}`)
  }

  return { companyDir, companyInfo }
}
