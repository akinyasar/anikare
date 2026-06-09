import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const status          = (formData.get('status') as string) ?? ''
  const randomNr        = (formData.get('random_nr') as string) ?? ''
  const platformOrderId = (formData.get('platform_order_id') as string) ?? ''
  const signature       = (formData.get('signature') as string) ?? ''

  const apiKey    = process.env.SHOPIER_OSB_USERNAME!
  const apiSecret = process.env.SHOPIER_OSB_SECRET!

  const expected = crypto
    .createHmac('sha256', apiSecret)
    .update(randomNr + apiKey + '1')
    .digest('base64')

  if (expected !== signature) {
    console.error('[Payment] Callback signature mismatch')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (status === 'approved') {
    const parts = platformOrderId.split(':')
    if (parts.length === 2) {
      const [eventId, packageType] = parts
      if (packageType === 'standard' || packageType === 'premium') {
        try {
          await activatePackage(eventId, packageType)
          console.log(`[Payment] Activated ${packageType} for event ${eventId}`)
        } catch (e) {
          console.error('[Payment] Activation error:', e)
        }
      }
    }
  }

  return NextResponse.redirect(new URL('/odeme-tamamlandi', req.url))
}
