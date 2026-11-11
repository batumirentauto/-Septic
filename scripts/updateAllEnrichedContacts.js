import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

const EXCEL_316_PATH = path.resolve('./outreach_316_high_ticket.xlsx')
const SENT_LOG_PATH = path.resolve('./outreach_sent_log.json')
const CACHE_JSON_PATH = path.resolve('./outreach_enriched_contacts.json')
const FOLLOWUP_XLSX_PATH = path.resolve('./outreach_green_sms_followup.xlsx')
const FOLLOWUP_CSV_PATH = path.resolve('./outreach_green_sms_followup.csv')

function normalizeDigits10(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return ''
}

function buildDirectOutreachMessage(row) {
  const company = row['Компания (Company)']
  const rawOwner = row['Имя владельца (Owner)'] || ''
  const owner = rawOwner && !rawOwner.includes('Hey there') ? rawOwner : ''
  const city = row['Город']
  const ratingStr = String(row['Рейтинг'] || '5.0★').split(' ')[0]
  const enUrl = row['Ссылка для клиента (EN)']
  const greeting = owner ? `Hey ${owner}!` : `Hey ${company} team!`

  return `${greeting} I tried texting your main shop number earlier, didn't realize it might be a landline :)

Saw your ${ratingStr} reviews in ${city} and put together a quick showcase website preview for ${company} with your real machinery & work photos:

👉 ${enUrl}

Takes 10 seconds to scroll on your phone. Totally zero pressure — just wanted to put the finished result in front of you first.

If you want to claim it for your business (can easily swap any photos, services, or text), we can transfer it to your domain for a flat one-time fee, no monthly retainers. If not, no worries at all!

Let me know what you think!
— Heorhii (+1 302-213-0266)`
}

const newEnrichedData = {
  "Smith Septic Service Inc.__Bell__FL": {
    company: "Smith Septic Service Inc.",
    city: "Bell",
    state: "FL",
    primaryPhone: "+1 386-935-1429",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Sloboda Brothers Inc. DBA American Septic Service__Wallkill__NY": {
    company: "Sloboda Brothers Inc. DBA American Septic Service",
    city: "Wallkill",
    state: "NY",
    primaryPhone: "+1 845-895-2501",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "+1 845-554-4738",
    altPhonesAll: ["+1 845-554-4738"],
    checkedAt: new Date().toISOString()
  },
  "Kitchens & Young Well & Septic Service__Macon__GA": {
    company: "Kitchens & Young Well & Septic Service",
    city: "Macon",
    state: "GA",
    primaryPhone: "+1 478-742-7423",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Moring Septic Tank Services__Ocala__FL": {
    company: "Moring Septic Tank Services",
    city: "Ocala",
    state: "FL",
    primaryPhone: "+1 352-629-7286",
    facebook: "",
    facebookAll: [],
    email: "moringsepticoffice@gmail.com",
    emailsAll: ["moringsepticoffice@gmail.com"],
    altPhone: "+1 352-629-0606",
    altPhonesAll: ["+1 352-629-0606"],
    checkedAt: new Date().toISOString()
  },
  "Bradley's Septic Services__Corinth__NY": {
    company: "Bradley's Septic Services",
    city: "Corinth",
    state: "NY",
    primaryPhone: "+1 518-654-6318",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Kalm Plumbing Solutions__Scranton__PA": {
    company: "Kalm Plumbing Solutions",
    city: "Scranton",
    state: "PA",
    primaryPhone: "+1 570-291-8886",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Rowland Enviro Septic Services__Mebane__NC": {
    company: "Rowland Enviro Septic Services",
    city: "Mebane",
    state: "NC",
    primaryPhone: "+1 336-516-6627",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Pipe-It Plumbers__Winchester__VA": {
    company: "Pipe-It Plumbers",
    city: "Winchester",
    state: "VA",
    primaryPhone: "+1 540-678-0226",
    facebook: "https://www.facebook.com/Pipe-It-Plumberscom-412302362184885",
    facebookAll: ["https://www.facebook.com/Pipe-It-Plumberscom-412302362184885"],
    email: "info@pipeitplumbers.com",
    emailsAll: ["info@pipeitplumbers.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Grade A Septic__Dunn__NC": {
    company: "Grade A Septic",
    city: "Dunn",
    state: "NC",
    primaryPhone: "+1 910-729-9004",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "+1 919-586-1785",
    altPhonesAll: ["+1 919-586-1785"],
    checkedAt: new Date().toISOString()
  },
  "Premier Septic Services__Powhatan__VA": {
    company: "Premier Septic Services",
    city: "Powhatan",
    state: "VA",
    primaryPhone: "+1 804-598-1049",
    facebook: "",
    facebookAll: [],
    email: "mswineford@aol.com",
    emailsAll: ["mswineford@aol.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Barney's Sanitation LLC.__Fort Myers__FL": {
    company: "Barney's Sanitation LLC.",
    city: "Fort Myers",
    state: "FL",
    primaryPhone: "+1 239-940-0471",
    facebook: "",
    facebookAll: [],
    email: "barneysanitation@gmail.com",
    emailsAll: ["barneysanitation@gmail.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Franklin's Septic__Monticello__GA": {
    company: "Franklin's Septic",
    city: "Monticello",
    state: "GA",
    primaryPhone: "+1 706-468-9200",
    facebook: "https://www.facebook.com/franklins.septic",
    facebookAll: ["https://www.facebook.com/franklins.septic"],
    email: "franklinseptic@gmail.com",
    emailsAll: ["franklinseptic@gmail.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Advanced Plumbing & Drain Cleaning, Inc.__Athens__GA": {
    company: "Advanced Plumbing & Drain Cleaning, Inc.",
    city: "Athens",
    state: "GA",
    primaryPhone: "+1 706-613-9325",
    facebook: "https://www.facebook.com/p/Advanced-Plumbing-Drain-Cleaning-100057423851502",
    facebookAll: ["https://www.facebook.com/p/Advanced-Plumbing-Drain-Cleaning-100057423851502"],
    email: "adv.plumbing@yahoo.com",
    emailsAll: ["adv.plumbing@yahoo.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Aardvark Septic Services__Athens__AL": {
    company: "Aardvark Septic Services",
    city: "Athens",
    state: "AL",
    primaryPhone: "+1 256-604-9681",
    facebook: "",
    facebookAll: [],
    email: "m.kulpinski@aardvarkseptical.com",
    emailsAll: ["m.kulpinski@aardvarkseptical.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Stone's Pumping__Knoxville__TN": {
    company: "Stone's Pumping",
    city: "Knoxville",
    state: "TN",
    primaryPhone: "+1 423-458-5606",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Shamrock Septic ️ - 24/7 Alvin, Texas__Alvin__TX": {
    company: "Shamrock Septic ️ - 24/7 Alvin, Texas",
    city: "Alvin",
    state: "TX",
    primaryPhone: "+1 832-785-6920",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Petersen Septic Systems LLC__Valders__WI": {
    company: "Petersen Septic Systems LLC",
    city: "Valders",
    state: "WI",
    primaryPhone: "+1 920-323-2640",
    facebook: "https://www.facebook.com/p/Petersen-Septic-Systems-LLC-100057621430627",
    facebookAll: ["https://www.facebook.com/p/Petersen-Septic-Systems-LLC-100057621430627"],
    email: "petersenseptic@gmail.com",
    emailsAll: ["petersenseptic@gmail.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Rozell's septic services__Henderson__TX": {
    company: "Rozell's septic services",
    city: "Henderson",
    state: "TX",
    primaryPhone: "+1 903-658-0243",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Kons Septic Services Inc__Germantown__WI": {
    company: "Kons Septic Services Inc",
    city: "Germantown",
    state: "WI",
    primaryPhone: "+1 262-251-1704",
    facebook: "",
    facebookAll: [],
    email: "konsseptic@yahoo.com",
    emailsAll: ["konsseptic@yahoo.com"],
    altPhone: "+1 262-406-8045",
    altPhonesAll: ["+1 262-406-8045"],
    checkedAt: new Date().toISOString()
  },
  "Milty's Septic Services__Stigler__OK": {
    company: "Milty's Septic Services",
    city: "Stigler",
    state: "OK",
    primaryPhone: "+1 918-451-4362",
    facebook: "https://www.facebook.com/miltysboysseptic",
    facebookAll: ["https://www.facebook.com/miltysboysseptic"],
    email: "",
    emailsAll: [],
    altPhone: "+1 918-864-5897",
    altPhonesAll: ["+1 918-864-5897", "+1 918-605-0369"],
    checkedAt: new Date().toISOString()
  },
  "TruFlow Plumbing & Drainage, Inc__Clarksville__TN": {
    company: "TruFlow Plumbing & Drainage, Inc",
    city: "Clarksville",
    state: "TN",
    primaryPhone: "+1 931-998-0606",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Jesse Pigeon Plumbing LLC__Fayetteville__AR": {
    company: "Jesse Pigeon Plumbing LLC",
    city: "Fayetteville",
    state: "AR",
    primaryPhone: "+1 479-256-1139",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Hectors septic service__Austin__TX": {
    company: "Hectors septic service",
    city: "Austin",
    state: "TX",
    primaryPhone: "+1 512-321-2660",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "BSKC Soil and Septic Services, LLC__Elmore__AL": {
    company: "BSKC Soil and Septic Services, LLC",
    city: "Elmore",
    state: "AL",
    primaryPhone: "+1 334-657-0363",
    facebook: "https://www.facebook.com/bskcsoilandsepticse",
    facebookAll: ["https://www.facebook.com/bskcsoilandsepticse"],
    email: "bskcsoilandsepticllc@gmail.com",
    emailsAll: ["bskcsoilandsepticllc@gmail.com"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Illinois Valley Septic Service LLC__Naperville__IL": {
    company: "Illinois Valley Septic Service LLC",
    city: "Naperville",
    state: "IL",
    primaryPhone: "+1 815-656-7867",
    facebook: "",
    facebookAll: [],
    email: "ivexcavating@yahoo.com",
    emailsAll: ["ivexcavating@yahoo.com"],
    altPhone: "+1 815-223-3276",
    altPhonesAll: ["+1 815-223-3276"],
    checkedAt: new Date().toISOString()
  },
  "Twin Ports Septic Pump and Repair__Duluth__MN": {
    company: "Twin Ports Septic Pump and Repair",
    city: "Duluth",
    state: "MN",
    primaryPhone: "+1 218-428-3552",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Wayne Krueger Water Systems__Wausau__WI": {
    company: "Wayne Krueger Water Systems",
    city: "Wausau",
    state: "WI",
    primaryPhone: "+1 715-675-2108",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "+1 715-675-1515",
    altPhonesAll: ["+1 715-675-1515"],
    checkedAt: new Date().toISOString()
  },
  "RP's Sewer Services__New Iberia__LA": {
    company: "RP's Sewer Services",
    city: "New Iberia",
    state: "LA",
    primaryPhone: "+1 337-367-8936",
    facebook: "",
    facebookAll: [],
    email: "rpssewerservice@yahoo.com",
    emailsAll: ["rpssewerservice@yahoo.com"],
    altPhone: "+1 337-352-1750",
    altPhonesAll: ["+1 337-352-1750"],
    checkedAt: new Date().toISOString()
  },
  "Bailey's Sewer & Drain, LLC__Colorado Springs__CO": {
    company: "Bailey's Sewer & Drain, LLC",
    city: "Colorado Springs",
    state: "CO",
    primaryPhone: "+1 719-208-2229",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "C & E Septic Services, LLC__St David__AZ": {
    company: "C & E Septic Services, LLC",
    city: "St David",
    state: "AZ",
    primaryPhone: "+1 520-686-2796",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "+1 520-732-9010",
    altPhonesAll: ["+1 520-732-9010"],
    checkedAt: new Date().toISOString()
  },
  "Mr.T's Up-keep Services LLC__Gillette__WY": {
    company: "Mr.T's Up-keep Services LLC",
    city: "Gillette",
    state: "WY",
    primaryPhone: "+1 307-622-0111",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Avery & Sons Plumbing__Orem__UT": {
    company: "Avery & Sons Plumbing",
    city: "Orem",
    state: "UT",
    primaryPhone: "+1 435-485-7121",
    facebook: "",
    facebookAll: [],
    email: "info@averyplumbing.pro",
    emailsAll: ["info@averyplumbing.pro"],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Corrales Septic Service__Albuquerque__NM": {
    company: "Corrales Septic Service",
    city: "Albuquerque",
    state: "NM",
    primaryPhone: "+1 505-485-3557",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Burton's Plumbing LLC__Pueblo__CO": {
    company: "Burton's Plumbing LLC",
    city: "Pueblo",
    state: "CO",
    primaryPhone: "+1 719-289-2144",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Pony Express Septic__Las Cruces__NM": {
    company: "Pony Express Septic",
    city: "Las Cruces",
    state: "NM",
    primaryPhone: "+1 575-649-7076",
    facebook: "",
    facebookAll: [],
    email: "",
    emailsAll: [],
    altPhone: "",
    altPhonesAll: [],
    checkedAt: new Date().toISOString()
  },
  "Elite Rooter Boise__Boise__ID": {
    company: "Elite Rooter Boise",
    city: "Boise",
    state: "ID",
    primaryPhone: "+1 208-425-1902",
    facebook: "https://www.facebook.com/EliteRooterPlumbing",
    facebookAll: ["https://www.facebook.com/EliteRooterPlumbing"],
    email: "service@eliterootermgt.com",
    emailsAll: ["service@eliterootermgt.com"],
    altPhone: "+1 866-805-5325",
    altPhonesAll: ["+1 866-805-5325"],
    checkedAt: new Date().toISOString()
  },
  "Peak Plumbing & Rooter, LLC__Fort Collins__CO": {
    company: "Peak Plumbing & Rooter, LLC",
    city: "Fort Collins",
    state: "CO",
    primaryPhone: "+1 970-888-0083",
    facebook: "",
    facebookAll: [],
    email: "jacob@peak-plumbing.com",
    emailsAll: ["jacob@peak-plumbing.com"],
    altPhone: "+1 970-399-5366",
    altPhonesAll: ["+1 970-399-5366", "+1 970-352-2820"],
    checkedAt: new Date().toISOString()
  },
  "Nu Flow Phoenix__Phoenix__AZ": {
    company: "Nu Flow Phoenix",
    city: "Phoenix",
    state: "AZ",
    primaryPhone: "+1 480-505-3618",
    facebook: "https://www.facebook.com/nuflowphoenix/",
    facebookAll: ["https://www.facebook.com/nuflowphoenix/"],
    email: "admin@nuflowphoenix.com",
    emailsAll: ["admin@nuflowphoenix.com"],
    altPhone: "+1 480-508-6634",
    altPhonesAll: ["+1 480-508-6634", "+1 480-605-0809"],
    checkedAt: new Date().toISOString()
  }
}

async function run() {
  console.log('📖 Reading current cache...')
  const currentCache = (await fs.pathExists(CACHE_JSON_PATH)) ? await fs.readJson(CACHE_JSON_PATH) : {}

  const mergedCache = {
    ...currentCache,
    ...newEnrichedData
  }

  await fs.writeJson(CACHE_JSON_PATH, mergedCache, { spaces: 2 })
  console.log(`✅ outreach_enriched_contacts.json updated! Total keys: ${Object.keys(mergedCache).length}`)

  console.log('📖 Reading outreach_316_high_ticket.xlsx and outreach_sent_log.json...')
  const wb316 = XLSX.readFile(EXCEL_316_PATH)
  const sentLog = (await fs.pathExists(SENT_LOG_PATH)) ? await fs.readJson(SENT_LOG_PATH) : { history: {} }
  const allRows = XLSX.utils.sheet_to_json(wb316.Sheets['Все 316 (По часам Батуми)'] || [])

  // 1. Export outreach_green_sms_followup.xlsx and .csv
  const enrichedRows = allRows.map((r) => {
    const key = `${r['Компания (Company)']}__${r['Город']}__${r['Штат']}`
    const info = mergedCache[key] || {}
    const phoneE164 = '+1' + normalizeDigits10(r['Телефон (Phone)'])
    const sentEntry = sentLog.history?.[phoneE164]
    return {
      ...r,
      'Статус SMS сегодня': sentEntry ? sentEntry.channel : 'Ожидает очереди',
      'Facebook страница': info.facebook || '',
      'Email владельца': info.email || '',
      'Доп. телефон (Мобильный/2-й)': (info.altPhonesAll || []).join(', '),
      'Готовое сообщение для Facebook / Email': buildDirectOutreachMessage(r),
    }
  })

  const greenTodayRows = enrichedRows.filter(
    (r) => r['Статус SMS сегодня'] === 'GREEN_SMS' || String(r['Статус SMS сегодня']).startsWith('SKIPPED')
  )

  const followupWb = XLSX.utils.book_new()
  const wsGreen = XLSX.utils.json_to_sheet(greenTodayRows)
  XLSX.utils.book_append_sheet(followupWb, wsGreen, 'Зелёные SMS (FB + Email)')
  const wsAll = XLSX.utils.json_to_sheet(enrichedRows)
  XLSX.utils.book_append_sheet(followupWb, wsAll, 'Все 316 (С контактами)')
  XLSX.writeFile(followupWb, FOLLOWUP_XLSX_PATH)
  await fs.writeFile(FOLLOWUP_CSV_PATH, '\uFEFF' + XLSX.utils.sheet_to_csv(wsGreen), 'utf8')
  console.log(`✅ ${FOLLOWUP_XLSX_PATH} and ${FOLLOWUP_CSV_PATH} updated!`)

  // 2. Also enrich outreach_316_high_ticket.xlsx sheets so contacts are visible there
  for (const sheetName of wb316.SheetNames) {
    const sheetRows = XLSX.utils.sheet_to_json(wb316.Sheets[sheetName])
    const updatedSheetRows = sheetRows.map((r) => {
      const key = `${r['Компания (Company)']}__${r['Город']}__${r['Штат']}`
      const info = mergedCache[key] || {}
      return {
        ...r,
        'Facebook страница': info.facebook || '',
        'Email владельца': info.email || '',
        'Доп. телефон (Мобильный/2-й)': (info.altPhonesAll || []).join(', ')
      }
    })
    wb316.Sheets[sheetName] = XLSX.utils.json_to_sheet(updatedSheetRows)
  }
  XLSX.writeFile(wb316, EXCEL_316_PATH)
  console.log(`✅ ${EXCEL_316_PATH} updated across all sheets!`)

  // Summary stats
  let totalFb = 0
  let totalEmail = 0
  let totalAltPhone = 0
  for (const r of greenTodayRows) {
    if (r['Facebook страница']) totalFb++
    if (r['Email владельца']) totalEmail++
    if (r['Доп. телефон (Мобильный/2-й)']) totalAltPhone++
  }

  console.log('\n================ SUMMARY FOR GREEN SMS LIST (43 companies) ================')
  console.log(`Total Green SMS Companies: ${greenTodayRows.length}`)
  console.log(`Companies with official Facebook: ${totalFb}`)
  console.log(`Companies with Email: ${totalEmail}`)
  console.log(`Companies with Secondary / Mobile Phone: ${totalAltPhone}`)
  console.log('===========================================================================')
}

run().catch(console.error)
