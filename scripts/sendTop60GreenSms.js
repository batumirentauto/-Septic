import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const LOG_FILE = path.resolve('./outreach_sent_log.json')
const CANDIDATES_FILE = path.resolve('./scripts/top60_green_sms.json')

function buildHookText(owner, city) {
  const name = owner && owner.trim() ? ` ${owner.trim()}` : ''
  return `Hey${name}, saw the great reviews on your work in ${city} — do you guys still take on septic installation and repair?`
}

async function sendGreenSms(phone, text) {
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
  console.log(`🚀 ЗАПУСК ТОП-60 ЗЕЛЕНЫХ SMS ДЛЯ ВЛАДЕЛЬЦЕВ НА ANDROID`)
  console.log(`========================================================================\n`)

  let logData = { history: {} }
  if (await fs.pathExists(LOG_FILE)) {
    logData = await fs.readJson(LOG_FILE)
  }

  const pool = await fs.readJson(CANDIDATES_FILE)
  console.log(`📋 Загружено ровно ${pool.length} контактов с именами владельцев.\n`)

  let count = 0
  for (const item of pool) {
    count++
    const text = buildHookText(item.owner, item.city)
    console.log(`[${count}/${pool.length}] 📩 ${item.owner} — ${item.company} (${item.city}, ${item.state}) -> ${item.phone}...`)

    try {
      await sendGreenSms(item.phone, text)
      console.log(`   🟢 УСПЕШНО: SMS доставлено оператору!`)

      logData.history[item.phone] = {
        company: item.company,
        owner: item.owner,
        city: `${item.city}, ${item.state}`,
        phone: item.phone,
        enUrl: item.slugUrl,
        channel: 'GREEN_SMS',
        dateKey: '2026-10-31',
        timestamp: new Date().toISOString(),
        msg1Sent: true,
        msg2Sent: false
      }
      await fs.writeJson(LOG_FILE, logData, { spaces: 2 })
    } catch (err) {
      console.log(`   ❌ Ошибка при отправке SMS: ${err.message}`)
    }

    if (count < pool.length) {
      const delay = Math.floor(30 + Math.random() * 15)
      console.log(`   ⏳ Естественная пауза ${delay} сек перед следующим подрядчиком...\n`)
      await sleep(delay * 1000)
    }
  }

  console.log(`\n========================================================================`)
  console.log(`🎉 ВСЕ 60 ЗЕЛЕНЫХ SMS УСПЕШНО ОБРАБОТАНЫ!`)
  console.log(`========================================================================\n`)
}

main().catch(console.error)
