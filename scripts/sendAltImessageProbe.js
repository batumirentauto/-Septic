import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as XLSXModule from 'xlsx'

const execFileAsync = promisify(execFile)
const XLSX = XLSXModule.default || XLSXModule

const CHAT_DB_PATH = path.join(os.homedir(), 'Library', 'Messages', 'chat.db')
const CACHE_JSON_PATH = path.resolve('./outreach_enriched_contacts.json')
const EXCEL_PATH = path.resolve('./outreach_316_high_ticket.xlsx')
const SENT_LOG_PATH = path.resolve('./outreach_sent_log.json')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function querySqlite(sql) {
  try {
    const { stdout } = await execFileAsync('sqlite3', ['-json', CHAT_DB_PATH, sql])
    const trimmed = stdout.trim()
    if (!trimmed) return []
    return JSON.parse(trimmed)
  } catch {
    return []
  }
}

async function getMaxMessageRowId() {
  const rows = await querySqlite('SELECT COALESCE(MAX(ROWID), 0) AS maxId FROM message;')
  return rows[0]?.maxId || 0
}

async function trySendImessageOnly(handleStr, text) {
  const beforeRowId = await getMaxMessageRowId()
  const script = `
on run argv
  set targetHandle to item 1 of argv
  set targetText to item 2 of argv
  tell application "Messages"
    set imsgAccount to 1st account whose service type = iMessage
    send targetText to participant targetHandle of imsgAccount
  end tell
end run
`
  try {
    await execFileAsync('osascript', ['-e', script, handleStr, text])
  } catch (err) {
    return { ok: false, note: err.message }
  }

  await sleep(5500)

  const safeLike = handleStr.includes('@')
    ? handleStr.replace(/'/g, "''")
    : handleStr.replace(/\D/g, '').slice(-10)

  const rows = await querySqlite(`
    SELECT m.ROWID, m.service, m.is_sent, m.is_delivered, m.error, h.id
    FROM message m
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    WHERE m.ROWID > ${beforeRowId}
      AND m.is_from_me = 1
      AND h.id LIKE '%${safeLike}%'
    ORDER BY m.ROWID DESC
    LIMIT 1;
  `)

  const latest = rows[0]
  if (!latest) {
    return { ok: false, note: 'Не появилось в chat.db' }
  }
  if (Number(latest.error) !== 0 || latest.service !== 'iMessage') {
    return { ok: false, note: `Не зарегистрирован в iMessage (код ${latest.error})` }
  }
  return {
    ok: true,
    rowId: latest.ROWID,
    delivered: Number(latest.is_delivered) === 1,
    note: `🔵 Доставлено по синему iMessage (${handleStr})!`,
  }
}

async function main() {
  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const cache = await fs.readJson(CACHE_JSON_PATH)
  const logData = await fs.readJson(SENT_LOG_PATH)

  console.log('========================================================================')
  console.log('🔵 ПРОВЕРКА И ОТПРАВКА ПО ДОП. МОБИЛЬНЫМ НОМЕРАМ И EMAIL ЧЕРЕЗ iMessage')
  console.log('========================================================================\n')

  let hits = 0
  let tested = 0

  for (const item of Object.values(cache)) {
    // Пропускаем тех, кто уже ответил по основному номеру
    if (item.company.includes('Bolt Septic') || item.company.includes('Residential Grading')) {
      continue
    }

    const contractor = allRows.find(
      (r) => r['Компания (Company)'] === item.company && r['Штат'] === item.state
    )
    if (!contractor) continue

    const msg1 = contractor['Сообщение 1 (Первый SMS)']
    const altPhones = (item.altPhonesAll || [])
      .map((p) => normalizePhone(p))
      .filter((p) => p && !p.startsWith('+1866') && !p.startsWith('+1800'))
    const emails = (item.emailsAll || []).filter((e) => e && e.includes('@'))

    if (altPhones.length === 0 && emails.length === 0) continue

    let companyDelivered = false

    // 1) Сначала проверяем вторые/аварийные телефоны через синий iMessage
    for (const altPhone of altPhones) {
      if (logData.history[altPhone]?.msg1Sent) continue
      tested++
      process.stdout.write(`🔎 Проверка 2-го телефона ${altPhone} (${item.company}, ${item.city} ${item.state})... `)
      const res = await trySendImessageOnly(altPhone, msg1)
      if (res.ok) {
        hits++
        companyDelivered = true
        console.log(`✅ УСПЕХ! ${res.note}`)
        logData.history[altPhone] = {
          company: item.company,
          city: `${item.city}, ${item.state}`,
          phone: altPhone,
          enUrl: contractor['Ссылка для клиента (EN)'],
          channel: 'BLUE_IMESSAGE_ALT_PHONE',
          slotKey: 'ALT',
          dateKey: '2026-10-29',
          timestamp: new Date().toISOString(),
          msg1Sent: true,
          msg2Sent: false,
        }
        await fs.writeJson(SENT_LOG_PATH, logData, { spaces: 2 })
        await sleep(25000)
        break
      } else {
        console.log(`⚪ Нет iMessage`)
      }
    }

    if (companyDelivered) continue

    // 2) Если 2-й телефон не в iMessage, проверяем Email (часто личный @gmail/@yahoo/@icloud привязан к Apple ID владельца!)
    for (const email of emails) {
      if (logData.history[email]?.msg1Sent) continue
      tested++
      process.stdout.write(`🔎 Проверка Apple ID Email ${email} (${item.company}, ${item.city} ${item.state})... `)
      const res = await trySendImessageOnly(email, msg1)
      if (res.ok) {
        hits++
        console.log(`✅ УСПЕХ! ${res.note}`)
        logData.history[email] = {
          company: item.company,
          city: `${item.city}, ${item.state}`,
          phone: email,
          enUrl: contractor['Ссылка для клиента (EN)'],
          channel: 'BLUE_IMESSAGE_EMAIL',
          slotKey: 'ALT',
          dateKey: '2026-10-29',
          timestamp: new Date().toISOString(),
          msg1Sent: true,
          msg2Sent: false,
        }
        await fs.writeJson(SENT_LOG_PATH, logData, { spaces: 2 })
        await sleep(25000)
        break
      } else {
        console.log(`⚪ Нет iMessage`)
      }
    }
  }

  console.log('\n========================================================================')
  console.log(`🎯 Проверено доп. контактов: ${tested} | Доставлено синих iMessage: ${hits}`)
  console.log('========================================================================')
}

main().catch(console.error)
