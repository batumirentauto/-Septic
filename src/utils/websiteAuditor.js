import axios from 'axios'

/**
 * Audits a company's website to determine if it meets the criteria:
 * 1. No website attached in Google Maps -> MATCH
 * 2. Is a Facebook page -> MATCH
 * 3. Does not open / broken (HTTP 4xx/5xx, DNS failure, timeout, SSL error, parked domain) -> MATCH
 * 4. Normal working website -> SKIP (NOT a target)
 *
 * @param {string|null} rawUrl - Website URL from Google Maps card
 * @returns {Promise<{ isValidTarget: boolean, issueType: string, issueDescription: string }>}
 */
export async function auditCompanyWebsite(rawUrl) {
  // Case 1: No website attached in Google Maps
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    return {
      isValidTarget: true,
      issueType: 'NO_WEBSITE',
      issueDescription: 'Сайт отсутствует в карточке',
    }
  }

  let cleanUrl = rawUrl.trim()

  // Unwrap Google redirect URL if present: https://www.google.com/url?q=...
  if (cleanUrl.includes('google.com/url?q=')) {
    const match = cleanUrl.match(/google\.com\/url\?q=([^&]+)/)
    if (match) {
      try {
        cleanUrl = decodeURIComponent(match[1])
      } catch {
        // ignore
      }
    }
  }

  // Case 2: Check if Facebook page
  const isFacebook =
    /https?:\/\/(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\//i.test(cleanUrl) ||
    cleanUrl.includes('facebook.com') ||
    cleanUrl.includes('fb.me') ||
    cleanUrl.includes('fb.com')

  if (isFacebook) {
    return {
      isValidTarget: true,
      issueType: 'FACEBOOK',
      issueDescription: 'Страница Facebook вместо сайта',
    }
  }

  // Case 3: Network verification of website accessibility
  try {
    const res = await axios.get(cleanUrl, {
      timeout: 6000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw for 4xx/5xx, inspect status directly
    })

    // If 403 from Cloudflare bot challenge, it's an active protected site (e.g., Mr Rooter), not broken
    const serverHeader = (res.headers['server'] || '').toLowerCase()
    const isCloudflareChallenge =
      res.status === 403 &&
      (serverHeader.includes('cloudflare') ||
        Boolean(res.headers['cf-ray']) ||
        String(res.data).includes('challenges.cloudflare.com'))

    if (isCloudflareChallenge) {
      return {
        isValidTarget: false,
        issueType: 'CLOUDFLARE_PROTECTED',
        issueDescription: 'Сайт работает нормально (Защищён Cloudflare)',
      }
    }

    if (res.status >= 400) {
      return {
        isValidTarget: true,
        issueType: `HTTP_${res.status}`,
        issueDescription: `Сайт не открывается (Ошибка HTTP ${res.status})`,
      }
    }

    // Check if redirected to a domain parking / for sale page
    const finalUrl = res.request?.res?.responseUrl || cleanUrl
    if (/godaddy\.com\/domainsearch|namecheap\.com|hugedomains\.com|dan\.com|sedo\.com/i.test(finalUrl)) {
      return {
        isValidTarget: true,
        issueType: 'DOMAIN_PARKED',
        issueDescription: 'Домен не работает (припаркован / продаётся)',
      }
    }

    // Normal working website -> Does NOT match user criteria
    return {
      isValidTarget: false,
      issueType: 'ONLINE',
      issueDescription: 'Сайт работает нормально',
    }
  } catch (err) {
    // Network / SSL / DNS / Timeout errors -> Matches criteria!
    let desc = 'Сайт не открывается'
    if (err.code === 'ENOTFOUND') {
      desc = 'Сайт не открывается (Домен не найден / DNS ошибка)'
    } else if (err.code === 'ECONNREFUSED') {
      desc = 'Сайт не открывается (Сервер сбросил соединение)'
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      desc = 'Сайт не открывается (Таймаут соединения)'
    } else if (err.code && err.code.includes('CERT')) {
      desc = 'Ошибка безопасности (Истёк или недействителен SSL)'
    } else {
      desc = `Сайт не открывается (${err.code || err.message})`
    }

    return {
      isValidTarget: true,
      issueType: err.code || 'NETWORK_ERROR',
      issueDescription: desc,
    }
  }
}
