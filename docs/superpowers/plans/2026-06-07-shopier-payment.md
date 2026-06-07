# Shopier Ödeme Entegrasyonu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wizard'da seçilen standard/premium paket için Shopier ödeme akışını entegre et; webhook ile ödeme onayı gelince event'in `package_type`'ını güncelle.

**Architecture:** Event her zaman `eco` olarak oluşturulur; wizard ücretli paket seçildiyse event oluşturduktan sonra Shopier'a yönlendirir. Shopier webhook handler ödemeyi doğrulayıp `package_type`'ı yükseltir. Başarı sayfası kullanıcıyı event dashboard'una yönlendirir.

**Tech Stack:** Next.js App Router API routes, Supabase service_role, Node.js `crypto` (HMAC-SHA256 imza doğrulama — zero yeni dependency)

---

## Ön Gereksinim: Shopier Kurulumu (Manuel — Koddan Önce Yap)

Bu adımlar **siz** tarafından Shopier dashboard'unda yapılacak:

1. [shopier.com](https://shopier.com) → Hesap aç → Bireysel → TCKN + IBAN
2. İki ürün oluştur:
   - **"AnıKare Standart"** → ₺1.000
   - **"AnıKare Premium"** → ₺1.399
3. Her ürünün ödeme linkini kopyala (ör. `https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXXX`)
4. Shopier Dashboard → Entegrasyonlar → Webhook URL:
   ```
   https://www.anikare.net/api/webhooks/shopier
   ```
5. API Anahtarı ve Webhook Secret'ı kopyala
6. Vercel'e ve `.env.local`'e ekle:
   ```
   SHOPIER_API_KEY=xxx
   SHOPIER_WEBHOOK_SECRET=xxx
   SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXXX
   SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=YYYYY
   ```

---

## File Map

| Durum | Dosya | Sorumluluk |
|-------|-------|------------|
| Yeni | `lib/payment/activate-package.ts` | Event `package_type` yükselt (service_role) |
| Yeni | `app/api/payment/create-checkout/route.ts` | Shopier URL'ini `platform_order_id` ile döndür |
| Yeni | `app/api/webhooks/shopier/route.ts` | HMAC doğrula, paketi aktive et |
| Yeni | `app/(marketing)/odeme-tamamlandi/page.tsx` | Ödeme başarı sayfası |
| Değişecek | `components/event/wizard.tsx` | Eco ile oluştur, ücretliyse checkout'a yönlendir |
| Değişecek | `.env.example` | Yeni env var'ları dokümante et |

---

## Task 1: Package Aktivasyon Lib

**Files:**
- Create: `lib/payment/activate-package.ts`

- [ ] **Step 1: Dosyayı oluştur**

```typescript
// lib/payment/activate-package.ts
import { createServiceClient } from '@/lib/supabase/server'
import type { PackageType } from '@/types'

export async function activatePackage(
  eventId: string,
  packageType: 'standard' | 'premium'
): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('events')
    .update({ package_type: packageType })
    .eq('id', eventId)
  if (error) throw new Error(`Package activation failed: ${error.message}`)
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

Beklenen: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add lib/payment/activate-package.ts
git commit -m "feat: add activatePackage lib function"
```

---

## Task 2: Create-Checkout API Route

Event ID ve paket tipi alır, Shopier URL'ini `platform_order_id` gömülü halde döndürür.

**Files:**
- Create: `app/api/payment/create-checkout/route.ts`

- [ ] **Step 1: Route'u oluştur**

```typescript
// app/api/payment/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  const packageType = searchParams.get('package')

  if (!eventId || (packageType !== 'standard' && packageType !== 'premium')) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // platform_order_id = "eventId:packageType" — webhook bu string'i parse eder
  const platformOrderId = `${eventId}:${packageType}`

  const baseUrl =
    packageType === 'standard'
      ? process.env.SHOPIER_URL_STANDARD
      : process.env.SHOPIER_URL_PREMIUM

  if (!baseUrl) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  // Shopier URL'ine buyer_id (user) ve platform_order_id ekle
  const checkoutUrl = `${baseUrl}&buyer_id=${encodeURIComponent(user.id)}&platform_order_id=${encodeURIComponent(platformOrderId)}`

  return NextResponse.json({ url: checkoutUrl })
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/payment/create-checkout/route.ts
git commit -m "feat: add create-checkout API route for Shopier"
```

---

## Task 3: Shopier Webhook Handler

HMAC-SHA256 imzayı doğrular, platform_order_id'den event ve paketi parse eder, aktivasyon çalıştırır.

**Files:**
- Create: `app/api/webhooks/shopier/route.ts`

- [ ] **Step 1: Route'u oluştur**

```typescript
// app/api/webhooks/shopier/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function verifySignature(
  apiKey: string,
  websiteUrl: string,
  paymentAmount: string,
  platformOrderId: string,
  receivedSignature: string,
  secret: string
): boolean {
  // Shopier imza: HMAC-SHA256(apiKey + websiteUrl + paymentAmount + platformOrderId, secret)
  const data = `${apiKey}${websiteUrl}${paymentAmount}${platformOrderId}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature))
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const status = formData.get('status') as string
  const platformOrderId = formData.get('platform_order_id') as string
  const paymentAmount = formData.get('payment_amount') as string
  const signature = formData.get('signature') as string

  const apiKey = process.env.SHOPIER_API_KEY!
  const secret = process.env.SHOPIER_WEBHOOK_SECRET!
  const websiteUrl = 'https://www.anikare.net'

  // İmza doğrulama
  const isValid = verifySignature(apiKey, websiteUrl, paymentAmount, platformOrderId, signature, secret)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Sadece başarılı ödemeleri işle
  if (status !== 'success') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // platform_order_id = "eventId:packageType"
  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
  }
  const [eventId, packageType] = parts

  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.json({ error: 'Unknown package type' }, { status: 400 })
  }

  await activatePackage(eventId, packageType)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/shopier/route.ts
git commit -m "feat: Shopier webhook handler with HMAC verification"
```

---

## Task 4: Ödeme Başarı Sayfası

**Files:**
- Create: `app/(marketing)/odeme-tamamlandi/page.tsx`

- [ ] **Step 1: Sayfayı oluştur**

```tsx
// app/(marketing)/odeme-tamamlandi/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Ödeme Tamamlandı — AnıKare',
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] mb-3">
          Ödeme Tamamlandı
        </h1>
        <p className="text-[#7a6a5a] leading-relaxed mb-2">
          Paketiniz birkaç saniye içinde aktive edilecek.
        </p>
        <p className="text-sm text-[#9ca3af] mb-8">
          Sayfanızı yeniledikten sonra paket sınırlarınız güncellenir.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#6D1A3E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#5a1533] transition-colors"
        >
          Dashboard&apos;a Dön
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add app/(marketing)/odeme-tamamlandi/page.tsx
git commit -m "feat: payment success page"
```

---

## Task 5: Wizard Akışını Güncelle

Ücretli paket seçildiyse event'i `eco` olarak oluştur, sonra checkout URL'e yönlendir.

**Files:**
- Modify: `components/event/wizard.tsx`

- [ ] **Step 1: `handleSubmit` fonksiyonunu güncelle**

`wizard.tsx`'te `handleSubmit` fonksiyonunu bul ve şununla değiştir:

```typescript
async function handleSubmit() {
  setLoading(true)
  setError(null)

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Oturum bulunamadı')

    const slug = generateSlug(state.title, state.eventType)
    const pinHash =
      state.pinEnabled && state.pinCode ? await hashPin(state.pinCode) : null

    const eventDate = state.eventDate ? new Date(state.eventDate) : new Date()
    const uploadBase = new Date(Math.max(eventDate.getTime(), Date.now()))
    const uploadExpiresAt = new Date(uploadBase.getTime() + 30 * 24 * 60 * 60 * 1000)
    const mediaRetentionUntil = new Date(uploadBase.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Event her zaman eco olarak oluşturulur — ödeme sonrası aktive edilir
    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        host_id: user.id,
        title: state.title,
        event_type: state.eventType,
        slug,
        event_date: state.eventDate || null,
        thank_you_message: state.thankYouMessage || null,
        pin_enabled: state.pinEnabled,
        pin_code_hash: pinHash,
        package_type: 'eco',
        template_id: state.templateId,
        guest_count_estimate: state.guestCountEstimate ? Number(state.guestCountEstimate) : null,
        upload_expires_at: uploadExpiresAt.toISOString(),
        media_retention_until: mediaRetentionUntil.toISOString(),
      })
      .select('id, slug')
      .single()

    if (insertError) throw new Error(insertError.message)

    // Ücretli paket seçildiyse checkout'a yönlendir
    if (state.packageType === 'standard' || state.packageType === 'premium') {
      const res = await fetch(
        `/api/payment/create-checkout?eventId=${data!.id}&package=${state.packageType}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Ödeme başlatılamadı')
      window.location.href = json.url
      return
    }

    router.push(`/etkinlik/${data!.slug}`)
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    setLoading(false)
  }
}
```

- [ ] **Step 2: Son adım buton metnini güncelle**

Wizard'da son adım butonu artık pakete göre farklı yazı göstermeli. `wizard.tsx`'te şu kısmı bul:

```tsx
{loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur ✨'}
```

Şununla değiştir:

```tsx
{loading
  ? 'İşleniyor...'
  : (state.packageType === 'eco' ? 'Etkinliği Oluştur ✨' : 'Etkinliği Oluştur & Ödemeye Geç →')
}
```

- [ ] **Step 3: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 4: Commit**

```bash
git add components/event/wizard.tsx
git commit -m "feat: wizard creates eco event, redirects to Shopier for paid packages"
```

---

## Task 6: Env Vars Dokümantasyonu

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: `.env.example`'a yeni değişkenleri ekle**

`.env.example` dosyasını aç ve şunu ekle (varolan değişkenlerin altına):

```bash
# Shopier Payment
SHOPIER_API_KEY=
SHOPIER_WEBHOOK_SECRET=
SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXX
SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=YYYY
```

- [ ] **Step 2: CLAUDE.md'yi güncelle**

`CLAUDE.md`'nin Environment Variables bölümüne şunları ekle:
```
SHOPIER_API_KEY
SHOPIER_WEBHOOK_SECRET
SHOPIER_URL_STANDARD
SHOPIER_URL_PREMIUM
```

Ayrıca "Completed Work" altına "Shopier payment integration" ekle.

- [ ] **Step 3: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "docs: add Shopier env vars to example and CLAUDE.md"
```

---

## Test Senaryosu (Canlıya Almadan Önce)

Shopier sandbox yoktur — canlı test gerekir. Küçük tutarlı test için (₺1'lik test ürünü):

1. Shopier'da geçici ₺1 test ürünü oluştur
2. Wizard'da standard seç → etkinliği oluştur → Shopier sayfasına yönlendirildin mi? ✓
3. Ödemeyi tamamla
4. Shopier webhook isteği attı mı? → Vercel'de Function Logs kontrol et
5. Event dashboard'unda paket badge'i `eco`'dan `standard`'a döndü mü? ✓
6. `/odeme-tamamlandi` sayfasını görüyor musun? ✓

**Webhook'u local test etmek için:**
```bash
# ngrok ile local'i dışarı aç
npx ngrok http 3000
# Shopier Webhook URL'ini geçici olarak ngrok URL'ine ayarla
# https://xxxx.ngrok.io/api/webhooks/shopier
```
