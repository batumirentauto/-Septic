import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

// Timezone mapping aligned with Batumi time (UTC+4) for morning outreach in the US (08:30–09:30 AM local)
const BATUMI_SLOTS = {
  EAST: {
    slotOrder: 1,
    batumiWindow: '16:30–17:30 Батуми',
    macbookWindow: '08:30–09:30 MacBook (EST/EDT)',
    zoneLabel: 'Восточное побережье (NY, FL, GA, NC, PA и др. — EST/EDT)',
    sheetName: '16_30-17_30 Восток (NY,FL,GA)',
    top100Quota: 30,
    greenSmsTarget: 15,
    states: new Set([
      'NY', 'FL', 'GA', 'PA', 'SC', 'NC', 'VA', 'OH', 'MI', 'IN',
      'KY', 'MD', 'MA', 'NH', 'CT', 'NJ', 'DE', 'ME', 'VT', 'WV', 'RI',
    ]),
  },
  CENTRAL: {
    slotOrder: 2,
    batumiWindow: '17:30–18:30 Батуми',
    macbookWindow: '09:30–10:30 MacBook (EST/EDT)',
    zoneLabel: 'Центральное время (TX, Чикаго/IL, TN, AL и др. — CST/CDT)',
    sheetName: '17_30-18_30 Центр (TX,IL,TN)',
    top100Quota: 30,
    greenSmsTarget: 15,
    states: new Set([
      'TX', 'IL', 'TN', 'AL', 'MO', 'KS', 'OK', 'AR', 'LA', 'WI',
      'MN', 'IA', 'MS', 'NE', 'ND', 'SD',
    ]),
  },
  MOUNTAIN: {
    slotOrder: 3,
    batumiWindow: '18:30–19:30 Батуми',
    macbookWindow: '10:30–11:30 MacBook (EST/EDT)',
    zoneLabel: 'Горное время (CO, AZ, UT, ID и др. — MST/MDT)',
    sheetName: '18_30-19_30 Горы (CO,AZ)',
    top100Quota: 20,
    greenSmsTarget: 10,
    states: new Set(['CO', 'AZ', 'ID', 'MT', 'NM', 'UT', 'WY']),
  },
  WEST: {
    slotOrder: 4,
    batumiWindow: '19:30–20:30 Батуми',
    macbookWindow: '11:30–12:30 MacBook (EST/EDT)',
    zoneLabel: 'Западное побережье (CA, WA, OR и др. — PST/PDT)',
    sheetName: '19_30-20_30 Запад (CA,WA)',
    top100Quota: 20,
    greenSmsTarget: 10,
    states: new Set(['CA', 'WA', 'OR', 'NV', 'AK', 'HI']),
  },
}

function getTimeZoneInfo(stateCode) {
  const st = (stateCode || '').trim().toUpperCase()
  for (const key of Object.keys(BATUMI_SLOTS)) {
    if (BATUMI_SLOTS[key].states.has(st)) {
      return BATUMI_SLOTS[key]
    }
  }
  return BATUMI_SLOTS.EAST
}

function buildMessages(lead) {
  const owner = lead.ownerName || ''
  const greeting = owner ? `Hey ${owner}` : `Hey there`
  const city = lead.city || lead.state || 'your'
  const enUrl = `https://septic.up.railway.app/${lead.slug}`
  const ruUrl = `https://septic.up.railway.app/${lead.slug}/ru`
  const hasPhotos = (lead.photosSample?.length || 0) > 0 || Boolean(lead.heroImage)

  const msg1 = `${greeting}, do you guys still do septic repair and excavation in the ${city} area?`

  const showcaseDesc = hasPhotos
    ? `with your real machinery & jobs`
    : `highlighting your services & customer reviews`

  const msg2 = `It's Heorhii! Don't have a septic emergency myself :) Reason I'm reaching out:\n\nSaw your ${lead.rating}-star reviews in ${city} and put together a quick showcase page for ${lead.name} ${showcaseDesc}:\n\n👉 ${enUrl}\n\nTakes 10 seconds to scroll on your phone. Totally zero pressure — just wanted to put the finished result in front of you first.\n\nIf you want to claim it for your business (can easily swap any photos, services, or text), we can transfer it to your domain for a flat one-time fee, no monthly retainers. If not, no worries at all!\n\nLet me know what you think!`

  const msg3 = `It's a flat $2,500 one-time. That covers full transfer of ownership, connecting your custom domain, mobile setup, and any revisions to photos or services you want. You own it 100% with zero recurring fees or monthly contracts.\n\nConsidering one single septic job is $10,000+, it pays for itself on the very first call. We can handle everything right here over text — no tedious calls needed. If you'd like to move forward, I can send over a secure PayPal link and get it transferred to your domain by tomorrow!`

  const msg4 = `Awesome! Here's the secure PayPal link: [PayPal Link]\n\nOnce settled, we'll get your revisions done and send over 2 simple lines to point your domain (or you can just invite us as a delegate in GoDaddy/Namecheap so you never have to share any passwords). If you don't have a domain yet, we can set that up for you too.\n\nSuper easy and painless — we'll have everything live for you in 24 hours!`

  return { owner, enUrl, ruUrl, hasPhotos, msg1, msg2, msg3, msg4 }
}

function compareConversionPriority(a, b) {
  const aHasPhone = a.phone && !a.phone.includes('Не указан') ? 1 : 0
  const bHasPhone = b.phone && !b.phone.includes('Не указан') ? 1 : 0
  if (aHasPhone !== bHasPhone) return bHasPhone - aHasPhone

  const aIsSeptic = !/mobile rv repair/i.test(a.name) ? 1 : 0
  const bIsSeptic = !/mobile rv repair/i.test(b.name) ? 1 : 0
  if (aIsSeptic !== bIsSeptic) return bIsSeptic - aIsSeptic

  const aFlag = a.slug === 'bonzo-excavating' ? 2 : a.slug === 'bolt-septic-excavation' ? 1 : 0
  const bFlag = b.slug === 'bonzo-excavating' ? 2 : b.slug === 'bolt-septic-excavation' ? 1 : 0
  if (aFlag !== bFlag) return bFlag - aFlag

  const aNoWeb = !a.hasWebsite ? 1 : 0
  const bNoWeb = !b.hasWebsite ? 1 : 0
  if (aNoWeb !== bNoWeb) return bNoWeb - aNoWeb

  const aPhotos = (a.photosSample?.length || 0) > 0 ? 1 : 0
  const bPhotos = (b.photosSample?.length || 0) > 0 ? 1 : 0
  if (aPhotos !== bPhotos) return bPhotos - aPhotos

  return (b.reviewCount || 0) - (a.reviewCount || 0)
}

function formatOutreachRow(lead, idx) {
  const tz = getTimeZoneInfo(lead.state)
  const { owner, enUrl, ruUrl, msg1, msg2, msg3, msg4 } = buildMessages(lead)

  return {
    '№': idx + 1,
    'Время отправки (Батуми)': tz.batumiWindow,
    'Время на MacBook (EST)': tz.macbookWindow,
    'Часовой пояс США': tz.zoneLabel,
    'Компания (Company)': lead.name,
    'Имя владельца (Owner)': owner || '— (Hey there)',
    'Телефон (Phone)': lead.phone,
    'Штат': lead.state,
    'Город': lead.city,
    'Рейтинг': `${lead.rating}★ (${lead.reviewCount})`,
    'Наличие сайта': lead.hasWebsite ? 'Есть старый сайт' : 'НЕТ САЙТА (Горячий)',
    'Фото в Google Maps': lead.photosSample?.length || (lead.heroImage ? 16 : 0),
    'Специализация': lead.primaryFocusEn || lead.primaryFocus || '',
    'Преимущества из отзывов': (lead.competitiveAdvantages?.en || []).join(' | '),
    'Ссылка для клиента (EN)': enUrl,
    'Ссылка для проверки (RU)': ruUrl,
    'Сообщение 1 (Первый SMS)': msg1,
    'Сообщение 2 (Ответ с личной ссылкой EN)': msg2,
    'Сообщение 3 (Цена $2,500 без созвонов)': msg3,
    'Сообщение 4 (PayPal и перенос домена)': msg4,
  }
}

async function generateTable() {
  const leads = await fs.readJson(path.resolve('./src/data/septicLeads.json'))
  const highTicket = leads.filter((l) => l.ticketTier === 'HIGH_TICKET')

  // Sort first by Batumi time slot (16:30 -> 17:30 -> 18:30 -> 19:30), then by conversion priority inside each slot
  highTicket.sort((a, b) => {
    const tzA = getTimeZoneInfo(a.state).slotOrder
    const tzB = getTimeZoneInfo(b.state).slotOrder
    if (tzA !== tzB) return tzA - tzB
    return compareConversionPriority(a, b)
  })

  // Build Top 100 list across the 4 time slots (30 East + 30 Central + 20 Mountain + 20 West = 100)
  const top100Leads = []
  const slotMap = new Map()
  for (const key of Object.keys(BATUMI_SLOTS)) {
    const slotInfo = BATUMI_SLOTS[key]
    const slotLeads = highTicket
      .filter((l) => getTimeZoneInfo(l.state).slotOrder === slotInfo.slotOrder)
      .sort(compareConversionPriority)
    slotMap.set(key, slotLeads)
    top100Leads.push(...slotLeads.slice(0, slotInfo.top100Quota))
  }

  const top100Rows = top100Leads.map((lead, idx) => formatOutreachRow(lead, idx))
  const allHighTicketRows = highTicket.map((lead, idx) => formatOutreachRow(lead, idx))

  // 1. Write outreach_316_high_ticket.xlsx & .csv (with Top 100 first tab)
  const wbOutreach = XLSX.utils.book_new()
  const wsTop100 = XLSX.utils.json_to_sheet(top100Rows)
  const wsAll = XLSX.utils.json_to_sheet(allHighTicketRows)

  XLSX.utils.book_append_sheet(wbOutreach, wsTop100, 'Топ-100 на сегодня')
  XLSX.utils.book_append_sheet(wbOutreach, wsAll, 'Все 316 (По часам Батуми)')

  const slotCounts = {}
  for (const key of Object.keys(BATUMI_SLOTS)) {
    const slotInfo = BATUMI_SLOTS[key]
    const slotLeads = slotMap.get(key)
    const slotRows = slotLeads.map((lead, idx) => formatOutreachRow(lead, idx))
    slotCounts[slotInfo.batumiWindow] = slotRows.length
    const wsSlot = XLSX.utils.json_to_sheet(slotRows)
    XLSX.utils.book_append_sheet(wbOutreach, wsSlot, slotInfo.sheetName)
  }

  XLSX.writeFile(wbOutreach, path.resolve('./outreach_316_high_ticket.xlsx'))
  await fs.writeFile(path.resolve('./outreach_316_high_ticket.csv'), XLSX.utils.sheet_to_csv(wsAll), 'utf8')
  await fs.writeFile(path.resolve('./outreach_top_100_today.csv'), XLSX.utils.sheet_to_csv(wsTop100), 'utf8')

  // 2. Update the existing master spreadsheet: septic_repair/companies.xlsx
  const existingXlsxPath = path.resolve('./septic_repair/companies.xlsx')
  if (await fs.pathExists(existingXlsxPath)) {
    const wbExisting = XLSX.readFile(existingXlsxPath)
    const firstSheetName = wbExisting.SheetNames[0]
    const existingRows = XLSX.utils.sheet_to_json(wbExisting.Sheets[firstSheetName])

    const leadByFolder = new Map()
    const leadByName = new Map()
    for (const l of leads) {
      if (l.folderName) leadByFolder.set(l.folderName, l)
      leadByName.set(`${(l.name || '').trim().toLowerCase()}|${(l.city || '').trim().toLowerCase()}`, l)
      leadByName.set((l.name || '').trim().toLowerCase(), l)
    }

    const updatedExistingRows = existingRows.map((row) => {
      const folder = row['Папка с файлами']
      const nameKey = `${(row['Название'] || '').trim().toLowerCase()}|${(row['Город'] || '').trim().toLowerCase()}`
      const lead =
        leadByFolder.get(folder) ||
        leadByName.get(nameKey) ||
        leadByName.get((row['Название'] || '').trim().toLowerCase())

      const stateCode = row['Штат'] || lead?.state || ''
      const tz = getTimeZoneInfo(stateCode)

      if (lead && lead.ticketTier === 'HIGH_TICKET') {
        const { owner, enUrl, ruUrl, msg1, msg2, msg3, msg4 } = buildMessages(lead)
        return {
          ...row,
          'Время отправки (Батуми)': tz.batumiWindow,
          'Время на MacBook (EST)': tz.macbookWindow,
          'Часовой пояс США': tz.zoneLabel,
          'Имя владельца (Owner)': owner || '— (Hey there)',
          'Персональная витрина (EN)': enUrl,
          'Витрина на русском (RU)': ruUrl,
          'Сообщение 1 (Первый SMS)': msg1,
          'Сообщение 2 (Ответ с личной ссылкой EN)': msg2,
          'Сообщение 3 (Цена $2,500 без созвонов)': msg3,
          'Сообщение 4 (PayPal и перенос домена)': msg4,
        }
      } else {
        return {
          ...row,
          'Время отправки (Батуми)': tz.batumiWindow,
          'Время на MacBook (EST)': tz.macbookWindow,
          'Часовой пояс США': tz.zoneLabel,
          'Имя владельца (Owner)': lead?.ownerName || '',
          'Персональная витрина (EN)': '— (Не высокочековый)',
          'Витрина на русском (RU)': '—',
          'Сообщение 1 (Первый SMS)': '',
          'Сообщение 2 (Ответ с личной ссылкой EN)': '',
          'Сообщение 3 (Цена $2,500 без созвонов)': '',
          'Сообщение 4 (PayPal и перенос домена)': '',
        }
      }
    })

    const wbNewMaster = XLSX.utils.book_new()
    const wsMaster = XLSX.utils.json_to_sheet(updatedExistingRows)
    XLSX.utils.book_append_sheet(wbNewMaster, wsMaster, firstSheetName)
    XLSX.utils.book_append_sheet(wbNewMaster, wsTop100, 'Топ-100 на сегодня')
    XLSX.utils.book_append_sheet(wbNewMaster, wsAll, '316 High-Ticket (Все)')

    for (const key of Object.keys(BATUMI_SLOTS)) {
      const slotInfo = BATUMI_SLOTS[key]
      const slotLeads = slotMap.get(key)
      const slotRows = slotLeads.map((lead, idx) => formatOutreachRow(lead, idx))
      const wsSlot = XLSX.utils.json_to_sheet(slotRows)
      XLSX.utils.book_append_sheet(wbNewMaster, wsSlot, slotInfo.sheetName)
    }

    XLSX.writeFile(wbNewMaster, existingXlsxPath)
    console.log(`✅ Updated septic_repair/companies.xlsx (597 rows + Топ-100 на сегодня + 4 timezone tabs)`)
  }

  console.log(`✅ Generated Top-100 (${top100Rows.length} rows) & All 316 in outreach_316_high_ticket.xlsx`)
  console.log('📊 Full 316 Breakdown by Batumi Time Windows:', slotCounts)
}

generateTable().catch(console.error)
