import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function verifyHash(res: string, receivedHash: string, osbSecret: string): boolean {
  const expected = crypto
    .createHmac('sha256', osbSecret)
    .update(res)
    .digest('base64')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(receivedHash)
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res  = (formData.get('res') as string) ?? ''
  const hash = (formData.get('hash') as string) ?? ''

  console.log('[OSB] res (first 300):', res.slice(0, 300))
  console.log('[OSB] hash:', hash.slice(0, 20) + '...')

  const osbSecret = process.env.SHOPIER_OSB_SECRET!

  const isValid = verifyHash(res, hash, osbSecret)
  if (!isValid) {
    console.log('[OSB] Hash mismatch')
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 })
  }

  let order: Record<string, string>
  try {
    order = JSON.parse(res)
  } catch {
    return NextResponse.json({ error: 'Invalid res payload' }, { status: 400 })
  }

  const platformOrderId = order.platform_order_id ?? ''

  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    // platform_order_id bizim formatımızda değil — işlem yapma
    return NextResponse.json({ ok: true, skipped: true })
  }

  const [eventId, packageType] = parts
  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  await activatePackage(eventId, packageType)
  return NextResponse.json({ ok: true })
}
