import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function verifyHash(
  osbUsername: string,
  osbSecret: string,
  orderNo: string,
  receivedHash: string
): boolean {
  const expected = crypto
    .createHash('md5')
    .update(osbUsername + osbSecret + orderNo)
    .digest('hex')
  console.log('[OSB] expected hash:', expected)
  console.log('[OSB] received hash:', receivedHash)
  return expected === receivedHash
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
    console.log('[OSB] Failed to parse res')
    return NextResponse.json({ error: 'Invalid res payload' }, { status: 400 })
  }

  console.log('[OSB] order:', JSON.stringify(order))

  const orderNo = order.order_id ?? order.orderNo ?? order.identity ?? ''
  if (!verifyHash(osbUsername, osbSecret, orderNo, hash)) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 })
  }

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
