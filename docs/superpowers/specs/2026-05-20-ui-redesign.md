# AnıKare UI Redesign — Design Spec

**Status:** Approved  
**Date:** 2026-05-20  
**Stitch Project ID:** `7118589300587044897`

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#6D1A3E` (deep burgundy) |
| Background | `#FAF7F2` (warm cream) |
| Surface (card) | `#FFFFFF` |
| Text primary | `#1a1a1a` |
| Text muted | `#7a6a5a` |
| Error | `#dc2626` |
| Heading font | Playfair Display (serif) |
| UI font | Inter (sans-serif) |
| Border radius | 24px (cards), 16px (inputs), 9999px (pills) |
| Shadow | `0 4px 24px rgba(0,0,0,0.07)` |

**Dark mode:** Deferred — not in scope for v1.

---

## Logo

- **Symbol:** Two overlapping polaroid frames (3:4 ratio, 8° rotation on back frame), small heart inside front frame
- **Wordmark:** `ANIKARE` — Helvetica Neue ExtraBold, all-caps, letter-spacing 3px
- **Files:** `public/brand/logo.svg` (burgundy on cream), `public/brand/logo-white.svg` (white)
- **App icon:** Same mark, 192×192 and 512×512 PNG — generated from SVG

---

## Screens & Components

### Global layout rules (PWA feel)
- `<html>` height: 100%, overflow hidden on mobile to prevent bounce
- `<body>` overscroll-behavior: none on mobile
- Safe area insets via `env(safe-area-inset-*)` on sticky bars
- No visible browser chrome on guest pages (no header bar, full bleed)
- Framer Motion page transitions: `opacity + y` fade-up (200ms)

### Guest Flow: `/e/[slug]`

**Stage 1 — Welcome (PIN disabled) / PIN Entry (PIN enabled)**

PIN Entry:
- Full-screen, vertically centered
- 4 OTP boxes: 56×64px, rounded-16px
- Active box: burgundy 2px border
- "Onayla" button: full-width pill, burgundy fill
- Error shake animation on wrong PIN

Welcome Screen:
- Full-bleed layout, no card wrapper
- Hero: couple name in Playfair Display 32px bold
- Date + venue with icon (calendar 📅, pin 📍), muted caption
- Thin ornamental divider
- White card (rounded-28px, shadow): "Anılarını Paylaş" + desc + name input + note textarea
- Input labels ABOVE the field, dark visible placeholder text (`#9ca3af` minimum)
- Sticky bottom bar (safe-area): primary "📷 Galeriden Seç" (burgundy fill) + secondary "📸 Kamera ile Çek" (outlined)

**Stage 2 — Media Staging (new)**

Triggered after file selection, before upload:
- Back button top-left
- Package limit pill top-right: e.g. "Eko · 150 📷 · 10 🎬"
- 2-column preview grid, rounded-12 thumbnails, aspect-square
  - Photo: actual thumbnail preview via `URL.createObjectURL()`
  - Video: dark bg + play icon overlay
  - Each item: ✕ remove button (top-right)
- Info bar: "N fotoğraf seçildi · XX.X MB"
- "+ Daha Fazla Ekle" secondary button
- Sticky bottom: package counter "📷 N/150 · 🎬 N/10" + "Yükle →" primary pill
- Package-based max file size enforcement before showing staging:
  - Eco: max 150 photos + 10 videos
  - Standard: unlimited photos + 30 videos  
  - Premium: unlimited all

**Stage 3 — Upload Progress**

- Fullscreen progress indicator
- Current file name + overall count "Yükleniyor... 2 / 5"
- Animated progress bar (burgundy, rounded)
- Cannot navigate away (locked screen)

**Stage 4 — Thank You**

- Shown ONLY after ALL files successfully uploaded
- Confetti/heart animation (CSS + Framer Motion)
- Host's custom thank-you message (or fallback)
- "Başka Anı Ekle" → returns to Stage 1 (Welcome, name cleared)

### Host Dashboard: `/(dashboard)/dashboard`

- Top bar: "ANIKARE" logo left, avatar right
- "Merhaba, [Name] 👋" greeting
- Event cards: gradient thumbnail, title, date, active/closed badge, photo+video count
- Bottom nav: Anılar / Takvim / Davetliler / Ayarlar (4 items)
- FAB: burgundy "+" bottom-right (→ `/etkinlik/yeni`)
- No desktop sidebar on mobile — bottom nav replaces it

### Event Creation Wizard: `/(dashboard)/etkinlik/yeni`

- Back arrow + "Yeni Etkinlik" title + "1/3" step indicator
- Burgundy progress bar (segmented, 33% / 66% / 100%)
- Step 1: Event type chips (Düğün ✓ selected = burgundy fill), title input, slug preview, date, guest count, PIN toggle
  - Guest count: controlled input — on clear shows empty string (not 0), min 1
- Step 2: Package cards (Eko / Standart / Premium)
- Step 3: Template selector (6 cards)
- Sticky "Devam →" / "Oluştur" button

### Bug Fixes (alongside redesign)

| Bug | Fix |
|-----|-----|
| Camera button opens gallery | Remove `multiple` from camera input — use `capture="environment"` without `multiple`. Separate file input per button. |
| "Unsupported file type" error | Expand MIME check: add `image/jpg`, `image/heic`, `image/heif`, also accept `application/octet-stream` for unknown types, validate by extension as fallback |
| Input text unreadable | All inputs: placeholder `text-[#6b7280]`, value `text-[#1a1a1a]`, label above field in `text-[#374151] font-medium text-sm` |
| Guest count input 0 stuck | Use `string` state internally, convert to number only on submit. `onChange`: if empty → `""`, else `Number(e.target.value)` |
| Thank you too early | Move `setStage('thankyou')` to after full upload loop completes, not per-file |

### globals.css additions

```css
/* PWA / app feel */
html { height: 100%; }
body { 
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-y;
}
input, textarea, select {
  color: #1a1a1a;
}
input::placeholder, textarea::placeholder {
  color: #9ca3af;
}
```

---

## Font Loading

Add to `app/layout.tsx`:
```tsx
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  weight: ['400', '600', '700']
})
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
})
```

In `globals.css` `@theme inline`:
```css
--font-heading: var(--font-playfair);
--font-sans: var(--font-inter);
```

---

## Component Architecture

```
components/
  ui/
    button.tsx          # variant: primary | secondary | ghost
    input.tsx           # label above, dark placeholder, error state  
    card.tsx            # white, rounded-3xl, shadow
    progress-bar.tsx    # burgundy, animated
    bottom-bar.tsx      # safe-area aware sticky container
  guest/
    pin-entry.tsx       # ✏️ redesign
    welcome-screen.tsx  # ✏️ redesign
    media-staging.tsx   # 🆕 new component
    upload-progress.tsx # 🆕 new component
    thank-you-screen.tsx # ✏️ redesign
    upload-bar.tsx      # ✏️ redesign (camera fix)
    guest-flow.tsx      # ✏️ state machine update
  dashboard/
    sidebar.tsx         # → bottom-nav.tsx on mobile
    event-card.tsx      # 🆕 extracted from page
  event/
    wizard.tsx          # ✏️ guest count bug fix
    steps/
      step-details.tsx  # ✏️ input redesign
```

Legend: ✏️ redesign existing · 🆕 new component
