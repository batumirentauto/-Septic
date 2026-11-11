import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as XLSXModule from 'xlsx'

const execFileAsync = promisify(execFile)
const XLSX = XLSXModule.default || XLSXModule

const CHAT_DB_PATH = path.join(os.homedir(), 'Library', 'Messages', 'chat.db')
const LOG_FILE_PATH = path.resolve('./outreach_sent_log.json')
const EXCEL_PATH = path.resolve('./outreach_316_high_ticket.xlsx')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function normalizePhone(rawPhone) {
  if (!rawPhone) return null
  const digits = String(rawPhone).replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function querySqlite(sql) {
  const { stdout } = await execFileAsync('sqlite3', [CHAT_DB_PATH, sql])
  return stdout.trim().split('\n').filter(Boolean)
}

async function getMaxMessageRowId() {
  const rows = await querySqlite('SELECT MAX(ROWID) FROM message;')
  return Number(rows[0] || 0)
}

async function checkIncomingReplies(allRows, logData) {
  const sql = `
    SELECT
      m.ROWID,
      m.date,
      h.id AS sender,
      m.service,
      m.text,
      HEX(m.attributedBody) AS hex_body
    FROM message m
    JOIN handle h ON m.handle_id = h.ROWID
    WHERE m.is_from_me = 0
      AND m.ROWID > ${logData.lastCheckedRowId || 0}
    ORDER BY m.ROWID ASC;
  `
  const rows = await querySqlite(sql)
  if (!rows.length) return

  for (const line of rows) {
    const [rowid, date, senderRaw, service, txt, hex] = line.split('|')
    const rid = Number(rowid)
    if (rid > (logData.lastCheckedRowId || 0)) {
      logData.lastCheckedRowId = rid
    }

    if (!senderRaw || (!senderRaw.startsWith('+1') && !senderRaw.includes('@'))) continue

    const digits = senderRaw.replace(/\D/g, '').slice(-10)
    const contractor = allRows.find(
      (r) => String(r['Телефон (Phone)'] || '').replace(/\D/g, '').slice(-10) === digits
    )

    if (contractor) {
      console.log('\n🔔 НОВЫЙ ВХОДЯЩИЙ ОТВЕТ!')
      console.log(`🏢 Компания: ${contractor['Компания (Company)']} (${senderRaw})`)
      console.log(`💬 Текст: "${txt || '(медиа/hex)'}"`)
    }
  }
  await fs.writeJson(LOG_FILE_PATH, logData, { spaces: 2 })
}

// Проверка и отправка ТОЛЬКО если номер — синий iMessage
async function probeAndSendBlueOnly(phoneE164, text) {
  const beforeRowId = await getMaxMessageRowId()

  const script = `
    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      try
        set targetBuddy to participant "${phoneE164}" of targetService
        send ${JSON.stringify(text)} to targetBuddy
        return "TRY_SENT"
      on error errMsg
        return "ERR: " & errMsg
      end try
    end tell
  `

  await execFileAsync('osascript', ['-e', script])
  await sleep(4000) // Ждем ответа демона Apple imagent в chat.db

  const checkSql = `
    SELECT m.ROWID, m.service, m.is_sent, m.error
    FROM message m
    JOIN handle h ON m.handle_id = h.ROWID
    WHERE m.ROWID > ${beforeRowId}
      AND m.is_from_me = 1
      AND h.id LIKE '%${phoneE164.replace(/\D/g, '').slice(-10)}'
    ORDER BY m.ROWID DESC
    LIMIT 1;
  `
  const resultRows = await querySqlite(checkSql)
  if (!resultRows.length) {
    return { isBlue: false, note: 'Не зарегистрирован в Apple iMessage' }
  }

  const [rowid, svc, isSent, err] = resultRows[0].split('|')
  const errorCode = Number(err)

  // Если код ошибки 22 — значит это Android / стационарный (НЕ iMessage)
  if (errorCode === 22) {
    return { isBlue: false, note: '🟢 Зелёный Android / сотовый без iMessage (пропущен)' }
  }

  if (svc === 'iMessage' && errorCode === 0) {
    return { isBlue: true, rowId: rowid, note: '🔵 Синий iMessage (Успешно доставлен на iPhone!)' }
  }

  return { isBlue: false, note: `Статус: ${svc}, ошибка ${errorCode}` }
}

async function main() {
  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const logData = (await fs.pathExists(LOG_FILE_PATH))
    ? await fs.readJson(LOG_FILE_PATH)
    : { history: {}, lastCheckedRowId: 0 }

  console.log('========================================================================')
  console.log('🔵 АВТОПИЛОТ: РАССЫЛКА ТОЛЬКО ПО СИНИМ iMessage (iPhone)')
  console.log('   • Зелёные номера Android / стационарные автоматически пропускаются!')
  console.log('   • Ноль расхода сотового лимита, доставка прямо на iPhone подрядчика')
  console.log('========================================================================\n')

  let sentBlueCount = 0
  let skippedGreenCount = 0

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]
    const rawPhone = row['Телефон (Phone)']
    const phoneE164 = normalizePhone(rawPhone)
    const company = row['Компания (Company)']
    const city = `${row['Город']}, ${row['Штат']}`
    const msg1 = row['Сообщение 1 (Первый SMS)']

    if (!phoneE164) continue
    if (logData.history[phoneE164]?.msg1Sent) continue

    // Проверяем входящие ответы
    await checkIncomingReplies(allRows, logData)

    process.stdout.write(`[Проверка] ${company} (${city}) [${phoneE164}]... `)
    const res = await probeAndSendBlueOnly(phoneE164, msg1)

    if (res.isBlue) {
      sentBlueCount++
      console.log(`\n🎉 🔵 ${res.note}`)
      console.log(`   Текст: "${msg1}"`)

      logData.history[phoneE164] = {
        company,
        city,
        phone: phoneE164,
        enUrl: row['Ссылка для клиента (EN)'],
        channel: 'BLUE_IMESSAGE',
        dateKey: '2026-10-30',
        timestamp: new Date().toISOString(),
        msg1Sent: true,
        msg2Sent: false,
      }
      await fs.writeJson(LOG_FILE_PATH, logData, { spaces: 2 })

      // Пауза 45-70 сек между успешными отправками iMessage
      const delay = Math.floor(45 + Math.random() * 25)
      console.log(`⏳ Естественная пауза ${delay} сек перед следующим контактом...\n`)
      await sleep(delay * 1000)
    } else {
      skippedGreenCount++
      console.log(`⏩ ${res.note}`)
      // Не тратим время на долгие паузы при пропуске зеленых (всего 3-4 секунды)
      await sleep(3500)
    }
  }

  console.log('\n========================================================================')
  console.log(`🏁 РАССЫЛКА ЗАВЕРШЕНА!`)
  console.log(`   🔵 Отправлено синих iMessage: ${sentBlueCount}`)
  console.log(`   ⏩ Пропущено зелёных контактов: ${skippedGreenCount}`)
  console.log('========================================================================')
}

main().catch(console.error)
