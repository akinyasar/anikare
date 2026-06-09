import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res  = (formData.get('res') as string) ?? ''
  const hash = (formData.get('hash') as string) ?? ''

  const osbUsername = process.env.SHOPIER_OSB_USERNAME!
  const osbSecret   = process.env.SHOPIER_OSB_SECRET!

  const expected = crypto
    .createHmac('sha256', osbSecret)
    .update(res + osbUsername)
    .digest('hex')

  if (expected !== hash) {
    console.log('[OSB] Hash mismatch')
    return new Response('fail', { status: 401 })
  }

  let order: Record<string, unknown>
  try {
    order = JSON.parse(Buffer.from(res, 'base64').toString('utf-8'))
  } catch {
    return new Response('fail', { status: 400 })
  }

  const platformOrderId = (order.platform_order_id as string) ?? ''
  const parts = platformOrderId.split(':')
  if (parts.length === 2) {
    const [eventId, packageType] = parts
    if (packageType === 'standard' || packageType === 'premium') {
      await activatePackage(eventId, packageType)
    }
  }

  return new Response('success', { status: 200 })
}
