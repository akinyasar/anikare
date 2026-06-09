import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { eventId, packageType } = await req.json()

  if (!eventId || (packageType !== 'standard' && packageType !== 'premium')) {
    return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const apiKey    = process.env.SHOPIER_OSB_USERNAME!
  const apiSecret = process.env.SHOPIER_OSB_SECRET!
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL!

  const randomNr        = crypto.randomBytes(16).toString('hex')
  const platformOrderId = `${eventId}:${packageType}`
  const price           = packageType === 'standard' ? '899.00' : '1299.00'
  const currency        = '0' // 0 = TRY
  const productName     = packageType === 'standard' ? 'AnıKare Standard Paket' : 'AnıKare Premium Paket'

  // Shopier api_pay4.php formula: base64(HMAC-SHA256-raw(randomNr + platformOrderId + price + currency, apiSecret))
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(randomNr + platformOrderId + price + currency)
    .digest('base64')

  const fullName     = (user.user_metadata?.full_name as string) ?? ''
  const parts        = fullName.trim().split(/\s+/)
  const buyerName    = parts[0] || 'Kullanıcı'
  const buyerSurname = parts.slice(1).join(' ') || '-'

  return NextResponse.json({
    action: 'https://www.shopier.com/ShowProduct/api_pay4.php',
    fields: {
      API_key:           apiKey,
      website_index:     '1',
      platform_order_id: platformOrderId,
      product_name:      productName,
      product_type:      '1',
      buyer_name:        buyerName,
      buyer_surname:     buyerSurname,
      buyer_email:       user.email ?? '',
      buyer_account_age: '0',
      buyer_id_nr:       '0',
      total_order_value: price,
      currency,
      platform:          'custom',
      is_in_frame:       '0',
      current_language:  '0',
      modul_version:     '1.0.4',
      random_nr:         randomNr,
      signature,
      callback:          `${siteUrl}/api/payment/callback`,
    },
  })
}
