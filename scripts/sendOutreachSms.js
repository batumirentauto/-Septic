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

// Лимит ТОЛЬКО на зелёные SMS через eSIM в день (синие iMessage идут без лимита сверху!)
const MAX_GREEN_SMS_PER_DAY = 50

// Пауза между сообщениями (45–80 секунд), чтобы ни сотовый оператор, ни Apple не включили фильтр
const MIN_DELAY_SEC = 45
const MAX_DELAY_SEC = 80

function buildSmartMsg2(contractor) {
  const companyName = String(contractor['Компания (Company)'] || '').trim()
  const city = String(contractor['Город'] || 'your').trim()
  const enLink = String(contractor['Ссылка для клиента (EN)'] || '').trim()
  return `Got it — asking because when you search septic repair in ${city}, your Google listing pops up with great reviews, but has no website attached, so some homeowners end up clicking your competitors. I already built a ready-to-go page for ${companyName} with your real photos and reviews so you can see how it looks: ${enLink} — no charge to look, curious if everything on there is accurate for your services?`
}

// Расписание слотов по реальному времени Батуми (Asia/Tbilisi, UTC+4)
const SLOTS = [
  {
    key: 'EAST',
    name: 'Слот 1: Восток США (NY, FL, GA, NC, PA и др.)',
    sheetName: '16_30-17_30 Восток (NY,FL,GA)',
    startHourBatumi: 16,
    startMinBatumi: 30,
    endHourBatumi: 17,
    endMinBatumi: 30,
    greenQuota: 15, // До 15 зелёных SMS + все синие iMessage без лимита
  },
  {
    key: 'CENTRAL',
    name: 'Слот 2: Центр США (TX, Чикаго/IL, TN, AL и др.)',
    sheetName: '17_30-18_30 Центр (TX,IL,TN)',
    startHourBatumi: 17,
    startMinBatumi: 30,
    endHourBatumi: 18,
    endMinBatumi: 30,
    greenQuota: 15, // До 15 зелёных SMS + все синие iMessage без лимита
  },
  {
    key: 'MOUNTAIN',
    name: 'Слот 3: Горное время (CO, AZ, UT, ID и др.)',
    sheetName: '18_30-19_30 Горы (CO,AZ)',
    startHourBatumi: 18,
    startMinBatumi: 30,
    endHourBatumi: 19,
    endMinBatumi: 30,
    greenQuota: 10, // До 10 зелёных SMS + все синие iMessage без лимита
  },
  {
    key: 'WEST',
    name: 'Слот 4: Запад США (CA, WA, OR и др.)',
    sheetName: '19_30-20_30 Запад (CA,WA)',
    startHourBatumi: 19,
    startMinBatumi: 30,
    endHourBatumi: 20,
    endMinBatumi: 30,
    greenQuota: 10, // До 10 зелёных SMS + все синие iMessage без лимита
  },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length > 10) return `+${digits}`
  return null
}

function getClocks() {
  const now = new Date()

  // Точное время в Батуми (Asia/Tbilisi, UTC+4) независимо от настроек экрана MacBook
  const batumiParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tbilisi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const bp = Object.fromEntries(batumiParts.map((p) => [p.type, p.value]))
  const batumiHour = Number(bp.hour === '24' ? 0 : bp.hour)
  const batumiMin = Number(bp.minute)
  const batumiDateKey = `${bp.year}-${bp.month}-${bp.day}`
  const batumiStr = `${String(batumiHour).padStart(2, '0')}:${bp.minute}:${bp.second}`

  // Локальное время на часах MacBook (для наглядности)
  const macStr = now.toTimeString().slice(0, 8)

  return {
    now,
    batumiHour,
    batumiMin,
    batumiTotalMinutes: batumiHour * 60 + batumiMin,
    batumiDateKey,
    batumiStr,
    macStr,
  }
}

async function loadSentLog() {
  if (await fs.pathExists(LOG_FILE_PATH)) {
    try {
      return await fs.readJson(LOG_FILE_PATH)
    } catch {}
  }
  return {
    history: {}, // phone -> { company, slug, channel: 'BLUE_IMESSAGE' | 'GREEN_SMS', slotKey, dateKey, timestamp, msg1Sent, msg2Sent }
    seenReplies: [], // array of message ROWIDs from chat.db
  }
}

async function saveSentLog(logData) {
  await fs.writeJson(LOG_FILE_PATH, logData, { spaces: 2 })
}

function getTodayCounts(logData, batumiDateKey) {
  let greenToday = 0
  let blueToday = 0
  const greenBySlot = { EAST: 0, CENTRAL: 0, MOUNTAIN: 0, WEST: 0 }
  const blueBySlot = { EAST: 0, CENTRAL: 0, MOUNTAIN: 0, WEST: 0 }

  for (const entry of Object.values(logData.history)) {
    if (entry.dateKey !== batumiDateKey) continue
    if (entry.channel === 'GREEN_SMS') {
      greenToday++
      if (greenBySlot[entry.slotKey] !== undefined) greenBySlot[entry.slotKey]++
    } else if (entry.channel === 'BLUE_IMESSAGE') {
      blueToday++
      if (blueBySlot[entry.slotKey] !== undefined) blueBySlot[entry.slotKey]++
    }
  }

  return { greenToday, blueToday, greenBySlot, blueBySlot }
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

async function ensureContactInAddressBook(phoneE164, ownerRaw, company, city, enUrl = '') {
  if (!phoneE164 || phoneE164.includes('@')) return
  const cleanOwner =
    ownerRaw && !String(ownerRaw).includes('Hey there') && !String(ownerRaw).includes('—')
      ? String(ownerRaw).trim()
      : ''
  const firstName = cleanOwner ? `${cleanOwner} (${company})` : company
  const lastName = city || ''
  const noteText = enUrl ? `Showcase: ${enUrl}` : 'Septic Outreach'

  const contactScript = `
on run argv
  set targetPhone to item 1 of argv
  set fName to item 2 of argv
  set lName to item 3 of argv
  set orgName to item 4 of argv
  set noteStr to item 5 of argv
  tell application "Contacts"
    set existing to (every person whose organization is orgName)
    if (count of existing) is 0 then
      set p to make new person with properties {first name:fName, last name:lName, organization:orgName, note:noteStr}
      make new phone at end of phones of p with properties {label:"mobile", value:targetPhone}
      save
    end if
  end tell
end run
`
  try {
    await execFileAsync('osascript', ['-e', contactScript, phoneE164, firstName, lastName, company, noteText])
  } catch {}
}

async function sendViaMessagesUI(phoneE164, text) {
  // 1) Открываем чат в Messages.app через нативную схему sms://+1...?body=...
  //    macOS сама открывает нужный диалог, подставляет американскую eSIM по умолчанию (+1 302-213-0266),
  //    автоматически определяет синий iMessage или зелёный SMS и вставляет текст в поле ввода (независимо от раскладки клавиатуры!).
  const encodedBody = encodeURIComponent(text)
  const smsUrl = `sms://${phoneE164}?body=${encodedBody}`
  await execFileAsync('open', [smsUrl])

  // Даём Messages.app 2.8 секунды на открытие чата и определение статуса (синий iMessage vs зелёный SMS)
  await sleep(2800)

  // 2) Нажимаем физический Return (key code 36) для отправки сообщения
  const sendKeyScript = `
tell application "Messages" to activate
delay 0.5
tell application "System Events"
  tell process "Messages"
    set frontmost to true
    delay 0.3
    key code 36
  end tell
end tell
`
  await execFileAsync('osascript', ['-e', sendKeyScript])
}

/**
 * Умная отправка через интерфейс Messages.app + проверка цвета (iMessage vs SMS) в базе chat.db:
 * 1) Набирает номер и отправляет сообщение через интерфейс окна Messages.app (чтобы всегда выбиралась американская eSIM).
 * 2) Messages.app за 2.5 секунды сама определяет: синий iMessage или зелёный SMS.
 * 3) Через 10 секунд скрипт смотрит в chat.db поле service ('iMessage' или 'SMS'):
 *    - Если 'iMessage' -> 🔵 Синее (0 расхода лимита 50 зелёных SMS!).
 *    - Если 'SMS'      -> 🟢 Зелёное (+1 к лимиту 50 зелёных SMS).
 */
async function sendSmartMessage(phoneE164, text, allowGreenFallback = true, dryRun = false) {
  if (dryRun) {
    return { ok: true, channel: 'BLUE_IMESSAGE', note: 'DRY-RUN (Тестовый прогон без отправки)' }
  }

  const last10 = phoneE164.replace(/\D/g, '').slice(-10)
  const beforeRowId = await getMaxMessageRowId()

  try {
    await sendViaMessagesUI(phoneE164, text)
  } catch (err) {
    return {
      ok: false,
      channel: 'ERROR_UI_PERMISSION',
      note: `Нужно включить разрешение «Универсальный доступ» (Accessibility) для Antigravity/Terminal в Настройках macOS: ${err.message}`,
    }
  }

  // Ждём 10 секунд, чтобы сообщение ушло и записалось в базу chat.db
  await sleep(10000)

  const checkMsgSql = `
    SELECT m.ROWID, m.service, m.is_sent, m.is_delivered, m.date_delivered, m.error
    FROM message m
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    WHERE m.ROWID > ${beforeRowId}
      AND m.is_from_me = 1
      AND h.id LIKE '%${last10}'
    ORDER BY m.ROWID DESC
    LIMIT 1;
  `
  const rows = await querySqlite(checkMsgSql)
  const latest = rows[0]

  if (!latest) {
    return {
      ok: false,
      channel: 'ERROR_NOT_FOUND',
      note: 'Сообщение не появилось в базе chat.db (проверьте, что окно Messages открыто)',
    }
  }

  if (Number(latest.error) !== 0) {
    return {
      ok: false,
      channel: 'ERROR_DELIVERY',
      note: `Ошибка отправки (код ${latest.error}, канал ${latest.service})`,
    }
  }

  if (latest.service === 'iMessage') {
    return {
      ok: true,
      channel: 'BLUE_IMESSAGE',
      rowId: latest.ROWID,
      note: 'Доставлено по iMessage (Синее — лимит SIM не потрачен!)',
    }
  }

  return {
    ok: true,
    channel: 'GREEN_SMS',
    rowId: latest.ROWID,
    note: 'Отправлено как зелёное SMS с американской eSIM (+1 к лимиту 50 зелёных)',
  }
}

function decodeAttributedBodyHex(hexStr) {
  if (!hexStr) return ''
  try {
    const buf = Buffer.from(hexStr, 'hex')
    const raw = buf.toString('utf8')
    const match = raw.match(/NSString[^\x20-\x7E]*\+.(.*?)iI/s)
    if (match && match[1]) {
      return match[1].replace(/[^\x20-\x7E]/g, ' ').trim()
    }
    return raw.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}

/**
 * Проверка новых входящих ответов от подрядчиков в базе Messages (chat.db)
 */
async function checkIncomingReplies(allRows, logData) {
  const sql = `
    SELECT m.ROWID, m.text, hex(m.attributedBody) AS attrHex, m.service, m.date, h.id AS senderPhone
    FROM message m
    JOIN handle h ON m.handle_id = h.ROWID
    WHERE m.is_from_me = 0
      AND (m.text IS NOT NULL OR m.attributedBody IS NOT NULL)
    ORDER BY m.ROWID DESC
    LIMIT 30;
  `
  const incoming = await querySqlite(sql)
  const seenSet = new Set(logData.seenReplies || [])
  let foundNew = false

  for (const msg of incoming.reverse()) {
    if (seenSet.has(msg.ROWID)) continue
    const msgText = (msg.text || decodeAttributedBodyHex(msg.attrHex) || '').trim()
    if (!msgText) continue
    const senderRaw = String(msg.senderPhone || '').trim()
    const last10 = senderRaw.replace(/\D/g, '').slice(-10)

    let contractor = null
    if (last10 && last10.length === 10) {
      contractor = allRows.find(
        (r) => String(r['Телефон (Phone)'] || '').replace(/\D/g, '').slice(-10) === last10
      )
    }
    // Если ответ пришёл со 2-го мобильного номера или Apple ID Email — находим компанию через logData.history
    if (!contractor) {
      const historyMatch = Object.values(logData.history || {}).find(
        (h) =>
          h.phone?.toLowerCase() === senderRaw.toLowerCase() ||
          (last10 && last10.length === 10 && String(h.phone || '').replace(/\D/g, '').slice(-10) === last10)
      )
      if (historyMatch) {
        contractor = allRows.find((r) => r['Компания (Company)'] === historyMatch.company)
      }
    }
    if (!contractor) continue

    seenSet.add(msg.ROWID)
    foundNew = true

    const companyName = contractor['Компания (Company)']
    const ownerName = contractor['Имя владельца (Owner)']
    const cityState = `${contractor['Город']}, ${contractor['Штат']}`
    const enLink = contractor['Ссылка для клиента (EN)']
    const msg2 = buildSmartMsg2(contractor)

    console.log('\n========================================================================')
    console.log(`🔔 ПОЛУЧЕН НОВЫЙ ОТВЕТ ОТ ПОДРЯДЧИКА! (${msg.service === 'iMessage' ? '🔵 iMessage' : '🟢 SMS'})`)
    console.log(`🏢 Компания: ${companyName} (${cityState}) | Владелец: ${ownerName}`)
    console.log(`📞 Телефон:  ${contractor['Телефон (Phone)']}`)
    console.log(`💬 Ответ клиента: "${msgText}"`)
    console.log(`🌐 Личная витрина: ${enLink}`)
    console.log('------------------------------------------------------------------------')

    const phoneE164 = senderRaw.includes('@') ? senderRaw : normalizePhone(senderRaw) || normalizePhone(contractor['Телефон (Phone)'])
    const isNegative = /^(no\b|nope|stop|unsubscribe|wrong number|not anymore|we don't|we do not|retired)/i.test(
      msgText.trim()
    )

    const safeCheckHandle = senderRaw.includes('@') ? senderRaw.replace(/'/g, "''") : last10
    // Проверяем в chat.db, сколько успешных исходящих сообщений уже было отправлено этому номеру/email
    const sentCountRows = await querySqlite(`
      SELECT COUNT(*) AS cnt
      FROM message m
      JOIN handle h ON m.handle_id = h.ROWID
      WHERE m.is_from_me = 1
        AND m.error = 0
        AND h.id LIKE '%${safeCheckHandle}%';
    `)
    const alreadySentCount = Number(sentCountRows[0]?.cnt || 0)
    const alreadySentMsg2 =
      alreadySentCount >= 2 || Boolean(phoneE164 && logData.history[phoneE164]?.msg2Sent)

    if (!isNegative && !alreadySentMsg2 && phoneE164 && msg2) {
      // Вычисляем сколько секунд назад пришло сообщение клиента (msg.date в chat.db — наносекунды от 2001-01-01 UTC)
      const appleEpochMs = 978307200000
      const msgTimestampMs = msg.date ? appleEpochMs + Number(msg.date) / 1e6 : Date.now()
      const elapsedSec = Math.max(0, Math.floor((Date.now() - msgTimestampMs) / 1000))

      // Целевая пауза перед длинным ответом: 80–110 секунд (1 мин 20 сек — 1 мин 50 сек) с момента ответа клиента,
      // и минимум 65–95 секунд ожидания прямо сейчас, чтобы ответ никогда не прилетал мгновенно!
      const targetTotalSec = Math.floor(80 + Math.random() * 31)
      const minNowWaitSec = Math.floor(65 + Math.random() * 31)
      const waitSec = Math.max(minNowWaitSec, targetTotalSec - elapsedSec)

      console.log(
        `⏳ Естественная пауза ${waitSec} сек (~1.5 мин, чтобы человек не получил длинный текст мгновенно) перед отправкой Сообщения 2 (${enLink})...`
      )
      await sleep(waitSec * 1000)
      const replyRes = await sendSmartMessage(phoneE164, msg2, true, false)
      console.log(`✅ Авто-ответ (Сообщение 2) для ${companyName}: ${replyRes.channel} — ${replyRes.note}`)
      if (!logData.history[phoneE164]) {
        logData.history[phoneE164] = {
          company: companyName,
          city: cityState,
          phone: phoneE164,
          enUrl: enLink,
          channel: replyRes.channel,
          slotKey: 'EAST',
          dateKey: getClocks().batumiDateKey,
          timestamp: new Date().toISOString(),
          msg1Sent: true,
          msg2Sent: true,
        }
      } else {
        logData.history[phoneE164].msg2Sent = true
      }
    } else {
      console.log('📋 ГОТОВОЕ СООБЩЕНИЕ 2 (если ещё не отправлено):')
      console.log(`\n${msg2}\n`)
    }
    console.log('========================================================================\n')
  }

  if (foundNew) {
    logData.seenReplies = [...seenSet]
    await saveSentLog(logData)
  }
}

async function checkVisitorRadar(logData) {
  try {
    const res = await fetch('https://septic.up.railway.app/api/radar?includeTests=0')
    if (!res.ok) return
    const data = await res.json()
    if (!data || !Array.isArray(data.sessions)) return

    if (!logData.seenRadarSessions) {
      logData.seenRadarSessions = {}
    }

    let updated = false
    for (const s of data.sessions) {
      const prev = logData.seenRadarSessions[s.sessionId]
      const isNewSession = !prev
      const isDeepEngagement =
        prev && !prev.notifiedDeep && (s.durationSec >= 25 || s.maxScrollPct >= 50 || s.photoClicks > 0)

      if (isNewSession || isDeepEngagement) {
        console.log('\n🔥🔥🔥 ====================================================================')
        console.log(
          `👀 [РАДАР ПРОСМОТРОВ] ${
            isNewSession ? 'ПОДРЯДЧИК ОТКРЫЛ ВИТРИНУ!' : 'ПОДРЯДЧИК АКТИВНО ИЗУЧАЕТ ВИТРИНУ!'
          }`
        )
        console.log(`🏢 Компания: ${s.companyName} (${s.city}, ${s.state})`)
        console.log(`👤 Владелец: ${s.ownerName} | 📞 ${s.phone}`)
        console.log(`📱 Устройство: ${s.device} (${s.screen}) | Часовой пояс: ${s.timezone}`)
        console.log(
          `⏱️ Время на сайте: ${s.durationSec} сек | Скролл: ${s.maxScrollPct}% | Клики по фото: ${s.photoClicks}`
        )
        console.log(`🔗 Панель радара: https://septic.up.railway.app/stats`)
        console.log('========================================================================\n')

        logData.seenRadarSessions[s.sessionId] = {
          firstSeenAt: s.firstSeenAt,
          notifiedDeep: Boolean(isDeepEngagement || s.durationSec >= 25 || s.maxScrollPct >= 50),
        }
        updated = true
      }
    }

    if (updated) {
      await saveSentLog(logData)
    }
  } catch {
    // ignore network errors while polling radar
  }
}

async function runSlot(slot, wb, allRows, logData, options = {}) {
  const { dryRun = false } = options
  const slotRows = XLSX.utils.sheet_to_json(wb.Sheets[slot.sheetName] || [])
  const clocks = getClocks()
  const counts = getTodayCounts(logData, clocks.batumiDateKey)

  console.log(`\n🚀 ЗАПУСК СЛОТА: ${slot.name}`)
  console.log(`🕒 Время сейчас: ${clocks.batumiStr} Батуми (${clocks.macStr} на часах MacBook)`)
  console.log(
    `📊 Статистика за сегодня (${clocks.batumiDateKey}): 🟢 Зелёных SMS: ${counts.greenToday}/${MAX_GREEN_SMS_PER_DAY} (в этом слоте: ${counts.greenBySlot[slot.key]}/${slot.greenQuota}) | 🔵 Синих iMessage: ${counts.blueToday} (без лимита)\n`
  )

  for (let i = 0; i < slotRows.length; i++) {
    const row = slotRows[i]
    const rawPhone = row['Телефон (Phone)']
    const phoneE164 = normalizePhone(rawPhone)
    const company = row['Компания (Company)']
    const city = `${row['Город']}, ${row['Штат']}`
    const msg1 = row['Сообщение 1 (Первый SMS)']

    if (!phoneE164) continue

    // Не отправляем повторно тем, кому уже отправляли
    if (logData.history[phoneE164]?.msg1Sent) {
      continue
    }

    // Проверяем свежие ответы перед каждым шагом
    await checkIncomingReplies(allRows, logData)

    const currentClocks = getClocks()
    const currentCounts = getTodayCounts(logData, currentClocks.batumiDateKey)
    const greenSlotUsed = currentCounts.greenBySlot[slot.key] || 0
    const greenTotalUsed = currentCounts.greenToday

    // Если мы уже выбрали дневной лимит 50 зелёных ИЛИ квоту зелёных этого слота — завершаем слот
    if (greenTotalUsed >= MAX_GREEN_SMS_PER_DAY) {
      console.log(`🛑 Достигнут дневной лимит ${MAX_GREEN_SMS_PER_DAY} зелёных SMS! Останавливаем отправку зелёных на сегодня.`)
      break
    }
    if (greenSlotUsed >= slot.greenQuota) {
      console.log(
        `✅ Выполнена квота слота (${greenSlotUsed}/${slot.greenQuota} зелёных SMS + ${currentCounts.blueBySlot[slot.key] || 0} синих iMessage)! Переходим к ожиданию следующего часового пояса.`
      )
      break
    }

    console.log(
      `[${currentClocks.batumiStr} Батуми] Отправка -> ${company} (${city}) [${phoneE164}]...`
    )
    console.log(`   Текст: "${msg1}"`)

    // Автоматически сохраняем контакт в Contacts.app перед отправкой (повышает траст Apple ID для синих iMessage)
    await ensureContactInAddressBook(
      phoneE164,
      row['Имя владельца (Owner)'],
      company,
      city,
      row['Ссылка для клиента (EN)']
    )

    const result = await sendSmartMessage(phoneE164, msg1, true, dryRun)

    if (!result.ok) {
      console.log(`   ⚠️ Пропуск номера (${phoneE164}): ${result.note}`)
      logData.history[phoneE164] = {
        company,
        city,
        phone: phoneE164,
        enUrl: row['Ссылка для клиента (EN)'],
        channel: result.channel,
        slotKey: slot.key,
        dateKey: currentClocks.batumiDateKey,
        timestamp: new Date().toISOString(),
        msg1Sent: true,
        msg2Sent: false,
      }
      await saveSentLog(logData)
      await sleep(15000)
      continue
    }

    logData.history[phoneE164] = {
      company,
      city,
      phone: phoneE164,
      enUrl: row['Ссылка для клиента (EN)'],
      channel: result.channel,
      slotKey: slot.key,
      dateKey: currentClocks.batumiDateKey,
      timestamp: new Date().toISOString(),
      msg1Sent: true,
      msg2Sent: false,
    }
    await saveSentLog(logData)

    const updatedCounts = getTodayCounts(logData, currentClocks.batumiDateKey)
    if (result.channel === 'BLUE_IMESSAGE') {
      console.log(
        `   🔵 [СИНЕЕ iMessage] ${result.note} | Зелёных: ${updatedCounts.greenToday}/${MAX_GREEN_SMS_PER_DAY} (слот: ${updatedCounts.greenBySlot[slot.key]}/${slot.greenQuota}), Синих: ${updatedCounts.blueToday}`
      )
    } else {
      console.log(
        `   🟢 [ЗЕЛЁНОЕ SMS] ${result.note} | Зелёных: ${updatedCounts.greenToday}/${MAX_GREEN_SMS_PER_DAY} (слот: ${updatedCounts.greenBySlot[slot.key]}/${slot.greenQuota}), Синих: ${updatedCounts.blueToday}`
      )
    }

    // Случайная человеческая пауза 45–80 секунд перед следующим контактом
    const delaySec = Math.floor(MIN_DELAY_SEC + Math.random() * (MAX_DELAY_SEC - MIN_DELAY_SEC + 1))
    console.log(`   ⏳ Пауза ${delaySec} сек перед следующим сообщением...\n`)
    await sleep(delaySec * 1000)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const statusOnly = args.includes('--status')
  const slotArg = args.find((a) => a.startsWith('--slot='))?.split('=')[1]?.toUpperCase()
  const replyArg = args.find((a) => a.startsWith('--reply='))?.split('=')[1]
  const testArg = args.find((a) => a.startsWith('--test='))?.split('=')[1]

  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const logData = await loadSentLog()
  const clocks = getClocks()
  const counts = getTodayCounts(logData, clocks.batumiDateKey)

  console.log('========================================================================')
  console.log('🤖 АВТОМАТИЗАЦИЯ РАССЫЛКИ SMS / iMessage (MacBook -> iPhone eSIM)')
  console.log(`🕒 Реальное время в Батуми:  ${clocks.batumiStr} (${clocks.batumiDateKey}, UTC+4)`)
  console.log(`💻 Время на часах MacBook:  ${clocks.macStr} (системное время ноутбука)`)
  console.log(
    `📊 Отправлено сегодня:      🟢 Зелёных SMS: ${counts.greenToday}/${MAX_GREEN_SMS_PER_DAY} | 🔵 Синих iMessage: ${counts.blueToday} (без лимита)`
  )
  console.log('========================================================================')

  // Всегда проверяем новые входящие ответы
  await checkIncomingReplies(allRows, logData)

  if (statusOnly) {
    for (const s of SLOTS) {
      console.log(
        `• ${s.name}: 🟢 ${counts.greenBySlot[s.key]}/${s.greenQuota} зелёных | 🔵 ${counts.blueBySlot[s.key]} синих`
      )
    }
    return
  }

  // Быстрая отправка Сообщения 2 (с персональной ссылкой) по номеру телефона
  if (replyArg) {
    const targetE164 = normalizePhone(replyArg)
    const last10 = (targetE164 || '').replace(/\D/g, '').slice(-10)
    const contractor = allRows.find(
      (r) => String(r['Телефон (Phone)'] || '').replace(/\D/g, '').slice(-10) === last10
    )
    if (!contractor) {
      console.error(`❌ Подрядчик с номером ${replyArg} не найден в таблице 316 High-Ticket.`)
      return
    }
    const msg2 = buildSmartMsg2(contractor)
    console.log(`\n📤 Отправка Сообщения 2 (с витриной) для ${contractor['Компания (Company)']} (${targetE164})...`)
    const res = await sendSmartMessage(targetE164, msg2, true, dryRun)
    console.log(`✅ Результат: ${res.channel} — ${res.note}`)
    if (logData.history[targetE164]) {
      logData.history[targetE164].msg2Sent = true
      await saveSentLog(logData)
    }
    return
  }

  // Тестовая отправка на произвольный номер
  if (testArg) {
    const targetE164 = normalizePhone(testArg)
    if (!targetE164) {
      console.error(`❌ Некорректный номер для теста: ${testArg}`)
      return
    }
    const testText = `Hey Zac, do you guys still do septic repair and excavation in the Pittsburgh area?`
    console.log(`\n🧪 ТЕСТОВАЯ ОТПРАВКА на номер ${targetE164}...`)
    const res = await sendSmartMessage(targetE164, testText, true, dryRun)
    console.log(`Результат теста: ${res.ok ? '✅ УСПЕШНО' : '❌ ОШИБКА'} | Канал: ${res.channel} | ${res.note}`)
    return
  }

  // Если указан конкретный слот вручную (--slot=EAST)
  if (slotArg) {
    const slot = SLOTS.find((s) => s.key === slotArg)
    if (!slot) {
      console.error(`❌ Неизвестный слот ${slotArg}. Доступные: EAST, CENTRAL, MOUNTAIN, WEST`)
      return
    }
    await runSlot(slot, wb, allRows, logData, { dryRun })
    return
  }

  // Режим автопилота по расписанию Батуми (16:30 -> 17:30 -> 18:30 -> 19:30)
  console.log('\n⏱️ Запущен режим АВТОПИЛОТА по времени Батуми (16:30 — 20:30)...')
  while (true) {
    const c = getClocks()
    await checkIncomingReplies(allRows, logData)
    await checkVisitorRadar(logData)

    const todayStats = getTodayCounts(logData, c.batumiDateKey)
    if (todayStats.greenToday >= MAX_GREEN_SMS_PER_DAY) {
      console.log(`🎉 Дневная норма ${MAX_GREEN_SMS_PER_DAY} зелёных SMS полностью выполнена! Продолжаю мониторить входящие ответы...`)
      await sleep(30000)
      continue
    }

    // Ищем первый открытый по времени Батуми слот (с 16:30 до 21:30), где ещё не выбрана квота зелёных SMS
    const activeSlot = SLOTS.find((s) => {
      const startMins = s.startHourBatumi * 60 + s.startMinBatumi
      const slotUsed = todayStats.greenBySlot[s.key] || 0
      return c.batumiTotalMinutes >= startMins && c.batumiTotalMinutes < 21 * 60 + 30 && slotUsed < s.greenQuota
    })

    if (activeSlot) {
      await runSlot(activeSlot, wb, allRows, logData, { dryRun })
    } else {
      // Показываем статус ожидания раз в 30 секунд
      const nextSlot = SLOTS.find((s) => {
        const startMins = s.startHourBatumi * 60 + s.startMinBatumi
        return c.batumiTotalMinutes < startMins
      })
      if (nextSlot) {
        const minsLeft = nextSlot.startHourBatumi * 60 + nextSlot.startMinBatumi - c.batumiTotalMinutes
        process.stdout.write(
          `\r⏳ [${c.batumiStr} Батуми | ${c.macStr} MacBook] Ожидание слота «${nextSlot.name}» (старт через ${minsLeft} мин)... `
        )
      } else {
        process.stdout.write(
          `\r👀 [${c.batumiStr} Батуми | ${c.macStr} MacBook] Вечернее окно завершено. Мониторинг входящих ответов... `
        )
      }
      await sleep(30000)
    }
  }
}

main().catch(console.error)
