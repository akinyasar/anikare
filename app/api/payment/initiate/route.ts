import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'
import { createClient } from '@/lib/supabase/server'

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! })

export async function POST(req: NextRequest) {
  const { eventId, packageType } = await req.json()

  if (!eventId || (packageType !== 'standard' && packageType !== 'premium')) {
    return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const productId =
    packageType === 'standard'
      ? process.env.POLAR_PRODUCT_STANDARD!
      : process.env.POLAR_PRODUCT_PREMIUM!

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: user.email ?? undefined,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/odeme-tamamlandi`,
      metadata: { referenceId: `${eventId}:${packageType}` },
    })
    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[Payment] Polar checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
