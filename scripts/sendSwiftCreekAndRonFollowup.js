import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function sendBlueVideoAndText(phone, text, videoPath) {
  const absVideo = path.resolve(videoPath)
  const script = `
    set theFile to (POSIX file "${absVideo}")
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${phone}" of targetService
      send theText to targetBuddy
      delay 4
      send theFile to targetBuddy
    end tell
  `
  return await execFileAsync('osascript', ['-e', script])
}

async function sendGreenSmsText(phone, text) {
  const script = `
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = SMS
      set targetBuddy to participant "${phone}" of targetService
      send theText to targetBuddy
    end tell
  `
  return await execFileAsync('osascript', ['-e', script])
}

async function main() {
  const logFile = path.resolve('./outreach_sent_log.json')
  let logData = { history: {} }
  if (await fs.pathExists(logFile)) {
    logData = await fs.readJson(logFile)
  }

  // 1. Send Swift Creek Plumbing (iMessage + Video)
  console.log(`\n[1/2] 🔵 Отправка Swift Creek Plumbing Company (+18045338203)...`)
  const swiftText = `Great to hear! Saw your solid reputation in Chesterfield.

Only thing is, your Google Maps profile doesn’t have a website button linked, so when locals look for major $10k+ septic installations, some end up trusting competitors instead.

I actually put together a clean mobile showcase for Swift Creek Plumbing featuring your equipment and reviews (sending a quick 15-sec preview below).

Want me to send the live link over to check it out?`
  const swiftVideo = './public/videos/swift-creek-plumbing-company/mobile.mp4'

  await sendBlueVideoAndText('+18045338203', swiftText, swiftVideo)
  console.log(`✅ Swift Creek Plumbing: Текст и видео mobile.mp4 успешно отправлены в iMessage!`)

  if (logData.history['+18045338203']) {
    logData.history['+18045338203'].msg2Sent = true
    logData.history['+18045338203'].replied = true
    logData.history['+18045338203'].followUpSentAt = new Date().toISOString()
  }

  // Пауза 25 секунд
  console.log(`⏳ Пауза 25 секунд...`)
  await sleep(25000)

  // 2. Send Ron (Stone's Pumping) follow-up SMS
  console.log(`\n[2/2] 🟢 Отправка follow-up Рону (Stone's Pumping, +14234585606)...`)
  const ronFollowupText = `Hey Ron, hope the preview loaded well! Curious what you think — does the equipment and service info look accurate to you?`
  await sendGreenSmsText('+14234585606', ronFollowupText)
  console.log(`✅ Stone's Pumping: Follow-up SMS успешно отправлен!`)

  if (logData.history['+14234585606']) {
    logData.history['+14234585606'].postVisitFollowupSentAt = new Date().toISOString()
  }

  await fs.writeJson(logFile, logData, { spaces: 2 })
  console.log(`\n🎉 ОБА ДЕЙСТВИЯ УСПЕШНО ВЫПОЛНЕНЫ!`)
}

main().catch(console.error)
