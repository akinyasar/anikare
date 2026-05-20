# AnıKare SaaS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Düğün ve davetler için QR-tabanlı dijital anı/fotoğraf paylaşım platformu — misafirler QR okutup anında fotoğraf yükler, ev sahipleri dashboard'dan yönetir.

**Architecture:** Next.js 16 App Router (frontend + serverless API routes), Supabase (PostgreSQL + Auth + Realtime), Cloudflare R2 (medya storage, sıfır egress), Vercel (deploy + cron). Misafir yüklemeleri presigned URL ile doğrudan R2'ye gider; API route'lar PIN doğrulama ve DB kayıt için service_role kullanır — hiçbir secret client'a açılmaz.

**Tech Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase JS v2 + SSR, AWS SDK v3 (R2), browser-image-compression, qrcode, nanoid, bcryptjs, jszip, zod

---

## Klasör Yapısı (Tüm Proje)

```
anikare/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx               # Navbar + footer ile marketing layout
│   │   └── page.tsx                 # Landing page
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── giris/page.tsx           # Google ile giriş
│   │   └── auth/callback/route.ts   # Supabase OAuth callback handler
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Auth guard + sidebar
│   │   ├── page.tsx                 # Etkinlik listesi / ana ekran
│   │   ├── etkinlik/
│   │   │   ├── yeni/page.tsx        # Etkinlik oluşturma sihirbazı
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Etkinlik dashboard'u
│   │   │       └── slayt/page.tsx   # Slayt yönetim sayfası
│   ├── e/[slug]/page.tsx            # Misafir upload akışı (QR hedefi)
│   ├── sunum/[slug]/page.tsx        # Canlı slayt gösterisi (salon ekranı)
│   ├── api/
│   │   ├── upload/presign/route.ts  # R2 presigned URL üret
│   │   ├── upload/confirm/route.ts  # Yükleme tamamlandı, DB'ye kaydet
│   │   ├── pin/verify/route.ts      # PIN doğrulama, httpOnly cookie yaz
│   │   ├── media/route.ts           # GET: event medyaları listele
│   │   ├── media/[id]/route.ts      # PATCH: gizle/göster, DELETE: sil
│   │   └── cron/cleanup/route.ts    # Vercel cron: süresi dolan medyaları sil
│   ├── manifest.ts                  # PWA manifest
│   ├── layout.tsx                   # Root layout
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   └── spinner.tsx
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── how-it-works.tsx
│   │   ├── pricing.tsx
│   │   └── footer.tsx
│   ├── event/
│   │   ├── wizard.tsx               # Çok adımlı form container
│   │   ├── steps/
│   │   │   ├── step-details.tsx     # Tür, isim, tarih, PIN
│   │   │   ├── step-package.tsx     # Eko/Standart/Premium seçimi
│   │   │   └── step-template.tsx    # Masa kartı şablonu
│   │   └── table-card-preview.tsx   # Canlı önizleme
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── media-grid.tsx           # Masonry grid
│   │   ├── media-card.tsx
│   │   ├── media-modal.tsx          # Orijinal görüntü + indirme
│   │   ├── qr-download.tsx          # QR + masa kartı PDF
│   │   └── stats-bar.tsx
│   ├── guest/
│   │   ├── pin-entry.tsx
│   │   ├── welcome-screen.tsx
│   │   ├── upload-bar.tsx           # Sabit alt bar
│   │   ├── upload-progress.tsx
│   │   └── thank-you-screen.tsx
│   └── slideshow/
│       └── slideshow-view.tsx       # Realtime akan fotoğraflar
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser singleton client
│   │   └── server.ts                # Server client (cookies)
│   ├── r2/
│   │   └── client.ts                # S3Client + presignedUrl (server-only)
│   ├── media/
│   │   └── compress.ts              # browser-image-compression wrapper
│   ├── i18n/
│   │   ├── dictionaries/tr.json
│   │   ├── dictionaries/en.json
│   │   ├── dictionaries/de.json
│   │   └── index.ts                 # Locale tespiti + dict yükle
│   ├── slug.ts                      # Türkçe → URL slug + nanoid
│   ├── pin.ts                       # bcrypt hash + compare
│   └── packages.ts                  # Paket limitleri ve config
├── hooks/
│   ├── use-auth.ts
│   ├── use-media-upload.ts          # Compress → presign → upload → confirm
│   └── use-event-realtime.ts        # Supabase realtime subscription
├── types/index.ts                   # Tüm TS interface/type'ları
├── proxy.ts                         # Next.js 16 auth guard (middleware yerine)
├── .env.example                     # Tüm key'lerin şablonu (commit edilir)
├── .env.local                       # Gerçek değerler (gitignore'da)
└── next.config.ts
```

---

## Supabase Veritabanı Şeması

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE event_type AS ENUM (
  'wedding', 'birthday', 'graduation', 'engagement', 'other'
);
CREATE TYPE package_type AS ENUM ('eco', 'standard', 'premium');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.events (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title                 TEXT NOT NULL,
  event_type            event_type NOT NULL DEFAULT 'wedding',
  slug                  TEXT UNIQUE NOT NULL,
  event_date            DATE,
  cover_image_key       TEXT,
  cover_image_url       TEXT,
  thank_you_message     TEXT,
  thank_you_video_url   TEXT,
  pin_enabled           BOOLEAN DEFAULT FALSE,
  pin_code_hash         TEXT,                      -- bcrypt hash, client'a hiç gönderilmez
  package_type          package_type NOT NULL DEFAULT 'eco',
  template_id           TEXT DEFAULT 'classic',
  guest_count_estimate  INT,
  is_upload_active      BOOLEAN DEFAULT TRUE,
  upload_expires_at     TIMESTAMPTZ,               -- event_date + 7 gün
  media_retention_until TIMESTAMPTZ,               -- event_date + 3 ay
  photo_count           INT DEFAULT 0,
  video_count           INT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.media (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id          UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  guest_name        TEXT NOT NULL,
  guest_note        TEXT,
  file_key          TEXT NOT NULL,                 -- R2 object key
  file_url          TEXT NOT NULL,                 -- CDN public URL
  file_type         TEXT NOT NULL CHECK (file_type IN ('photo', 'video')),
  file_size         BIGINT,
  original_filename TEXT,
  is_visible        BOOLEAN DEFAULT TRUE,
  uploaded_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: auth.users → profiles otomatik oluştur
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: events.updated_at otomatik güncelle
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: photo_count / video_count cache
-- ============================================================
CREATE OR REPLACE FUNCTION update_event_media_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.file_type = 'photo' THEN
      UPDATE public.events SET photo_count = photo_count + 1 WHERE id = NEW.event_id;
    ELSE
      UPDATE public.events SET video_count = video_count + 1 WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.file_type = 'photo' THEN
      UPDATE public.events SET photo_count = GREATEST(photo_count - 1, 0) WHERE id = OLD.event_id;
    ELSE
      UPDATE public.events SET video_count = GREATEST(video_count - 1, 0) WHERE id = OLD.event_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_count_trigger
  AFTER INSERT OR DELETE ON public.media
  FOR EACH ROW EXECUTE FUNCTION update_event_media_count();
```

---

## RLS Politikaları

```sql
-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profile_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- EVENTS
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Host kendi etkinliklerini CRUD yapabilir
CREATE POLICY "events_host_all"
  ON public.events FOR ALL
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Misafirler slug ile aktif etkinlikleri okuyabilir
-- (pin_code_hash sütunu API route'da filtrelenir, RLS tüm satırı açar)
CREATE POLICY "events_public_read"
  ON public.events FOR SELECT
  USING (TRUE);

-- ============================================================
-- MEDIA
-- ============================================================
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Host kendi etkinliğinin medyasını yönetebilir
CREATE POLICY "media_host_all"
  ON public.media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = media.event_id
        AND events.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = media.event_id
        AND events.host_id = auth.uid()
    )
  );

-- Herkese görünür medyayı okuma izni (slayt gösterisi için)
CREATE POLICY "media_public_visible_read"
  ON public.media FOR SELECT
  USING (is_visible = TRUE);

-- NOT: Misafir INSERT'leri doğrudan Supabase'e değil,
-- /api/upload/confirm route'una (service_role) gider.
```

---

## Paket Limitleri

```typescript
// lib/packages.ts
export const PACKAGES = {
  eco: {
    maxPhotos: 150,
    maxVideos: 10,
    compressionTarget: 1080,   // px (uzun kenar)
    compressionQuality: 0.75,
    liveSlideshow: false,
    premiumTemplates: false,
  },
  standard: {
    maxPhotos: Infinity,
    maxVideos: 30,
    compressionTarget: 2160,   // 4K
    compressionQuality: 0.85,
    liveSlideshow: false,
    premiumTemplates: false,
  },
  premium: {
    maxPhotos: Infinity,
    maxVideos: Infinity,
    compressionTarget: null,   // sıkıştırma yok
    compressionQuality: 1,
    liveSlideshow: true,
    premiumTemplates: true,
  },
} as const;
```

---

## Task 1: Foundation — Bağımlılıklar, Env, .gitignore

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `types/index.ts`

- [ ] **Step 1: Paketleri yükle**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  browser-image-compression framer-motion \
  qrcode nanoid bcryptjs jszip zod cookies-next

npm install --save-dev @types/qrcode @types/bcryptjs @types/jszip
```

- [ ] **Step 2: `.env.example` oluştur (commit edilecek şablon)**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=anikare-media
R2_PUBLIC_URL=https://your-r2-public-domain.com

# Vercel Cron güvenliği
CRON_SECRET=generate_a_random_32_char_string_here
```

- [ ] **Step 3: `.gitignore`'a güvenlik eklemeleri yap**

Mevcut `.gitignore`'daki `.env*` satırı zaten tüm env dosyalarını kapatıyor. Aşağıdakileri de ekle:

```gitignore
# Secrets
*.pem
*.key
.env*.local
.env.production

# Uploads (accidental local test files)
/uploads
/tmp
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "feat: add all dependencies and env template"
```

---

## Task 2: TypeScript Tipleri

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Tüm tip tanımlarını yaz**

```typescript
// types/index.ts
export type EventType = 'wedding' | 'birthday' | 'graduation' | 'engagement' | 'other';
export type PackageType = 'eco' | 'standard' | 'premium';
export type FileType = 'photo' | 'video';
export type Locale = 'tr' | 'en' | 'de';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  host_id: string;
  title: string;
  event_type: EventType;
  slug: string;
  event_date: string | null;
  cover_image_key: string | null;
  cover_image_url: string | null;
  thank_you_message: string | null;
  thank_you_video_url: string | null;
  pin_enabled: boolean;
  package_type: PackageType;
  template_id: string;
  guest_count_estimate: number | null;
  is_upload_active: boolean;
  upload_expires_at: string | null;
  media_retention_until: string | null;
  photo_count: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

// pin_code_hash asla client'a gönderilmez — ayrı tip
export type PublicEvent = Omit<Event, 'pin_code_hash'>;

export interface MediaItem {
  id: string;
  event_id: string;
  guest_name: string;
  guest_note: string | null;
  file_key: string;
  file_url: string;
  file_type: FileType;
  file_size: number | null;
  original_filename: string | null;
  is_visible: boolean;
  uploaded_at: string;
}

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface UploadPayload {
  eventId: string;
  guestName: string;
  guestNote?: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Supabase Kurulumu (Panel Adımları)

**Açıklama:** Supabase panelinde yapılacak adımlar. Hiç kod yazılmaz, sadece SQL çalıştırılır.

- [ ] **Step 1: Supabase projesi oluştur**

1. https://supabase.com adresine git → "New Project"
2. Proje adı: `anikare`, bölge: `eu-central-1` (Frankfurt, TR'ye en yakın)
3. Güçlü bir veritabanı şifresi oluştur (sakla, gerekebilir)
4. Proje hazırlanana kadar bekle (~2 dakika)

- [ ] **Step 2: Veritabanı şemasını uygula**

Supabase Panel → Sol menü "SQL Editor" → "New query" → Yukarıdaki tüm SQL'i (Extensions + Enums + Tables + Triggers bölümleri) yapıştır → "Run" butonuna tıkla.

Başarı: Hiç kırmızı hata görmemelisin. Yeşil "Success" mesajı gelir.

- [ ] **Step 3: RLS politikalarını uygula**

Aynı SQL Editor'da yeni bir query aç → RLS Politikaları bölümündeki SQL'i yapıştır → "Run".

- [ ] **Step 4: Google Auth'u aktif et**

1. Panel → Authentication → Providers → Google → "Enable"
2. Google Cloud Console'a git (console.cloud.google.com)
3. Yeni proje oluştur → "API & Services" → "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
4. Application type: "Web application"
5. Authorized redirect URI'ye şunu ekle: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Client ID ve Client Secret'ı kopyala → Supabase Google Provider sayfasına yapıştır → Save

- [ ] **Step 5: Supabase URL ve Key'leri al**

Panel → Settings → API:
- `Project URL` → `.env.local`'da `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (**asla client'a açma**)

- [ ] **Step 6: `.env.local` dosyası oluştur**

```bash
cp .env.example .env.local
# Şimdi .env.local içine gerçek değerleri doldur
```

---

## Task 4: Cloudflare R2 Kurulumu (Panel Adımları)

- [ ] **Step 1: Cloudflare hesabı ve R2 bucket**

1. https://dash.cloudflare.com → "R2 Object Storage" → "Create bucket"
2. Bucket name: `anikare-media`, Region: EEUR (Eastern Europe) → "Create"

- [ ] **Step 2: Public domain bağla (ücretsiz r2.dev subdomain)**

Bucket sayfası → "Settings" → "Public access" → "Allow Access" → Sana bir `*.r2.dev` URL verir.
Bu URL `R2_PUBLIC_URL` olarak `.env.local`'a gir.

**İleride custom domain** eklemek için: Settings → Custom Domains → Add domain.

- [ ] **Step 3: CORS politikası ayarla**

Bucket sayfası → Settings → CORS → Aşağıdaki JSON'u yapıştır:

```json
[
  {
    "AllowedOrigins": ["https://anikare.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

- [ ] **Step 4: R2 API token oluştur**

Cloudflare Dashboard → R2 → "Manage R2 API Tokens" → "Create API Token":
- Permissions: "Object Read & Write"
- Specific bucket: `anikare-media`
- Token oluştur → `Access Key ID` ve `Secret Access Key`'i kopyala → `.env.local`'a ekle
- `R2_ACCOUNT_ID` için: Cloudflare sağ sidebar'da "Account ID" yazar

- [ ] **Step 5: Yaşam döngüsü kuralı (3 ay sonra otomatik sil)**

Bucket → Settings → Object Lifecycle → "Add rule":
- Rule name: `media-retention`
- Prefix: (boş bırak — tüm objeler)
- Days until expiration: `90`
→ Save

---

## Task 5: Core Infrastructure — Supabase Clients + Proxy

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `proxy.ts`

- [ ] **Step 1: Browser Supabase client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Server Supabase client**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createServiceClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: proxy.ts auth guard (Next.js 16 — middleware değil proxy)**

```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboard = request.nextUrl.pathname.startsWith('/etkinlik') ||
    request.nextUrl.pathname === '/dashboard' ||
    request.nextUrl.pathname.startsWith('/(dashboard)')

  // Giriş gerektiren route'lara kimliksiz erişim → yönlendir
  const protectedPaths = ['/etkinlik', '/dashboard']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/giris', request.url))
  }

  // Giriş yapmış kullanıcı login sayfasına → dashboard'a yönlendir
  if (request.nextUrl.pathname === '/giris' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/ proxy.ts
git commit -m "feat: add Supabase clients and proxy auth guard"
```

---

## Task 6: R2 Client + Upload API Routes

**Files:**
- Create: `lib/r2/client.ts`
- Create: `app/api/upload/presign/route.ts`
- Create: `app/api/upload/confirm/route.ts`

- [ ] **Step 1: R2 S3 client (server-only)**

```typescript
// lib/r2/client.ts
import { S3Client } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME!
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!
```

- [ ] **Step 2: Presigned URL API route**

```typescript
// app/api/upload/presign/route.ts
import { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2/client'
import { createServiceClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import type { PresignResponse } from '@/types'

const schema = z.object({
  eventId: z.string().uuid(),
  fileName: z.string(),
  mimeType: z.string().regex(/^(image|video)\//),
  fileSize: z.number().positive(),
  fileType: z.enum(['photo', 'video']),
})

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 })

  const { eventId, fileName, mimeType, fileSize, fileType } = parsed.data

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Etkinlik kontrolü: aktif mi, süresi dolmadı mı?
  const { data: event, error } = await supabase
    .from('events')
    .select('id, package_type, is_upload_active, upload_expires_at, photo_count, video_count')
    .eq('id', eventId)
    .single()

  if (error || !event) return Response.json({ error: 'Event not found' }, { status: 404 })
  if (!event.is_upload_active) return Response.json({ error: 'Upload closed' }, { status: 403 })
  if (event.upload_expires_at && new Date(event.upload_expires_at) < new Date()) {
    return Response.json({ error: 'Event expired' }, { status: 403 })
  }

  // Paket limit kontrolü
  const { PACKAGES } = await import('@/lib/packages')
  const pkg = PACKAGES[event.package_type as keyof typeof PACKAGES]
  if (fileType === 'photo' && event.photo_count >= pkg.maxPhotos) {
    return Response.json({ error: 'Photo limit reached' }, { status: 403 })
  }
  if (fileType === 'video' && event.video_count >= pkg.maxVideos) {
    return Response.json({ error: 'Video limit reached' }, { status: 403 })
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg'
  const fileKey = `events/${eventId}/${fileType}s/${nanoid()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: mimeType,
    ContentLength: fileSize,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
  const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`

  return Response.json({ uploadUrl, fileKey, publicUrl } satisfies PresignResponse)
}
```

- [ ] **Step 3: Upload confirm route (PIN doğrulama cookie'si kontrol eder)**

```typescript
// app/api/upload/confirm/route.ts
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { cookies } from 'next/headers'

const schema = z.object({
  eventId: z.string().uuid(),
  guestName: z.string().min(1).max(100),
  guestNote: z.string().max(300).optional(),
  fileKey: z.string(),
  fileUrl: z.string().url(),
  fileType: z.enum(['photo', 'video']),
  fileSize: z.number().positive(),
  originalFilename: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 })

  const { eventId, guestName, guestNote, fileKey, fileUrl, fileType, fileSize, originalFilename } = parsed.data

  // PIN cookie doğrulama
  const cookieStore = await cookies()
  const pinCookie = cookieStore.get(`pin_verified_${eventId}`)?.value

  const supabase = await createServiceClient()

  // Etkinlik PIN gerektirir mi?
  const { data: event } = await supabase
    .from('events')
    .select('pin_enabled, is_upload_active, upload_expires_at')
    .eq('id', eventId)
    .single()

  if (!event) return Response.json({ error: 'Event not found' }, { status: 404 })
  if (!event.is_upload_active) return Response.json({ error: 'Upload closed' }, { status: 403 })
  if (event.upload_expires_at && new Date(event.upload_expires_at) < new Date()) {
    return Response.json({ error: 'Event expired' }, { status: 403 })
  }

  if (event.pin_enabled && pinCookie !== `verified_${eventId}`) {
    return Response.json({ error: 'PIN required' }, { status: 403 })
  }

  const { error } = await supabase.from('media').insert({
    event_id: eventId,
    guest_name: guestName,
    guest_note: guestNote || null,
    file_key: fileKey,
    file_url: fileUrl,
    file_type: fileType,
    file_size: fileSize,
    original_filename: originalFilename,
  })

  if (error) return Response.json({ error: 'DB insert failed' }, { status: 500 })

  return Response.json({ success: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/r2/ app/api/upload/
git commit -m "feat: add R2 client and upload presign/confirm API routes"
```

---

## Task 7: PIN Doğrulama + Client-Side Compression

**Files:**
- Create: `lib/pin.ts`
- Create: `lib/media/compress.ts`
- Create: `app/api/pin/verify/route.ts`

- [ ] **Step 1: PIN hash yardımcıları**

```typescript
// lib/pin.ts
import bcrypt from 'bcryptjs'

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}
```

- [ ] **Step 2: PIN verify API route**

```typescript
// app/api/pin/verify/route.ts
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPin } from '@/lib/pin'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  eventId: z.string().uuid(),
  pin: z.string().length(4).regex(/^\d{4}$/),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid' }, { status: 400 })

  const { eventId, pin } = parsed.data

  const supabase = await createServiceClient()
  const { data: event } = await supabase
    .from('events')
    .select('pin_enabled, pin_code_hash')
    .eq('id', eventId)
    .single()

  if (!event || !event.pin_enabled || !event.pin_code_hash) {
    return Response.json({ error: 'No PIN required' }, { status: 400 })
  }

  const valid = await verifyPin(pin, event.pin_code_hash)
  if (!valid) return Response.json({ error: 'Wrong PIN' }, { status: 401 })

  // httpOnly cookie ile doğrulamayı işaretle (30 gün geçerli)
  const cookieStore = await cookies()
  cookieStore.set(`pin_verified_${eventId}`, `verified_${eventId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  return Response.json({ success: true })
}
```

- [ ] **Step 3: Client-side compression**

```typescript
// lib/media/compress.ts
import imageCompression from 'browser-image-compression'
import type { PackageType } from '@/types'
import { PACKAGES } from '@/lib/packages'

export async function compressImage(
  file: File,
  packageType: PackageType
): Promise<File> {
  const pkg = PACKAGES[packageType]
  if (pkg.compressionTarget === null) return file  // premium: sıkıştırma yok

  const options = {
    maxWidthOrHeight: pkg.compressionTarget,
    initialQuality: pkg.compressionQuality,
    useWebWorker: true,
    fileType: file.type as string,
  }

  const compressed = await imageCompression(file, options)
  return new File([compressed], file.name, { type: file.type })
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/pin.ts lib/media/ app/api/pin/
git commit -m "feat: add PIN verification and client-side compression"
```

---

## Task 8: Slug Üretici + i18n

**Files:**
- Create: `lib/slug.ts`
- Create: `lib/i18n/dictionaries/tr.json`
- Create: `lib/i18n/dictionaries/en.json`
- Create: `lib/i18n/dictionaries/de.json`
- Create: `lib/i18n/index.ts`

- [ ] **Step 1: Türkçe slug üretici**

```typescript
// lib/slug.ts
import { nanoid } from 'nanoid'
import type { EventType } from '@/types'

const TR_SUFFIXES: Record<EventType, string> = {
  wedding: 'evleniyor',
  birthday: 'dogum-gunu',
  graduation: 'mezuniyet',
  engagement: 'nisan',
  other: 'etkinlik',
}

function toTurkishSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i')
    .replace(/İ/g, 'i').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export function generateSlug(names: string, eventType: EventType): string {
  const safeName = toTurkishSlug(names)
  const suffix = TR_SUFFIXES[eventType]
  const id = nanoid(6)
  return `${safeName}-${suffix}-${id}`
}
```

- [ ] **Step 2: i18n sözlükleri**

```json
// lib/i18n/dictionaries/tr.json
{
  "guest": {
    "welcome": "Hoş geldiniz!",
    "enterName": "Adınızı girin",
    "namePlaceholder": "Adınız ve soyadınız",
    "noteOptional": "Bir not bırakın (isteğe bağlı)",
    "openCamera": "Kamera Aç",
    "selectFromGallery": "Galeriden Seç",
    "uploading": "Yükleniyor...",
    "uploadMore": "Başka anı ekle",
    "pinTitle": "Gizlilik Kodu",
    "pinDescription": "Masa kartınızdaki 4 haneli kodu girin",
    "pinError": "Hatalı kod, tekrar deneyin",
    "confirm": "Onayla",
    "thankYouDefault": "Anılarınızı paylaştığınız için teşekkürler!"
  },
  "errors": {
    "uploadFailed": "Yükleme başarısız oldu, tekrar deneyin",
    "eventClosed": "Bu etkinlik için yükleme sona erdi",
    "limitReached": "Paket limiti doldu"
  }
}
```

```json
// lib/i18n/dictionaries/en.json
{
  "guest": {
    "welcome": "Welcome!",
    "enterName": "Enter your name",
    "namePlaceholder": "Your full name",
    "noteOptional": "Leave a note (optional)",
    "openCamera": "Open Camera",
    "selectFromGallery": "Select from Gallery",
    "uploading": "Uploading...",
    "uploadMore": "Add another memory",
    "pinTitle": "Privacy Code",
    "pinDescription": "Enter the 4-digit code on your table card",
    "pinError": "Wrong code, please try again",
    "confirm": "Confirm",
    "thankYouDefault": "Thank you for sharing your memories!"
  },
  "errors": {
    "uploadFailed": "Upload failed, please try again",
    "eventClosed": "Uploads are closed for this event",
    "limitReached": "Package limit reached"
  }
}
```

```json
// lib/i18n/dictionaries/de.json
{
  "guest": {
    "welcome": "Willkommen!",
    "enterName": "Ihren Namen eingeben",
    "namePlaceholder": "Vor- und Nachname",
    "noteOptional": "Hinterlassen Sie eine Notiz (optional)",
    "openCamera": "Kamera öffnen",
    "selectFromGallery": "Aus Galerie wählen",
    "uploading": "Wird hochgeladen...",
    "uploadMore": "Weitere Erinnerung hinzufügen",
    "pinTitle": "Zugangscode",
    "pinDescription": "Geben Sie den 4-stelligen Code auf Ihrer Tischkarte ein",
    "pinError": "Falscher Code, bitte erneut versuchen",
    "confirm": "Bestätigen",
    "thankYouDefault": "Vielen Dank für das Teilen Ihrer Erinnerungen!"
  },
  "errors": {
    "uploadFailed": "Upload fehlgeschlagen, bitte erneut versuchen",
    "eventClosed": "Uploads für diese Veranstaltung sind geschlossen",
    "limitReached": "Paketlimit erreicht"
  }
}
```

- [ ] **Step 3: Locale tespit ve dictionary yükleyici**

```typescript
// lib/i18n/index.ts
import type { Locale } from '@/types'

export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en', 'de']
export const DEFAULT_LOCALE: Locale = 'tr'

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const lang = navigator.language.split('-')[0] as Locale
  return SUPPORTED_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE
}

const dictionaryCache = new Map<Locale, Record<string, unknown>>()

export async function getDictionary(locale: Locale) {
  if (dictionaryCache.has(locale)) return dictionaryCache.get(locale)!
  const dict = await import(`./dictionaries/${locale}.json`)
  dictionaryCache.set(locale, dict.default)
  return dict.default as Record<string, unknown>
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/slug.ts lib/i18n/
git commit -m "feat: add slug generator and i18n dictionaries (TR/EN/DE)"
```

---

## Task 9: Auth Flow Pages

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/giris/page.tsx`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Auth layout**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Giriş sayfası**

```typescript
// app/(auth)/giris/page.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AnıKare</h1>
      <p className="text-gray-500 mb-8">Düğününüzün dijital anı defteri</p>
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Devam Et
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 3: OAuth callback route**

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/giris?error=auth_failed`)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/ app/auth/
git commit -m "feat: add Google OAuth login page and callback route"
```

---

## Task 10: Dashboard Layout + Etkinlik Listesi

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx`
- Create: `components/dashboard/sidebar.tsx`

- [ ] **Step 1: Dashboard layout (server component — auth kontrolü)**

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Dashboard ana sayfası (etkinlik listesi)**

```typescript
// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Event } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, event_date, package_type, photo_count, video_count, is_upload_active')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Etkinliklerim</h1>
        <Link
          href="/etkinlik/yeni"
          className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-rose-600 transition-colors"
        >
          + Yeni Etkinlik
        </Link>
      </div>

      {!events?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Henüz etkinliğiniz yok.</p>
          <Link href="/etkinlik/yeni" className="text-rose-500 font-medium mt-2 inline-block">
            İlk etkinliğinizi oluşturun →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event: Partial<Event>) => (
            <Link
              key={event.id}
              href={`/etkinlik/${event.slug}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-gray-900">{event.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${event.is_upload_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {event.is_upload_active ? 'Aktif' : 'Kapalı'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{event.event_date}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-600">
                <span>📷 {event.photo_count}</span>
                <span>🎬 {event.video_count}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/ components/dashboard/sidebar.tsx
git commit -m "feat: add dashboard layout and events list page"
```

---

## Task 11: Etkinlik Oluşturma Sihirbazı

**Files:**
- Create: `app/(dashboard)/etkinlik/yeni/page.tsx`
- Create: `components/event/wizard.tsx`
- Create: `components/event/steps/step-details.tsx`
- Create: `components/event/steps/step-package.tsx`
- Create: `components/event/steps/step-template.tsx`
- Create: `components/event/table-card-preview.tsx`

- [ ] **Step 1: Sihirbaz state yönetimi (wizard.tsx)**

```typescript
// components/event/wizard.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/slug'
import { hashPin } from '@/lib/pin'
import StepDetails from './steps/step-details'
import StepPackage from './steps/step-package'
import StepTemplate from './steps/step-template'
import TableCardPreview from './table-card-preview'
import type { EventType, PackageType } from '@/types'

interface WizardState {
  title: string
  eventType: EventType
  eventDate: string
  guestCountEstimate: number
  thankYouMessage: string
  pinEnabled: boolean
  pinCode: string
  packageType: PackageType
  templateId: string
  coverImageFile: File | null
  coverImagePreview: string | null
}

const INITIAL_STATE: WizardState = {
  title: '', eventType: 'wedding', eventDate: '',
  guestCountEstimate: 50, thankYouMessage: '',
  pinEnabled: false, pinCode: '', packageType: 'standard',
  templateId: 'classic', coverImageFile: null, coverImagePreview: null,
}

const STEPS = ['Detaylar', 'Paket', 'Tasarım']

export default function EventWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function update(partial: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...partial }))
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Cover image yükle (varsa)
    let coverImageKey: string | null = null
    let coverImageUrl: string | null = null
    if (state.coverImageFile) {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'cover', fileName: state.coverImageFile.name,
          mimeType: state.coverImageFile.type, fileSize: state.coverImageFile.size,
          fileType: 'photo',
        }),
      })
      // Kapak için özel presign: eventId 'cover' yerine event oluşturulduktan sonra taşı
      // Basitlik için cover'ı event oluşturulduktan sonra ayrı handle et
    }

    const slug = generateSlug(state.title, state.eventType)
    const pinHash = state.pinEnabled && state.pinCode
      ? await hashPin(state.pinCode) : null

    const now = new Date()
    const eventDate = state.eventDate ? new Date(state.eventDate) : now
    const uploadExpiresAt = new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    const mediaRetentionUntil = new Date(eventDate.getTime() + 90 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase.from('events').insert({
      host_id: user.id,
      title: state.title,
      event_type: state.eventType,
      slug,
      event_date: state.eventDate || null,
      thank_you_message: state.thankYouMessage || null,
      pin_enabled: state.pinEnabled,
      pin_code_hash: pinHash,
      package_type: state.packageType,
      template_id: state.templateId,
      guest_count_estimate: state.guestCountEstimate,
      upload_expires_at: uploadExpiresAt.toISOString(),
      media_retention_until: mediaRetentionUntil.toISOString(),
    }).select('slug').single()

    setLoading(false)
    if (!error && data) {
      router.push(`/etkinlik/${data.slug}`)
    }
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1 max-w-lg">
        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-rose-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 0 && <StepDetails state={state} update={update} />}
        {step === 1 && <StepPackage state={state} update={update} />}
        {step === 2 && <StepTemplate state={state} update={update} />}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-600 hover:bg-gray-50 transition-colors">
              Geri
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!state.title}
              className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors">
              Devam
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors">
              {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
            </button>
          )}
        </div>
      </div>

      {/* Canlı önizleme */}
      <div className="hidden lg:block w-72 sticky top-6 self-start">
        <TableCardPreview state={state} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wizard page**

```typescript
// app/(dashboard)/etkinlik/yeni/page.tsx
import EventWizard from '@/components/event/wizard'

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Yeni Etkinlik Oluştur</h1>
      <EventWizard />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/etkinlik/ components/event/
git commit -m "feat: add event creation wizard with live preview"
```

---

## Task 12: Misafir Upload Akışı

**Files:**
- Create: `app/e/[slug]/page.tsx`
- Create: `components/guest/pin-entry.tsx`
- Create: `components/guest/welcome-screen.tsx`
- Create: `components/guest/upload-bar.tsx`
- Create: `components/guest/thank-you-screen.tsx`
- Create: `hooks/use-media-upload.ts`

- [ ] **Step 1: upload hook (compress → presign → PUT → confirm)**

```typescript
// hooks/use-media-upload.ts
'use client'
import { useState } from 'react'
import { compressImage, isVideoFile } from '@/lib/media/compress'
import type { PackageType, FileType } from '@/types'

interface UploadArgs {
  file: File
  eventId: string
  packageType: PackageType
  guestName: string
  guestNote?: string
}

export function useMediaUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload({ file, eventId, packageType, guestName, guestNote }: UploadArgs) {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Sıkıştır (sadece fotoğraflar)
      const processedFile = isVideoFile(file) ? file : await compressImage(file, packageType)
      setProgress(20)

      const fileType: FileType = isVideoFile(file) ? 'video' : 'photo'

      // 2. Presigned URL al
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, fileType,
          fileName: processedFile.name,
          mimeType: processedFile.type,
          fileSize: processedFile.size,
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Presign failed')
      }

      const { uploadUrl, fileKey, publicUrl } = await presignRes.json()
      setProgress(40)

      // 3. Doğrudan R2'ye yükle
      await fetch(uploadUrl, {
        method: 'PUT',
        body: processedFile,
        headers: { 'Content-Type': processedFile.type },
      })
      setProgress(80)

      // 4. DB'ye kaydet
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, guestName, guestNote: guestNote || undefined,
          fileKey, fileUrl: publicUrl, fileType,
          fileSize: processedFile.size,
          originalFilename: file.name,
        }),
      })

      if (!confirmRes.ok) throw new Error('Confirm failed')
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return { upload, progress, uploading, error }
}
```

- [ ] **Step 2: Misafir sayfası (server component — event verisi çeker)**

```typescript
// app/e/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GuestFlow from '@/components/guest/guest-flow'
import type { PageProps } from 'next'

export default async function GuestPage({ params }: PageProps<'/e/[slug]'>) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_type, event_date, cover_image_url, thank_you_message, thank_you_video_url, pin_enabled, package_type, is_upload_active, upload_expires_at')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  return <GuestFlow event={event} />
}
```

- [ ] **Step 3: GuestFlow client bileşeni oluştur**

```typescript
// components/guest/guest-flow.tsx
'use client'
import { useState, useRef } from 'react'
import { detectLocale, getDictionary } from '@/lib/i18n'
import PinEntry from './pin-entry'
import WelcomeScreen from './welcome-screen'
import UploadBar from './upload-bar'
import ThankYouScreen from './thank-you-screen'
import { useMediaUpload } from '@/hooks/use-media-upload'
import type { PublicEvent } from '@/types'
import { useEffect } from 'react'

type Stage = 'pin' | 'welcome' | 'uploading' | 'thankyou'

export default function GuestFlow({ event }: { event: PublicEvent }) {
  const [stage, setStage] = useState<Stage>(event.pin_enabled ? 'pin' : 'welcome')
  const [guestName, setGuestName] = useState('')
  const [guestNote, setGuestNote] = useState('')
  const [dict, setDict] = useState<Record<string, unknown>>({})
  const { upload, progress, uploading, error } = useMediaUpload()

  useEffect(() => {
    getDictionary(detectLocale()).then(setDict)
  }, [])

  const g = (dict.guest || {}) as Record<string, string>

  if (!event.is_upload_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-500 text-lg">{(dict.errors as Record<string, string>)?.eventClosed}</p>
      </div>
    )
  }

  if (stage === 'pin') {
    return <PinEntry eventId={event.id} dict={g} onSuccess={() => setStage('welcome')} />
  }

  if (stage === 'thankyou') {
    return (
      <ThankYouScreen
        message={event.thank_you_message || g.thankYouDefault}
        videoUrl={event.thank_you_video_url}
        uploadMoreLabel={g.uploadMore}
        onUploadMore={() => setStage('welcome')}
      />
    )
  }

  async function handleFiles(files: FileList) {
    setStage('uploading')
    for (const file of Array.from(files)) {
      await upload({
        file, eventId: event.id,
        packageType: event.package_type,
        guestName, guestNote,
      })
    }
    setStage('thankyou')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <WelcomeScreen
        event={event} dict={g}
        guestName={guestName} setGuestName={setGuestName}
        guestNote={guestNote} setGuestNote={setGuestNote}
      />
      <UploadBar
        dict={g}
        disabled={!guestName.trim() || uploading}
        progress={progress}
        uploading={uploading}
        error={error}
        onFiles={handleFiles}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/e/ components/guest/ hooks/use-media-upload.ts
git commit -m "feat: add guest upload flow with PIN, compression, and thank-you screen"
```

---

## Task 13: Etkinlik Dashboard'u (Host)

**Files:**
- Create: `app/(dashboard)/etkinlik/[slug]/page.tsx`
- Create: `components/dashboard/media-grid.tsx`
- Create: `components/dashboard/media-modal.tsx`
- Create: `components/dashboard/qr-download.tsx`
- Create: `app/api/media/route.ts`
- Create: `app/api/media/[id]/route.ts`

- [ ] **Step 1: Media API routes**

```typescript
// app/api/media/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return Response.json({ error: 'Missing eventId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Kullanıcının bu etkinliğe sahip olduğunu doğrula
  const { data: event } = await supabase
    .from('events').select('id').eq('id', eventId).eq('host_id', user.id).single()
  if (!event) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .order('uploaded_at', { ascending: false })

  return Response.json({ media })
}
```

```typescript
// app/api/media/[id]/route.ts
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET } from '@/lib/r2/client'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { is_visible } = await req.json()

  const supabase = await createServiceClient()
  const anonSupa = await (await import('@/lib/supabase/server')).createClient()
  const { data: { user } } = await anonSupa.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Media'nın host'a ait olduğunu doğrula
  const { data: media } = await supabase
    .from('media').select('id, event_id').eq('id', id).single()
  if (!media) return Response.json({ error: 'Not found' }, { status: 404 })

  const { data: event } = await supabase
    .from('events').select('id').eq('id', media.event_id).eq('host_id', user.id).single()
  if (!event) return Response.json({ error: 'Forbidden' }, { status: 403 })

  await supabase.from('media').update({ is_visible }).eq('id', id)
  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServiceClient()
  const anonSupa = await (await import('@/lib/supabase/server')).createClient()
  const { data: { user } } = await anonSupa.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: media } = await supabase
    .from('media').select('id, event_id, file_key').eq('id', id).single()
  if (!media) return Response.json({ error: 'Not found' }, { status: 404 })

  const { data: event } = await supabase
    .from('events').select('id').eq('id', media.event_id).eq('host_id', user.id).single()
  if (!event) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // R2'den sil
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: media.file_key }))

  // DB'den sil (trigger photo/video_count'u azaltır)
  await supabase.from('media').delete().eq('id', id)
  return Response.json({ success: true })
}
```

- [ ] **Step 2: Etkinlik dashboard sayfası**

```typescript
// app/(dashboard)/etkinlik/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MediaGrid from '@/components/dashboard/media-grid'
import QrDownload from '@/components/dashboard/qr-download'
import type { PageProps } from 'next'

export default async function EventDashboardPage({ params }: PageProps<'/(dashboard)/etkinlik/[slug]'>) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{event.event_date} • {event.package_type}</p>
        </div>
        <QrDownload slug={slug} eventTitle={event.title} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-3xl font-bold text-rose-500">{event.photo_count}</p>
          <p className="text-sm text-gray-400 mt-1">Fotoğraf</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-3xl font-bold text-rose-500">{event.video_count}</p>
          <p className="text-sm text-gray-400 mt-1">Video</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mt-1">
            {event.is_upload_active ? '🟢 Yükleme Açık' : '🔴 Yükleme Kapalı'}
          </p>
        </div>
      </div>

      <MediaGrid eventId={event.id} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/etkinlik/\[slug\]/ app/api/media/ components/dashboard/
git commit -m "feat: add event dashboard with media grid and moderation"
```

---

## Task 14: Canlı Slayt Gösterisi (Premium)

**Files:**
- Create: `app/sunum/[slug]/page.tsx`
- Create: `components/slideshow/slideshow-view.tsx`
- Create: `hooks/use-event-realtime.ts`

- [ ] **Step 1: Realtime hook**

```typescript
// hooks/use-event-realtime.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem } from '@/types'

export function useEventRealtime(eventId: string, initialMedia: MediaItem[]) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'media', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const newItem = payload.new as MediaItem
          if (newItem.is_visible && newItem.file_type === 'photo') {
            setMedia(prev => [newItem, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return media
}
```

- [ ] **Step 2: Slideshow sayfası**

```typescript
// app/sunum/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SlideshowView from '@/components/slideshow/slideshow-view'
import type { PageProps } from 'next'

export default async function SlideshowPage({ params }: PageProps<'/sunum/[slug]'>) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, package_type')
    .eq('slug', slug)
    .single()

  if (!event || event.package_type !== 'premium') notFound()

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', event.id)
    .eq('file_type', 'photo')
    .eq('is_visible', true)
    .order('uploaded_at', { ascending: false })
    .limit(50)

  return <SlideshowView event={event} initialMedia={media || []} />
}
```

- [ ] **Step 3: Commit**

```bash
git add app/sunum/ components/slideshow/ hooks/use-event-realtime.ts
git commit -m "feat: add premium live slideshow with Supabase realtime"
```

---

## Task 15: PWA Manifest + next.config

**Files:**
- Create: `app/manifest.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: PWA manifest**

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AnıKare — Dijital Anı Defteri',
    short_name: 'AnıKare',
    description: 'Düğün ve davetleriniz için QR tabanlı fotoğraf paylaşım platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f43f5e',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

- [ ] **Step 2: next.config.ts (R2 domain izni + image optimizasyon)**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: process.env.R2_PUBLIC_HOSTNAME || 'placeholder.r2.dev',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: PWA ikonları oluştur**

```bash
# public/icons/ klasörü oluştur ve 192x192, 512x512 icon.png dosyaları ekle
mkdir -p public/icons
# Figma/Canva'dan export ettiğin logo görsellerini buraya koy
```

- [ ] **Step 4: Commit**

```bash
git add app/manifest.ts next.config.ts public/icons/
git commit -m "feat: add PWA manifest and Next.js image config"
```

---

## Task 16: Veri Temizleme Cron Job

**Files:**
- Create: `app/api/cron/cleanup/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Cleanup API route**

```typescript
// app/api/cron/cleanup/route.ts
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET } from '@/lib/r2/client'

export async function GET(req: NextRequest) {
  // Vercel cron güvenliği
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Medya retention süresi dolan etkinlikler
  const { data: expiredEvents } = await supabase
    .from('events')
    .select('id')
    .lt('media_retention_until', new Date().toISOString())
    .eq('is_upload_active', true)

  if (!expiredEvents?.length) return Response.json({ deleted: 0 })

  let deletedCount = 0
  for (const event of expiredEvents) {
    // R2'den tüm dosyaları sil
    const prefix = `events/${event.id}/`
    const listed = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix }))
    for (const obj of listed.Contents || []) {
      if (obj.Key) {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: obj.Key }))
        deletedCount++
      }
    }

    // DB'den media kayıtlarını sil
    await supabase.from('media').delete().eq('event_id', event.id)

    // Upload'ı kapat
    await supabase.from('events').update({ is_upload_active: false }).eq('id', event.id)
  }

  return Response.json({ deleted: deletedCount })
}
```

- [ ] **Step 2: Vercel cron yapılandırması**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Her gece 03:00'da çalışır. Vercel Hobby plan: 1 cron job ücretsiz.

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/ vercel.json
git commit -m "feat: add nightly cron job for expired media cleanup"
```

---

## Task 17: Landing Page

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `app/(marketing)/page.tsx`
- Create: `components/landing/hero.tsx`
- Create: `components/landing/pricing.tsx`

- [ ] **Step 1: Marketing layout**

```typescript
// app/(marketing)/layout.tsx
import Link from 'next/link'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-rose-500">AnıKare</Link>
          <div className="flex items-center gap-4">
            <Link href="/giris" className="text-sm text-gray-600 hover:text-gray-900">Giriş</Link>
            <Link href="/giris"
              className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}
```

- [ ] **Step 2: Landing page bileşenlerini çağır**

```typescript
// app/(marketing)/page.tsx
import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import HowItWorks from '@/components/landing/how-it-works'
import Pricing from '@/components/landing/pricing'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AnıKare — Düğününüzün Dijital Anı Defteri',
  description: 'QR kod ile misafirlerinizin fotoğraflarını anında toplayın. Kurulum yok, uygulama indirme yok.',
  openGraph: {
    title: 'AnıKare',
    description: 'Düğün ve davetler için dijital anı paylaşım platformu',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(marketing\)/ components/landing/
git commit -m "feat: add SEO-optimized landing page"
```

---

## Task 18: Vercel Deployment + Custom Domain

**Açıklama:** Vercel'e deploy ve domain bağlama. Hiç kod yazılmaz.

- [ ] **Step 1: GitHub'a push**

```bash
git push origin main
```

- [ ] **Step 2: Vercel'e import**

1. https://vercel.com/new adresine git
2. "Import Git Repository" → GitHub hesabını bağla → `anikare` repo'yu seç
3. Framework Preset: **Next.js** (otomatik algılar)
4. "Deploy" butonuna tıkla (ilk deploy başarısız olabilir — env eksik)

- [ ] **Step 3: Environment variables ekle**

Vercel Dashboard → Projen → Settings → Environment Variables:

Her değişkeni tek tek ekle:
```
NEXT_PUBLIC_SUPABASE_URL         = (Supabase'den)
NEXT_PUBLIC_SUPABASE_ANON_KEY    = (Supabase'den)
SUPABASE_SERVICE_ROLE_KEY        = (Supabase'den)
R2_ACCOUNT_ID                    = (Cloudflare'den)
R2_ACCESS_KEY_ID                 = (Cloudflare'den)
R2_SECRET_ACCESS_KEY             = (Cloudflare'den)
R2_BUCKET_NAME                   = anikare-media
R2_PUBLIC_URL                    = https://pub-xxx.r2.dev
R2_PUBLIC_HOSTNAME               = pub-xxx.r2.dev
CRON_SECRET                      = (32 char random string)
```

"Redeploy" butonuna tıkla.

- [ ] **Step 4: Custom domain bağla**

1. Vercel → Projen → Settings → Domains → "Add Domain"
2. `anikare.com` gir → Vercel sana 2 DNS kaydı verir (A ve CNAME)
3. Domain registrar'ına git (GoDaddy/Namecheap/vb.) → DNS yönetimine gir
4. Vercel'in verdiği kayıtları ekle
5. Propagasyon 5-15 dakika sürer → Vercel "Valid Configuration" gösterir

- [ ] **Step 5: Supabase'e production URL ekle**

Supabase → Authentication → URL Configuration:
- Site URL: `https://anikare.com`
- Redirect URLs'e ekle: `https://anikare.com/auth/callback`

Cloudflare R2 CORS AllowedOrigins'e ekle: `https://anikare.com`

---

## Özet: Geliştirme Sırası

| Task | Süre (tahmini) | Bağımlı |
|------|----------------|---------|
| 1. Foundation | 30 dk | — |
| 2. TypeScript Types | 15 dk | 1 |
| 3. Supabase Setup | 45 dk | 1 |
| 4. R2 Setup | 30 dk | 1 |
| 5. Core Infra (clients + proxy) | 30 dk | 3 |
| 6. R2 Upload API | 45 dk | 4, 5 |
| 7. PIN + Compression | 30 dk | 2, 5 |
| 8. Slug + i18n | 20 dk | 2 |
| 9. Auth Pages | 20 dk | 5 |
| 10. Dashboard Layout | 30 dk | 9 |
| 11. Event Wizard | 60 dk | 8, 10 |
| 12. Guest Flow | 60 dk | 6, 7, 8 |
| 13. Event Dashboard | 60 dk | 6, 10 |
| 14. Live Slideshow | 30 dk | 13 |
| 15. PWA | 20 dk | — |
| 16. Cron Cleanup | 20 dk | 6 |
| 17. Landing Page | 45 dk | 9 |
| 18. Deployment | 30 dk | Tümü |

**Toplam tahmini süre:** ~8-10 saat (aktif geliştirme)
