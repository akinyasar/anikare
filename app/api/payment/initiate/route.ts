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

  const randomNr     = crypto.randomBytes(16).toString('hex')
  const websiteIndex = '1'
  // Shopier PHP SDK formula: base64(HMAC-SHA256-raw(randomNr + apiKey + websiteIndex, apiSecret))
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(randomNr + apiKey + websiteIndex)
    .digest('base64')

  const fullName   = (user.user_metadata?.full_name as string) ?? ''
  const parts      = fullName.trim().split(/\s+/)
  const buyerName  = parts[0] || 'Kullanıcı'
  const buyerSurname = parts.slice(1).join(' ') || '-'

  const price       = packageType === 'standard' ? '899.00' : '1299.00'
  const productName = packageType === 'standard' ? 'AnıKare Standard Paket' : 'AnıKare Premium Paket'

  return NextResponse.json({
    action: 'https://www.shopier.com/ShowProduct/shopier.php',
    fields: {
      API_key:                  apiKey,
      website_index:            websiteIndex,
      platform_order_id:        `${eventId}:${packageType}`,
      buyer_name:               buyerName,
      buyer_surname:            buyerSurname,
      buyer_email:              user.email ?? '',
      buyer_account_age:        '0',
      buyer_id_nr:              '0',
      product_name:             productName,
      product_type:             '1',
      quantity:                 '1',
      amount_without_discount:  price,
      current_currency:         '0',
      callback:                 `${siteUrl}/api/payment/callback`,
      random_nr:                randomNr,
      signature,
    },
  })
}
