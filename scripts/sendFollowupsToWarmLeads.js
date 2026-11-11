import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const LEADS = [
  {
    phone: "+13522727247",
    company: "Superior Septic Services",
    recipientName: "Kaylee",
    channel: "BLUE_IMESSAGE",
    videoSlug: "superior-septic-services",
    text: `Great to hear Kaylee! Saw your 5-star reputation in Umatilla — people clearly respect your work.

Only thing is, your Google profile has no website button attached, so when local homeowners look for major $10k+ septic replacements, some end up trusting competitors instead.

I actually put together a clean mobile showcase for Superior Septic featuring your actual equipment and reviews (sending a quick 15-sec preview below).

Want me to send the live link so you can check if your services are accurate?`
  },
  {
    phone: "+14104303897",
    company: "B.L Phippin & Son Construction LLC",
    recipientName: "",
    channel: "BLUE_IMESSAGE",
    videoSlug: "bl-phippin-son-construction-llc",
    text: `Love that! Saw your solid reputation in Salisbury — clearly trusted in the area.

The reason I reached out is your Google profile doesn’t have a website button linked, so homeowners searching for major $10k+ septic installations often end up calling competitors instead.

I put together a quick mobile showcase for B.L Phippin & Son featuring your equipment and work (sending a 15-sec video below).

Want me to text the link over so you can see if all your info looks accurate?`
  },
  {
    phone: "+12565223945",
    company: "Miller Environmental Services",
    recipientName: "",
    channel: "BLUE_IMESSAGE",
    videoSlug: "miller-environmental-services",
    text: `Great to hear! Saw your solid work in Cullman.

Main reason I reached out: your Google Maps profile has no website button attached, so when locals search for big $10k+ septic replacements, some end up going to competitors.

Put together a clean mobile preview for Miller Environmental with your equipment and reviews (sending a quick 15-sec video below).

Want me to send the live link over to check it out?`
  },
  {
    phone: "+16158150229",
    company: "KD Services Excavation & Septic",
    recipientName: "",
    channel: "BLUE_IMESSAGE",
    videoSlug: "kd-services-excavation-septic",
    text: `Makes complete sense staying focused right in Dickson County!

Actually wasn't looking for a job out of area — noticed your Google profile has no website button attached, so local homeowners searching around Dickson often end up calling competitors for $10k+ jobs.

I put together a clean mobile showcase for KD Services tailored right to Dickson co (sending a 15-sec preview below).

Want me to send the live link so you can check if your equipment and info look accurate?`
  },
  {
    phone: "+14234585606",
    company: "Stone's Pumping",
    recipientName: "Ron",
    channel: "GREEN_SMS",
    videoSlug: null,
    text: `Awesome Ron, here is the custom preview page built for Stone's Pumping: https://septic.up.railway.app/stones-pumping — take a quick scroll on your phone and let me know if everything on there looks accurate!`
  }
]

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
  console.log(`\n========================================================================`)
  console.log(`🚀 ОТПРАВКА ПЕРСОНАЛЬНЫХ ОТВЕТОВ ДЛЯ ${LEADS.length} ГОРЯЧИХ ЛИДОВ`)
  console.log(`========================================================================\n`)

  const logFile = path.resolve('./outreach_sent_log.json')
  let logData = { history: {} }
  if (await fs.pathExists(logFile)) {
    logData = await fs.readJson(logFile)
  }

  let count = 0
  for (const lead of LEADS) {
    count++
    console.log(`[${count}/${LEADS.length}] 📩 ${lead.company} (${lead.phone}, ${lead.channel})...`)

    try {
      if (lead.channel === 'BLUE_IMESSAGE') {
        const videoPath = `./public/videos/${lead.videoSlug}/mobile.mp4`
        if (!await fs.pathExists(videoPath)) {
          throw new Error(`Video file not found: ${videoPath}`)
        }
        await sendBlueVideoAndText(lead.phone, lead.text, videoPath)
        console.log(`   ✅ Успешно отправлен текст + видео mobile.mp4 (${lead.videoSlug})!`)
      } else {
        await sendGreenSmsText(lead.phone, lead.text)
        console.log(`   ✅ Успешно отправлена ссылка через SMS!`)
      }

      if (logData.history && logData.history[lead.phone]) {
        logData.history[lead.phone].msg2Sent = true
        logData.history[lead.phone].replied = true
        logData.history[lead.phone].followUpSentAt = new Date().toISOString()
      }
      await fs.writeJson(logFile, logData, { spaces: 2 })

    } catch (err) {
      console.error(`   ❌ Ошибка при отправке для ${lead.phone}: ${err.message}`)
    }

    if (count < LEADS.length) {
      const waitSec = Math.floor(25 + Math.random() * 15)
      console.log(`⏳ Пауза ${waitSec} сек перед следующим сообщением...\n`)
      await sleep(waitSec * 1000)
    }
  }

  console.log(`\n🎉 ВСЕ 5 ГОРЯЧИХ ЛИДОВ ОБРАБОТАНЫ!`)
}

main().catch(console.error)
