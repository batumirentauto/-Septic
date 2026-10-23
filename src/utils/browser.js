import { chromium } from 'playwright'

/**
 * Launch Chromium with stealth arguments and realistic user profile
 */
export async function createBrowser(options = {}) {
  const isHeadless = options.headless !== undefined ? options.headless : true

  const browser = await chromium.launch({
    headless: isHeadless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ],
  })

  return browser
}

/**
 * Create a fresh stealth context
 */
export async function createBrowserContext(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 28.5383, longitude: -81.3792 },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })
  })

  return context
}

/**
 * Handle Google cookie consent dialogs if they pop up
 */
export async function handleGoogleConsent(page) {
  try {
    const consentButtons = [
      'button:has-text("Accept all")',
      'button:has-text("I agree")',
      'button:has-text("Принять все")',
      'button:has-text("Согласиться")',
      'form[action*="consent"] button',
    ]

    for (const selector of consentButtons) {
      const btn = await page.$(selector)
      if (btn && (await btn.isVisible())) {
        await btn.click()
        await page.waitForTimeout(1000)
        break
      }
    }
  } catch {
    // Ignore if consent modal is not present
  }
}
