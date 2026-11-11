import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as XLSXModule from 'xlsx'
import { recordShowcaseVideos } from './recordShowcaseVideos.js'

const execFileAsync = promisify(execFile)
const XLSX = XLSXModule.default || XLSXModule

const CHAT_DB_PATH = path.join(os.homedir(), 'Library', 'Messages', 'chat.db')
const LOG_FILE_PATH = path.resolve('./outreach_sent_log.json')
const EXCEL_PATH = path.resolve('./outreach_316_high_ticket.xlsx')

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function querySqlite(sql) {
  const { stdout } = await execFileAsync('sqlite3', [CHAT_DB_PATH, sql])
  return stdout.trim()
}

// Отправка файла через Messages UI (буфер обмена + Cmd+V + Enter)
async function sendAttachmentViaUi(phoneE164, filePath) {
  const absPath = path.resolve(filePath)
  if (!(await fs.pathExists(absPath))) {
    console.error(`❌ Файл не найден: ${absPath}`)
    return false
  }

  // 1. Копируем файл в буфер обмена macOS как файл
  const setClipboardScript = `
    set theFile to (POSIX file "${absPath}") as alias
    set the clipboard to (theFile)
  `
  await execFileAsync('osascript', ['-e', setClipboardScript])

  // 2. Открываем ветку и вставляем файл
  const pasteScript = `
    open location "sms://${phoneE164}"
    delay 1.5
    tell application "System Events"
      tell process "Messages"
        set frontmost to true
        delay 0.5
        keystroke "v" using {command down}
        delay 1.5
        key code 36 -- Return
      end tell
    end tell
  `
  await execFileAsync('osascript', ['-e', pasteScript])
  return true
}

// Отправка текста через sms:// URL
async function sendTextViaUi(phoneE164, text) {
  const encText = encodeURIComponent(text)
  const script = `
    open location "sms://${phoneE164}?&body=${encText}"
    delay 1.8
    tell application "System Events"
      tell process "Messages"
        set frontmost to true
        delay 0.6
        key code 36 -- Return
      end tell
    end tell
  `
  await execFileAsync('osascript', ['-e', script])
  return true
}

// Формирование нового текста Сообщения 2 (с $10k+ и проверкой точности данных)
export function buildV2Message(contractor) {
  const owner = String(contractor['Имя владельца (Owner)'] || '').trim()
  const city = String(contractor['Город'] || 'your area').trim()
  const company = String(contractor['Компания (Company)'] || 'your company').trim()

  const firstName = owner && !owner.toLowerCase().includes('owner') && !owner.includes('—')
    ? owner.split(' ')[0].replace(/[^a-zA-Z]/g, '')
    : ''
  const greeting = firstName ? `Great to hear ${firstName}!` : `Great to hear!`

  return `${greeting} Saw your 5-star reputation in ${city} — people clearly respect your work.

Only thing is, your Google Maps profile has no website button attached. When homeowners are about to spend $10,000+ on a major septic replacement, they almost always want to see an official site first — so without one, some end up trusting competitors instead.

Put together a clean showcase for ${company} featuring your actual equipment and reviews (sending mobile & desktop previews below).

Want me to send the link so you can check if your services and details are accurate?`
}

// Отправка полной связки (Текст -> Видео 1 -> Видео 2)
export async function sendShowcaseBundle(phoneE164, contractor, slug) {
  console.log(`\n========================================================================`)
  console.log(`🚀 ОТПРАВКА СВЯЗКИ (ТЕКСТ + 2 ВИДЕО) ДЛЯ: ${contractor['Компания (Company)']} (${phoneE164})`)
  console.log(`========================================================================`)

  // 1. Убеждаемся, что видео существуют
  const videos = await recordShowcaseVideos({ slug })
  console.log(`📁 Видео готовы:`)
  console.log(`   📱 Mobile:  ${videos.mobileMp4}`)
  console.log(`   💻 Desktop: ${videos.desktopMp4}`)

  // 2. Отправляем текст
  const textMsg = buildV2Message(contractor)
  console.log(`\n💬 Шаг 1: Отправка текста Сообщения 2...`)
  await sendTextViaUi(phoneE164, textMsg)
  console.log(`✅ Текст отправлен. Пауза 5 сек перед видео 1...`)
  await sleep(5000)

  // 3. Отправляем мобильное видео (MMS 1)
  console.log(`📱 Шаг 2: Отправка мобильного видео (MMS 1)...`)
  await sendAttachmentViaUi(phoneE164, videos.mobileMp4)
  console.log(`✅ Мобильное видео отправлено. Пауза 5 сек перед видео 2...`)
  await sleep(5000)

  // 4. Отправляем десктопное видео (MMS 2)
  console.log(`💻 Шаг 3: Отправка десктопного видео (MMS 2)...`)
  await sendAttachmentViaUi(phoneE164, videos.desktopMp4)
  console.log(`✅ Десктопное видео отправлено! Полная связка успешно доставлена!`)
  console.log(`========================================================================\n`)
  return true
}

// Прямой вызов для теста (например, node scripts/sendShowcaseBundle.js +16067824356 american-septic)
if (process.argv[1]?.endsWith('sendShowcaseBundle.js')) {
  const phone = process.argv[2]
  const slug = process.argv[3]
  if (!phone || !slug) {
    console.log('Использование: node scripts/sendShowcaseBundle.js <phone> <slug>')
    process.exit(1)
  }

  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const contractor = allRows.find(r => (r['Ссылка для клиента (EN)'] || '').includes(slug)) || {
    'Компания (Company)': slug,
    'Имя владельца (Owner)': '',
    'Город': 'your area'
  }

  sendShowcaseBundle(phone, contractor, slug).catch(console.error)
}
