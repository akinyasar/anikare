import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  const packageType = searchParams.get('package')

  if (!eventId || (packageType !== 'standard' && packageType !== 'premium')) {
    return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const baseUrl =
    packageType === 'standard'
      ? process.env.SHOPIER_URL_STANDARD
      : process.env.SHOPIER_URL_PREMIUM

  if (!baseUrl) {
    return NextResponse.json({ error: 'Ödeme yapılandırılmamış' }, { status: 500 })
  }

  const platformOrderId = `${eventId}:${packageType}`
  const separator = baseUrl.includes('?') ? '&' : '?'
  const checkoutUrl =
    `${baseUrl}${separator}` +
    `buyer_id=${encodeURIComponent(user.id)}` +
    `&platform_order_id=${encodeURIComponent(platformOrderId)}`

  return NextResponse.json({ url: checkoutUrl })
}
