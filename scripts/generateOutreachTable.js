import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

async function generateTable() {
  const leads = await fs.readJson(path.resolve('./src/data/septicLeads.json'))
  const highTicket = leads.filter((l) => l.ticketTier === 'HIGH_TICKET')

  // Sort leads by highest sales conversion priority:
  // 1. Flagships (Bonzo, Bolt)
  // 2. No Website + Has Real Photos + High Rating
  // 3. No Website + High Rating
  // 4. Has Website + Has Real Photos + High Rating
  // 5. Remaining High-Ticket
  highTicket.sort((a, b) => {
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
  })

  const rows = highTicket.map((lead, idx) => {
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

    return {
      '№': idx + 1,
      'Компания (Company)': lead.name,
      'Имя владельца (Owner)': owner || '— (Hey there)',
      'Телефон (Phone)': lead.phone,
      'Город / Штат': `${lead.city}, ${lead.state}`,
      'Рейтинг': `${lead.rating}★ (${lead.reviewCount})`,
      'Наличие сайта': lead.hasWebsite ? 'Есть старый сайт' : 'НЕТ САЙТА (Горячий)',
      'Фото на витрине': lead.photosSample?.length || (lead.heroImage ? 16 : 0),
      'Специализация': lead.primaryFocusEn || lead.primaryFocus || '',
      'Преимущества из отзывов': (lead.competitiveAdvantages?.en || []).join(' | '),
      'Ссылка для клиента (EN)': enUrl,
      'Ссылка для проверки (RU)': ruUrl,
      'Сообщение 1 (Первый SMS)': msg1,
      'Сообщение 2 (Ответ с витриной)': msg2,
    }
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'High-Ticket 316 Outreach')

  const xlsxOut = path.resolve('./outreach_316_high_ticket.xlsx')
  const csvOut = path.resolve('./outreach_316_high_ticket.csv')

  XLSX.writeFile(wb, xlsxOut)
  const csvContent = XLSX.utils.sheet_to_csv(ws)
  await fs.writeFile(csvOut, csvContent, 'utf8')

  console.log(`✅ Generated ${rows.length} rows in outreach_316_high_ticket.xlsx and outreach_316_high_ticket.csv`)
}

generateTable().catch(console.error)
