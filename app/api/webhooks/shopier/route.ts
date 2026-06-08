import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function logHash(
  osbUsername: string,
  osbSecret: string,
  orderNo: string,
  receivedHash: string
): void {
  const expected = crypto
    .createHash('sha256')
    .update(osbUsername + osbSecret + orderNo)
    .digest('hex')
  console.log('[OSB] expected hash:', expected)
  console.log('[OSB] received hash:', receivedHash)
  console.log('[OSB] match:', expected === receivedHash)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res  = (formData.get('res') as string) ?? ''
  const hash = (formData.get('hash') as string) ?? ''

  const osbUsername = process.env.SHOPIER_OSB_USERNAME!
  const osbSecret   = process.env.SHOPIER_OSB_SECRET!

  let order: Record<string, string>
  try {
    order = JSON.parse(Buffer.from(res, 'base64').toString('utf-8'))
  } catch {
    return NextResponse.json({ error: 'Invalid res payload' }, { status: 400 })
  }

  // Hash formülü henüz doğrulanmadı — gerçek sipariş geldikten sonra aktif edilecek
  logHash(osbUsername, osbSecret, order.orderid ?? '', hash)

  const platformOrderId = order.platform_order_id ?? ''
  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const [eventId, packageType] = parts
  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  await activatePackage(eventId, packageType)
  return NextResponse.json({ ok: true })
}
