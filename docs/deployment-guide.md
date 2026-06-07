# AnıKare — Deployment Guide

Bu dosya, local geliştirmeden production'a kadar tüm adımları içerir.
**Mevcut production durumu:** Site `https://www.anikare.net` üzerinde canlı.

---

## Mevcut Production Yapısı

| Servis | URL / Detay |
|--------|-------------|
| Site | `https://www.anikare.net` |
| Media CDN | `https://media.anikare.net` (Cloudflare R2 custom domain) |
| Vercel fallback | `https://anikare.vercel.app` (hâlâ çalışır) |
| Supabase | Site URL: `https://www.anikare.net` |
| R2 CORS | `localhost:3000`, `anikare.vercel.app`, `www.anikare.net`, `anikare.net` |

---

## 1. Local Development

`.env.local` dosyanda aşağıdakiler dolu olmalı:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=anikare-media
R2_PUBLIC_URL=https://media.anikare.net
R2_PUBLIC_HOSTNAME=media.anikare.net
CRON_SECRET=herhangi-bir-string-olabilir-localde
```

> **Not:** Local'de `media.anikare.net` kullanıyorsan CORS sorun çıkmaz (sadece upload için `localhost:3000` yeterli). Presigned GET URL'ler R2'den doğrudan gelir.

```bash
npm run dev
```

### Local Test Kontrol Listesi

- [ ] `http://localhost:3000` — Landing page açılıyor mu?
- [ ] `http://localhost:3000/giris` — Google giriş butonu görünüyor mu?
- [ ] Google ile giriş → `/dashboard`'a yönleniyor mu?
- [ ] `/etkinlik/yeni` — Sihirbaz çalışıyor mu? (3 adım, canlı önizleme)
- [ ] Etkinlik oluştur → slug üretiliyor, `/etkinlik/[slug]` açılıyor mu?
- [ ] `/e/[slug]` — Misafir sayfası, PIN varsa PIN ekranı çıkıyor mu?
- [ ] Fotoğraf yükle → R2'ye gidiyor, dashboard'da görünüyor mu?
- [ ] Dashboard'dan fotoğraf gizle/sil çalışıyor mu? (optimistik — anında tepki vermeli)
- [ ] QR kodu canvas'ta render oluyor, PDF indiriliyor mu? (yeni sekmede açılmamalı)

---

## 2. Production Deploy

Kod push edince Vercel otomatik deploy alır:

```bash
git push origin main
# → Vercel ~1-2 dakikada production'ı günceller
```

Build durumu: **Vercel → Projen → Deployments**

### Environment Variable Değişikliği Sonrası

Vercel'den env var güncellersen otomatik deploy tetiklenmez. Manuel redeploy:
**Deployments → en üstteki → ⋯ → Redeploy**

---

## 3. Yeni Domain Eklenirse (Gelecek Referans)

### 3.1 — Vercel'e Domain Ekle

1. Vercel → Projen → **Settings → Domains → Add Existing**
2. Apex domain yaz (`anikare.co` gibi) → **Add**
3. Vercel "Auto configure" sunarsa tıkla — DNS kayıtlarını CF'de otomatik ayarlar
4. Yeşil "Valid Configuration" görününce tamamdır

### 3.2 — Supabase'i Güncelle

**Supabase → Authentication → URL Configuration:**
- **Site URL:** yeni domain
- **Redirect URLs:** `https://yeni-domain.com/auth/callback` ekle

### 3.3 — R2 CORS'u Güncelle

**Cloudflare → R2 → anikare-media → Settings → CORS Policy:**

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://anikare.vercel.app",
      "https://www.anikare.net",
      "https://anikare.net",
      "https://yeni-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 4. Cron Job Kontrolü

Vercel Hobby plan günde 1 cron çalıştırır, her gece 03:00 UTC.

**Vercel → Projen → Cron Jobs** → `/api/cron/cleanup` listelenmiş olmalı.

Manuel test:
```bash
curl -H "Authorization: Bearer CRON_SECRET_DEGERIN" \
  https://www.anikare.net/api/cron/cleanup
# Beklenen: {"deleted":0,"message":"No expired events"}
```

---

## 5. Vercel Analytics

Kod layout'a ekli (`<Analytics />`). Panel'de aktive et:
**Vercel → Projen → Analytics → Enable Analytics** (ücretsiz, Hobby plan dahil)

---

## 6. Geri Alma (Rollback)

**Vercel → Deployments → İstediğin eski deploy → ⋯ → Promote to Production**

---

## Hızlı Referans

| Bilgi | Nerede |
|-------|--------|
| Supabase URL + Keys | supabase.com → Settings → API |
| R2 Account ID | Cloudflare dashboard sağ sidebar |
| R2 API Token | Cloudflare → R2 → Manage API Tokens |
| R2 Custom Domain | Cloudflare → R2 → anikare-media → Settings → Custom Domains |
| Vercel Deployments | vercel.com → anikare → Deployments |
| Cron Secret | `.env.local` + Vercel env vars |
| CF Domain DNS | dash.cloudflare.com → anikare.net → DNS |
