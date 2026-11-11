import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const WARM_LEADS = [
  {
    phone: "+13522727247",
    company: "Superior Septic Services",
    name: "Kaylee",
    slug: "superior-septic-services",
    channel: "BLUE_IMESSAGE",
    text: `Awesome Kaylee! Here is the custom mobile preview page built for Superior Septic: https://septic.up.railway.app/superior-septic-services

Take 10 seconds to scroll on your phone and let me know if your equipment and service info look accurate!`
  },
  {
    phone: "+14104303897",
    company: "B.L Phippin & Son Construction LLC",
    name: "Justin",
    slug: "bl-phippin-son-construction-llc",
    channel: "BLUE_IMESSAGE",
    text: `Awesome! Here is the custom mobile preview built for B.L Phippin & Son: https://septic.up.railway.app/bl-phippin-son-construction-llc

Take 10 seconds on your phone to check if your machinery photos and service info look accurate!`
  },
  {
    phone: "+12565223945",
    company: "Miller Environmental Services",
    name: "Stephanie",
    slug: "miller-environmental-services",
    channel: "BLUE_IMESSAGE",
    text: `Awesome! Here is the custom mobile preview page built for Miller Environmental: https://septic.up.railway.app/miller-environmental-services

Take 10 seconds to scroll on your phone — does the equipment and info look accurate to you?`
  },
  {
    phone: "+16158150229",
    company: "KD Services Excavation & Septic",
    name: "Drew",
    slug: "kd-services-excavation-septic",
    channel: "BLUE_IMESSAGE",
    text: `Awesome! Here is the custom mobile preview tailored right to Dickson co for KD Services: https://septic.up.railway.app/kd-services-excavation-septic

Take 10 seconds to scroll on your phone and let me know if everything looks accurate!`
  },
  {
    phone: "+18045338203",
    company: "Swift Creek Plumbing Company",
    name: "Mike",
    slug: "swift-creek-plumbing-company",
    channel: "BLUE_IMESSAGE",
    text: `Awesome Mike! Here is the custom preview page built for Swift Creek Plumbing: https://septic.up.railway.app/swift-creek-plumbing-company

Take 10 seconds to scroll on your phone — does your equipment and service area look accurate?`
  }
]

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

async function main() {
  console.log(`\n========================================================================`)
  console.log(`🚀 ОТПРАВКА ПРЯМЫХ ССЫЛОК ДЛЯ ${WARM_LEADS.length} ТЕПЛЫХ ПОДРЯДЧИКОВ`)
  console.log(`========================================================================\n`)

  const logFile = path.resolve('./outreach_sent_log.json')
  let logData = { history: {} }
  if (await fs.pathExists(logFile)) {
    logData = await fs.readJson(logFile)
  }

  let count = 0
  for (const lead of WARM_LEADS) {
    count++
    console.log(`[${count}/${WARM_LEADS.length}] 📩 Отправка ссылки для ${lead.company} (${lead.phone})...`)
    try {
      await sendBlueImessage(lead.phone, lead.text)
      console.log(`   ✅ Успешно отправлена ссылка в iMessage!`)

      if (logData.history && logData.history[lead.phone]) {
        logData.history[lead.phone].linkSentAt = new Date().toISOString()
      }
      await fs.writeJson(logFile, logData, { spaces: 2 })
    } catch (err) {
      console.error(`   ❌ Ошибка: ${err.message}`)
    }

    if (count < WARM_LEADS.length) {
      const waitSec = Math.floor(25 + Math.random() * 15)
      console.log(`⏳ Пауза ${waitSec} сек перед следующим сообщением...\n`)
      await sleep(waitSec * 1000)
    }
  }

  console.log(`\n🎉 ВСЕ ССЫЛКИ УСПЕШНО ОТПРАВЛЕНЫ! ЖДЕМ ВИЗИТОВ НА РАДАРЕ!`)
}

main().catch(console.error)
