# Davetiye Sayfası — Design Spec

## Context

Hosts currently share two things with guests: the printed table card (QR → `/e/[slug]` upload flow) and, for Premium, a live slideshow (`/sunum/[slug]`). There's no page a host can share **before** the event that tells guests when and where to actually go — especially relevant for Turkish weddings, which often have multiple sub-events (kına, nikah, düğün) at different venues and times.

This spec adds a public "davetiye" (invitation) info page per event: program(s) with date/time/venue/address, an embedded map, and a "get directions" action — plus the dashboard surface a host uses to enter that data.

The author is building this feature ahead of using it for their own real wedding (2026-09-12), so **the already-printed QR code and event slug must never be affected** by this work, now or when the feature is extended later.

## Goals

- Host can define 0–N "programs" (kına/nikah/düğün/etc.), each with a name, venue name, address, optional Google Maps link, date, and time
- Public page at `/davetiye/[slug]` shows these programs with an embedded map + "Yol Tarifi Al" (get directions) button per program
- Available to **all packages** (eco/standard/premium) — this is a low-marginal-cost, high-utility feature, not a storage/compute-heavy premium perk like the live slideshow
- Host controls visibility via an explicit `invitation_enabled` toggle, independent of event creation
- Page has a dynamic Open Graph image (couple names + date) for nice link previews when shared via WhatsApp etc.
- Data can be entered during the creation wizard **or** edited any time after, via a dedicated dashboard page

## Non-Goals

- No RSVP / guest response collection (static info only)
- No CTA linking to the `/e/[slug]` photo upload flow (different moment in the event lifecycle — invitation is shared pre-wedding, upload happens day-of via table QR)
- No per-template (botanical/floral/minimal) visual variants — one independent page design using the site's general brand language (maroon `#6D1A3E` / cream `#FAF7F2` / Playfair + Inter), decoupled from table card illustrations
- No PIN gating on the public page (informational only, not media)
- No geocoding/Places Autocomplete — host supplies address text + optional pasted Google Maps share link

## Data Model

New nullable columns on `public.events` (additive migration, no impact on existing rows or the `slug`/`id` the QR already encodes):

```sql
ALTER TABLE public.events
  ADD COLUMN invitation_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN programs JSONB DEFAULT '[]'::jsonb;
```

`programs` is an array of:

```ts
interface ProgramItem {
  id: string          // client-generated (nanoid), for list editing/ordering
  name: string          // free text: "Kına Gecesi", "Nikah Töreni", "Düğün"...
  venueName: string
  address: string
  mapsUrl?: string        // pasted Google Maps share link, if host provides one
  date: string              // YYYY-MM-DD
  time?: string              // HH:mm
}
```

Chosen JSONB over a child table (like `media`) because this list is always read/written as one unit together with its parent event (one form, one page) — no independent lifecycle, no need for relational joins or its own RLS policy.

RLS: no new policy needed beyond what already exists — `events_public_read` already allows public read of the `events` row, which now includes `programs`/`invitation_enabled`. Host writes go through the existing `events_host_all` policy.

## Wizard Changes (`components/event/wizard.tsx`)

Since the feature isn't package-gated, it can live directly in the creation wizard instead of waiting for a post-payment state:

- `STEPS` becomes `['Detaylar', 'Program & Konum', 'Paket', 'Tasarım']`
- New step component `components/event/steps/step-programs.tsx`, rendering the shared `ProgramsEditor` (see below)
- `WizardState` gains `programs: ProgramItem[]` (default `[]`)
- `canProceed()` needs no new validation branch for this step index — it's fully optional, an empty list is valid
- `handleSubmit()`'s `.insert({...})` payload gains `programs: state.programs` (`invitation_enabled` defaults to `false` at creation — host turns it on explicitly once they're happy with the content, via the dashboard page)

## Shared `ProgramsEditor` Component

`components/event/programs-editor.tsx` — a controlled component (`items`, `onChange`) used in two places:
1. `StepPrograms` inside the wizard
2. The new dashboard edit page (below)

Renders an add/remove/reorder list of program rows (name, venue name, address, optional maps link, date, time inputs), following the existing wizard input patterns (`components/ui/input.tsx`).

## Dashboard Edit Page

No event-editing surface exists today (`event-detail-client.tsx` is read-only; the wizard only ever `insert`s). New page:

`app/(dashboard)/etkinlik/[slug]/davetiye/page.tsx`
- Same auth + `host_id` ownership check pattern as the existing event detail page
- Renders `invitation_enabled` toggle + `ProgramsEditor`
- Save calls `supabase.from('events').update({ programs, invitation_enabled }).eq('id', event.id)` directly from the client — matching the wizard's existing direct-Supabase-call pattern (no new API route needed for this)

`event-detail-client.tsx` gains a "Davetiye Sayfası" link next to the existing "Canlı Slayt" link — **without** the `package_type === 'premium'` guard the slideshow link has, since this feature is available on every package. Two affordances here: a link to `/etkinlik/[slug]/davetiye` (edit) and, once `invitation_enabled` is true, a link to `/davetiye/[slug]` (public view, opens in new tab, same pattern as the slideshow link).

## Public Page (`app/davetiye/[slug]/page.tsx`)

- If `invitation_enabled` is `false` → `notFound()`
- Hero: couple names via the existing `TitleText` component (reuses the `&` glyph fix already shipped for table cards) + event date, Playfair heading, cream/maroon palette
- If `programs` is empty: hero only, no program section — still a valid, viewable page
- Otherwise, one card per program: name, venue name, address, date/time, embedded map, "Yol Tarifi Al" button
  - Map: Google Maps **Embed API** iframe (`https://www.google.com/maps/embed/v1/place?key=...&q=<url-encoded address>`) — official/stable endpoint, not the unofficial no-key trick, since this is going live for production use indefinitely
  - Get-directions link: uses `mapsUrl` if the host provided one, otherwise falls back to `https://www.google.com/maps/dir/?api=1&destination=<url-encoded address>` — this universal Google Maps URL correctly opens the native Maps app (Apple Maps prompt or Google Maps) on both iOS and Android without any user-agent sniffing
- No PIN gate, no upload CTA (per Non-Goals)

## Open Graph Image

`app/davetiye/[slug]/opengraph-image.tsx` using `next/og`'s `ImageResponse` (1200×630) — fetches the event's title + date server-side, renders a branded card (Playfair heading, maroon/cream). This is a new pattern for the codebase (no prior `next/og` usage found) but is the standard Next.js App Router convention for per-route dynamic OG images.

## i18n

Two separate systems already exist in the codebase, each string set goes to the one matching its audience:
- Dashboard/admin strings (wizard step labels, "Davetiye Ayarları" page copy) → `lib/i18n/site.ts`, same flat per-locale object pattern as existing `liveSlideshowLink`/`statPhotos` keys, added identically across the `tr`/`en`/`de` blocks
- Public-page guest-facing strings (`/davetiye/[slug]`) → `lib/i18n/dictionaries/{tr,en,de}.json`, same async-loaded pattern as the guest upload flow

## External Dependency — Google Maps Embed API

Requires one new env var (e.g. `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`) from Google Cloud Console — likely the same GCP project already used for Supabase's Google OAuth, just enabling the "Maps Embed API" on it and generating a restricted key. This is a manual step only the account owner can do; the implementation plan must spell out the exact panel/click path and exactly what value needs to come back for it to proceed — not leave it as a vague dependency.

## Stability Guarantee

The QR code printed on the table cards encodes `https://www.anikare.net/e/[slug]` — completely independent of everything in this spec. This feature only adds new nullable columns and new routes; it never touches `events.slug` or the `/e/[slug]` route. The one hard rule for the author's own upcoming real event: create it once, never delete/recreate it (which would generate a new slug) — after that, any part of this feature (including fields not yet built) can be safely backfilled onto that same row at any time.

## Testing / Verification

- `npx tsc --noEmit` + `npx eslint` on all touched files (per project convention — avoid `npm run build` while `next dev` is running)
- Manual verification via `claude-in-chrome`: wizard flow with 0 and 2+ programs, dashboard edit page round-trip, public page with `invitation_enabled=false` (expect 404), empty-programs state, populated state with map + directions link, OG image render (fetch the route directly)
- DB verification via service-role queries (same approach used earlier this session) to confirm `programs`/`invitation_enabled` persist correctly and existing events are unaffected by the migration
