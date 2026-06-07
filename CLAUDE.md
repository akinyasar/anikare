@AGENTS.md

# AnıKare — Project Context for Claude

## What This Project Is
A QR-based digital memory/photo sharing SaaS for weddings and events.
- Guests scan a QR code at their table → upload photos/videos directly from browser (no app needed)
- Hosts manage events, moderate media, download QR cards, and view a live slideshow
- Brand name: **AnıKare** (Turkish for "memory frame")
- Live at: **https://www.anikare.net**

## Tech Stack
- **Frontend:** Next.js 16.2.6 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend/Auth:** Supabase (PostgreSQL + Google OAuth + Realtime)
- **Storage:** Cloudflare R2 (S3-compatible, zero egress fees) — media served via `media.anikare.net`
- **Deployment:** Vercel (Hobby plan — 1 cron job free) — `www.anikare.net`

## Critical Next.js 16 Differences
- `middleware.ts` is **deprecated** — use `proxy.ts` instead (same API, renamed)
- Tailwind CSS v4 uses `@import "tailwindcss"` not `@tailwind` directives — no `tailwind.config.js`
- Route params are **async**: `const { slug } = await params` (not `params.slug` directly)
- **`PageProps` is NOT exported from 'next'** — use inline typing: `{ params: Promise<{ slug: string }> }`
- `proxy` export function name (not `middleware`) in proxy.ts

## Project Structure
```
app/
  (marketing)/          # Landing page (public)
  (auth)/               # Login page + OAuth callback
  (dashboard)/          # Protected host area (auth required)
    etkinlik/yeni/      # Event creation wizard
    etkinlik/[slug]/    # Event dashboard
  e/[slug]/             # Guest upload flow (QR target, public)
  sunum/[slug]/         # Live slideshow display (public, premium only)
  api/
    upload/presign/     # Generate R2 presigned URL
    upload/confirm/     # Record upload in DB (uses service_role)
    pin/verify/         # Verify guest PIN → set httpOnly cookie
    media/              # List + moderate media (returns presigned GET URLs)
    media/[id]/         # PATCH (visibility) + DELETE
    cron/cleanup/       # Nightly expired media cleanup
lib/
  supabase/client.ts    # Browser Supabase client
  supabase/server.ts    # Server client + service client
  r2/client.ts          # S3Client for Cloudflare R2 (server-only)
  media/compress.ts     # browser-image-compression wrapper
  i18n/                 # TR/EN/DE dictionaries + locale detection
    site.ts             # 180+ key site-wide translations (t(locale, key))
    dictionaries/       # tr.json, en.json, de.json (guest flow)
  slug.ts               # Turkish slug generator (ş→s, ç→c etc.) + nanoid
  pin.ts                # bcrypt hash + compare for PIN codes
  packages.ts           # Package limits (eco/standard/premium)
  download.ts           # triggerBlobDownload + fetchAndDownload helpers
components/
  dashboard/
    event-list-client.tsx   # 'use client' wrapper for locale-aware event list
    event-detail-client.tsx # 'use client' wrapper for locale-aware event detail
    media-grid.tsx          # Optimistic hide/delete, stagger animation, skeleton
    media-modal.tsx         # Full-screen media view with download
    media-card.tsx
    mobile-header.tsx       # Mobile-only sticky header with locale switcher
    bottom-nav.tsx          # 2-item mobile bottom nav (events + new event)
  slideshow/
    slideshow-view.tsx      # Fullscreen slideshow with always-visible guest info + nav
  table-card/
    card-botanical.tsx      # SVG-native corner rotation (not CSS transform)
    card-floral.tsx         # SVG-native corner rotation
    download-pdf-btn.tsx    # Blob-based PDF download (octet-stream)
  guest/
    media-staging.tsx       # Upload preview grid with package limit indicators
    thank-you-screen.tsx    # Animated thank-you with localized title
  event/
    wizard.tsx              # 3-step event creation with scroll-to-top
  providers/
    locale-provider.tsx     # LocaleProvider + useLocale() — localStorage persistence
hooks/
  use-event-realtime.ts     # Supabase realtime for new photo inserts
  use-media-upload.ts       # Batch upload hook with compression
types/index.ts              # All TypeScript interfaces (MediaItem includes viewUrl?)
proxy.ts                    # Auth guard (Next.js 16 proxy, not middleware)
supabase/schema.sql         # Full DB schema — run in Supabase SQL Editor
```

## Security Rules (PUBLIC REPO — Never Violate)
- **No hardcoded secrets** — all via `.env.local` (gitignored)
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never import in client components
- `pin_code_hash` column is **never returned to client** — API routes filter it out
- Guest media inserts go through `/api/upload/confirm` (service_role), not direct Supabase client
- PIN verification sets an httpOnly cookie (`pin_verified_<eventId>`)
- Cron endpoint protected by `Authorization: Bearer <CRON_SECRET>` header

## Environment Variables
See `.env.example` for full list. Required:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
R2_PUBLIC_HOSTNAME
CRON_SECRET
```
Set `.env.local` locally, and add all vars to Vercel dashboard before deploying.

## Database (Supabase)
- Schema file: `supabase/schema.sql` — run once in Supabase SQL Editor
- Key tables: `profiles`, `events`, `media`
- `pin_code_hash` stored as bcrypt hash — never expose to client
- Triggers: auto-create profile on signup, update `updated_at`, cache `photo_count`/`video_count`
- RLS: enabled on all tables — hosts own their events/media, guests read public events

## Package Limits (lib/packages.ts)
| Package | Photos | Videos | Compression | Slideshow |
|---------|--------|--------|-------------|-----------|
| Eco | 150 | 10 | 1080p | ✗ |
| Standard | ∞ | 30 | 4K | ✗ |
| Premium | ∞ | ∞ | None | ✓ |

## Cloudflare R2
- Bucket: `anikare-media`
- Object path pattern: `events/<eventId>/photos/<nanoid>.jpg`
- Lifecycle rule: 90 days auto-delete (set in R2 bucket settings)
- Custom domain: `media.anikare.net` — CF CDN, zero egress
- Presigned URL flow: client → `/api/upload/presign` → R2 (PUT directly) → `/api/upload/confirm`
- Media display: `/api/media` generates presigned GET URLs (1hr expiry) per request
- CORS: allows `http://localhost:3000`, `https://anikare.vercel.app`, `https://www.anikare.net`, `https://anikare.net`

## i18n
- Auto-detects browser language (TR/EN/DE), defaults to TR
- `lib/i18n/site.ts` — 180+ keys for all site/dashboard pages via `t(locale, key)`
- `lib/i18n/dictionaries/{tr,en,de}.json` — guest flow dictionary (passed as prop)
- `LocaleProvider` + `useLocale()` — client-side, persisted in localStorage
- Server components pass data to `'use client'` wrappers for locale-awareness
- Dashboard pages: `EventListClient` and `EventDetailClient` are locale-aware client wrappers

## Key Architectural Decisions
- **Presigned GET URLs everywhere** — no public bucket; `/api/media` generates per-request signed URLs so images load reliably in production
- **Optimistic UI** — hide/delete in `media-grid.tsx` flip state immediately, API fires in background, revert on error
- **Modal live sync** — modal receives `media.find(m => m.id === selected.id) ?? selected` so optimistic updates reflect immediately
- **SVG-native corner rotation** — html2canvas misrenders CSS `transform: rotate()` on absolute elements; fixed by using `<g transform="rotate(180, cx, cy)">` inside SVG
- **Blob downloads** — all downloads (PDF, photos, videos) use `fetchAndDownload()` which fetches as blob + `application/octet-stream` to force download on mobile
- **Upload expiry** — `max(today, eventDate) + 30 days` so past-dated test events don't expire immediately
- **Slideshow layout** — guest info + nav arrows always visible; only top control bar fades on 3s idle

## Production URLs
- Site: `https://www.anikare.net` (apex `anikare.net` → 308 redirects to www)
- Media CDN: `https://media.anikare.net` (Cloudflare R2 custom domain)
- Legacy: `https://anikare.vercel.app` (still works, not removed from Supabase)

## Completed Work

### Core SaaS (18 tasks)
All 18 tasks from `docs/superpowers/plans/2026-05-20-anikare-saas.md` are complete:
Project setup, types, schema, R2, auth, upload API, PIN/compression, i18n, OAuth, dashboard, wizard, guest flow, media moderation, premium slideshow, PWA, cron cleanup, landing page, Vercel deployment.

### UI Redesign (16 tasks)
All 16 tasks from `docs/superpowers/plans/2026-05-20-ui-redesign.md` are complete:
Design tokens, base UI components, MIME fixes, batch upload hook, PIN/welcome/upload/staging/progress/thank-you screen redesigns, guest flow state machine, dashboard nav, wizard fixes, auth/marketing logo update, PWA icons.

### Post-Launch Fixes & Features
- **Full site localization** — all pages (landing, auth, dashboard) respond to locale switcher
- **Dashboard client wrappers** — `EventListClient` + `EventDetailClient` for locale-aware server component pattern
- **Media staging + thank-you translation** — guest flow fully localized
- **Favicon/PWA icons** — updated to new small-heart logo
- **Desktop event detail layout** — 2-column (stats+table card left, QR right)
- **Mobile header** — sticky logo + locale switcher for dashboard (lg:hidden)
- **Bottom nav** — reduced to 2 items, removed duplicate /dashboard link
- **Wizard UX** — date/guest grid fix (`grid-cols-1 sm:grid-cols-2`), scroll-to-top on step change
- **PDF force-download** — blob with `application/octet-stream` MIME type
- **Blob download for media** — `fetchAndDownload()` for cross-origin fetch-before-download
- **SVG corner fix** — html2canvas rotation bug fixed with SVG-native `<g transform>`
- **R2 presigned GET URLs** — `/api/media` generates signed URLs; `/sunum/[slug]` generates 2hr URLs for slideshow
- **Media grid UX** — correct skeleton count, stagger animation, 30s API cache
- **Optimistic hide/delete** — instant UI response, API in background
- **Modal live sync** — reflects optimistic updates immediately
- **Upload expiry fix** — `max(today, eventDate) + 30 days`
- **Slideshow** — fullscreen support, always-visible guest info + nav arrows, top-bar-only fade
- **Custom domain** — `anikare.net` via Cloudflare Registrar, connected to Vercel via auto-configure
- **R2 CDN domain** — `media.anikare.net` active, CORS updated
- **Supabase OAuth** — site URL + redirect URL updated to `https://www.anikare.net`

## Operational Reference

**Cron test:**
```bash
curl -H "Authorization: Bearer CRON_SECRET_DEGERIN" \
  https://www.anikare.net/api/cron/cleanup
# Beklenen: {"deleted":0,"message":"No expired events"}
```

**Rollback:** Vercel → Deployments → istediğin deploy → ⋯ → Promote to Production

**Env var değişikliği sonrası:** Otomatik deploy tetiklenmez — Deployments → en üstteki → ⋯ → Redeploy

**Yeni domain eklenirse:** Vercel Auto Configure → Supabase redirect URL ekle → R2 CORS'a ekle

## Next Steps (Roadmap)
1. **Payment integration** (see `docs/todo/payment.md`) — Shopier for individual sellers (no company needed), iyzico later when incorporated
2. **Email notifications** (see `docs/todo/email-notifications.md`) — Resend for upload + event creation notifications
3. **Slideshow host control** — `/etkinlik/[slug]/slayt` management page (not yet built)

## Collaboration Rules
- **Commit messages:** `feat: ...` / `fix: ...` only — no Co-Authored-By lines
- **After each session:** Update this CLAUDE.md with completed tasks and any new decisions
- After completing code changes, always run `npm run build` to verify no TS errors before committing
- User is an experienced frontend developer — no need to explain React/Tailwind basics
- For backend/DevOps steps: explain exactly which panel to open, where to click, what to paste
