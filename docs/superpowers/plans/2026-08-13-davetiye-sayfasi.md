# Davetiye Sayfası Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every AnıKare host a shareable, public per-event invitation page at `/davetiye/[slug]` listing 0–N programs (kına/nikah/düğün) with date, time, venue, address, an embedded Google map and a "Yol Tarifi Al" action — editable both in the creation wizard and from a dedicated dashboard page.

**Architecture:** Two new nullable columns on `public.events` (`invitation_enabled BOOLEAN`, `programs JSONB`) hold all state — no child table, no new RLS policy (existing `events_public_read` / `events_host_all` already cover reads and writes). A single shared controlled client component `ProgramsEditor` (`items` / `onChange`) is rendered in both the wizard's new step 2 and the new dashboard settings page, which writes back with a direct `supabase.from('events').update(...)` call, matching the wizard's existing direct-Supabase pattern. The public page is a plain server component mirroring `app/sunum/[slug]/page.tsx`'s fetch-then-`notFound()` shape (gated on `invitation_enabled`, **not** on package), plus a sibling `opengraph-image.tsx` using `next/og`'s `ImageResponse`.

**Tech Stack:** Next.js 16.2.6 App Router (async route params, `next/og` file convention), React 19, TypeScript, Tailwind CSS v4, Supabase Postgres (JSONB + RLS), Google Maps Embed API (iframe), `nanoid`, existing `lib/i18n/site.ts` + `lib/i18n/dictionaries/*.json` dual i18n systems.

## Global Constraints

- **Never touch `events.slug`, the `slug` generator, or the `/e/[slug]` route.** The QR codes on the author's already-printed table cards encode `https://www.anikare.net/e/[slug]`. This feature only *adds* nullable columns and *adds* new routes. Do not delete/recreate any event row.
- **The migration must be additive-only.** No `DROP`, no `ALTER ... TYPE`, no `NOT NULL` on new columns, no changes to existing columns, triggers, or policies.
- **No RSVP / guest response collection.** The page is static information only.
- **No CTA linking to `/e/[slug]`** from the invitation page (different moment in the event lifecycle).
- **No PIN gating** on `/davetiye/[slug]` (informational only, not media).
- **Available to all packages** (`eco` / `standard` / `premium`). Do **not** add a `package_type === 'premium'` guard anywhere in this feature.
- **No per-template visual variants.** One page design using site brand language: maroon `#6D1A3E`, brand-light `#f5e6ed`, cream `#FAF7F2`, muted `#9b4a6a`, text `#1a1a1a` / `#7a6a5a` / `#9ca3af`, borders `#e8ddd5`, Playfair (`var(--font-playfair)`) for headings, Inter for body.
- **No geocoding / Places Autocomplete.** Host types address text and optionally pastes a Google Maps share link.
- **Google Maps Embed API only** — the official keyed `https://www.google.com/maps/embed/v1/place?key=...&q=...` endpoint. Never the unofficial key-less `output=embed` trick.
- **Next.js 16 rules** (from CLAUDE.md): route params are async (`const { slug } = await params`); `PageProps` is NOT exported from `next` — use inline `{ params: Promise<{ slug: string }> }`; `proxy.ts` not `middleware.ts`; Tailwind v4 has no config file.
- **Verification command is `npx tsc --noEmit` + `npx eslint <files>`, never `npm run build`** — a `next dev` server may be running and `next build` will fight it over `.next/`.
- **This repo has no automated test suite** (`package.json` scripts are only `dev`/`build`/`start`/`lint`; there is no `tests/`, `test/` or `__tests__/` directory, and no test runner in dependencies). "Testable deliverable" here means: `tsc` clean, `eslint` clean, plus the per-task manual browser checklist. **Do not invent unit tests or add a test framework.**
- **This repo has no automated migration runner.** `supabase/` contains only `schema.sql`; there is no Supabase CLI dependency and no `supabase/migrations/` folder. CLAUDE.md states: "Schema file: `supabase/schema.sql` — run once in Supabase SQL Editor." SQL changes must be hand-run by the project owner in the Supabase dashboard.
- **Commit messages are single-line conventional commits** (`feat: ...` / `fix: ...` / `docs: ...`), matching `git log`. **Do not add `Co-Authored-By:` or any Claude/agent trailer.**
- **Public repo — no hardcoded secrets.** All keys go through `.env.local` (gitignored) + `.env.example` placeholders + Vercel env vars.

---

### Task 1: Database Migration — `invitation_enabled` + `programs`

**Files:**
- Modify: `supabase/schema.sql` (append at end of file, after line 176 `ON public.media FOR SELECT USING (is_visible = TRUE);`)

**Interfaces:**
- Consumes: nothing.
- Produces: `public.events.invitation_enabled BOOLEAN DEFAULT FALSE`, `public.events.programs JSONB DEFAULT '[]'::jsonb`.

- [ ] **Step 1: Append the additive migration block to the end of `supabase/schema.sql`**

```sql

-- ============================================================
-- DAVETİYE SAYFASI (additive — 2026-08-13)
-- Mevcut satırlara ve events.slug'a dokunmaz.
-- Yeni kurulumda schema.sql'in sonunda çalışır; mevcut
-- veritabanında bu blok tek başına migration olarak çalıştırılır.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS invitation_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS programs           JSONB   DEFAULT '[]'::jsonb;

-- RLS: yeni policy gerekmez.
--   okuma  → mevcut "events_public_read"  (USING TRUE)
--   yazma  → mevcut "events_host_all"     (auth.uid() = host_id)
-- Trigger: mevcut "events_updated_at" bu kolonların UPDATE'inde de çalışır.
```

- [ ] **Step 2: Verify the file is syntactically consistent**

```bash
tail -20 supabase/schema.sql
```

Success: the block above is the last thing in the file, and `grep -c "invitation_enabled" supabase/schema.sql` returns `1`.

- [ ] **Step 3: STOP — this step requires the project owner (Supabase SQL Editor)**

  There is no migration runner in this repo. Ask the project owner to do this and confirm before continuing:

  1. Open <https://supabase.com/dashboard> and sign in.
  2. Select the **AnıKare** project.
  3. In the left sidebar click **SQL Editor**, then **+ New query**.
  4. Paste exactly the two SQL statements below (the `ALTER TABLE` only — comments optional):

     ```sql
     ALTER TABLE public.events
       ADD COLUMN IF NOT EXISTS invitation_enabled BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS programs           JSONB   DEFAULT '[]'::jsonb;
     ```
  5. Click **Run** (or press ⌘+Enter). Expect `Success. No rows returned`.
  6. Verify with a second query:

     ```sql
     SELECT slug, invitation_enabled, programs FROM public.events ORDER BY created_at DESC LIMIT 5;
     ```

     Expect every existing row to show `invitation_enabled = false` and `programs = []`, and every `slug` to be **unchanged**.

  Do not proceed to Task 5 or Task 7 until the owner confirms step 6 output.

- [ ] **Step 4: Commit**
```bash
git add supabase/schema.sql
git commit -m "feat: add invitation_enabled and programs columns to events"
```

---

### Task 2: TypeScript Types — `ProgramItem`, `Event` fields, `Dictionary.invitation`

**Files:**
- Modify: `types/index.ts:14-36` (add two fields to `Event`), `types/index.ts:36` (insert `ProgramItem` above `PublicEvent`), `types/index.ts:107-111` (add `invitation` block to `Dictionary`)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface ProgramItem { id: string; name: string; venueName: string; address: string; mapsUrl?: string; date: string; time?: string }`
  - `Event.invitation_enabled: boolean`, `Event.programs: ProgramItem[]`
  - `Dictionary['invitation']: { eyebrow: string; programTitle: string; getDirections: string; mapUnavailable: string; seeYouThere: string }`

- [ ] **Step 1: Add `invitation_enabled` and `programs` to the `Event` interface**

  In `types/index.ts`, inside `export interface Event { ... }`, insert these two lines immediately after `  is_upload_active: boolean;` (currently line 29):

```ts
  invitation_enabled: boolean;
  programs: ProgramItem[];
```

- [ ] **Step 2: Add the `ProgramItem` interface immediately after the closing `}` of `interface Event` and before the `// pin_code_hash asla client'a gönderilmez` comment**

```ts
// Davetiye sayfası programları — events.programs JSONB kolonunda saklanır.
// Her zaman parent event ile birlikte tek parça okunup yazılır (child tablo değil).
export interface ProgramItem {
  id: string;          // nanoid(8) — liste düzenleme/sıralama için client tarafında üretilir
  name: string;        // "Kına Gecesi", "Nikah Töreni", "Düğün"...
  venueName: string;
  address: string;
  mapsUrl?: string;    // hostun yapıştırdığı Google Maps paylaşım linki
  date: string;        // YYYY-MM-DD
  time?: string;       // HH:mm
}
```

- [ ] **Step 3: Add the `invitation` block to the `Dictionary` interface**

  In `types/index.ts`, inside `export interface Dictionary { ... }`, insert this block immediately after the closing `};` of the `errors: { ... }` block (currently line 111), i.e. as the last member of the interface:

```ts
  invitation: {
    eyebrow: string;
    programTitle: string;
    getDirections: string;
    mapUnavailable: string;
    seeYouThere: string;
  };
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

Success: exits with no output (exit code 0). `Event` gaining required fields is safe — the untyped Supabase client returns `any`, and the only consumer of `PublicEvent` (`components/guest/guest-flow.tsx`) never reads the new fields.

```bash
npx eslint types/index.ts
```

Success: no output.

- [ ] **Step 5: Commit**
```bash
git add types/index.ts
git commit -m "feat: add ProgramItem type and invitation fields to Event and Dictionary"
```

---

### Task 3: i18n Strings — dashboard keys in `site.ts`, guest keys in dictionaries

**Files:**
- Modify: `lib/i18n/site.ts:118` (tr, after `uploadedContent`), `lib/i18n/site.ts:267` (en), `lib/i18n/site.ts:409` (de)
- Modify: `lib/i18n/dictionaries/tr.json`, `lib/i18n/dictionaries/en.json`, `lib/i18n/dictionaries/de.json`
- Modify: `lib/i18n/index.ts` (add `detectLocaleFromAcceptLanguage`)

**Interfaces:**
- Consumes: `Dictionary['invitation']` from Task 2.
- Produces:
  - New `SiteKey`s: `invitationCardTitle`, `invitationCardDesc`, `invitationEditLink`, `invitationPublicLink`, `invitationSettingsTitle`, `invitationSettingsDesc`, `invitationEnabledLabel`, `invitationEnabledHint`, `invitationSave`, `invitationSaving`, `invitationSaved`, `invitationSaveError`, `invitationBackToEvent`, `programsTitle`, `programsDesc`, `programAdd`, `programRemove`, `programMoveUp`, `programMoveDown`, `programNameLabel`, `programNamePlaceholder`, `programVenueLabel`, `programVenuePlaceholder`, `programAddressLabel`, `programAddressPlaceholder`, `programMapsUrlLabel`, `programMapsUrlPlaceholder`, `programDateLabel`, `programTimeLabel`, `programEmpty`, `programUntitled`
  - `detectLocaleFromAcceptLanguage(acceptLang: string): Locale` exported from `lib/i18n/index.ts`
  - `dict.invitation.{eyebrow,programTitle,getDirections,mapUnavailable,seeYouThere}` in all three JSON dictionaries

- [ ] **Step 1: Insert the Turkish block into `lib/i18n/site.ts` immediately after line 118 (`uploadedContent: 'Yüklenen İçerikler',`)**

```ts
    // Davetiye sayfası — dashboard
    invitationCardTitle: 'Davetiye Sayfası',
    invitationCardDesc: 'Misafirlerinize program, mekan ve yol tarifi bilgilerini tek bağlantıda paylaşın.',
    invitationEditLink: '📍 Davetiyeyi Düzenle →',
    invitationPublicLink: '🔗 Davetiye Sayfasını Aç →',
    invitationSettingsTitle: 'Davetiye Ayarları',
    invitationSettingsDesc: 'Programları ekleyin, hazır olduğunuzda sayfayı yayına alın.',
    invitationEnabledLabel: 'Davetiye Sayfasını Yayınla',
    invitationEnabledHint: 'Kapalıyken bağlantı 404 döner — içeriği hazırlarken kapalı tutabilirsiniz.',
    invitationSave: 'Kaydet',
    invitationSaving: 'Kaydediliyor...',
    invitationSaved: 'Kaydedildi ✓',
    invitationSaveError: 'Kaydedilemedi, tekrar deneyin',
    invitationBackToEvent: '← Etkinliğe Dön',
    // Program editörü (sihirbaz + dashboard ortak)
    programsTitle: 'Program & Konum',
    programsDesc: 'Kına, nikah, düğün... Her biri için tarih, saat ve mekan ekleyin. Bu adım isteğe bağlıdır.',
    programAdd: '+ Program Ekle',
    programRemove: 'Kaldır',
    programMoveUp: 'Yukarı taşı',
    programMoveDown: 'Aşağı taşı',
    programNameLabel: 'Program Adı',
    programNamePlaceholder: 'Örn: Nikah Töreni',
    programVenueLabel: 'Mekan Adı',
    programVenuePlaceholder: 'Örn: Sapanca Garden',
    programAddressLabel: 'Adres',
    programAddressPlaceholder: 'Açık adres — haritada bu adres gösterilir',
    programMapsUrlLabel: 'Google Maps Bağlantısı (isteğe bağlı)',
    programMapsUrlPlaceholder: 'https://maps.app.goo.gl/...',
    programDateLabel: 'Tarih',
    programTimeLabel: 'Saat',
    programEmpty: 'Henüz program eklenmedi.',
    programUntitled: 'Program',
```

- [ ] **Step 2: Insert the English block into `lib/i18n/site.ts` immediately after line 267 (`uploadedContent: 'Uploaded Content',`)**

```ts
    invitationCardTitle: 'Invitation Page',
    invitationCardDesc: 'Share the programme, venue and directions with your guests in one link.',
    invitationEditLink: '📍 Edit Invitation →',
    invitationPublicLink: '🔗 Open Invitation Page →',
    invitationSettingsTitle: 'Invitation Settings',
    invitationSettingsDesc: 'Add your programmes, then publish the page when you are ready.',
    invitationEnabledLabel: 'Publish Invitation Page',
    invitationEnabledHint: 'While off, the link returns 404 — keep it off while preparing the content.',
    invitationSave: 'Save',
    invitationSaving: 'Saving...',
    invitationSaved: 'Saved ✓',
    invitationSaveError: 'Could not save, please try again',
    invitationBackToEvent: '← Back to Event',
    programsTitle: 'Programme & Venue',
    programsDesc: 'Henna night, ceremony, reception... Add a date, time and venue for each. This step is optional.',
    programAdd: '+ Add Programme',
    programRemove: 'Remove',
    programMoveUp: 'Move up',
    programMoveDown: 'Move down',
    programNameLabel: 'Programme Name',
    programNamePlaceholder: 'E.g. Wedding Ceremony',
    programVenueLabel: 'Venue Name',
    programVenuePlaceholder: 'E.g. Sapanca Garden',
    programAddressLabel: 'Address',
    programAddressPlaceholder: 'Full address — this is what the map will show',
    programMapsUrlLabel: 'Google Maps Link (optional)',
    programMapsUrlPlaceholder: 'https://maps.app.goo.gl/...',
    programDateLabel: 'Date',
    programTimeLabel: 'Time',
    programEmpty: 'No programmes added yet.',
    programUntitled: 'Programme',
```

- [ ] **Step 3: Insert the German block into `lib/i18n/site.ts` immediately after line 409 (`uploadedContent: 'Hochgeladene Inhalte',`)**

```ts
    invitationCardTitle: 'Einladungsseite',
    invitationCardDesc: 'Teilen Sie Programm, Veranstaltungsort und Wegbeschreibung in einem Link.',
    invitationEditLink: '📍 Einladung bearbeiten →',
    invitationPublicLink: '🔗 Einladungsseite öffnen →',
    invitationSettingsTitle: 'Einladungseinstellungen',
    invitationSettingsDesc: 'Programme hinzufügen und die Seite veröffentlichen, wenn Sie bereit sind.',
    invitationEnabledLabel: 'Einladungsseite veröffentlichen',
    invitationEnabledHint: 'Solange deaktiviert, liefert der Link 404 — ideal während der Vorbereitung.',
    invitationSave: 'Speichern',
    invitationSaving: 'Wird gespeichert...',
    invitationSaved: 'Gespeichert ✓',
    invitationSaveError: 'Speichern fehlgeschlagen, bitte erneut versuchen',
    invitationBackToEvent: '← Zurück zur Veranstaltung',
    programsTitle: 'Programm & Ort',
    programsDesc: 'Henna-Abend, Trauung, Feier... Fügen Sie je Datum, Uhrzeit und Ort hinzu. Dieser Schritt ist optional.',
    programAdd: '+ Programm hinzufügen',
    programRemove: 'Entfernen',
    programMoveUp: 'Nach oben',
    programMoveDown: 'Nach unten',
    programNameLabel: 'Programmname',
    programNamePlaceholder: 'z.B. Trauung',
    programVenueLabel: 'Name des Veranstaltungsortes',
    programVenuePlaceholder: 'z.B. Sapanca Garden',
    programAddressLabel: 'Adresse',
    programAddressPlaceholder: 'Vollständige Adresse — diese wird auf der Karte angezeigt',
    programMapsUrlLabel: 'Google-Maps-Link (optional)',
    programMapsUrlPlaceholder: 'https://maps.app.goo.gl/...',
    programDateLabel: 'Datum',
    programTimeLabel: 'Uhrzeit',
    programEmpty: 'Noch keine Programme hinzugefügt.',
    programUntitled: 'Programm',
```

- [ ] **Step 4: Add the `invitation` object to `lib/i18n/dictionaries/tr.json`** — insert as a new top-level key after the closing `}` of `"errors"` (remember to add the comma after `"errors": { ... }`):

```json
  "invitation": {
    "eyebrow": "DAVETİYE",
    "programTitle": "Program",
    "getDirections": "Yol Tarifi Al",
    "mapUnavailable": "Harita şu anda gösterilemiyor",
    "seeYouThere": "Sizi aramızda görmekten mutluluk duyarız 🤍"
  }
```

- [ ] **Step 5: Add the `invitation` object to `lib/i18n/dictionaries/en.json`** (same position):

```json
  "invitation": {
    "eyebrow": "INVITATION",
    "programTitle": "Programme",
    "getDirections": "Get Directions",
    "mapUnavailable": "The map cannot be shown right now",
    "seeYouThere": "We would love to have you with us 🤍"
  }
```

- [ ] **Step 6: Add the `invitation` object to `lib/i18n/dictionaries/de.json`** (same position):

```json
  "invitation": {
    "eyebrow": "EINLADUNG",
    "programTitle": "Programm",
    "getDirections": "Route berechnen",
    "mapUnavailable": "Die Karte kann derzeit nicht angezeigt werden",
    "seeYouThere": "Wir freuen uns auf Sie 🤍"
  }
```

- [ ] **Step 7: Add `detectLocaleFromAcceptLanguage` to `lib/i18n/index.ts`** — append at the end of the file:

```ts
// Sunucu tarafı locale tespiti — Accept-Language header'ından.
// (app/e/[slug]/page.tsx içindeki yerel kopyanın paylaşılabilir hâli;
//  o dosya bilerek değiştirilmiyor.)
export function detectLocaleFromAcceptLanguage(acceptLang: string): Locale {
  const primary = acceptLang.split(',')[0].split(';')[0].trim().split('-')[0].toLowerCase()
  return SUPPORTED_LOCALES.includes(primary as Locale) ? (primary as Locale) : DEFAULT_LOCALE
}
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit && npx eslint lib/i18n/site.ts lib/i18n/index.ts && node -e "['tr','en','de'].forEach(l=>{const d=require('./lib/i18n/dictionaries/'+l+'.json');const k=Object.keys(d.invitation);if(k.length!==5)throw new Error(l+' invitation keys: '+k);console.log(l,'ok',k.join(','))})"
```

Success: `tsc` and `eslint` produce no output, and the node one-liner prints `tr ok ...`, `en ok ...`, `de ok ...` (5 keys each). Note the `Dictionary` interface added in Task 2 is only applied via a type assertion in `getDictionary`, so a mismatch would not be caught by `tsc` — this JSON check is the real guard.

- [ ] **Step 9: Commit**
```bash
git add lib/i18n/site.ts lib/i18n/index.ts lib/i18n/dictionaries/tr.json lib/i18n/dictionaries/en.json lib/i18n/dictionaries/de.json
git commit -m "feat: add invitation page i18n strings for tr/en/de"
```

---

### Task 4: `lib/programs.ts` + shared `ProgramsEditor` + wizard step integration

**Files:**
- Create: `lib/programs.ts`
- Create: `components/event/programs-editor.tsx`
- Create: `components/event/steps/step-programs.tsx`
- Modify: `components/event/wizard.tsx:1-40` (imports, `WizardState`, `INITIAL_STATE`, `STEPS`), `components/event/wizard.tsx:56-66` (`canProceed`), `components/event/wizard.tsx:85-105` (`.insert()` payload), `components/event/wizard.tsx:156-158` (step render), `components/event/wizard.tsx:201` (preview visibility)

**Interfaces:**
- Consumes: `ProgramItem` from Task 2; `programsTitle`/`programAdd`/… `SiteKey`s from Task 3.
- Produces:
  - `lib/programs.ts`: `createProgramItem(): ProgramItem`, `sanitizePrograms(items: ProgramItem[]): ProgramItem[]`, `normalizePrograms(value: unknown): ProgramItem[]`, `directionsUrl(item: ProgramItem): string | null`, `mapEmbedUrl(item: ProgramItem, apiKey: string | undefined): string | null`
  - `components/event/programs-editor.tsx`: default export `ProgramsEditor` with props `{ items: ProgramItem[]; onChange: (items: ProgramItem[]) => void }`
  - `components/event/steps/step-programs.tsx`: default export `StepPrograms` with props `{ state: { programs: ProgramItem[] }; update: (partial: { programs: ProgramItem[] }) => void }`
  - `WizardState.programs: ProgramItem[]`

- [ ] **Step 1: Create `lib/programs.ts`**

```ts
import { nanoid } from 'nanoid'
import type { ProgramItem } from '@/types'

export function createProgramItem(): ProgramItem {
  return {
    id: nanoid(8),
    name: '',
    venueName: '',
    address: '',
    mapsUrl: '',
    date: '',
    time: '',
  }
}

// Kaydetmeden önce: tamamen boş satırları at, string'leri trim'le,
// boş opsiyonelleri undefined yap (JSON.stringify bunları tamamen düşürür).
export function sanitizePrograms(items: ProgramItem[]): ProgramItem[] {
  return items
    .filter((p) => p.name.trim() || p.venueName.trim() || p.address.trim())
    .map((p) => ({
      id: p.id,
      name: p.name.trim(),
      venueName: p.venueName.trim(),
      address: p.address.trim(),
      mapsUrl: p.mapsUrl?.trim() ? p.mapsUrl.trim() : undefined,
      date: p.date,
      time: p.time?.trim() ? p.time.trim() : undefined,
    }))
}

// JSONB kolonundan okurken: gelen değer her şey olabilir (null, obje, eski şema).
// Her zaman güvenli bir ProgramItem[] döndür.
export function normalizePrograms(value: unknown): ProgramItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((raw): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null)
    .map((raw) => ({
      id: typeof raw.id === 'string' && raw.id ? raw.id : nanoid(8),
      name: typeof raw.name === 'string' ? raw.name : '',
      venueName: typeof raw.venueName === 'string' ? raw.venueName : '',
      address: typeof raw.address === 'string' ? raw.address : '',
      mapsUrl: typeof raw.mapsUrl === 'string' && raw.mapsUrl ? raw.mapsUrl : undefined,
      date: typeof raw.date === 'string' ? raw.date : '',
      time: typeof raw.time === 'string' && raw.time ? raw.time : undefined,
    }))
}

// "Yol Tarifi Al" — host bir Maps linki yapıştırdıysa onu kullan, yoksa
// evrensel Google Maps URL'i üret. Bu URL iOS'ta Apple/Google Maps,
// Android'de Google Maps uygulamasını user-agent kontrolü olmadan açar.
export function directionsUrl(item: ProgramItem): string | null {
  const pasted = item.mapsUrl?.trim()
  if (pasted) return pasted
  const address = item.address.trim()
  if (!address) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

// Google Maps Embed API (resmî, key'li endpoint).
// Key yoksa veya adres boşsa null döner — çağıran taraf fallback gösterir.
export function mapEmbedUrl(item: ProgramItem, apiKey: string | undefined): string | null {
  const address = item.address.trim()
  if (!apiKey || !address) return null
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(address)}`
}
```

- [ ] **Step 2: Create `components/event/programs-editor.tsx`**

  Note: `Input` derives its `id` from `label` when no `id` is given, which would produce duplicate DOM ids across rows — every `Input` below therefore passes an explicit `id`.

```tsx
'use client'

import Input from '@/components/ui/input'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import { createProgramItem } from '@/lib/programs'
import type { ProgramItem } from '@/types'

interface Props {
  items: ProgramItem[]
  onChange: (items: ProgramItem[]) => void
}

export default function ProgramsEditor({ items, onChange }: Props) {
  const { locale } = useLocale()

  function updateItem(id: string, partial: Partial<ProgramItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#374151]">{t(locale, 'programsTitle')}</p>
        <p className="text-xs text-[#9ca3af] mt-0.5">{t(locale, 'programsDesc')}</p>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[#9ca3af] bg-white border border-dashed border-[#e8ddd5] rounded-2xl px-4 py-8 text-center">
          {t(locale, 'programEmpty')}
        </p>
      )}

      {items.map((item, index) => (
        <div key={item.id} className="bg-white border border-[#e8ddd5] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#6D1A3E] bg-[#f5e6ed] px-2.5 py-1 rounded-full truncate">
              {item.name.trim() || `${t(locale, 'programUntitled')} ${index + 1}`}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label={t(locale, 'programMoveUp')}
                title={t(locale, 'programMoveUp')}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="w-7 h-7 rounded-full border border-[#e8ddd5] text-[#7a6a5a] text-xs hover:bg-[#F0EBE3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={t(locale, 'programMoveDown')}
                title={t(locale, 'programMoveDown')}
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="w-7 h-7 rounded-full border border-[#e8ddd5] text-[#7a6a5a] text-xs hover:bg-[#F0EBE3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-[#9ca3af] hover:text-red-500 px-2 py-1 rounded-full transition-colors"
              >
                {t(locale, 'programRemove')}
              </button>
            </div>
          </div>

          <Input
            id={`program-${item.id}-name`}
            label={t(locale, 'programNameLabel')}
            placeholder={t(locale, 'programNamePlaceholder')}
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
          />

          <Input
            id={`program-${item.id}-venue`}
            label={t(locale, 'programVenueLabel')}
            placeholder={t(locale, 'programVenuePlaceholder')}
            value={item.venueName}
            onChange={(e) => updateItem(item.id, { venueName: e.target.value })}
          />

          <Input
            id={`program-${item.id}-address`}
            label={t(locale, 'programAddressLabel')}
            placeholder={t(locale, 'programAddressPlaceholder')}
            value={item.address}
            onChange={(e) => updateItem(item.id, { address: e.target.value })}
          />

          <Input
            id={`program-${item.id}-maps-url`}
            label={t(locale, 'programMapsUrlLabel')}
            placeholder={t(locale, 'programMapsUrlPlaceholder')}
            type="url"
            value={item.mapsUrl ?? ''}
            onChange={(e) => updateItem(item.id, { mapsUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id={`program-${item.id}-date`}
              label={t(locale, 'programDateLabel')}
              type="date"
              value={item.date}
              onChange={(e) => updateItem(item.id, { date: e.target.value })}
            />
            <Input
              id={`program-${item.id}-time`}
              label={t(locale, 'programTimeLabel')}
              type="time"
              value={item.time ?? ''}
              onChange={(e) => updateItem(item.id, { time: e.target.value })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, createProgramItem()])}
        className="w-full border-2 border-dashed border-[#e8ddd5] rounded-2xl py-3 text-sm font-medium text-[#6D1A3E] hover:border-[#6D1A3E]/40 hover:bg-[#f5e6ed] transition-colors"
      >
        {t(locale, 'programAdd')}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/event/steps/step-programs.tsx`**

```tsx
'use client'

import ProgramsEditor from '@/components/event/programs-editor'
import type { ProgramItem } from '@/types'

interface StepProgramsState {
  programs: ProgramItem[]
}

interface Props {
  state: StepProgramsState
  update: (partial: Partial<StepProgramsState>) => void
}

export default function StepPrograms({ state, update }: Props) {
  return (
    <div className="space-y-5">
      <ProgramsEditor
        items={state.programs}
        onChange={(programs) => update({ programs })}
      />
    </div>
  )
}
```

- [ ] **Step 4: Wire the new step into `components/event/wizard.tsx`**

  4a. Add imports — after the existing `import StepDetails from './steps/step-details'` line, insert:

```tsx
import StepPrograms from './steps/step-programs'
```

  and change the `types` import line to:

```tsx
import type { EventType, PackageType, ProgramItem } from '@/types'
```

  and add to the `lib` imports (next to `import { hashPin } from '@/lib/pin'`):

```tsx
import { sanitizePrograms } from '@/lib/programs'
```

  4b. Add `programs` to `WizardState` — insert after `  pinCode: string`:

```tsx
  programs: ProgramItem[]
```

  4c. Add the default to `INITIAL_STATE` — insert after `  pinCode: '',`:

```tsx
  programs: [],
```

  4d. Replace the `STEPS` constant (line 38):

```tsx
const STEPS = ['Detaylar', 'Program & Konum', 'Paket', 'Tasarım']
```

  4e. Update `canProceed()` — the template step moved from index 2 to index 3. Replace the whole function body's second branch so the function reads:

```tsx
  function canProceed() {
    if (step === 0) {
      if (!state.title.trim()) return false
      if (state.pinEnabled && state.pinCode.length !== 4) return false
      return true
    }
    // step 1 (Program & Konum) tamamen isteğe bağlı — ek doğrulama yok
    if (step === 3) {
      return ['minimal', 'floral', 'botanical'].includes(state.templateId)
    }
    return true
  }
```

  4f. Add `programs` to the `.insert({...})` payload — insert immediately after the `template_id: state.templateId,` line:

```tsx
          programs: sanitizePrograms(state.programs),
```

  (Do **not** add `invitation_enabled` — it defaults to `FALSE` in the DB; the host enables it explicitly from the dashboard page.)

  4g. Replace the three step-render lines (currently 156–158) with four:

```tsx
        {step === 0 && <StepDetails state={state} update={update} />}
        {step === 1 && <StepPrograms state={state} update={update} />}
        {step === 2 && <StepPackage state={state} update={update} />}
        {step === 3 && <StepTemplate state={state} update={update} />}
```

  4h. Update the live-preview visibility line (currently 201) — the template step is now index 3:

```tsx
      <div className={`hidden lg:block w-72 sticky top-6 space-y-4 ${step === 3 ? 'invisible' : ''}`}>
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npx eslint lib/programs.ts components/event/programs-editor.tsx components/event/steps/step-programs.tsx components/event/wizard.tsx
```

Success: both commands produce no output.

  Manual browser check (dev server on `http://localhost:3000`, logged in):
  1. Open `http://localhost:3000/etkinlik/yeni`. The progress bar shows **4** labels: `Detaylar · Program & Konum · Paket · Tasarım`.
  2. Type a title (e.g. `Test & Deneme`) → **Devam** is enabled → click it.
  3. Step 2 shows "Program & Konum", the dashed empty-state box, and a `+ Program Ekle` button. **Devam** is enabled with zero programs (optional step).
  4. Click `+ Program Ekle` twice. Two cards appear; fill the first (`Nikah Töreni` / `Sapanca Garden` / a real address / date / time). The chip at the top of the card updates to `Nikah Töreni` as you type.
  5. Click `↓` on the first card — the two cards swap. Click `↑` — they swap back. `↑` on the first card and `↓` on the last are disabled (dimmed).
  6. Click `Kaldır` on the second card — it disappears, the first is unaffected.
  7. Continue to **Paket** (step 3) then **Tasarım** (step 4). Confirm the **Etkinliği Oluştur ✨** button only appears on step 4, and that with no template chosen the button state matches previous behaviour.
  8. Pick the free (`Ücretsiz`) package + `minimal` template, submit. You land on `/etkinlik/<slug>`.
  9. In the Supabase SQL Editor run `SELECT slug, programs FROM public.events ORDER BY created_at DESC LIMIT 1;` — `programs` contains exactly one object with `name`, `venueName`, `address`, `date`, `time` and **no** empty-string `mapsUrl` key.
  10. Repeat once creating an event with **zero** programs — `programs` is `[]`.

- [ ] **Step 6: Commit**
```bash
git add lib/programs.ts components/event/programs-editor.tsx components/event/steps/step-programs.tsx components/event/wizard.tsx
git commit -m "feat: add programs editor and Program & Konum step to event wizard"
```

---

### Task 5: Dashboard invitation settings page + event detail links

**Files:**
- Create: `app/(dashboard)/etkinlik/[slug]/davetiye/page.tsx`
- Create: `app/(dashboard)/etkinlik/[slug]/davetiye/loading.tsx`
- Create: `components/dashboard/invitation-settings-client.tsx`
- Modify: `app/(dashboard)/etkinlik/[slug]/page.tsx:15-18` (add `invitation_enabled` to the select)
- Modify: `components/dashboard/event-detail-client.tsx:1-10` (imports), `:26-38` (`Props`), `:101-110` (add the invitation block after the premium slideshow link)

**Interfaces:**
- Consumes: `ProgramItem` (Task 2), `normalizePrograms` / `sanitizePrograms` (Task 4), `ProgramsEditor` (Task 4), `invitation*` `SiteKey`s (Task 3).
- Produces: route `/etkinlik/[slug]/davetiye`; `InvitationSettingsClient` with props `{ eventId: string; eventTitle: string; slug: string; initialEnabled: boolean; initialPrograms: ProgramItem[] }`; `EventDetailClient` `Props['event']` gains `invitation_enabled: boolean`.

- [ ] **Step 1: Create `components/dashboard/invitation-settings-client.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import ProgramsEditor from '@/components/event/programs-editor'
import { sanitizePrograms } from '@/lib/programs'
import type { ProgramItem } from '@/types'

interface Props {
  eventId: string
  eventTitle: string
  slug: string
  initialEnabled: boolean
  initialPrograms: ProgramItem[]
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function InvitationSettingsClient({
  eventId,
  eventTitle,
  slug,
  initialEnabled,
  initialPrograms,
}: Props) {
  const { locale } = useLocale()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [programs, setPrograms] = useState<ProgramItem[]>(initialPrograms)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function handleSave() {
    setSaveState('saving')
    const cleaned = sanitizePrograms(programs)
    const supabase = createClient()
    const { error } = await supabase
      .from('events')
      .update({ programs: cleaned, invitation_enabled: enabled })
      .eq('id', eventId)

    if (error) {
      setSaveState('error')
      return
    }
    setPrograms(cleaned)
    setSaveState('saved')
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/etkinlik/${slug}`}
        className="text-sm text-[#7a6a5a] hover:text-[#6D1A3E] transition-colors"
      >
        {t(locale, 'invitationBackToEvent')}
      </Link>

      <div className="mt-4 mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#9b4a6a] mb-1">
          {eventTitle}
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{t(locale, 'invitationSettingsTitle')}</h1>
        <p className="text-[#9ca3af] text-sm mt-1">{t(locale, 'invitationSettingsDesc')}</p>
      </div>

      {/* Yayınlama anahtarı */}
      <div className="bg-white border border-[#e8ddd5] rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#374151]">{t(locale, 'invitationEnabledLabel')}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{t(locale, 'invitationEnabledHint')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={t(locale, 'invitationEnabledLabel')}
            onClick={() => {
              setEnabled((v) => !v)
              setSaveState('idle')
            }}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
              enabled ? 'bg-[#6D1A3E]' : 'bg-[#e8ddd5]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {enabled && (
          <a
            href={`/davetiye/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
          >
            {t(locale, 'invitationPublicLink')}
          </a>
        )}
      </div>

      <ProgramsEditor
        items={programs}
        onChange={(next) => {
          setPrograms(next)
          setSaveState('idle')
        }}
      />

      {saveState === 'error' && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          {t(locale, 'invitationSaveError')}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="w-full mt-6 bg-[#6D1A3E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5a1533] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saveState === 'saving'
          ? t(locale, 'invitationSaving')
          : saveState === 'saved'
            ? t(locale, 'invitationSaved')
            : t(locale, 'invitationSave')}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(dashboard)/etkinlik/[slug]/davetiye/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InvitationSettingsClient from '@/components/dashboard/invitation-settings-client'
import { normalizePrograms } from '@/lib/programs'

export default async function InvitationSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: event } = await supabase
    .from('events')
    .select('id, title, invitation_enabled, programs')
    .eq('slug', slug)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  return (
    <InvitationSettingsClient
      eventId={event.id}
      eventTitle={event.title}
      slug={slug}
      initialEnabled={event.invitation_enabled ?? false}
      initialPrograms={normalizePrograms(event.programs)}
    />
  )
}
```

- [ ] **Step 3: Create `app/(dashboard)/etkinlik/[slug]/davetiye/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="max-w-lg">
      <div className="h-4 w-28 bg-[#F0EBE3] rounded-full animate-pulse mb-6" />
      <div className="h-3 w-32 bg-[#F0EBE3] rounded-full animate-pulse mb-2" />
      <div className="h-7 w-56 bg-[#F0EBE3] rounded-full animate-pulse mb-2" />
      <div className="h-4 w-72 bg-[#F0EBE3] rounded-full animate-pulse mb-6" />
      <div className="h-20 bg-[#F0EBE3] rounded-2xl animate-pulse mb-6" />
      <div className="h-24 bg-[#F0EBE3] rounded-2xl animate-pulse mb-4" />
      <div className="h-12 bg-[#F0EBE3] rounded-xl animate-pulse" />
    </div>
  )
}
```

- [ ] **Step 4: Add `invitation_enabled` to the event detail page's select**

  In `app/(dashboard)/etkinlik/[slug]/page.tsx`, replace the `.select(...)` argument with:

```tsx
    .select('id, title, event_type, event_date, package_type, template_id, photo_count, video_count, guest_count_estimate, is_upload_active, invitation_enabled')
```

- [ ] **Step 5: Add the "Davetiye Sayfası" block to `components/dashboard/event-detail-client.tsx`**

  5a. Add the `Link` import at the top of the file, immediately after `'use client'` and its blank line (before `import { useLocale } ...`):

```tsx
import Link from 'next/link'
```

  5b. Add `invitation_enabled` to the `Props['event']` shape — insert after `    is_upload_active: boolean`:

```tsx
    invitation_enabled: boolean
```

  5c. Insert the following block **immediately after** the closing `)}` of the existing `{event.package_type === 'premium' && ( ... )}` slideshow link block and **before** `<TableCardSection ... />`. Note there is deliberately **no** package guard here — this feature ships on every package:

```tsx
          {/* Davetiye Sayfası — tüm paketlerde kullanılabilir (premium gate YOK) */}
          <div className="bg-white rounded-3xl border border-[#e8ddd5] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-1">
              {t(locale, 'invitationCardTitle')}
            </h2>
            <p className="text-xs text-[#9ca3af] mb-4">{t(locale, 'invitationCardDesc')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/etkinlik/${slug}/davetiye`}
                className="inline-flex items-center gap-2 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
              >
                {t(locale, 'invitationEditLink')}
              </Link>
              {event.invitation_enabled && (
                <a
                  href={`/davetiye/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
                >
                  {t(locale, 'invitationPublicLink')}
                </a>
              )}
            </div>
          </div>
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npx eslint "app/(dashboard)/etkinlik/[slug]/page.tsx" "app/(dashboard)/etkinlik/[slug]/davetiye/page.tsx" "app/(dashboard)/etkinlik/[slug]/davetiye/loading.tsx" components/dashboard/invitation-settings-client.tsx components/dashboard/event-detail-client.tsx
```

Success: both commands produce no output.

  Manual browser check (logged in, using the free/`eco` event created in Task 4 — this proves there is no premium gate):
  1. Open `http://localhost:3000/etkinlik/<slug>`. A white "Davetiye Sayfası" card appears between the stats row and the "Masa Kartı Şablonu" section, showing only the **📍 Davetiyeyi Düzenle →** link (the public link is hidden because `invitation_enabled` is still `false`).
  2. Click it → you land on `/etkinlik/<slug>/davetiye` with the event title as eyebrow, the publish toggle **off**, and the programs entered in Task 4 pre-filled in the editor.
  3. Edit a venue name, add a second program, click **Kaydet** → the button text becomes `Kaydediliyor...` then `Kaydedildi ✓`.
  4. Hard-refresh the page → your edits persisted.
  5. Turn the publish toggle **on**, click **Kaydet**. A **🔗 Davetiye Sayfasını Aç →** link appears under the toggle.
  6. Click **← Etkinliğe Dön** → the event detail card now shows **both** links.
  7. In the Supabase SQL Editor: `SELECT invitation_enabled, jsonb_array_length(programs) FROM public.events WHERE slug = '<slug>';` → `true` and the expected count.
  8. Switch the locale switcher to EN and DE — all labels on both pages change; no Turkish strings remain.
  9. Log in as (or simulate) a different host and open `/etkinlik/<slug>/davetiye` → 404 (the `host_id` filter).

- [ ] **Step 7: Commit**
```bash
git add "app/(dashboard)/etkinlik/[slug]/page.tsx" "app/(dashboard)/etkinlik/[slug]/davetiye" components/dashboard/invitation-settings-client.tsx components/dashboard/event-detail-client.tsx
git commit -m "feat: add invitation settings dashboard page and event detail links"
```

---

### Task 6: 🛑 STOP — PROJECT OWNER ONLY: Google Maps Embed API key

**Files:**
- Modify: `.env.example` (append at end of file)
- Modify (owner, not committed): `.env.local`
- Modify (owner, outside the repo): Vercel project environment variables

**Interfaces:**
- Consumes: nothing.
- Produces: `process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` — a string starting with `AIza…`, consumed by `mapEmbedUrl(item, apiKey)` in Task 7.

> **🛑 STOP — THIS TASK REQUIRES THE PROJECT OWNER.**
> The implementing agent **must not** attempt to create this key. It requires interactive sign-in to the owner's personal Google Cloud Console and a billing account. The agent's only job in this task is Step 1 (`.env.example`) and then to **pause and ask the owner to complete Steps 2–4 and reply with confirmation that `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` is set in `.env.local`**. Task 7 can be written without it, but Task 7's map verification cannot pass until this is done.

- [ ] **Step 1 (agent): Append the new variable to `.env.example`**

```
# Google Maps Embed API — /davetiye/[slug] sayfasındaki gömülü harita
# console.cloud.google.com → APIs & Services → Credentials → API key
# "Maps Embed API" etkinleştirilmeli; anahtar HTTP referrer ile kısıtlanmalı
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=
```

- [ ] **Step 2 (PROJECT OWNER): Create the key in Google Cloud Console**

  Follow these exactly. You have never used Google Cloud Console before — that's fine, every click is listed.

  1. Open a browser and go to **<https://console.cloud.google.com/>**. Sign in with the Google account that owns AnıKare (the same one you used to set up Supabase's Google sign-in).
  2. **Pick the project.** At the very top of the page, just to the right of the "Google Cloud" logo, there is a dropdown showing a project name (or "Select a project"). Click it. A dialog opens.
     - If you see a project you already made for AnıKare (the one used for Google sign-in / OAuth), click it and skip to point 4.
     - Otherwise click **NEW PROJECT** at the top-right of that dialog, type `AnıKare` in the **Project name** field, leave everything else alone, and click **CREATE**. Wait ~10 seconds, then use the same dropdown to select the new project.
  3. **Attach billing.** Google requires a billing account on the project before Maps keys work, even though the **Maps Embed API is free with unlimited usage** — you will not be charged for this feature.
     - Click the **hamburger menu (☰)** at the very top-left, choose **Billing**.
     - If it says "This project has no billing account", click **LINK A BILLING ACCOUNT** → **CREATE BILLING ACCOUNT** → follow the prompts (country, card details) → finish.
     - If a billing account is already linked, do nothing here.
  4. **Turn on the Maps Embed API.**
     - Click **☰** → **APIs & Services** → **Library**.
     - In the search box at the top, type `Maps Embed API`.
     - Click the result card titled exactly **Maps Embed API**.
     - Click the blue **ENABLE** button. Wait for the page to reload showing "API enabled".
  5. **Create the key.**
     - Click **☰** → **APIs & Services** → **Credentials**.
     - At the top of the page click **+ CREATE CREDENTIALS**, then choose **API key** from the small menu.
     - A popup appears titled "API key created" showing a long string starting with `AIza...`. **Click the copy icon** and paste it somewhere temporarily (a notes app).
     - Click **Edit API key** in that popup (if you already closed it: in the Credentials list, click the key's name, e.g. "API key 1").
  6. **Name it.** In the **Name** field at the top, replace the default with:
     `AnıKare Maps Embed (web)`
  7. **Restrict where it can be used.** Under **Application restrictions**, select the radio button **Websites**. A "Website restrictions" box appears. Click **ADD** and enter each of these one at a time, clicking **DONE** after each:
     - `https://www.anikare.net/*`
     - `https://anikare.net/*`
     - `https://*.vercel.app/*`
     - `http://localhost:3000/*`
  8. **Restrict which API it can call.** Scroll down to **API restrictions**, select the radio button **Restrict key**. A dropdown labelled "Select APIs" appears — click it and tick **only** `Maps Embed API`. Click **OK**.
  9. Click the blue **SAVE** button at the bottom. Changes can take up to 5 minutes to take effect.
  10. Back on the **Credentials** page, click the copy icon next to your key to copy the `AIza...` value again.

- [ ] **Step 3 (PROJECT OWNER): Put the key in `.env.local`**

  1. In the project folder `/Users/ayasar/personal-projects/anikare`, open the file `.env.local` in your editor. (This file is gitignored — it is never committed. If it doesn't exist, copy `.env.example` to `.env.local` first.)
  2. Add this line at the bottom, pasting your key after the `=` with **no quotes and no spaces**:

     ```
     NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```
  3. Save the file.
  4. **Stop and restart the dev server** (`Ctrl+C` in the terminal running `npm run dev`, then `npm run dev` again). Next.js only reads env files at startup.

- [ ] **Step 4 (PROJECT OWNER): Put the key in Vercel**

  1. Go to **<https://vercel.com/>** and sign in.
  2. Click the **anikare** project.
  3. Click the **Settings** tab at the top.
  4. In the left sidebar click **Environment Variables**.
  5. In the **Key** field type exactly: `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`
  6. In the **Value** field paste the same `AIza...` key.
  7. Make sure all three environment checkboxes are ticked: **Production**, **Preview**, **Development**.
  8. Click **Save**.
  9. Go to the **Deployments** tab, click the **⋯** menu on the most recent production deployment, and choose **Redeploy** so the new variable is picked up.

- [ ] **Step 5: Owner reports back to the agent**

  Reply in chat with either the key value or simply:
  > "`NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` is set in `.env.local` and in Vercel, dev server restarted."

  **The agent must not continue past Task 7 Step 3's map verification until this confirmation arrives.**

- [ ] **Step 6: Verify (agent, after owner confirms)**

```bash
grep -c "NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY" .env.example .env.local
```

Success: prints `.env.example:1` and `.env.local:1`. (Never print the value itself, and never `git add .env.local`.)

- [ ] **Step 7: Commit (agent — `.env.example` only)**
```bash
git add .env.example
git commit -m "feat: document NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY env var"
```

---

### Task 7: Public `/davetiye/[slug]` page — hero, program cards, map, directions

**Files:**
- Create: `app/davetiye/[slug]/page.tsx`
- Modify: `app/robots.ts:14-24` (add `/davetiye/` to `disallow`)

**Interfaces:**
- Consumes: `ProgramItem` (Task 2); `getDictionary` + `detectLocaleFromAcceptLanguage` + `dict.invitation.*` (Task 3); `normalizePrograms`, `directionsUrl`, `mapEmbedUrl` (Task 4); `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` (Task 6); `TitleText` from `components/table-card/title-text.tsx`; `SITE_URL` from `lib/config.ts`.
- Produces: public route `/davetiye/[slug]`; `generateMetadata` supplying `openGraph` for the OG image in Task 8.

- [ ] **Step 1: Create `app/davetiye/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, detectLocaleFromAcceptLanguage } from '@/lib/i18n'
import { normalizePrograms, directionsUrl, mapEmbedUrl } from '@/lib/programs'
import { TitleText } from '@/components/table-card/title-text'
import { SITE_URL } from '@/lib/config'
import type { Locale } from '@/types'

function dateLocaleTag(locale: Locale): string {
  return locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'tr-TR'
}

// 'YYYY-MM-DD' yerel saatte parse edilir (düz new Date() UTC'ye kaydırıp
// bazı saat dilimlerinde günü bir geri alır).
function formatDate(value: string, locale: Locale): string {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(dateLocaleTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, invitation_enabled')
    .eq('slug', slug)
    .single()

  if (!event || !event.invitation_enabled) {
    return { title: 'Davetiye', robots: { index: false, follow: false } }
  }

  const dateLabel = event.event_date ? formatDate(event.event_date, 'tr') : ''
  const description = dateLabel ? `${event.title} — ${dateLabel}` : event.title

  return {
    title: event.title,
    description,
    // Etkinlik detayları arama motorlarında listelenmesin (/e/ ve /sunum/ ile aynı
    // gizlilik duruşu). WhatsApp/iMessage önizlemeleri bundan etkilenmez.
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title: event.title,
      description,
      url: `${SITE_URL}/davetiye/${slug}`,
      siteName: 'AnıKare',
    },
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, invitation_enabled, programs')
    .eq('slug', slug)
    .single()

  // Paket kontrolü YOK — bu özellik tüm paketlerde açık.
  // Görünürlük yalnızca invitation_enabled ile kontrol edilir.
  if (!event || !event.invitation_enabled) notFound()

  const headersList = await headers()
  const locale = detectLocaleFromAcceptLanguage(headersList.get('accept-language') ?? 'tr')
  const dict = await getDictionary(locale)
  const inv = dict.invitation

  const programs = normalizePrograms(event.programs)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
  const heroDate = event.event_date ? formatDate(event.event_date, locale) : ''

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-xl">
        {/* Hero */}
        <header className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#9b4a6a]">
            {inv.eyebrow}
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#6D1A3E] leading-tight mt-4">
            <TitleText title={event.title} />
          </h1>
          {heroDate && <p className="text-sm text-[#7a6a5a] mt-4">{heroDate}</p>}
          <div className="w-16 h-px bg-[#e8ddd5] mx-auto mt-8" />
        </header>

        {/* Programlar — boşsa hiçbir şey render edilmez, sayfa yine geçerli */}
        {programs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase text-[#9b4a6a] mb-6">
              {inv.programTitle}
            </h2>

            <div className="space-y-6">
              {programs.map((item) => {
                const embed = mapEmbedUrl(item, apiKey)
                const directions = directionsUrl(item)
                const programDate = formatDate(item.date, locale)
                const whenParts = [programDate, item.time].filter(Boolean).join(' · ')

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#e8ddd5] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden"
                  >
                    <div className="p-6">
                      {item.name && (
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a]">
                          {item.name}
                        </h3>
                      )}
                      {whenParts && (
                        <p className="text-sm text-[#6D1A3E] font-medium mt-2">{whenParts}</p>
                      )}
                      {item.venueName && (
                        <p className="text-sm font-medium text-[#374151] mt-4">{item.venueName}</p>
                      )}
                      {item.address && (
                        <p className="text-sm text-[#7a6a5a] leading-relaxed mt-1">{item.address}</p>
                      )}
                    </div>

                    {embed ? (
                      <iframe
                        title={`${item.venueName || item.name} — ${item.address}`}
                        src={embed}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block w-full h-[220px] border-0"
                      />
                    ) : (
                      item.address && (
                        <div className="flex items-center justify-center h-[120px] bg-[#F0EBE3] text-xs text-[#9ca3af] px-6 text-center">
                          {inv.mapUnavailable}
                        </div>
                      )
                    )}

                    {directions && (
                      <div className="p-5 border-t border-[#e8ddd5]">
                        <a
                          href={directions}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full bg-[#6D1A3E] text-white rounded-full py-3 text-sm font-medium hover:bg-[#5a1533] transition-colors"
                        >
                          {inv.getDirections}
                        </a>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <p className="text-center text-sm text-[#7a6a5a] mt-12">{inv.seeYouThere}</p>
        <p className="text-center text-[11px] tracking-[0.2em] uppercase text-[#9ca3af] mt-10">
          AnıKare
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Add `/davetiye/` to `app/robots.ts`'s `disallow` array** — insert `'/davetiye/',` immediately after the `'/sunum/',` entry so the array reads:

```ts
        disallow: [
          '/dashboard',
          '/etkinlik/',
          '/e/',
          '/sunum/',
          '/davetiye/',
          '/api/',
          '/giris',
          '/kayit',
          '/sifremi-unuttum',
          '/auth/',
        ],
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint "app/davetiye/[slug]/page.tsx" app/robots.ts
```

Success: both commands produce no output.

  Manual browser check (dev server restarted **after** Task 6's key was added):
  1. Open `http://localhost:3000/davetiye/<slug>` for an event whose toggle is **on** → the page renders: `DAVETİYE` eyebrow, the couple names in Playfair maroon (with the `&` in italic serif via `TitleText`), the event date, then one card per program.
  2. Each card shows name, `date · time`, venue, address, an **embedded Google map iframe centred on the address**, and a maroon **Yol Tarifi Al** pill.
  3. Right-click the map → "Inspect": the `iframe` `src` starts with `https://www.google.com/maps/embed/v1/place?key=AIza` — confirms the official keyed Embed API, not the unofficial `output=embed` trick. If instead you see the grey `Harita şu anda gösterilemiyor` box, the env var is missing or the dev server wasn't restarted.
  4. Click **Yol Tarifi Al** on a program with **no** `mapsUrl` → a new tab opens `https://www.google.com/maps/dir/?api=1&destination=...`. On a real phone this opens the native Maps app.
  5. Add a `mapsUrl` (e.g. a `https://maps.app.goo.gl/...` link) to one program in the dashboard, save, reload the public page → **Yol Tarifi Al** now goes to that pasted link instead.
  6. Turn the toggle **off** in the dashboard, save, reload `/davetiye/<slug>` → **404 page**.
  7. Turn it back on, remove all programs, save, reload → hero + `Sizi aramızda görmekten mutluluk duyarız 🤍` + `AnıKare` only, no program section, **no upload CTA, no PIN prompt, no RSVP form**.
  8. Open the page in a fresh incognito window (logged out) → it still renders (no auth, no PIN).
  9. Change the browser's preferred language to English then German (or `curl -H "Accept-Language: de" http://localhost:3000/davetiye/<slug> | grep -i einladung`) → the eyebrow / programme heading / directions button / closing line switch language.
  10. `curl -s http://localhost:3000/robots.txt | grep davetiye` → prints `Disallow: /davetiye/`.
  11. Confirm `http://localhost:3000/e/<slug>` still works exactly as before — this feature must not have touched the QR flow.

- [ ] **Step 4: Commit**
```bash
git add "app/davetiye" app/robots.ts
git commit -m "feat: add public davetiye page with map embed and directions"
```

---

### Task 8: Dynamic Open Graph image for `/davetiye/[slug]`

**Files:**
- Create: `public/fonts/PlayfairDisplay-Bold.woff` (downloaded binary asset)
- Create: `app/davetiye/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `createClient` from `lib/supabase/server`; the same `slug` route param as Task 7; `generateMetadata`'s `openGraph` object from Task 7 (Next.js merges the file-based image into it automatically).
- Produces: `GET /davetiye/<slug>/opengraph-image` returning a 1200×630 PNG; `og:image` / `twitter:image` meta tags on the invitation page.

`next/og` ships with Next.js itself (`node_modules/next/og.js` → `next/dist/compiled/@vercel/og`) — **no new dependency to install**. Next.js 16.2.6 supports the App Router `opengraph-image.tsx` file convention with `params: Promise<{ slug: string }>`.

- [ ] **Step 1: Download the Playfair Display Bold font used by the OG renderer**

  Satori (which powers `ImageResponse`) supports `ttf`, `otf` and `woff` — **not** `woff2` — and has no access to `next/font`, so the font must be a real file in the repo.

```bash
mkdir -p public/fonts
curl -sL -o public/fonts/PlayfairDisplay-Bold.woff \
  "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDT.woff"
ls -l public/fonts/PlayfairDisplay-Bold.woff
```

Success: the file exists and is roughly 55 KB (`55652` bytes). If it is 0 bytes or a few hundred bytes (an error page), stop and re-run.

- [ ] **Step 2: Create `app/davetiye/[slug]/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@/lib/supabase/server'

export const alt = 'AnıKare Davetiye'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, event_date')
    .eq('slug', slug)
    .single()

  // satori next/font'a erişemez — Playfair'i dosyadan yükle (woff destekleniyor).
  const playfair = await readFile(
    join(process.cwd(), 'public/fonts/PlayfairDisplay-Bold.woff')
  )

  const title: string = event?.title ?? 'AnıKare'
  const dateLabel: string = event?.event_date
    ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          border: '18px solid #6D1A3E',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 12,
            color: '#9b4a6a',
            marginBottom: 32,
          }}
        >
          DAVETİYE
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Playfair',
            fontSize: 92,
            fontWeight: 700,
            color: '#6D1A3E',
            textAlign: 'center',
            padding: '0 90px',
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {dateLabel ? (
          <div style={{ display: 'flex', fontSize: 34, color: '#7a6a5a', marginTop: 36 }}>
            {dateLabel}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 6,
            color: '#9ca3af',
            marginTop: 56,
          }}
        >
          ANIKARE.NET
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair',
          data: playfair,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
```

  Note: `TitleText` is deliberately **not** used here — satori requires `display: 'flex'` on any element with multiple children, and `TitleText` returns a fragment mixing raw text nodes and `<span>`s. The plain string keeps the render deterministic.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx eslint "app/davetiye/[slug]/opengraph-image.tsx"
```

Success: both commands produce no output.

```bash
curl -s -o /tmp/og.png -w "%{http_code} %{content_type} %{size_download}\n" \
  "http://localhost:3000/davetiye/<slug>/opengraph-image"
```

Success: prints `200 image/png` and a size well above `10000` bytes.

  Manual browser check:
  1. Open `http://localhost:3000/davetiye/<slug>/opengraph-image` directly → a 1200×630 cream card with a maroon border, the spaced `DAVETİYE` label, the couple names in **Playfair Bold maroon** (not the default sans — if the names look like a plain grotesque, the font file failed to load), the Turkish-formatted date, and `ANIKARE.NET` at the bottom.
  2. Confirm Turkish characters render correctly by using an event whose title contains `ş`, `ğ`, `ı` or `İ` (e.g. `Ayşe & Muştafa`).
  3. Back on `http://localhost:3000/davetiye/<slug>`, view page source and confirm a `<meta property="og:image" content=".../davetiye/<slug>/opengraph-image...">` tag is present (Next injects it because `opengraph-image.tsx` is a sibling of `page.tsx`).
  4. After the next Vercel deploy, paste `https://www.anikare.net/davetiye/<slug>` into a WhatsApp chat (or <https://www.opengraph.xyz/>) → the preview shows the generated card, not the generic site `og-image.png`.

- [ ] **Step 4: Commit**
```bash
git add public/fonts/PlayfairDisplay-Bold.woff "app/davetiye/[slug]/opengraph-image.tsx"
git commit -m "feat: add dynamic OG image for davetiye page"
```

---

## Final End-to-End Checklist (after all tasks)

- [ ] `npx tsc --noEmit` clean.
- [ ] `npx eslint .` clean.
- [ ] Create a brand new event through the wizard with 2 programs → dashboard → enable → public page renders both cards with working maps and directions.
- [ ] `SELECT slug FROM public.events ORDER BY created_at;` — every pre-existing slug is byte-for-byte what it was before Task 1.
- [ ] `/e/<slug>` guest upload flow, `/sunum/<slug>` slideshow, and the table-card PDF download all still behave exactly as before.
- [ ] `git log --oneline -8` shows 8 single-line `feat:` commits with no `Co-Authored-By` trailer.

---

## Self-Review Notes (gaps found and closed while drafting)

- **JSONB round-trip safety.** The spec defines `ProgramItem` but not how to read back an arbitrary `jsonb` value. Added `normalizePrograms(value: unknown)` in Task 4 so a `null`, a stale shape, or a hand-edited row can never crash the dashboard or the public page; `sanitizePrograms` is its write-side counterpart (drops blank rows, trims, converts empty optionals to `undefined` so they vanish from the JSON).
- **Duplicate DOM ids.** `components/ui/input.tsx` derives `id` from `label` when none is passed — with N program rows that would produce N inputs sharing `id="adres"` and broken `<label for>` behaviour. Every `Input` in `ProgramsEditor` now passes an explicit `id={`program-${item.id}-…`}`.
- **Wizard step-index shift.** Inserting a step at index 1 silently moves the template step from 2 → 3. Two places besides the render block depend on that index (`canProceed()`'s template validation, and the live-preview `invisible` class); both are called out explicitly in Task 4 Steps 4e and 4h.
- **`event_detail` select.** The new `invitation_enabled` link condition requires the column in the server page's `.select(...)`, which is easy to forget; added as Task 5 Step 4.
- **Locale on a server-rendered public page.** `useLocale()` is client-only, so the public page can't use it. Rather than duplicating `app/e/[slug]/page.tsx`'s private `detectLocaleFromHeader`, Task 3 adds a shared `detectLocaleFromAcceptLanguage` to `lib/i18n/index.ts`; `app/e/[slug]/page.tsx` is deliberately left untouched to keep the QR flow's diff at zero.
- **`robots.ts`.** Not in the spec, but leaving `/davetiye/` indexable would put real guests' wedding venues and addresses into Google, inconsistent with the existing `disallow` entries for `/e/`, `/sunum/` and `/etkinlik/`. Added in Task 7 Step 2 plus per-page `robots: { index: false, follow: false }`; link-preview crawlers (WhatsApp/iMessage) are unaffected.
- **OG font.** The spec asks for a "Playfair heading" in the OG image, but satori cannot see `next/font` and rejects `woff2`. Task 8 Step 1 pins an exact, verified `fonts.gstatic.com` **woff** URL (HTTP 200, 55,652 bytes) and Step 3 includes a visual check that the font actually applied.
- **Timezone date bug.** `new Date('2026-09-12')` parses as UTC midnight and displays as 11 September in negative-offset zones. All date formatting uses `new Date(\`${value}T00:00:00\`)`.
- **Placeholder scan.** No "TBD", no "similar to Task N", no "handle errors appropriately" — every component, helper, SQL statement, i18n key (all three locales) and console click path is written out in full.
- **Type/signature consistency scan.** `ProgramItem` is defined once (Task 2) and its exact field set is used identically by `lib/programs.ts`, `ProgramsEditor`, `StepPrograms`, `WizardState`, `InvitationSettingsClient` and the public page. `ProgramsEditor`'s `onChange: (items: ProgramItem[]) => void` is called with that exact signature in both consumers. `mapEmbedUrl(item, apiKey)` and `directionsUrl(item)` are declared in Task 4 and invoked with matching arity in Task 7.

### Critical Files for Implementation
- /Users/ayasar/personal-projects/anikare/components/event/wizard.tsx
- /Users/ayasar/personal-projects/anikare/components/dashboard/event-detail-client.tsx
- /Users/ayasar/personal-projects/anikare/supabase/schema.sql
- /Users/ayasar/personal-projects/anikare/lib/i18n/site.ts
- /Users/ayasar/personal-projects/anikare/types/index.ts