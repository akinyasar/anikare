# Shopier Ödeme Entegrasyonu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standard/Premium paket seçilince Shopier'a yönlendir; Shopier OSB (Otomatik Sipariş Bildirimi) ile ödeme onayı gelince `package_type`'ı güncelle. Paket limitlerini güncelle (Standart→1080p/₺899, Premium→₺1.299).

**Architecture:** Event her zaman `eco` oluşturulur. Wizard ücretli paket seçildiyse `/api/payment/create-checkout`'u çağırır, Shopier ürün URL'ine `platform_order_id=eventId:packageType` ekleyerek yönlendirir. Ödeme sonrası Shopier sunucusu `/api/webhooks/shopier`'e OSB POST'u atar; handler imzayı doğrular, `platform_order_id`'yi parse eder, paketi aktive eder.

**Tech Stack:** Next.js App Router API routes, Supabase service_role, Node.js `crypto` — sıfır yeni npm paketi.

---

## BÖLÜM 1 — MANUEL KURULUM (Koddan önce tamamla)

### A. Shopier Ürün Linklerini Doğru Formata Çevir

Shopier dashboard → Ürünlerim → her ürünün sayfasındaki URL'den ID'yi al.

Örnek: `https://www.shopier.com/anikare/47857590` → ID = `47857590`

Shopier'ın OSB sistemi `api_pdp.php` formatını destekler:
```
https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXXXXXX
```

Her iki ürün için bu URL'i oluştur ve not al:
```
Standart: https://www.shopier.com/ShowProduct/api_pdp.php?pid=STANDART_ID
Premium:  https://www.shopier.com/ShowProduct/api_pdp.php?pid=PREMIUM_ID
```

### B. OSB Bildirim URL'ini Gir

Shopier Dashboard → **Entegrasyonlar → Otomatik Sipariş Bildirimi**

Ekranın sağ tarafında şunlar var:
- **OSB KULLANICI ADI** — uzun hex string (not al, env var olacak)
- **OSB ŞİFRESİ** — uzun hex string (not al, env var olacak)
- **BİLDİRİM URL** bölümü — PROTOKOL dropdown + URL kutusu

Yapılacaklar:
1. **PROTOKOL** dropdown'ından **https** seç
2. **BİLDİRİM URL** kutusuna şunu gir (sadece domain ve path, `https://` olmadan):
   ```
   www.anikare.net/api/webhooks/shopier
   ```
3. **KAYDET** butonuna bas

### C. OSB'yi Test Et

Üstteki **BİLDİRİM TESTİ** sekmesine geç → **Test Gönder** butonuna bas.

> Kodu yazmadan önce test etmek anlamsız — önce kodu deploy et, sonra test sekmesine dön.

### D. OSB'yi Aktifleştir

**AKTİFLEŞTİRME** sekmesine geç → aktifleştir.

> Kodu deploy ettikten sonra yap.

### E. Vercel'e Env Var Ekle

[vercel.com](https://vercel.com) → `anikare` → **Settings → Environment Variables**

Aşağıdaki 4 değişkeni ekle:

| Name | Value |
|------|-------|
| `SHOPIER_OSB_USERNAME` | OSB KULLANICI ADI (B adımındaki hex string) |
| `SHOPIER_OSB_SECRET` | OSB ŞİFRESİ (B adımındaki hex string) |
| `SHOPIER_URL_STANDARD` | `https://www.shopier.com/ShowProduct/api_pdp.php?pid=STANDART_ID` |
| `SHOPIER_URL_PREMIUM` | `https://www.shopier.com/ShowProduct/api_pdp.php?pid=PREMIUM_ID` |

Ekledikten sonra: **Deployments → en üstteki → ⋯ → Redeploy**

### F. `.env.local`'e Ekle

Proje kökündeki `.env.local`'in sonuna:

```bash
# Shopier OSB
SHOPIER_OSB_USERNAME=e72f38ee70e176af8230e5a617dc8e5e
SHOPIER_OSB_SECRET=fe4030ca08903f71cb561d8cd48d2256
SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=STANDART_ID
SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=PREMIUM_ID
```

### Manuel Adım Kontrol Listesi

- [ ] Her iki ürünün `api_pdp.php?pid=X` URL'i oluşturuldu ve not alındı
- [ ] OSB ekranında PROTOKOL=https, URL girildi, Kaydet'e basıldı
- [ ] OSB KULLANICI ADI ve OSB ŞİFRESİ not alındı
- [ ] 4 env var Vercel'e eklendi + Redeploy yapıldı
- [ ] `.env.local`'e eklendi
- [ ] (Deploy sonrası) OSB Bildirim Testi yapıldı
- [ ] (Test başarılıysa) OSB Aktifleştirildi

---

## BÖLÜM 2 — KOD DEĞİŞİKLİKLERİ

### File Map

| Durum | Dosya | Değişiklik |
|-------|-------|------------|
| Değişecek | `lib/packages.ts` | Standard compressionTarget 2160→1080 |
| Değişecek | `lib/i18n/site.ts` | Fiyat ve özellik stringleri (TR/EN/DE) |
| Değişecek | `components/event/steps/step-package.tsx` | Fiyat ve özellik metinleri |
| Yeni | `lib/payment/activate-package.ts` | DB'de package_type yükseltme |
| Yeni | `app/api/payment/create-checkout/route.ts` | Shopier URL oluştur ve döndür |
| Yeni | `app/api/webhooks/shopier/route.ts` | OSB doğrula → paketi aktive et |
| Yeni | `app/(marketing)/odeme-tamamlandi/page.tsx` | Ödeme sonrası bilgi sayfası |
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
    compressionTarget: 2160,
```
Şununla değiştir:
```typescript
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

### Task 2: i18n Fiyat ve Özellik Stringlerini Güncelle

**Files:**
- Modify: `lib/i18n/site.ts`

Üç dil bloğunda (tr / en / de) aşağıdaki satırlar değişecek.

- [ ] **Step 1: TR bloğu**

Şunu bul → değiştir:
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

- [ ] **Step 2: EN bloğu**

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

- [ ] **Step 3: DE bloğu**

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

### Task 3: Wizard Paket Adımı Güncelle

**Files:**
- Modify: `components/event/steps/step-package.tsx`

- [ ] **Step 1: `const PACKAGES` dizisini tamamen değiştir**

`step-package.tsx`'te `const PACKAGES = [` ile başlayan ve kapanan `]` arasındaki her şeyi şununla değiştir:

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
git commit -m "feat: update wizard package prices and features"
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

  // platform_order_id = "eventId:packageType" — OSB handler bunu parse eder
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

### Task 6: Shopier OSB Webhook Handler

Shopier ödeme sonrası bu endpoint'e form-encoded POST atar. İmzayı doğrularız, `platform_order_id`'yi parse ederiz, paketi aktive ederiz.

**OSB İmza Doğrulama:**
```
data     = OSB_KULLANICI_ADI + website_url + total_order_value + platform_order_id
signature = base64( HMAC-SHA256(data, OSB_SIFRESI) )
```
`website_url` = Shopier'ın satıcı hesabında kayıtlı site URL'i (büyük ihtimalle `www.anikare.net`).

**Files:**
- Create: `app/api/webhooks/shopier/route.ts`

- [ ] **Step 1: Route'u oluştur**

```typescript
// app/api/webhooks/shopier/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { activatePackage } from '@/lib/payment/activate-package'

function verifySignature(
  osbUsername: string,
  websiteUrl: string,
  totalOrderValue: string,
  platformOrderId: string,
  receivedSignature: string,
  osbSecret: string
): boolean {
  const data = `${osbUsername}${websiteUrl}${totalOrderValue}${platformOrderId}`
  const expected = crypto
    .createHmac('sha256', osbSecret)
    .update(data)
    .digest('base64')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(receivedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = new URLSearchParams(text)

  const platformOrderId = params.get('platform_order_id') ?? ''
  const totalOrderValue  = params.get('total_order_value') ?? ''
  const signature        = params.get('signature') ?? ''
  const apiKey           = params.get('API_key') ?? ''

  const osbUsername = process.env.SHOPIER_OSB_USERNAME!
  const osbSecret   = process.env.SHOPIER_OSB_SECRET!

  // API_key eşleşmeli
  if (apiKey !== osbUsername) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  // İmza doğrulama — website_url Shopier'ın hesabınızdaki kayıtlı URL'dir
  const websiteUrl = 'www.anikare.net'
  const isValid = verifySignature(
    osbUsername,
    websiteUrl,
    totalOrderValue,
    platformOrderId,
    signature,
    osbSecret
  )

  if (!isValid) {
    // İmza başarısız → website_url formatı farklı olabilir, logla ve devam et
    // İlk test aşamasında bu bloğu geçici kaldırabilirsiniz (aşağıdaki notu oku)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // platform_order_id = "eventId:packageType"
  const parts = platformOrderId.split(':')
  if (parts.length !== 2) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  const [eventId, packageType] = parts
  if (packageType !== 'standard' && packageType !== 'premium') {
    return NextResponse.json({ error: 'Unknown package' }, { status: 400 })
  }

  await activatePackage(eventId, packageType)
  return NextResponse.json({ ok: true })
}
```

> **İmza Testi Notu:** OSB Bildirim Testi sekmesindeki test isteği gerçek bir ödeme değil — `platform_order_id` ve `total_order_value` rastgele değerler içerir, imza doğrulaması başarısız olabilir. Test sırasında Vercel Function Logs'tan gelen parametreleri kontrol et. Eğer `website_url` olarak `www.anikare.net` yerine başka bir değer geliyorsa (ör. `https://www.anikare.net`), `websiteUrl` sabitini güncelle.

- [ ] **Step 2: Build kontrol**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/shopier/route.ts
git commit -m "feat: Shopier OSB webhook handler"
```

---

### Task 7: Ödeme Bilgi Sayfası

Kullanıcı Shopier'da ödeme tamamlayınca Shopier kendi başarı sayfasını gösterir. Kullanıcı oradan dashboard'a döner — paketi aktive edilmiş görür. Bu sayfa isteğe bağlı bilgi sayfasıdır; wizard'da "ödeme sonrası buraya dön" linki olarak kullanılır.

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
          Etkinlik sayfanızı yeniledikten sonra yeni paket limitleri geçerli olur.
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

- [ ] **Step 2: Build kontrol + commit**

```bash
npm run build 2>&1 | grep -E "(error TS|✓ Compiled)"
git add app/(marketing)/odeme-tamamlandi/page.tsx
git commit -m "feat: payment success info page"
```

---

### Task 8: Wizard Akışını Güncelle

**Files:**
- Modify: `components/event/wizard.tsx`

- [ ] **Step 1: `handleSubmit` fonksiyonunu değiştir**

`wizard.tsx`'te mevcut `async function handleSubmit()` bloğunu bul ve içini tamamen şununla değiştir:

```typescript
async function handleSubmit() {
  setLoading(true)
  setError(null)

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Oturum bulunamadı')

    const slug = generateSlug(state.title, state.eventType)
    const pinHash =
      state.pinEnabled && state.pinCode ? await hashPin(state.pinCode) : null

    const eventDate = state.eventDate ? new Date(state.eventDate) : new Date()
    const uploadBase = new Date(Math.max(eventDate.getTime(), Date.now()))
    const uploadExpiresAt = new Date(uploadBase.getTime() + 30 * 24 * 60 * 60 * 1000)
    const mediaRetentionUntil = new Date(uploadBase.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Event her zaman eco oluşturulur — OSB onayından sonra aktive edilir
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
        guest_count_estimate: state.guestCountEstimate
          ? Number(state.guestCountEstimate)
          : null,
        upload_expires_at: uploadExpiresAt.toISOString(),
        media_retention_until: mediaRetentionUntil.toISOString(),
      })
      .select('id, slug')
      .single()

    if (insertError) throw new Error(insertError.message)

    // Ücretli paket seçildiyse Shopier'a yönlendir
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

Şunu bul:
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
git commit -m "feat: wizard eco event + Shopier redirect for paid packages"
```

---

### Task 9: Env Vars ve Dokümantasyon

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: `.env.example`'ın sonuna ekle**

```bash
# Shopier OSB (Otomatik Sipariş Bildirimi)
# Dashboard > Entegrasyonlar > OSB ekranından alınır
SHOPIER_OSB_USERNAME=
SHOPIER_OSB_SECRET=
SHOPIER_URL_STANDARD=https://www.shopier.com/ShowProduct/api_pdp.php?pid=XXXX
SHOPIER_URL_PREMIUM=https://www.shopier.com/ShowProduct/api_pdp.php?pid=YYYY
```

- [ ] **Step 2: CLAUDE.md Environment Variables bölümüne ekle**

```
SHOPIER_OSB_USERNAME
SHOPIER_OSB_SECRET
SHOPIER_URL_STANDARD
SHOPIER_URL_PREMIUM
```

CLAUDE.md "Completed Work" altına ekle:
```
- **Shopier OSB payment integration** — eco→standard/premium upgrade on OSB notification
- **Package rebalance** — Standard 1080p/₺899, Premium ₺1.299
```

- [ ] **Step 3: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "docs: Shopier env vars and CLAUDE.md update"
```

---

## BÖLÜM 3 — DEPLOY VE TEST

### Sırayla Yapılacaklar

1. Tüm tasklar tamamlandıktan sonra `git push` ile Vercel'e deploy et
2. Deploy tamamlanınca Shopier → OSB → **Bildirim Testi** sekmesi → test gönder
3. **Vercel → Functions → Logs** aç, `/api/webhooks/shopier` isteğini gör
4. Logda gelen `website_url` parametresini kontrol et. Eğer `www.anikare.net` yerine farklı bir şey varsa (ör. `https://www.anikare.net`) → `app/api/webhooks/shopier/route.ts` içindeki `websiteUrl` sabitini güncelle → yeniden deploy
5. Test başarılıysa OSB → **Aktifleştirme** sekmesi → aktifleştir

### Gerçek Ödeme Testi

1. Dashboard → Yeni Etkinlik → **Standart** seç → **"Etkinliği Oluştur & Ödemeye Geç →"** butonunu gör ✓
2. Butona bas → Shopier ürün sayfasına yönlendirildin mi? ✓
3. Ödemeyi tamamla → Shopier başarı sayfasını göster
4. Dashboard'a dön → etkinliğin paketi `eco`→`standard` oldu mu? ✓ (birkaç saniye sürebilir)
