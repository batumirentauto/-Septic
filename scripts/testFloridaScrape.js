import { createBrowser, createBrowserContext, handleGoogleConsent } from '../src/utils/browser.js'

async function testScrape() {
  const browser = await createBrowser({ headless: true })
  const context = await createBrowserContext(browser)
  const page = await context.newPage()

  const query = 'septic service Ocala FL'
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`

  console.log(`Navigating to: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)
  await handleGoogleConsent(page)
  await page.waitForTimeout(1000)

  // Scroll feed a few times
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]')
      if (feed) feed.scrollBy(0, 1500)
    })
    await page.waitForTimeout(700)
  }

  const cards = await page.evaluate(() => {
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

      // Check website button directly on card if available
      const webBtn = card.querySelector('a[data-value="Website"], a[aria-label*="website" i]')
      const websiteOnCard = webBtn ? webBtn.getAttribute('href') : null

      return { name, placeUrl, rating, reviewsCount, websiteOnCard }
    })
  })

  console.log(`Found ${cards.length} cards in Ocala, FL:`)
  console.log(JSON.stringify(cards.slice(0, 8), null, 2))

  await browser.close()
}

testScrape().catch(console.error)
