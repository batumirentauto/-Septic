import { NextResponse } from 'next/server'
import crypto from 'crypto'

const ZADARMA_API_KEY = process.env.ZADARMA_API_KEY || 'bafd1dc13201ec786c9f'
const ZADARMA_API_SECRET = process.env.ZADARMA_API_SECRET || '7114bcc84ef2a01bfd12'
const ZADARMA_PBX_ID = process.env.ZADARMA_PBX_ID || '605466'

const MANAGER_SIP_MAP: Record<string, string> = {
  dinara: `${ZADARMA_PBX_ID}-101`,
  '1': `${ZADARMA_PBX_ID}-101`,
  tatyana: `${ZADARMA_PBX_ID}-102`,
  '2': `${ZADARMA_PBX_ID}-102`,
  jayne: `${ZADARMA_PBX_ID}-103`,
  jane: `${ZADARMA_PBX_ID}-103`,
  '3': `${ZADARMA_PBX_ID}-103`,
  test: `${ZADARMA_PBX_ID}-100`,
  '100': `${ZADARMA_PBX_ID}-100`,
  master: `${ZADARMA_PBX_ID}-100`,
}

async function callZadarma(
  method: string,
  params: Record<string, string | number> = {},
  httpMethod: 'GET' | 'POST' = 'GET'
) {
  const allParams = { ...params, format: 'json' }
  const sortedKeys = Object.keys(allParams).sort()
  const searchParams = new URLSearchParams()
  for (const k of sortedKeys) {
    searchParams.append(k, String(allParams[k]))
  }
  const paramsString = searchParams.toString()

  const md5Hash = crypto.createHash('md5').update(paramsString, 'utf8').digest('hex')
  const dataToSign = method + paramsString + md5Hash
  const hmacHex = crypto.createHmac('sha1', ZADARMA_API_SECRET).update(dataToSign, 'utf8').digest('hex')
  const signatureBase64 = Buffer.from(hmacHex, 'utf8').toString('base64')
  const authHeader = `${ZADARMA_API_KEY}:${signatureBase64}`

  let url = 'https://api.zadarma.com' + method
  const options: RequestInit = {
    method: httpMethod,
    headers: {
      Authorization: authHeader,
    },
  }

  if (httpMethod === 'GET') {
    url += '?' + paramsString
  } else {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    options.body = paramsString
  }

  const res = await fetch(url, options)
  const data = await res.json()
  return { status: res.status, data }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'balance'
    const manager = (searchParams.get('manager') || 'master').toLowerCase()

    if (action === 'webrtc_key') {
      const sip = MANAGER_SIP_MAP[manager] || '756804'
      const { data } = await callZadarma('/v1/webrtc/get_key/', { sip })
      return NextResponse.json({
        ok: data.status === 'success',
        key: data.key || null,
        sip,
        manager,
        callerId: process.env.ZADARMA_CALLER_ID || '+1 (585) 438-0111',
      })
    }

    if (action === 'balance') {
      const { data } = await callZadarma('/v1/info/balance/')
      return NextResponse.json(data)
    }

    if (action === 'stats') {
      const start = searchParams.get('start') || '2026-11-01 00:00:00'
      const { data } = await callZadarma('/v1/statistics/', { start })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, manager, to } = body

    if (action === 'callback') {
      if (!to) {
        return NextResponse.json({ error: 'Parameter "to" is required' }, { status: 400 })
      }

      const mgrKey = (manager || 'master').toLowerCase()
      const sip = MANAGER_SIP_MAP[mgrKey] || '756804'

      // Normalize US phone number: remove non-digits
      let cleanPhone = String(to).replace(/\D/g, '')
      if (cleanPhone.length === 10) {
        cleanPhone = '1' + cleanPhone
      }

      // Zadarma callback: "from" is manager's SIP extension, "to" is the destination phone number
      const { status, data } = await callZadarma(
        '/v1/request/callback/',
        {
          from: sip,
          to: cleanPhone,
        },
        'GET'
      )

      return NextResponse.json({
        ok: data.status === 'success',
        zadarmaStatus: status,
        result: data,
        sip,
        to: cleanPhone,
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
