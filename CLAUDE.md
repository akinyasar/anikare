@AGENTS.md

# AnıKare — Project Context for Claude

## What This Project Is
A QR-based digital memory/photo sharing SaaS for weddings and events.
- Guests scan a QR code at their table → upload photos/videos directly from browser (no app needed)
- Hosts manage events, moderate media, download QR cards, and view a live slideshow
- Brand name: **AnıKare** (Turkish for "memory frame")

## Tech Stack
- **Frontend:** Next.js 16.2.6 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend/Auth:** Supabase (PostgreSQL + Google OAuth + Realtime)
- **Storage:** Cloudflare R2 (S3-compatible, zero egress fees)
- **Deployment:** Vercel (Hobby plan — 1 cron job free)

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
    etkinlik/[slug]/slayt/  # Slideshow management
  e/[slug]/             # Guest upload flow (QR target, public)
  sunum/[slug]/         # Live slideshow display (public, premium only)
  api/
    upload/presign/     # Generate R2 presigned URL
    upload/confirm/     # Record upload in DB (uses service_role)
    pin/verify/         # Verify guest PIN → set httpOnly cookie
    media/              # List + moderate media
    cron/cleanup/       # Nightly expired media cleanup
lib/
  supabase/client.ts    # Browser Supabase client
  supabase/server.ts    # Server client + service client
  r2/client.ts          # S3Client for Cloudflare R2 (server-only)
  media/compress.ts     # browser-image-compression wrapper
  i18n/                 # TR/EN/DE dictionaries + locale detection
  slug.ts               # Turkish slug generator (ş→s, ç→c etc.) + nanoid
  pin.ts                # bcrypt hash + compare for PIN codes
  packages.ts           # Package limits (eco/standard/premium)
types/index.ts          # All TypeScript interfaces
proxy.ts                # Auth guard (Next.js 16 proxy, not middleware)
supabase/schema.sql     # Full DB schema — run in Supabase SQL Editor
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
- Presigned URL flow: client → `/api/upload/presign` → R2 (PUT directly) → `/api/upload/confirm`

## i18n
- Auto-detects browser language (TR/EN/DE), defaults to TR
- Dictionary files: `lib/i18n/dictionaries/{tr,en,de}.json`
- Client-side only (guest pages) — no URL-based routing

## Implementation Plan
Full plan at: `docs/superpowers/plans/2026-05-20-anikare-saas.md`
18 tasks total — progress tracked via TodoWrite in each session.

**Completed tasks (all 18):**
- Task 1: Dependencies + env template + .gitignore ✅
- Task 2: TypeScript types (`types/index.ts`) ✅
- Task 3: Supabase schema SQL + panel setup ✅
- Task 4: Cloudflare R2 bucket + CORS + lifecycle rule ✅
- Task 5: Supabase clients (browser + server + service) + `proxy.ts` auth guard ✅
- Task 6: R2 client + `/api/upload/presign` + `/api/upload/confirm` ✅
- Task 7: PIN hash/verify (`lib/pin.ts`) + `/api/pin/verify` + `lib/media/compress.ts` ✅
- Task 8: Turkish slug generator (`lib/slug.ts`) + TR/EN/DE i18n dictionaries ✅
- Task 9: Google OAuth login page + `/auth/callback` route ✅
- Task 10: Dashboard layout + sidebar + events list page ✅
- Task 11: 3-step event creation wizard + live table card preview ✅
- Task 12: Guest flow (PIN entry, welcome screen, upload bar, thank-you screen) ✅
- Task 13: Event dashboard + media grid + moderation (hide/delete) + QR download ✅
- Task 14: Premium live slideshow (`/sunum/[slug]`) with Supabase realtime ✅
- Task 15: PWA manifest + next.config image domains ✅
- Task 16: Nightly cleanup cron (`/api/cron/cleanup`) + `vercel.json` ✅
- Task 17: Landing page (hero + features + pricing) ✅
- Task 18: Vercel deployment guide (manual panel steps) ✅

**Known Issues / Notes:**
- `public/icons/` contains a placeholder — add real 192×192 and 512×512 PNG icons before deploying
- Slideshow management page (`/etkinlik/[slug]/slayt`) is listed in plan but not yet implemented (host control UI for slideshow)

## Collaboration Rules
- **Commit messages:** `feat: ...` / `fix: ...` only — no Co-Authored-By lines
- **After each session:** Update this CLAUDE.md with completed tasks and any new decisions
- After completing code changes, always run `npm run build` to verify no TS errors before committing
- User is an experienced frontend developer — no need to explain React/Tailwind basics
- For backend/DevOps steps: explain exactly which panel to open, where to click, what to paste
