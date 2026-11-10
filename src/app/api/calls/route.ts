import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import rawCallLeads from '../../../data/callLeads.json'

const LOG_FILE = path.resolve(process.cwd(), 'outreach_call_log.json')

function readLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'))
    }
  } catch (err) {
    console.error('Error reading call log:', err)
  }
  return { calls: {}, stats: { total: 0, agreed: 0, callback: 0, noAnswer: 0, declined: 0, wrongNumber: 0 } }
}

function writeLog(data: any) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing call log:', err)
  }
}

async function sendTelegramAlert(leadInfo: any, status: string, note: string, stats: any) {
  const statusEmoji: Record<string, string> = {
    AGREED: '✅ СОГЛАСИЛИСЬ НА SMS',
    CALLBACK: '🟡 ПЕРЕЗВОНИТЬ / СЕКРЕТАРЬ',
    NO_ANSWER: '⏳ НЕ ВЗЯЛИ ТРУБКУ',
    DECLINED: '❌ ОТКАЗ / НЕ ИНТЕРЕСНО',
    WRONG_NUMBER: '🚫 НЕВЕРНЫЙ НОМЕР',
  }

  const statusLabel = statusEmoji[status] || status

  const text =
    `📞 <b>Результат звонка оператора Ходы</b>\n\n` +
    `🏢 <b>Компания:</b> ${leadInfo.company || '—'}\n` +
    `👤 <b>Владелец:</b> ${leadInfo.owner || '—'}\n` +
    `📱 <b>Телефон:</b> <code>${leadInfo.phone}</code>\n` +
    `📍 <b>Город:</b> ${leadInfo.city || ''}, ${leadInfo.state || ''}\n` +
    `🎯 <b>Результат:</b> <b>${statusLabel}</b>\n` +
    (note ? `📝 <b>Заметка:</b> <i>${note}</i>\n` : '') +
    `🔗 <b>Витрина:</b> https://zonus.co/${leadInfo.slug}\n\n` +
    `📊 <b>Сводка на текущий момент:</b>\n` +
    `• Всего обработано: <b>${stats.total}</b>\n` +
    `• 🟢 Согласились на SMS: <b>${stats.agreed}</b>\n` +
    `• 🟡 Перезвонить/Жена: <b>${stats.callback}</b>\n` +
    `• ⚪ Не ответили: <b>${stats.noAnswer}</b>\n` +
    `• 🔴 Отказ: <b>${stats.declined}</b>`

  const targets = [
    {
      token: process.env.TELEGRAM_BOT_TOKEN || '8915615220:AAHstRA8VGD1lP0O-Oyg9SLt7hee9FRGLNI',
      chatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '5811905642',
    },
    {
      token: '9160117417:AAHEbjH0025ymMJEYWOQpAc3L5iIXioaMeU',
      chatId: '8182918344',
    },
  ]

  for (const { token, chatId } of targets) {
    if (!token || !chatId) continue
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      })
    } catch (e) {
      console.error('Failed to notify Telegram:', e)
    }
  }
}

export async function GET() {
  const data = readLog()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, slug, company, status, note, isSilentSync } = body

    if (!phone || !status) {
      return NextResponse.json({ error: 'phone and status are required' }, { status: 400 })
    }

    const data = readLog()
    if (!data.calls) data.calls = {}

    data.calls[phone] = {
      slug,
      company,
      phone,
      status, // 'AGREED' | 'CALLBACK' | 'NO_ANSWER' | 'DECLINED' | 'WRONG_NUMBER'
      note: note || '',
      updatedAt: new Date().toISOString(),
    }

    // Recalculate stats
    const stats = {
      total: Object.keys(data.calls).length,
      agreed: 0,
      callback: 0,
      noAnswer: 0,
      declined: 0,
      wrongNumber: 0,
    }

    for (const item of Object.values(data.calls) as any[]) {
      if (item.status === 'AGREED') stats.agreed++
      else if (item.status === 'CALLBACK') stats.callback++
      else if (item.status === 'NO_ANSWER') stats.noAnswer++
      else if (item.status === 'DECLINED') stats.declined++
      else if (item.status === 'WRONG_NUMBER') stats.wrongNumber++
    }

    data.stats = stats
    data.lastUpdated = new Date().toISOString()

    writeLog(data)

    // Send Telegram alert unless it is an automated background sync of old data
    if (!isSilentSync) {
      const matchedLead = (rawCallLeads as any[]).find((l) => l.phone === phone || l.slug === slug) || {
        company,
        slug,
        phone,
      }
      sendTelegramAlert(matchedLead, status, note || '', stats).catch((err) =>
        console.error('Background telegram alert error:', err)
      )
    }

    return NextResponse.json({ ok: true, stats, logged: data.calls[phone] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
