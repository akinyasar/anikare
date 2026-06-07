# AnıKare — QR-Based Digital Memory Sharing for Weddings & Events

> **Scan. Upload. Remember.**
> Guests scan a QR code at their table and upload photos directly from their browser — no app download, no account required.

**Live:** [www.anikare.net](https://www.anikare.net)

---

## Overview

AnıKare (Turkish for *memory frame*) is a SaaS platform built for weddings, engagements, and celebrations. The host places printed QR code cards on each table before the event. Guests scan, enter their name (and an optional PIN), and upload photos or videos directly from their phone. Every memory lands in the host's dashboard in real time — and can be projected as a live fullscreen slideshow on the venue screen.

The product is designed to be completely frictionless for guests: no account, no app install, no configuration. For hosts, setup takes under two minutes.

---

## Stack

| | What it does in this project |
|--|------------------------------|
| **Next.js 16** (App Router) | Full-stack framework — server components for data fetching, API routes for backend logic, `proxy.ts` for auth guard |
| **Supabase** | PostgreSQL database with Row Level Security, Google OAuth, and Realtime subscriptions (live slideshow updates) |
| **Cloudflare R2** | Media storage — S3-compatible, zero egress fees; guests upload directly via presigned PUT URLs, never through our server |
| **Vercel** | Deployment + free daily cron job (nightly media cleanup) |
| **Tailwind CSS v4** | Utility-first styling — no config file, `@import "tailwindcss"` only |
| **Framer Motion** | Slideshow transitions, stagger animations, page-level motion |
| **bcryptjs** | PIN codes are hashed server-side and never stored in plaintext |
| **html2canvas + jsPDF** | Client-side PDF generation for printable QR table cards |
| **browser-image-compression** | Client-side photo compression before upload — quality tier depends on package |
| **AWS SDK v3** | Used for generating presigned R2 URLs (R2 is S3-compatible, no Cloudflare SDK needed) |

---

## Features

### For Guests
- **Zero friction** — scan QR, type your name, upload. Done.
- **Multilingual** — auto-detects browser language (Turkish, English, German); falls back to Turkish
- **Privacy-protected** — optional 4-digit PIN per event keeps uploads private to invited guests
- **Smart compression** — photos are compressed client-side before upload based on the host's package tier, saving bandwidth without quality loss where it matters
- **Camera capture** — works with native camera on mobile; gallery selection also supported
- **Personalized thank-you** — animated thank-you screen after upload

### For Hosts
- **Event creation wizard** — 3-step flow: details → design → PIN; live table card preview throughout
- **Turkish slug generation** — SEO-friendly, Turkish-character-aware event URLs (`/e/ahmet-ve-ayse-dügünü-abc12`)
- **Package tiers** — Eco (150 photos / 10 videos), Standard (unlimited photos / 30 videos), Premium (unlimited everything + live slideshow)
- **Real-time media dashboard** — photo/video grid with stagger animation; optimistic hide/delete (instant UI response)
- **Media moderation** — hide inappropriate content immediately without deleting; full delete also available
- **Bulk download** — download all photos as a ZIP file with one click
- **Print-ready table cards** — two designs (Botanical, Floral) with QR code; download as PDF; SVG-native corner artwork renders correctly in print
- **Live slideshow** *(Premium)* — fullscreen auto-advancing presentation for the venue projector; Supabase Realtime updates in real time as guests upload; guest name/note always visible; fully-visible navigation arrows

### Technical Highlights
- **Serverless** — no backend to maintain; built on Next.js API routes + Supabase + Cloudflare
- **Zero egress costs** — Cloudflare R2 for media storage with a custom CDN domain (`media.anikare.net`); no bandwidth fees
- **Presigned URL upload flow** — guest browser uploads directly to R2; server never proxies media bytes
- **Secure media delivery** — no public bucket; `/api/media` generates per-request presigned GET URLs (1hr expiry) via AWS SDK
- **Auto data lifecycle** — media auto-deleted by R2 after 90 days; upload links expire 30 days after the event
- **Production-grade security** — Supabase Row Level Security, bcrypt-hashed PINs, httpOnly session cookies, service-role-only DB writes for guest uploads
- **PWA-ready** — Web App Manifest, custom icons, mobile viewport optimized

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Server components + serverless API routes in one repo |
| Language | TypeScript | Full type safety across frontend and API |
| Styling | Tailwind CSS v4 | Utility-first, no config file needed |
| Animation | Framer Motion | Slideshow transitions, stagger effects, page animations |
| Auth & Database | Supabase (PostgreSQL + Google OAuth + Realtime) | Managed auth, RLS policies, real-time subscriptions |
| Storage | Cloudflare R2 | S3-compatible, zero egress fees, custom CDN domain |
| Deployment | Vercel | Git-push deploys, free cron job (1/day on Hobby) |
| PDF Generation | html2canvas + jsPDF | Client-side table card PDF export |
| Compression | browser-image-compression | Client-side photo compression before upload |
| QR Codes | qrcode | QR generation in canvas |
| Slugs | nanoid + custom Turkish normalizer | Unique, readable, Turkish-character-safe URLs |
| PIN Security | bcryptjs | Server-side PIN hashing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Guest Browser                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /e/[slug]  →  PIN verify  →  Upload  →  Thank You │   │
│  └────────────────────┬────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │ PUT (presigned URL)
                        ▼
┌──────────────────────────────┐    ┌──────────────────────────┐
│  Cloudflare R2               │    │  Supabase PostgreSQL      │
│  anikare-media bucket        │    │  events / media / profiles│
│  media.anikare.net (CDN)     │    │  RLS on all tables        │
└──────────────────────────────┘    └──────────────┬───────────┘
                                                   │ Realtime
┌─────────────────────────────────────────────────┼──────────┐
│  Host Browser                                   │          │
│  ┌──────────────────────┐  ┌────────────────────▼───────┐  │
│  │  /dashboard          │  │  /sunum/[slug]             │  │
│  │  Event wizard        │  │  Live slideshow (Premium)  │  │
│  │  Media grid          │  │  Fullscreen + auto-advance │  │
│  │  QR card download    │  └────────────────────────────┘  │
│  └──────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Presigned upload flow:** Guests upload directly to R2 via a presigned PUT URL generated by `/api/upload/presign`. The server never touches media bytes. After upload, `/api/upload/confirm` records the media in the database using the service role key — guests never have direct DB access.

**Secure image delivery:** R2 bucket is not public. `/api/media` generates short-lived presigned GET URLs for each item on every request. This prevents hotlinking and gives per-item access control.

**Optimistic UI:** Hide/delete actions in the media grid flip state instantly and fire the API in the background. On error, state reverts. This makes moderation feel instant.

**Client-side locale:** Locale is detected from `navigator.language`, persisted in `localStorage`, and provided via `LocaleProvider`. Server components pass data as props to `'use client'` wrappers that call `useLocale()` — this avoids duplicating data fetches while making all UI text locale-aware.

---

## Project Structure

```
app/
├── (marketing)/              # Public landing page (hero, features, pricing)
├── (auth)/                   # Google OAuth login + /auth/callback handler
├── (dashboard)/              # Protected host area
│   ├── dashboard/            # Event list
│   └── etkinlik/
│       ├── yeni/             # 3-step event creation wizard
│       └── [slug]/           # Per-event dashboard (media grid + QR)
├── e/[slug]/                 # Guest upload flow (QR code target)
├── sunum/[slug]/             # Live slideshow display (Premium only)
└── api/
    ├── upload/presign/       # Generate R2 presigned PUT URL
    ├── upload/confirm/       # Record upload in DB (service_role)
    ├── pin/verify/           # Verify PIN, set httpOnly cookie
    ├── media/                # List media + generate presigned GET URLs
    ├── media/[id]/           # PATCH (visibility) + DELETE
    └── cron/cleanup/         # Nightly: delete media for expired events

components/
├── ui/                       # Button, Input, Card, BottomBar, LocaleSwitcher
├── dashboard/                # MediaGrid, MediaModal, MediaCard, MobileHeader, BottomNav
├── event/                    # Wizard + step components
├── guest/                    # PinEntry, Welcome, UploadBar, MediaStaging, UploadProgress, ThankYou
├── slideshow/                # SlideshowView (fullscreen, realtime)
├── table-card/               # CardBotanical, CardFloral, DownloadPdfBtn
├── landing/                  # Hero, Features, HowItWorks, Pricing, CTA, Nav, Footer
└── providers/                # LocaleProvider

lib/
├── supabase/                 # client.ts, server.ts (createClient + createServiceClient)
├── r2/client.ts              # S3Client configured for Cloudflare R2
├── i18n/
│   ├── site.ts               # 180+ keys for site/dashboard (t(locale, key))
│   └── dictionaries/         # tr.json, en.json, de.json (guest flow)
├── media/compress.ts         # browser-image-compression wrapper
├── download.ts               # triggerBlobDownload + fetchAndDownload
├── slug.ts                   # Turkish slug normalizer + nanoid suffix
├── pin.ts                    # bcrypt hash + compare
└── packages.ts               # Package tier definitions and limits

hooks/
├── use-event-realtime.ts     # Supabase Realtime for live photo inserts
└── use-media-upload.ts       # Batch upload with compression + progress

types/index.ts                # All TypeScript interfaces
proxy.ts                      # Next.js 16 auth guard (replaces middleware.ts)
supabase/schema.sql           # Full DB schema with RLS, triggers, indexes
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- [Supabase](https://supabase.com) project (free tier works)
- [Cloudflare](https://cloudflare.com) account with R2 enabled (free tier works)

### Installation

```bash
git clone https://github.com/akinyasar/anikare.git
cd anikare
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example` for all required values).

### Database Setup

Run `supabase/schema.sql` in your Supabase project's **SQL Editor**. This creates all tables, triggers, RLS policies, and indexes in one shot.

### R2 Setup

1. Create a bucket named `anikare-media` in Cloudflare R2
2. Add a CORS policy (see `docs/deployment-guide.md` for the JSON)
3. Set a lifecycle rule: delete objects after 90 days
4. Create an API token with read+write access to the bucket
5. (Optional) Add a custom domain (`media.yourdomain.com`) for CDN delivery

### Development

```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server-only, never expose**) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret key |
| `R2_BUCKET_NAME` | R2 bucket name (e.g. `anikare-media`) |
| `R2_PUBLIC_URL` | Public base URL for media (e.g. `https://media.yourdomain.com`) |
| `R2_PUBLIC_HOSTNAME` | Hostname only (e.g. `media.yourdomain.com`) |
| `CRON_SECRET` | Bearer token for the cleanup cron endpoint |

> **Security:** This is a public repository. Never commit `.env.local`. The `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes and must never reach the client bundle.

---

## Package Tiers

| | Eco | Standard | Premium |
|--|-----|----------|---------|
| Photos | 150 | Unlimited | Unlimited |
| Videos | 10 | 30 | Unlimited |
| Compression | 1080p | 4K | None (original quality) |
| Live Slideshow | — | — | ✓ |

---

## Roadmap

### Completed
- [x] Core platform (upload flow, auth, media management, QR cards)
- [x] Premium live slideshow with Supabase Realtime
- [x] Full TR/EN/DE localization
- [x] PWA support (Web App Manifest, icons)
- [x] Nightly cleanup cron job
- [x] Custom domain (`www.anikare.net`)
- [x] R2 CDN custom domain (`media.anikare.net`)
- [x] Optimistic UI for media moderation
- [x] Mobile-optimized dashboard (sticky header, bottom nav)
- [x] Blob-based downloads (PDF, photos, videos) — works on mobile

### In Progress / Next
- [ ] Payment integration (Shopier for individuals, iyzico later)
- [ ] Email notifications (Resend — upload alerts, event confirmation, welcome)
- [ ] Slideshow host control panel (`/etkinlik/[slug]/slayt`)

---

## Security Notes

- Supabase RLS is enabled on all tables. Hosts can only read/write their own events and media.
- Guest uploads go through a presigned URL flow — guests never have DB credentials.
- PINs are stored as bcrypt hashes. The raw PIN is never persisted.
- PIN verification sets an `httpOnly` cookie per event, not accessible from JavaScript.
- The cron cleanup endpoint requires a `Bearer` token to prevent unauthorized calls.

---

## License

MIT
