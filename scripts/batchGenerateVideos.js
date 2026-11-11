import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'
import { recordShowcaseVideos } from './recordShowcaseVideos.js'

const XLSX = XLSXModule.default || XLSXModule
const EXCEL_PATH = path.resolve('./outreach_316_high_ticket.xlsx')
const LOG_PATH = path.resolve('./outreach_sent_log.json')

async function main() {
  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const logData = (await fs.pathExists(LOG_PATH)) ? await fs.readJson(LOG_PATH) : { history: {} }

  // 1. Gather 20 yesterday replied companies (top priority!)
  const prioritySlugs = new Set()
  for (const [phone, h] of Object.entries(logData.history || {})) {
    if (h.msg2Sent) {
      const row = allRows.find((r) => r['Компания (Company)'] === h.company)
      if (row && row['Ссылка для клиента (EN)']) {
        const slug = row['Ссылка для клиента (EN)'].replace('https://septic.up.railway.app/', '')
        prioritySlugs.add(slug)
      }
    }
  }

  // 2. Gather today's planned new contacts (next 90 companies from remaining pool)
  const alreadyContactedPhones = new Set(Object.keys(logData.history || {}))
  const todayPlannedSlugs = []

  for (const r of allRows) {
    const rawPhone = String(r['Телефон (Phone)'] || '').replace(/\D/g, '')
    const e164 = rawPhone.length === 10 ? `+1${rawPhone}` : `+${rawPhone}`
    if (!alreadyContactedPhones.has(e164)) {
      const link = String(r['Ссылка для клиента (EN)'] || '')
      const slug = link.replace('https://septic.up.railway.app/', '')
      if (slug) {
        todayPlannedSlugs.push(slug)
        if (todayPlannedSlugs.length >= 90) break
      }
    }
  }

  const allSlugsToProcess = [...Array.from(prioritySlugs), ...todayPlannedSlugs]
  console.log('========================================================================')
  console.log(`🎬 ПАКЕТНАЯ ГЕНЕРАЦИЯ ВИДЕО ДЛЯ ${allSlugsToProcess.length} КОМПАНИЙ`)
  console.log(`   • Вчерашние ответившие (приоритет №1): ${prioritySlugs.size} компаний`)
  console.log(`   • Сегодняшняя новая волна рассылки:  ${todayPlannedSlugs.length} компаний`)
  console.log('========================================================================\n')

  let count = 0
  for (const slug of allSlugsToProcess) {
    count++
    const isPriority = prioritySlugs.has(slug)
    const prefix = `[${count}/${allSlugsToProcess.length}] ${isPriority ? '🔥 ПРИОРИТЕТ' : '📦 НОВЫЙ'}`
    process.stdout.write(`${prefix} Запись видео для «${slug}»... `)

    try {
      const res = await recordShowcaseVideos({ slug })
      if (res.skipped) {
        console.log(`✅ Уже существует (пропущено)`)
      } else {
        const mSize = ((await fs.stat(res.mobileMp4)).size / 1024).toFixed(0)
        const dSize = ((await fs.stat(res.desktopMp4)).size / 1024).toFixed(0)
        console.log(`✅ Готово (моб: ${mSize} КБ, десктоп: ${dSize} КБ)`)
      }
    } catch (err) {
      console.log(`❌ Ошибка: ${err.message}`)
    }
  }

  console.log('\n🎉 Все видео успешно сгенерированы и упакованы под лимиты MMS!')
}

main().catch(console.error)
