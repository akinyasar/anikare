import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function verifySignature(
  osbUsername: string,
  websiteUrl: string,
  totalOrderValue: string,
  platformOrderId: string,
  receivedSignature: string,
  osbSecret: string
): boolean {
  const data = `${osbUsername}${websiteUrl}${totalOrderValue}${platformOrderId}`
  const expected = crypto
    .createHmac('sha256', osbSecret)
    .update(data)
    .digest('base64')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(receivedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = new URLSearchParams(text)

  const platformOrderId = params.get('platform_order_id') ?? ''
  const totalOrderValue  = params.get('total_order_value') ?? ''
  const signature        = params.get('signature') ?? ''
  const apiKey           = params.get('API_key') ?? ''

  const osbUsername = process.env.SHOPIER_OSB_USERNAME!
  const osbSecret   = process.env.SHOPIER_OSB_SECRET!

  if (apiKey !== osbUsername) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const websiteUrl = 'www.anikare.net'
  const isValid = verifySignature(
    osbUsername,
    websiteUrl,
    totalOrderValue,
    platformOrderId,
    signature,
    osbSecret
  )

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  const [eventId, packageType] = parts
  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.json({ error: 'Unknown package' }, { status: 400 })
  }

  await activatePackage(eventId, packageType)
  return NextResponse.json({ ok: true })
}
