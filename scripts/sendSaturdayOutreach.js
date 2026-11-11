import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const MAX_GREEN_SMS_TODAY = 60
const LOG_FILE = path.resolve('./outreach_sent_log.json')
const CANDIDATES_FILE = path.resolve('./scripts/untouched_candidates.json')

function buildHookText(owner, city) {
  const name = owner && owner.trim() ? ` ${owner.trim()}` : ''
  return `Hey${name}, saw the great reviews on your work in ${city} — do you guys still take on septic installation and repair?`
}

async function sendBlueImessage(phone, text) {
  const script = `
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${phone}" of targetService
      send theText to targetBuddy
    end tell
  `
  return await execFileAsync('osascript', ['-e', script])
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
  console.log(`🚀 СУББОТНЯЯ РАССЫЛКА (EAST + CENTRAL) С ЛИМИТОМ ЗЕЛЕНЫХ: МАКСИМУМ ${MAX_GREEN_SMS_TODAY} SMS`)
  console.log(`========================================================================\n`)

  let logData = { history: {} }
  if (await fs.pathExists(LOG_FILE)) {
    logData = await fs.readJson(LOG_FILE)
  }

  const candidatePool = await fs.readJson(CANDIDATES_FILE)

  console.log(`📋 Всего найдено ${candidatePool.length} нетронутых компаний в поясах EST и CST.`)
  console.log(`🎯 Лимит зелёных SMS на сегодня: строго не более ${MAX_GREEN_SMS_TODAY} сообщений.\n`)

  let blueCount = 0
  let greenCount = 0
  let skippedCount = 0
  let totalProcessed = 0

  for (const item of candidatePool) {
    // Проверяем актуальный лог (вдруг контакт уже был отправлен)
    if (logData.history[item.phone]) {
      continue
    }

    totalProcessed++
    const text = buildHookText(item.owner, item.city)

    console.log(`[${totalProcessed}/${candidatePool.length}] 📩 ${item.company} (${item.owner || 'No owner'}, ${item.city}, ${item.state}) -> ${item.phone}...`)

    let channel = 'UNKNOWN'
    let sent = false

    // 1. Сначала пробуем синий iMessage
    try {
      await sendBlueImessage(item.phone, text)
      channel = 'BLUE_IMESSAGE'
      blueCount++
      sent = true
      console.log(`   🔵 УСПЕХ: Отправлено через синий iMessage! (Всего синих: ${blueCount})`)
    } catch (err) {
      // 2. Если ошибка (Android / Landline), пробуем Green SMS с учётом лимита 60
      if (err.message.includes('22') || err.message.includes('error number')) {
        if (greenCount < MAX_GREEN_SMS_TODAY) {
          try {
            await sendGreenSms(item.phone, text)
            channel = 'GREEN_SMS'
            greenCount++
            sent = true
            console.log(`   🟢 УСПЕХ: Отправлено через зелёный SMS! (Зелёных: ${greenCount}/${MAX_GREEN_SMS_TODAY})`)
          } catch (smsErr) {
            console.log(`   ❌ Ошибка при отправке SMS: ${smsErr.message}`)
            channel = 'SMS_FAILED'
          }
        } else {
          channel = 'GREEN_SKIPPED_LIMIT_60'
          skippedCount++
          console.log(`   ⏸️ Лимит зелёных (${MAX_GREEN_SMS_TODAY}) исчерпан — пропускаем SMS для этого контакта.`)
        }
      } else {
        console.log(`   ❌ Другая ошибка: ${err.message}`)
        channel = 'ERROR_OTHER'
      }
    }

    // Сохраняем в лог
    logData.history[item.phone] = {
      company: item.company,
      owner: item.owner,
      city: `${item.city}, ${item.state}`,
      phone: item.phone,
      enUrl: item.slugUrl,
      channel,
      dateKey: '2026-10-31',
      timestamp: new Date().toISOString(),
      msg1Sent: sent,
      msg2Sent: false
    }
    await fs.writeJson(LOG_FILE, logData, { spaces: 2 })

    // Естественная пауза между отправками (25–40 сек)
    if (sent) {
      const delay = Math.floor(25 + Math.random() * 15)
      console.log(`   ⏳ Пауза ${delay} сек перед следующим подрядчиком...\n`)
      await sleep(delay * 1000)
    } else {
      // Быстрый шаг при пропуске
      await sleep(2000)
    }
  }

  console.log(`\n========================================================================`)
  console.log(`🎉 РАССЫЛКА ЗАВЕРШЕНА!`)
  console.log(`🔵 Отправлено синих iMessage: ${blueCount}`)
  console.log(`🟢 Отправлено зелёных SMS: ${greenCount} (лимит был: ${MAX_GREEN_SMS_TODAY})`)
  console.log(`⏸️ Пропущено из-за лимита: ${skippedCount}`)
  console.log(`========================================================================\n`)
}

main().catch(console.error)
