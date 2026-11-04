import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

export async function GET() {
  const data = readLog()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, slug, company, status, note } = body

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

    return NextResponse.json({ ok: true, stats, logged: data.calls[phone] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
