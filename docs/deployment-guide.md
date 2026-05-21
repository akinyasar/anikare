# AnıKare — Deployment Guide

Bu dosya, projeyi local'de test etmekten production'a almaya kadar tüm adımları içerir.
**Domain değişikliği de dahil** — hiçbir adım kaybolmaz.

---

## 1. Local Test (Başlangıç Noktası)

`.env.local` dosyanda aşağıdakiler dolu olmalı (bak: `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=anikare-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev
R2_PUBLIC_HOSTNAME=pub-xxx.r2.dev
CRON_SECRET=herhangi-bir-string-olabilir-localde
```

Sunucuyu başlat:

```bash
npm run dev
```

### Local'de Test Edilecekler

- [ ] `http://localhost:3000` — Landing page açılıyor mu?
- [ ] `http://localhost:3000/giris` — Google giriş butonu görünüyor mu?
- [ ] Google ile giriş → `/dashboard`'a yönleniyor mu?
- [ ] `/etkinlik/yeni` — Sihirbaz çalışıyor mu? (3 adım, canlı önizleme)
- [ ] Etkinlik oluştur → slug üretiliyor, `/etkinlik/[slug]` açılıyor mu?
- [ ] `/e/[slug]` — Misafir sayfası, PIN varsa PIN ekranı çıkıyor mu?
- [ ] Fotoğraf yükle → R2'ye gidiyor, dashboard'da görünüyor mu?
- [ ] Dashboard'dan fotoğraf gizle/sil çalışıyor mu?
- [ ] QR kodu canvas'ta render oluyor mu?

> **Not:** R2 CORS'ta `http://localhost:3000` var, local yükleme çalışmalı.

---

## 2. İlk Vercel Deploy (Free URL ile)

### 2.1 — Projeyi Vercel'e Import Et

1. [vercel.com/new](https://vercel.com/new) adresine git
2. **"Import Git Repository"** → GitHub hesabını bağla → `anikare` repo → **Import**
3. Framework: **Next.js** (otomatik seçili) — dokunma
4. **Deploy** tıkla (env yoksa başarısız olur, sorun değil)

### 2.2 — Environment Variables Ekle

**Vercel → Projen → Settings → Environment Variables**

Her birini ekle, Environment olarak **Production + Preview + Development** seç:

| Name | Nereden Alınır |
|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (**gizli tut**) |
| `R2_ACCOUNT_ID` | Cloudflare dashboard sağ sidebar |
| `R2_ACCESS_KEY_ID` | R2 → Manage API Tokens → token'ın Access Key ID'si |
| `R2_SECRET_ACCESS_KEY` | Aynı token'ın Secret Access Key'i |
| `R2_BUCKET_NAME` | `anikare-media` |
| `R2_PUBLIC_URL` | `https://pub-XXXXX.r2.dev` |
| `R2_PUBLIC_HOSTNAME` | `pub-XXXXX.r2.dev` |
| `CRON_SECRET` | Terminalde `openssl rand -hex 16` çalıştır, çıktıyı yapıştır |

Tüm değişkenler eklendikten sonra: **Deployments → üstteki deploy → ⋯ → Redeploy**

### 2.3 — Vercel URL'ini Öğren

Deploy bittikten sonra Vercel sana şöyle bir URL verir:
```
https://anikare-xxxxxx.vercel.app
```
Bu URL'i bir yere not et.

### 2.4 — Supabase'e Vercel URL'ini Ekle

**Supabase Panel → Authentication → URL Configuration:**

- **Site URL:** `https://anikare-xxxxxx.vercel.app`
- **Redirect URLs → Add URL:** `https://anikare-xxxxxx.vercel.app/auth/callback`
- **Save** tıkla

### 2.5 — R2 CORS'a Vercel URL'ini Ekle

**Cloudflare → R2 → anikare-media → Settings → CORS Policy → Edit:**

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://anikare-xxxxxx.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 3. Production'da Test Et

Tüm local testleri yeniden `vercel.app` URL'iyle yap:

- [ ] Google login çalışıyor mu? (Supabase redirect URL doğru mu?)
- [ ] Fotoğraf yükleme R2'ye gidiyor mu? (CORS doğru mu?)
- [ ] `/sunum/[slug]` premium slideshow açılıyor mu?
- [ ] Cron endpoint'i test et:
  ```bash
  curl -H "Authorization: Bearer CRON_SECRET_DEGERIN" \
    https://anikare-xxxxxx.vercel.app/api/cron/cleanup
  # Beklenen: {"deleted":0,"message":"No expired events"}
  ```

---

## 4. Custom Domain Ekle (anikare.co satın alındıktan sonra)

> Bu adımlar tamamen bağımsız — ne zaman istersen yapabilirsin, servis kesintisi olmaz.

### 4.1 — Vercel'e Domain Ekle

1. Vercel → Projen → **Settings → Domains → Add Domain**
2. `anikare.co` yaz → **Add**
3. Vercel sana iki DNS kaydı verir, örneğin:
   ```
   Type: A      Name: @    Value: 76.76.21.21
   Type: CNAME  Name: www  Value: cname.vercel-dns.com
   ```

### 4.2 — DNS Kaydını Ayarla

Domain aldığın sağlayıcıya git (GoDaddy, Namecheap, Porkbun vb.):

1. DNS yönetimine gir
2. Vercel'in verdiği A ve CNAME kayıtlarını ekle
3. Propagasyon 5-30 dakika sürer
4. Vercel'de **yeşil "Valid Configuration"** görünce tamamdır

### 4.3 — Supabase'i Güncelle

**Supabase → Authentication → URL Configuration:**

- **Site URL:** `https://anikare.co` *(vercel.app URL'ini kaldır)*
- **Redirect URLs:** `https://anikare.co/auth/callback` ekle, eski vercel.app URL'ini silebilirsin
- **Save**

### 4.4 — R2 CORS'u Güncelle

**Cloudflare → R2 → anikare-media → Settings → CORS Policy:**

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://anikare.co",
      "https://www.anikare.co"
    ],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4.5 — Kontrol

- [ ] `https://anikare.co` açılıyor mu?
- [ ] Google login hâlâ çalışıyor mu?
- [ ] Fotoğraf yükleme çalışıyor mu?

---

## 5. PWA İkonları (Eksik — Deploy'dan Önce Tamamla)

`public/icons/` klasörüne şu iki dosyayı ekle:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Logonu Figma/Canva'dan bu boyutlarda export edip kopyala.
PWA olmadan site çalışır ama "Ana ekrana ekle" özelliği ikonlar olmadan tam çalışmaz.

---

## 6. Vercel Analytics Aktive Et

Kod layout'a eklendi (`<Analytics />`), ama Vercel tarafında bir kez enable etmen gerekiyor:

1. **Vercel → Projen → Analytics** sekmesine tıkla
2. **"Enable Analytics"** butonuna bas (ücretsiz, Hobby plan dahil)
3. Production'da trafik geldiğinde sayfa görüntüleme, ülke, cihaz gibi veriler buraya akar

> Local'de (`npm run dev`) analytics çalışmaz — sadece production deployment'ta veri toplanır.

---

## 7. Vercel Cron Doğrulama

Vercel Hobby plan günde 1 cron çalıştırır, her gece 03:00 UTC.

Kontrol etmek için: **Vercel → Projen → Cron Jobs** sekmesine bak.
`/api/cron/cleanup` listelenmiş olmalı, son çalışma zamanı görünür.

---

## 8. Günlük Geliştirme Akışı (İlk Deploy Sonrası)

### Kod push ettikten sonra ne olur?

```
git push origin main
       ↓  (~10 saniye)
Vercel GitHub'ı algılar, build başlar
       ↓  (~1-2 dakika)
Production otomatik güncellenir
```

**Yapman gereken hiçbir şey yok.** Push = deploy.

### Build durumunu nerede görürsün?

**vercel.com → Projen → Deployments** sekmesi:
- Her push bir satır olarak listelenir
- Yeşil ✓ = başarılı, kırmızı ✗ = hata (tıklayınca build logları açılır)
- "Visit" butonuyla production'a gidebilirsin

### Preview URL nedir?

`main` dışında bir branch push edersen Vercel otomatik bir preview URL üretir:
```
https://anikare-git-feature-xyz-akinyasar.vercel.app
```
Production'a almadan önce burada test edebilirsin. PR açarsan GitHub'da doğrudan preview linki görünür.

### Bir deploy'u geri almak istersen

**Vercel → Deployments → İstediğin eski deploy → ⋯ → Promote to Production**
Tek tıkla eski versiyona dönersin, sıfır downtime.

### Environment variable değiştirince ne olur?

Vercel Dashboard'dan değiştirip kaydettin diyelim — **otomatik deploy tetiklenmez.**
Manuel olarak son deployment'ı Redeploy etmen gerekir:
**Deployments → En üstteki → ⋯ → Redeploy**

---

## Hızlı Referans: Neyi Nerede Bulursun

| Bilgi | Nerede |
|-------|--------|
| Supabase URL + Keys | supabase.com → Settings → API |
| R2 Public URL | Cloudflare → R2 → bucket → Settings → Public Access |
| R2 Account ID | Cloudflare dashboard sağ sidebar |
| Vercel deploy URL | Vercel → Projen → Deployments |
| Cron secret | `.env.local` + Vercel env vars |
