import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs-extra'
import { execFileSync } from 'child_process'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const FFMPEG_PATH = ffmpegInstaller.path

export async function recordShowcaseVideos({
  slug,
  baseUrl = 'http://localhost:3000',
  outDir = path.resolve('./public/videos')
}) {
  const targetDir = path.join(outDir, slug)
  await fs.ensureDir(targetDir)

  const mobileMp4 = path.join(targetDir, 'mobile.mp4')
  const desktopMp4 = path.join(targetDir, 'desktop.mp4')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    // 1. MOBILE RECORDING (Честный iPhone 390x844, ровно 9:16 БЕЗ серых полей!)
    const tempMobileDir = path.join(targetDir, 'temp_mobile')
    await fs.ensureDir(tempMobileDir)

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      recordVideo: {
        dir: tempMobileDir,
        size: { width: 390, height: 844 } // Ровно под размер окна!
      }
    })

    const mobilePage = await mobileContext.newPage()
    await mobilePage.goto(`${baseUrl}/${slug}?notrack=1`, { waitUntil: 'networkidle' })
    
    // 1. Спокойная фиксация на шапке (2 секунды)
    await mobilePage.waitForTimeout(2000)

    // 2. Медленный человеческий скролл с микропаузами
    await mobilePage.evaluate(async () => {
      // Скролл к блоку техники
      const scrollTo = async (targetY, durationMs) => {
        const startY = window.scrollY
        const distance = targetY - startY
        const startTime = performance.now()
        while (performance.now() - startTime < durationMs) {
          const progress = (performance.now() - startTime) / durationMs
          // Плавная функция ease-in-out
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress
          window.scrollTo(0, startY + distance * ease)
          await new Promise((r) => setTimeout(r, 16))
        }
        window.scrollTo(0, targetY)
      }

      // Шаг 1: скроллим к технике (за 3.5 секунды)
      await scrollTo(850, 3500)
      await new Promise((r) => setTimeout(r, 2200)) // Остановка на технике на 2.2 секунды

      // Шаг 2: скроллим к галерее и отзывам (за 3.5 секунды)
      await scrollTo(1750, 3500)
      await new Promise((r) => setTimeout(r, 2200)) // Остановка на отзывах на 2.2 секунды

      // Шаг 3: скроллим к калькулятору (за 2.5 секунды)
      await scrollTo(2400, 2500)
      await new Promise((r) => setTimeout(r, 1500)) // Финал
    })

    await mobilePage.close()
    await mobileContext.close()

    const mobileFiles = await fs.readdir(tempMobileDir)
    const mobileWebm = mobileFiles.find((f) => f.endsWith('.webm'))
    if (mobileWebm) {
      const inputWebm = path.join(tempMobileDir, mobileWebm)
      // Конвертируем БЕЗ pad, сохраняя родное соотношение сторон смартфона
      execFileSync(FFMPEG_PATH, [
        '-y',
        '-i',
        inputWebm,
        '-vf',
        'scale=390:844,fps=24',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-profile:v',
        'baseline',
        '-level',
        '3.0',
        '-pix_fmt',
        'yuv420p',
        '-b:v',
        '450k',
        '-maxrate',
        '550k',
        '-bufsize',
        '700k',
        '-an',
        mobileMp4
      ])
      await fs.remove(tempMobileDir)
    }

    // 2. DESKTOP RECORDING (Честный десктоп 1280x720, 16:9 на весь экран)
    const tempDesktopDir = path.join(targetDir, 'temp_desktop')
    await fs.ensureDir(tempDesktopDir)

    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1.5,
      recordVideo: {
        dir: tempDesktopDir,
        size: { width: 1280, height: 720 }
      }
    })

    const desktopPage = await desktopContext.newPage()
    await desktopPage.goto(`${baseUrl}/${slug}?notrack=1`, { waitUntil: 'networkidle' })
    
    // Спокойная фиксация на шапке десктопа (2.0 секунды)
    await desktopPage.waitForTimeout(2000)

    // Человеческий десктопный скролл с остановками
    await desktopPage.evaluate(async () => {
      const scrollTo = async (targetY, durationMs) => {
        const startY = window.scrollY
        const distance = targetY - startY
        const startTime = performance.now()
        while (performance.now() - startTime < durationMs) {
          const progress = (performance.now() - startTime) / durationMs
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress
          window.scrollTo(0, startY + distance * ease)
          await new Promise((r) => setTimeout(r, 16))
        }
        window.scrollTo(0, targetY)
      }

      // Шаг 1: скроллим к технике (парк оборудования)
      await scrollTo(800, 3200)
      await new Promise((r) => setTimeout(r, 2200))

      // Шаг 2: скроллим к галерее работ и отзывам
      await scrollTo(1600, 3200)
      await new Promise((r) => setTimeout(r, 2200))

      // Шаг 3: скроллим к калькулятору и карте
      await scrollTo(2300, 2500)
      await new Promise((r) => setTimeout(r, 1500))
    })

    await desktopPage.close()
    await desktopContext.close()

    const desktopFiles = await fs.readdir(tempDesktopDir)
    const desktopWebm = desktopFiles.find((f) => f.endsWith('.webm'))
    if (desktopWebm) {
      const inputWebm = path.join(tempDesktopDir, desktopWebm)
      execFileSync(FFMPEG_PATH, [
        '-y',
        '-i',
        inputWebm,
        '-vf',
        'scale=1280:720,fps=24',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-profile:v',
        'baseline',
        '-level',
        '3.0',
        '-pix_fmt',
        'yuv420p',
        '-b:v',
        '450k',
        '-maxrate',
        '550k',
        '-bufsize',
        '700k',
        '-an',
        desktopMp4
      ])
      await fs.remove(tempDesktopDir)
    }

    return { mobileMp4, desktopMp4, skipped: false }
  } finally {
    await browser.close()
  }
}

// Прямой запуск для теста
const isDirectRun = process.argv[1]?.endsWith('recordShowcaseVideos.js')
if (isDirectRun) {
  const testSlug = process.argv[2] || 'fehl-safe-plumbing'
  console.log(`🎬 Тестовая перегенерация чистого видео для: ${testSlug}...`)
  recordShowcaseVideos({ slug: testSlug })
    .then(async (res) => {
      const mobileSize = (await fs.stat(res.mobileMp4)).size
      const desktopSize = (await fs.stat(res.desktopMp4)).size
      console.log(`✅ ГОТОВО!`)
      console.log(`📱 Мобильное: ${res.mobileMp4} (${(mobileSize / 1024).toFixed(1)} КБ)`)
      console.log(`💻 Десктоп:  ${res.desktopMp4} (${(desktopSize / 1024).toFixed(1)} КБ)`)
    })
    .catch(console.error)
}
