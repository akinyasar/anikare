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
- Use `PageProps<'/path/[param]'>` helper type for typed page props
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

**Completed tasks:**
- Task 1: Dependencies + env template + .gitignore ✅
- Task 2: TypeScript types ✅
- Task 3: Supabase schema SQL + panel setup guide ✅
- Task 4: Cloudflare R2 setup (manual panel steps — in progress)

## Collaboration Rules
- **Commit messages:** `feat: ...` / `fix: ...` only — no Co-Authored-By lines
- **After each session:** Update this CLAUDE.md with completed tasks and any new decisions
- After completing code changes, always run `npm run build` to verify no TS errors before committing
- User is an experienced frontend developer — no need to explain React/Tailwind basics
- For backend/DevOps steps: explain exactly which panel to open, where to click, what to paste
