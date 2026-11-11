import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const TARGETS = [
  {
    phone: "+18648047426",
    company: "Bolt Septic & Excavation",
    owner: "Cody",
    city: "Greenville"
  },
  {
    phone: "+18647109158",
    company: "Residential Grading and Septic LLC",
    owner: "Will",
    city: "Pendleton"
  },
  {
    phone: "+13365166627",
    company: "Rowland Enviro Septic Services",
    owner: "Daniel",
    city: "Mebane"
  },
  {
    phone: "+19107299004",
    company: "Grade A Septic",
    owner: "",
    city: "Dunn"
  },
  {
    phone: "+12566049681",
    company: "Aardvark Septic Services",
    owner: "Mark",
    city: "Athens"
  },
  {
    phone: "+14234585606",
    company: "Stone's Pumping",
    owner: "Ron",
    city: "Knoxville"
  },
  {
    phone: "+18327856920",
    company: "Shamrock Septic",
    owner: "Tyler",
    city: "Alvin"
  },
  {
    phone: "+14792561139",
    company: "Jesse Pigeon Plumbing LLC",
    owner: "Jesse",
    city: "Fayetteville"
  },
  {
    phone: "+13076220111",
    company: "Mr.T's Up-keep Services LLC",
    owner: "Trevor",
    city: "Gillette"
  },
  {
    phone: "+15413069974",
    company: "Bulldog Septic",
    owner: "",
    city: "Terrebonne"
  }
]

function buildText(target) {
  const firstName = target.owner && !target.owner.includes('—') && !target.owner.toLowerCase().includes('hey')
    ? target.owner.trim()
    : ''
  const greeting = firstName ? `Great to hear ${firstName}!` : `Great to hear!`

  return `${greeting} Saw your 5-star reputation in ${target.city} — people clearly respect your work.

Only thing is, your Google profile has no website button attached. When homeowners are about to spend $10,000+ on a major septic replacement, they almost always want to see an official site first — so without one, some end up trusting competitors instead.

I actually built a clean mobile showcase for ${target.company} featuring your actual equipment and reviews.

Want me to send the link so you can check if your services and details are accurate?`
}

async function sendSms(phone, text) {
  const script = `
    set msgText to ${JSON.stringify(text)}
    open location "sms://${phone}?&body=" & (do shell script "python3 -c 'import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))' " & quoted form of msgText)
    delay 2
    tell application "System Events"
      tell process "Messages"
        set frontmost to true
        delay 0.5
        key code 36
      end tell
    end tell
  `
  await execFileAsync('osascript', ['-e', script])
}

async function main() {
  console.log(`\n========================================================================`)
  console.log(`📤 ОТПРАВКА ОБНОВЛЕННОГО СООБЩЕНИЯ 2 ДЛЯ 10 ВЧЕРАШНИХ ЗЕЛЕНЫХ КОНТАКТОВ`)
  console.log(`========================================================================\n`)

  let count = 0
  for (const t of TARGETS) {
    count++
    const text = buildText(t)
    console.log(`[${count}/${TARGETS.length}] 🟢 Отправка для ${t.company} (${t.phone})...`)
    try {
      await sendSms(t.phone, text)
      console.log(`✅ Успешно отправлено!`)
    } catch (e) {
      console.log(`❌ Ошибка отправки: ${e.message}`)
    }

    if (count < TARGETS.length) {
      const delay = Math.floor(45 + Math.random() * 25) // 45-70 сек между подрядчиками
      console.log(`⏳ Естественная пауза ${delay} сек перед следующим контактом...\n`)
      await sleep(delay * 1000)
    }
  }

  console.log(`\n🎉 ВСЕ 10 ВЧЕРАШНИХ ЗЕЛЕНЫХ КОНТАКТОВ УСПЕШНО ОБРАБОТАНЫ!`)
}

main().catch(console.error)
