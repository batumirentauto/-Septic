import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const RON_PHONE = "+14234585606"

const MSG_1 = `Got it updated for you Ron! Swapped out Knoxville for Rockwood, Kingston, Harriman, Dayton, Cleveland & Sweetwater: https://septic.up.railway.app/stones-pumping`

const MSG_2 = `Take a quick look at the pricing estimator on there too — let me know if those rates match what you charge or if you want me to tweak the numbers/options. And if you have 2-3 photos of your truck in your camera roll, text them over and I'll drop them right in!`

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
  console.log(`\n========================================================================`)
  console.log(`🚀 ОТПРАВКА ОБНОВЛЕНИЯ РОНУ (Stone's Pumping, ${RON_PHONE})`)
  console.log(`========================================================================\n`)

  console.log(`[1/2] 📩 Отправка Сообщения 1 (Ссылка с обновленными городами)...`)
  await sendGreenSmsText(RON_PHONE, MSG_1)
  console.log(`   ✅ Сообщение 1 успешно отправлено в SMS!`)

  console.log(`⏳ Пауза 6 секунд (естественный темп живого человека)...`)
  await sleep(6000)

  console.log(`[2/2] 📩 Отправка Сообщения 2 (Калькулятор цен + запрос фото техники)...`)
  await sendGreenSmsText(RON_PHONE, MSG_2)
  console.log(`   ✅ Сообщение 2 успешно отправлено в SMS!`)

  const logFile = path.resolve('./outreach_sent_log.json')
  if (await fs.pathExists(logFile)) {
    const logData = await fs.readJson(logFile)
    if (logData.history && logData.history[RON_PHONE]) {
      logData.history[RON_PHONE].ronCustomUpdateSentAt = new Date().toISOString()
      await fs.writeJson(logFile, logData, { spaces: 2 })
    }
  }

  console.log(`\n🎉 ОБА СООБЩЕНИЯ РОНУ УСПЕШНО ДОСТАВЛЕНЫ!`)
}

main().catch(console.error)
