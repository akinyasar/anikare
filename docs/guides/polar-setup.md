# Polar.sh Kurulum Rehberi

## Para Akışı — Genel Bakış

```
Kullanıcı (TR kart) → Polar checkout → Polar bakiyesi (USD) → 7 gün bekleme → Sen çekersin → TR IBAN (TRY)
```

- Türk Visa ve Mastercard kartları kabul edilir (Stripe altyapısı)
- Para Polar'da USD olarak birikir
- "Çek" butonuna bastığında Stripe, TR IBAN'ına transfer yapar
- Banka USD'yi otomatik TRY'ye çevirir
- Satıştan ~2 hafta sonra hesabında olur (7 gün settlement + 4-7 gün transfer)
- **Aylık fee:** $2 (Stripe payout ücreti, sabit)
- **İşlem fee:** Polar %5 + $0.50, Stripe payout %1 cross-border

---

## Adım 1 — Hesap Aç

1. **https://polar.sh** adresine git
2. Sağ üstteki **"Sign Up"** butonuna bas
3. GitHub hesabınla giriş yap (en kolay yol)
4. İsim ve organizasyon bilgilerini doldur
   - Organization name: `anikare` (veya istediğin)
   - Slug: `anikare` (URL'de görünür)
5. Hesap oluştu

---

## Adım 2 — Ödeme Alabilmek İçin Doğrulama (Stripe Connect)

Bu adım olmadan ürün satamazsın.

1. Sol menüden **Finance** → **Payouts** tıkla
2. **"Connect bank account"** veya **"Setup payouts"** butonuna bas
3. Stripe'ın sayfasına yönlendirilirsin
4. Buraya gir:
   - **Country:** Turkey
   - **Account type:** Individual (şirket yok)
   - **IBAN:** TR hesap numaranı gir
   - TC kimlik numarası ve kişisel bilgiler isteyecek
5. Tamamla → Polar'a geri dön

> ⚠️ Stripe kimlik doğrulaması için pasaport veya kimlik fotoğrafı isteyebilir.
> Bu normal — yasal zorunluluk.

---

## Adım 3 — Ürünler Oluştur

Sol menüden **Products** → **"New product"** butonuna bas.

### Standard Paket

| Alan | Değer |
|------|-------|
| Name | AnıKare Standard |
| Description | Sınırsız fotoğraf, 20 video, 1080p kalite |
| Type | **One-time purchase** (abonelik değil) |
| Price | **$27.00** |
| Currency | USD |

**Save** bas.

Ürün kaydedilince **Product ID** göreceksin (şöyle bir şey: `prod_abc123xyz`).
Bunu bir yere not et.

### Premium Paket

Aynı adımları tekrar yap:

| Alan | Değer |
|------|-------|
| Name | AnıKare Premium |
| Description | Sınırsız fotoğraf, sınırsız video, canlı slayt gösterisi |
| Type | **One-time purchase** |
| Price | **$39.00** |
| Currency | USD |

**Save** bas, Product ID'yi not et.

---

## Adım 4 — API Anahtarı Al 

1. Sol menü altında **Settings** → **API** tıkla
2. **"New token"** butonuna bas
3. Token adı: `anikare-production`
4. **Oluştur** → Çıkan token'ı **hemen kopyala** (bir daha göremezsin)
5. Bu token Vercel'e `POLAR_ACCESS_TOKEN` olarak eklenecek

---

## Adım 5 — Webhook Kur

1. Sol menüden **Settings** → **Webhooks** tıkla
2. **"Add endpoint"** butonuna bas
3. Şunları doldur:

| Alan | Değer |
|------|-------|
| URL | `https://www.anikare.net/api/webhooks/polar` |
| Events | **order.paid** seç (sadece bunu) |

4. **Save** bas
5. Oluşan webhook'un yanındaki **"..."** → **"Reveal secret"** tıkla
6. Bu secret'ı kopyala — `POLAR_WEBHOOK_SECRET` olarak Vercel'e eklenecek

---

## Adım 6 — Vercel'e Environment Variables Ekle

Vercel dashboard → anikare projesi → **Settings → Environment Variables**

Şunları ekle:

```
POLAR_ACCESS_TOKEN    = (Adım 4'teki token)
POLAR_PRODUCT_STANDARD = (Standard ürünün Product ID'si)
POLAR_PRODUCT_PREMIUM  = (Premium ürünün Product ID'si)
POLAR_WEBHOOK_SECRET   = (Adım 5'teki webhook secret)
```

Ekledikten sonra: **Deployments → en üstteki → ⋯ → Redeploy** (env değişiklikleri otomatik uygulanmaz)

---

## Adım 7 — Test (Benden Kod Geldikten Sonra)

Polar'ın test modu var:
1. Settings → **"Switch to sandbox"**
2. Orada da aynı ürünleri oluştur (test için)
3. Test kartı: `4242 4242 4242 4242` (Stripe test kartı)
4. Production'a geçince **"Switch to production"**

---

## Bana Lazım Olan Bilgiler (Kurulum Bitince)

Şunları bana gönder:
- Standard Product ID
- Premium Product ID
- (Token ve webhook secret'ı Vercel'e kendin ekle — bana gönderme)

Bu bilgilerle ben:
1. Tüm Shopier kodunu kaldırırım
2. Polar entegrasyonunu yazarım
3. Fiyat bildirim mesajını (USD açıklaması) UI'ya eklerim
