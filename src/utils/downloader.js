import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'

/**
 * Clean business title to make a safe filesystem folder name
 */
export function sanitizeFolderName(name) {
  if (!name) return 'Unknown_Business'
  return name
    .replace(/[<>:"/\\|?*]/g, '') // remove illegal filesystem chars
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100)
}

/**
 * Convert Google Maps thumbnail URL to maximum resolution original image
 */
export function toHighResUrl(url) {
  if (!url) return null

  // Google usercontent photos
  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    if (url.includes('=')) {
      return url.replace(/=w\d+-h\d+.*$/, '=s0').replace(/=s\d+.*$/, '=s0')
    }
    return `${url}=s0`
  }

  // Street view or other googleapis
  if (url.includes('streetviewpixels-pa.googleapis.com')) {
    return url.replace(/w\d+-h\d+/, 'w1600-h1200')
  }

  return url
}

/**
 * Download an image file from a URL to destination path using ArrayBuffer
 * This ensures no unhandled stream events or process hangs
 */
export async function downloadImage(url, destFilePath, timeoutMs = 8000) {
  try {
    const highRes = toHighResUrl(url)
    await fs.ensureDir(path.dirname(destFilePath))

    const response = await axios.get(highRes, {
      responseType: 'arraybuffer',
      timeout: timeoutMs,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })

    if (response.status === 200 && response.data) {
      await fs.writeFile(destFilePath, Buffer.from(response.data))
      return destFilePath
    }
  } catch {
    // Fallback to original URL
    try {
      const fallbackRes = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 6000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      })
      if (fallbackRes.status === 200 && fallbackRes.data) {
        await fs.writeFile(destFilePath, Buffer.from(fallbackRes.data))
        return destFilePath
      }
    } catch {
      return null
    }
  }
  return null
}
