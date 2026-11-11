import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const BLUES = [
  {
    phone: "+17245444979",
    company: "Bonzo Excavating",
    owner: "Zac",
    city: "Pittsburgh",
    slug: "bonzo-excavating"
  },
  {
    phone: "+13525285391",
    company: "Dunnellon Septic Tank Service Inc",
    owner: "Ryan",
    city: "Morriston",
    slug: "dunnellon-septic-tank-service-inc"
  },
  {
    phone: "+19102372003",
    company: "R & J Septic Tank Services",
    owner: "Reggie",
    city: "Fayetteville",
    slug: "r-j-septic-tank-services"
  },
  {
    phone: "+17245811495",
    company: "Chaffee Excavating Inc",
    owner: "",
    city: "Darlington",
    slug: "chaffee-excavating-inc"
  },
  {
    phone: "+16039779037",
    company: "Evergreen Drain and Septic",
    owner: "Lindsay", // его жена Линдси отвечала лично!
    city: "Alexandria",
    slug: "evergreen-drain-and-septic"
  },
  {
    phone: "+13364911470",
    company: "Brian's Septic Service",
    owner: "Brian",
    city: "Greensboro",
    slug: "brians-septic-service"
  },
  {
    phone: "+12074171434",
    company: "Brag’s Sewer & Septic",
    owner: "Tyler",
    city: "Augusta",
    slug: "brags-sewer-septic"
  },
  {
    phone: "+19136699397",
    company: "Larsen & Sons Plumbing",
    owner: "Chris",
    city: "Spring Hill",
    slug: "larsen-sons-plumbing"
  }
]

function buildText(b) {
  const name = b.owner ? ` ${b.owner}` : ''
  return `Hey${name}, recorded a quick 15-sec preview of the mobile page so you don't even have to open the link to see it. 

Curious — is that your main excavator in the photos, or do you guys mostly run a different rig now?`
}

async function sendBlueVideoAndText(phone, text, videoPath) {
  const absVideo = path.resolve(videoPath)
  const script = `
    set theFile to (POSIX file "${absVideo}")
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${phone}" of targetService
      send theText to targetBuddy
      delay 3
      send theFile to targetBuddy
    end tell
  `
  await execFileAsync('osascript', ['-e', script])
}

async function main() {
  console.log(`\n========================================================================`)
  console.log(`🔵 ЗАПУСК ВИДЕО-ДОЖИМА ДЛЯ ${BLUES.length} ВЧЕРАШНИХ СИНИХ КОНТАКТОВ (iMessage)`)
  console.log(`========================================================================\n`)

  let count = 0
  for (const b of BLUES) {
    count++
    const text = buildText(b)
    const videoPath = `./public/videos/${b.slug}/mobile.mp4`

    console.log(`[${count}/${BLUES.length}] 🔵 Отправка для ${b.company} (${b.owner || 'Owner'}, ${b.phone})...`)
    try {
      await sendBlueVideoAndText(b.phone, text, videoPath)
      console.log(`✅ Успешно отправлен текст + нативное видео в iMessage!`)
    } catch (e) {
      console.log(`❌ Ошибка: ${e.message}`)
    }

    if (count < BLUES.length) {
      const delay = Math.floor(45 + Math.random() * 25)
      console.log(`⏳ Естественная пауза ${delay} сек перед следующим iMessage...\n`)
      await sleep(delay * 1000)
    }
  }

  console.log(`\n🎉 ВСЕ 8 ВЧЕРАШНИХ СИНИХ КОНТАКТОВ УСПЕШНО ОБРАБОТАНЫ!`)
}

main().catch(console.error)
