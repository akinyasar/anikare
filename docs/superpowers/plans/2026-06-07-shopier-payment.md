# Shopier Ödeme Entegrasyonu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standard/Premium paket seçilince Shopier'a yönlendir, ödeme callback'i ile `package_type`'ı güncelle; paket limitlerini (Standart→1080p/₺899, Premium→₺1.299) güncelle.

**Architecture:** Event her zaman `eco` oluşturulur. Wizard ücretli paket seçildiyse `/api/payment/create-checkout`'u çağırır, Shopier URL'ine `platform_order_id=eventId:packageType` ekleyerek kullanıcıyı yönlendirir. Ödeme sonrası Shopier, kullanıcı tarayıcısını `/api/payment/callback`'e yönlendirir; bu route `platform_order_id`'yi parse edip paketi aktive eder, başarı/hata sayfasına redirect atar.

**Tech Stack:** Next.js App Router API routes, Supabase service_role, Node.js `crypto` — sıfır yeni npm paketi.

---

## BÖLÜM 1 — MANUEL KURULUM (Kod yazmadan önce tamamlanacak)

Bu adımlar **siz** tarafından Shopier ve Vercel'de yapılacak.

### A. Shopier Hesabı

1. [shopier.com](https://shopier.com) → **Üye Ol** → **Bireysel Satıcı**
2. Ad/soyad, e-posta, şifre, TCKN, telefon → kaydet
3. E-postaya gelen doğrulama linkine tıkla
4. Giriş yap → sol menü → **Hesap Ayarları → Banka Bilgileri** → IBAN gir → kaydet

### B. İki Ürün Oluştur

Sol menü → **Ürünlerim → Yeni Ürün Ekle**

**Ürün 1 — Standart:**

| Alan | Değer |
|------|-------|
| Ürün Adı | `AnıKare Standart` |
| Fiyat | `899` |
| Para Birimi | TRY |
| Ürün Tipi | Dijital Ürün |
| Stok | Sınırsız |

Kaydet → ürün sayfasında URL'i gör: `https://www.shopier.com/anikare/XXXXXXXX`  
Buradaki `XXXXXXXX` = ürün ID'si — not al.

**Ürün 2 — Premium:**

| Alan | Değer |
|------|-------|
| Ürün Adı | `AnıKare Premium` |
| Fiyat | `1299` |
| Para Birimi | TRY |
| Ürün Tipi | Dijital Ürün |
| Stok | Sınırsız |

Kaydet → ürün ID'sini not al.

### C. Her İki Ürüne Callback URL Ekle

Her ürün için:
1. Ürüne tıkla → **Düzenle**
2. **"Başarı Sonrası URL"** veya **"Geri Dönüş URL"** alanını bul
3. Şunu gir:
   ```
   https://www.anikare.net/api/payment/callback
   ```
4. Kaydet

> Shopier ödeme sonrası kullanıcının tarayıcısını bu URL'e yönlendirecek ve `platform_order_id`, `status`, `payment_amount`, `buyer_id` gibi parametreleri GET parametresi olarak ekleyecek.

### D. API Key ve Secret'ı Al

Sol menü → **Entegrasyonlar** veya **API**:
- **API Anahtarı** → kopyala
- **Webhook/Gizli Anahtar** → kopyala

> Eğer bu menü yoksa Shopier'a `destek@shopier.com` üzerinden yazarak API erişimi iste. Kod aşaması için şimdilik placeholder bırak.

### E. Vercel'e Env Var Ekle

[vercel.com](https://vercel.com) → `anikare` → **Settings → Environment Variables** → aşağıdaki 4'ü ekle:

| Name | Value |
|------|-------|
| `SHOPIER_API_KEY` | D adımındaki API anahtarı |
| `SHOPIER_WEBHOOK_SECRET` | D adımındaki secret (yoksa boş bırak, sonra ekle) |
| `SHOPIER_URL_STANDARD` | `https://www.shopier.com/ShowProduct/api_pdp.php?pid=STANDART_URUN_ID` |
| `SHOPIER_URL_PREMIUM` | `https://www.shopier.com/ShowProduct/api_pdp.php?pid=PREMIUM_URUN_ID` |

> `STANDART_URUN_ID` ve `PREMIUM_URUN_ID` = B adımında not aldığın sayısal ID'ler.

Ekledikten sonra: **Deployments → en üstteki → ⋯ → Redeploy**

### F. `.env.local`'e Ekle

Proje kökündeki `.env.local`'in sonuna ekle:

```bash
SHOPIER_API_KEY=buraya_api_key
SHOPIER_WEBHOOK_SECRET=buraya_secret
SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXXXX
SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=YYYYYY
```

### Kontrol Listesi (Manuel adımlar tamam mı?)

- [ ] Shopier hesabı açıldı ve e-posta doğrulandı
- [ ] IBAN eklendi
- [ ] "AnıKare Standart" ₺899 oluşturuldu, ID not alındı
- [ ] "AnıKare Premium" ₺1.299 oluşturuldu, ID not alındı
- [ ] Her iki ürüne callback URL eklendi: `https://www.anikare.net/api/payment/callback`
- [ ] 4 env var Vercel'e eklendi
- [ ] Vercel redeploy yapıldı
- [ ] `.env.local`'e eklendi

---

## BÖLÜM 2 — KOD DEĞİŞİKLİKLERİ

### File Map

| Durum | Dosya | Değişiklik |
|-------|-------|------------|
| Değişecek | `lib/packages.ts` | Standard compressionTarget 2160→1080 |
| Değişecek | `lib/i18n/site.ts` | Fiyat ve özellik stringleri (TR/EN/DE) |
| Değişecek | `components/event/steps/step-package.tsx` | Fiyat ve özellik metinleri |
| Yeni | `lib/payment/activate-package.ts` | DB'de package_type yükseltme fonksiyonu |
| Yeni | `app/api/payment/create-checkout/route.ts` | Shopier URL oluştur ve döndür |
| Yeni | `app/api/payment/callback/route.ts` | Shopier callback → paketi aktive et |
| Yeni | `app/(marketing)/odeme-tamamlandi/page.tsx` | Başarı sayfası |
| Yeni | `app/(marketing)/odeme-basarisiz/page.tsx` | Hata sayfası |
| Değişecek | `components/event/wizard.tsx` | Eco oluştur, ücretliyse Shopier'a yönlendir |
| Değişecek | `.env.example` | Yeni env var dokümantasyonu |
| Değişecek | `CLAUDE.md` | Tamamlanan iş kaydı |

---

### Task 1: Paket Limitlerini Güncelle

**Files:**
- Modify: `lib/packages.ts`

- [ ] **Step 1: Standard compressionTarget'ı güncelle**

`lib/packages.ts`'te şu satırı bul:
```typescript
  standard: {
    maxPhotos: Infinity,
    maxVideos: 20,
    compressionTarget: 2160,
```
Şununla değiştir:
```typescript
  standard: {
    maxPhotos: Infinity,
    maxVideos: 20,
    compressionTarget: 1080,
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```
Beklenen: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add lib/packages.ts
git commit -m "feat: standard package compression 1080p"
```

---

### Task 2: Fiyat ve Özellik Stringlerini Güncelle (i18n)

**Files:**
- Modify: `lib/i18n/site.ts`

Üç dil bloğunda (tr / en / de) aşağıdaki alanlar değişecek.

- [ ] **Step 1: Türkçe — TR bloğunu güncelle**

`lib/i18n/site.ts`'te TR bloğunda şunları bul ve değiştir:

```typescript
    plan2Price: '₺1.000',
```
→
```typescript
    plan2Price: '₺899',
```

```typescript
    plan2F3: '4K kalite',
```
→
```typescript
    plan2F3: '1080p kalite',
```

```typescript
    plan3Price: '₺1.399',
```
→
```typescript
    plan3Price: '₺1.299',
```

- [ ] **Step 2: İngilizce — EN bloğunu güncelle**

```typescript
    plan2Price: '₺1,000',
```
→
```typescript
    plan2Price: '₺899',
```

```typescript
    plan2F3: '4K quality',
```
→
```typescript
    plan2F3: '1080p quality',
```

```typescript
    plan3Price: '₺1,399',
```
→
```typescript
    plan3Price: '₺1,299',
```

- [ ] **Step 3: Almanca — DE bloğunu güncelle**

```typescript
    plan2Price: '₺1.000',
```
→
```typescript
    plan2Price: '₺899',
```

```typescript
    plan2F3: '4K-Qualität',
```
→
```typescript
    plan2F3: '1080p-Qualität',
```

```typescript
    plan3Price: '₺1.399',
```
→
```typescript
    plan3Price: '₺1.299',
```

- [ ] **Step 4: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/site.ts
git commit -m "feat: update package prices standard 899 premium 1299"
```

---

### Task 3: Wizard Paket Adımı Fiyat/Özellik Güncelle

**Files:**
- Modify: `components/event/steps/step-package.tsx`

- [ ] **Step 1: PACKAGES dizisini güncelle**

`step-package.tsx`'te `const PACKAGES` dizisini tamamen şununla değiştir:

```typescript
const PACKAGES = [
  {
    value: 'eco' as PackageType,
    name: 'Ücretsiz',
    price: 'Ücretsiz',
    features: ['10 fotoğraf', '2 video', 'Temel QR kart', 'Akışı keşfet'],
  },
  {
    value: 'standard' as PackageType,
    name: 'Standart',
    price: '₺899',
    popular: true,
    features: ['Sınırsız fotoğraf', '20 video', '1080p kalite', '3 masa kartı şablonu (PDF)'],
  },
  {
    value: 'premium' as PackageType,
    name: 'Premium',
    price: '₺1.299',
    features: [
      'Sınırsız fotoğraf & video',
      'Orijinal kalite',
      '3 masa kartı şablonu (PDF)',
      'Canlı slayt gösterisi',
    ],
  },
]
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add components/event/steps/step-package.tsx
git commit -m "feat: update wizard package step prices and features"
```

---

### Task 4: Package Aktivasyon Lib

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
    .update({ package_type: packageType as PackageType })
    .eq('id', eventId)
  if (error) throw new Error(`Package activation failed: ${error.message}`)
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add lib/payment/activate-package.ts
git commit -m "feat: add activatePackage lib"
```

---

### Task 5: Create-Checkout API Route

Shopier ürün URL'ini `platform_order_id` gömülü döndürür.

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

  // platform_order_id: "eventId:packageType" — callback bu string'i parse eder
  const platformOrderId = `${eventId}:${packageType}`
  const checkoutUrl =
    `${baseUrl}` +
    `&buyer_id=${encodeURIComponent(user.id)}` +
    `&platform_order_id=${encodeURIComponent(platformOrderId)}`

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
git commit -m "feat: create-checkout API route"
```

---

### Task 6: Shopier Callback Handler

Ödeme tamamlanınca Shopier kullanıcıyı bu route'a yönlendirir. `platform_order_id` parse edilir, paket aktive edilir, kullanıcı başarı/hata sayfasına redirect edilir.

**Files:**
- Create: `app/api/payment/callback/route.ts`

> **Not:** Bu route, Shopier'ın kullanıcı tarayıcısını yönlendirdiği bir GET endpoint'idir (sunucu-sunucu değil, tarayıcı üzerinden gelir). Shopier'ın callback'te gönderdiği parametreler: `platform_order_id`, `status` (`1` = başarılı, `0` = başarısız), `payment_id`, `buyer_id`, `payment_amount`. Eğer `status` değeri `1` veya `success` olarak geliyorsa her ikisini de kabul ediyoruz.

- [ ] **Step 1: Route'u oluştur**

```typescript
// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { activatePackage } from '@/lib/payment/activate-package'

const SUCCESS_URL = 'https://www.anikare.net/odeme-tamamlandi'
const FAILURE_URL = 'https://www.anikare.net/odeme-basarisiz'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const status = searchParams.get('status') // Shopier: '1' veya 'success'
  const platformOrderId = searchParams.get('platform_order_id') ?? ''

  // Başarısız ödeme veya eksik parametre
  const isSuccess = status === '1' || status === 'success'
  if (!isSuccess || !platformOrderId) {
    return NextResponse.redirect(FAILURE_URL)
  }

  // platform_order_id = "eventId:packageType"
  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    return NextResponse.redirect(FAILURE_URL)
  }

  const [eventId, packageType] = parts
  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.redirect(FAILURE_URL)
  }

  try {
    await activatePackage(eventId, packageType)
  } catch {
    return NextResponse.redirect(FAILURE_URL)
  }

  return NextResponse.redirect(SUCCESS_URL)
}
```

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/payment/callback/route.ts
git commit -m "feat: Shopier payment callback handler"
```

---

### Task 7: Ödeme Başarı Sayfası

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
          Paketiniz aktive edildi.
        </p>
        <p className="text-sm text-[#9ca3af] mb-8">
          Etkinlik sayfanızı yeniledikten sonra yeni paket sınırları geçerli olur.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#6D1A3E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#5a1533] transition-colors"
        >
          Etkinliklerime Git →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(marketing)/odeme-tamamlandi/page.tsx
git commit -m "feat: payment success page"
```

---

### Task 8: Ödeme Hata Sayfası

**Files:**
- Create: `app/(marketing)/odeme-basarisiz/page.tsx`

- [ ] **Step 1: Sayfayı oluştur**

```tsx
// app/(marketing)/odeme-basarisiz/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Ödeme Başarısız — AnıKare',
}

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1a1a1a] mb-3">
          Ödeme Alınamadı
        </h1>
        <p className="text-[#7a6a5a] leading-relaxed mb-2">
          İşleminiz tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
        </p>
        <p className="text-sm text-[#9ca3af] mb-8">
          Etkinliğiniz oluşturuldu, ücretsiz pakette devam ediyor.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-[#6D1A3E]/25 text-[#6D1A3E] font-semibold px-6 py-3.5 rounded-full hover:bg-[#f5e6ed] transition-colors"
          >
            Dashboard&apos;a Dön
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#6D1A3E] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#5a1533] transition-colors"
          >
            Tekrar Dene
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(marketing)/odeme-basarisiz/page.tsx
git commit -m "feat: payment failure page"
```

---

### Task 9: Wizard Akışını Güncelle

**Files:**
- Modify: `components/event/wizard.tsx`

- [ ] **Step 1: `handleSubmit` fonksiyonunu değiştir**

`wizard.tsx`'te mevcut `handleSubmit` async fonksiyonunu tamamen şununla değiştir:

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

    // Event her zaman eco olarak oluşturulur — ödeme onaylandıktan sonra aktive edilir
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

`wizard.tsx`'te şunu bul:
```tsx
{loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur ✨'}
```
Şununla değiştir:
```tsx
{loading
  ? 'İşleniyor...'
  : state.packageType === 'eco'
    ? 'Etkinliği Oluştur ✨'
    : 'Etkinliği Oluştur & Ödemeye Geç →'}
```

- [ ] **Step 3: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 4: Commit**

```bash
git add components/event/wizard.tsx
git commit -m "feat: wizard creates eco event then redirects to Shopier for paid packages"
```

---

### Task 10: Env Vars ve Dokümantasyon

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: `.env.example`'a ekle**

`.env.example`'ın sonuna ekle:
```bash
# Shopier Payment
SHOPIER_API_KEY=
SHOPIER_WEBHOOK_SECRET=
SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXX
SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=YYYY
```

- [ ] **Step 2: CLAUDE.md Environment Variables bölümüne ekle**

```
SHOPIER_API_KEY
SHOPIER_WEBHOOK_SECRET
SHOPIER_URL_STANDARD
SHOPIER_URL_PREMIUM
```

CLAUDE.md "Completed Work" bölümüne ekle:
```
- **Shopier payment integration** — callback-based, eco→standard/premium upgrade on payment
- **Package rebalance** — Standard 1080p/₺899, Premium ₺1.299
```

- [ ] **Step 3: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "docs: Shopier env vars and CLAUDE.md update"
```

---

## Test Senaryosu

Kodu deploy ettikten sonra:

1. Dashboard → **Yeni Etkinlik** → **Standart** seç → **"Etkinliği Oluştur & Ödemeye Geç →"** butonunu gör ✓
2. Butona bas → Shopier ürün sayfasına yönlendirildin mi? ✓
3. Ödemeyi tamamla → `/odeme-tamamlandi` sayfasına döndün mü? ✓
4. Dashboard'da etkinliğin paketi `eco` → `standard` oldu mu? ✓
5. Ödemede **İptal Et** → `/odeme-basarisiz` sayfasını gördün mü? ✓

**Callback parametrelerini kontrol etmek için:**
Shopier ödeme yaptıktan sonra Vercel Function Logs'ta `/api/payment/callback` isteğinin URL parametrelerine bak. Eğer `status` değeri `1` veya `success` yerine başka bir şeyse, `isSuccess` kontrolünü buna göre güncelle.
