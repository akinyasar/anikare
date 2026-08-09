# Masa Kartı Tasarım İyileştirmesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the three table-card templates' corner illustrations (botanical, floral) and the minimal template's frame so they read as professional wedding stationery instead of sparse placeholder art, apply the project's existing Playfair Display heading font, and add a local-only preview page so the user can review and download all 6 card variants before anything ships.

**Architecture:** No architectural changes. Same `CardProps` interface, same `Landscape`/`Portrait` function pair per template file, same `html2canvas` + `jsPDF` export pipeline in `download-pdf-btn.tsx`. Only the SVG illustration content inside each template and one new dev-only route are added.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, inline SVG (no new dependencies), existing `next/font/google` Playfair Display already configured in `app/layout.tsx`.

## Global Constraints

- **No CSS `transform: rotate()` on any DOM element that gets exported to PDF.** The only rotation allowed is SVG-native, inside an SVG `<g transform="rotate(180, cx, cy)">` where `cx`/`cy` are the SVG's own viewBox center. This is the fix for a previous bug where corners appeared crooked in exported PDFs. CSS `transform: scale(...)` on a wrapping `<div>` (used in the existing `Portrait` layouts) is fine and must not be changed.
- **Do not run `git commit` or `git push` at the end of tasks.** The user will review the dev-only preview page locally first and give explicit approval before anything is committed. Every task ends with "stop — do not commit" instead of a commit step.
- **No new npm dependencies.** Playfair Display is already loaded globally via `app/layout.tsx` as CSS variable `--font-heading` (mapped from `--font-playfair` in `app/globals.css:18`), weights `400`/`700`. Reference it as `fontFamily: 'var(--font-heading), Georgia, serif'` — do not add a second `next/font/google` call.
- **Keep the existing per-template color palettes.** Botanical stays sage-green (`#5c7a3c`/`#7a9e6a`/`#a8c896`) + gold (`#c9a84c`). Floral stays blush pink (`#f4a0b0`/`#e07898`/`#f9c0cc`) + sage green. Minimal stays bordo (`#6D1A3E`) only, no green/gold — this is what keeps it visually distinct from the other two.
- **No `npm test` in this project** — verification is `npm run build` (TypeScript + prod build) plus manual visual check via `npm run dev`, matching this repo's existing convention (see `CLAUDE.md`: "always run `npm run build` to verify no TS errors before committing").

---

## File Structure

| File | Responsibility |
|---|---|
| `components/table-card/card-botanical.tsx` | Modify — denser `BotanicalCorner` SVG (eucalyptus), Playfair heading font |
| `components/table-card/card-floral.tsx` | Modify — denser `FloralCorner` SVG (rose + eucalyptus bouquet), Playfair heading font |
| `components/table-card/card-minimal.tsx` | Modify — double-line frame + geometric corner marks, Playfair heading font |
| `app/dev/masa-karti-preview/page.tsx` | Create — server component, `notFound()` outside development, renders the client grid |
| `app/dev/masa-karti-preview/preview-client.tsx` | Create — client component, 3 templates × 2 orientations grid + "Tümünü İndir" button |

---

### Task 1: Denser botanical corner illustration

**Files:**
- Modify: `components/table-card/card-botanical.tsx:16-46` (the `BotanicalCorner` function and its viewBox usage)
- Modify: `components/table-card/card-botanical.tsx:95` and `:141` (the `h1` `fontFamily` in `Landscape` and `Portrait`)

**Interfaces:**
- Consumes: nothing new — `CardProps`, `QRContent`, `formatDate` in this file are unchanged.
- Produces: `BotanicalCorner({ flip }: { flip?: boolean })` keeps the exact same signature and is still rendered the exact same way by `Landscape`/`Portrait` (`<BotanicalCorner />` top-right, `<BotanicalCorner flip />` bottom-left) — no caller changes needed.

- [ ] **Step 1: Replace `BotanicalCorner` with a denser, data-driven eucalyptus composition**

Replace lines 15–46 (the whole `BotanicalCorner` function) with:

```tsx
// Stitch/competitor-inspired dense eucalyptus corner (160×140 viewBox)
const BOTANICAL_LEAVES: { cx: number; cy: number; rx: number; ry: number; rot: number; fill: string }[] = [
  // Branch A — outer sweep along the top edge
  { cx: 148, cy: 14, rx: 10, ry: 6, rot: -20, fill: '#a8c896' },
  { cx: 138, cy: 10, rx: 9, ry: 5.5, rot: -35, fill: '#7a9e6a' },
  { cx: 128, cy: 16, rx: 11, ry: 6.5, rot: -15, fill: '#a8c896' },
  { cx: 116, cy: 12, rx: 8, ry: 5, rot: -40, fill: '#5c7a3c' },
  { cx: 104, cy: 20, rx: 12, ry: 7, rot: -25, fill: '#7a9e6a' },
  { cx: 92, cy: 16, rx: 9, ry: 5.5, rot: -45, fill: '#a8c896' },
  { cx: 80, cy: 26, rx: 11, ry: 6.5, rot: -20, fill: '#5c7a3c' },
  { cx: 68, cy: 22, rx: 8.5, ry: 5, rot: -50, fill: '#7a9e6a' },
  // Branch B — mid diagonal
  { cx: 140, cy: 34, rx: 10, ry: 6, rot: -55, fill: '#7a9e6a' },
  { cx: 128, cy: 42, rx: 12, ry: 7, rot: -35, fill: '#a8c896' },
  { cx: 114, cy: 48, rx: 9, ry: 5.5, rot: -60, fill: '#5c7a3c' },
  { cx: 100, cy: 56, rx: 11, ry: 6.5, rot: -40, fill: '#7a9e6a' },
  { cx: 86, cy: 60, rx: 9, ry: 5.5, rot: -65, fill: '#a8c896' },
  { cx: 72, cy: 68, rx: 10, ry: 6, rot: -45, fill: '#5c7a3c' },
  { cx: 58, cy: 72, rx: 8, ry: 5, rot: -70, fill: '#7a9e6a' },
  // Branch C — inner sweep, reaches deepest into the card
  { cx: 122, cy: 66, rx: 9, ry: 5.5, rot: 10, fill: '#5c7a3c' },
  { cx: 108, cy: 76, rx: 10, ry: 6, rot: -10, fill: '#7a9e6a' },
  { cx: 94, cy: 84, rx: 8.5, ry: 5, rot: 15, fill: '#a8c896' },
  { cx: 80, cy: 92, rx: 9.5, ry: 5.5, rot: -5, fill: '#5c7a3c' },
  { cx: 64, cy: 98, rx: 8, ry: 5, rot: 20, fill: '#7a9e6a' },
  { cx: 48, cy: 104, rx: 7, ry: 4.5, rot: 0, fill: '#a8c896' },
  // Filler leaves for fullness
  { cx: 150, cy: 30, rx: 6, ry: 4, rot: -10, fill: '#5c7a3c' },
  { cx: 96, cy: 34, rx: 6.5, ry: 4, rot: -30, fill: '#a8c896' },
  { cx: 62, cy: 46, rx: 6, ry: 3.5, rot: -55, fill: '#7a9e6a' },
  { cx: 40, cy: 88, rx: 6, ry: 3.5, rot: 10, fill: '#5c7a3c' },
  { cx: 32, cy: 110, rx: 5.5, ry: 3.5, rot: -5, fill: '#a8c896' },
]

const BOTANICAL_DOTS: { cx: number; cy: number; r: number; fill: string }[] = [
  { cx: 132, cy: 8, r: 1.4, fill: '#3d5c2d' },
  { cx: 136, cy: 12, r: 1.1, fill: '#3d5c2d' },
  { cx: 128, cy: 12, r: 1.2, fill: '#3d5c2d' },
  { cx: 104, cy: 40, r: 1.3, fill: '#3d5c2d' },
  { cx: 108, cy: 44, r: 1.1, fill: '#3d5c2d' },
  { cx: 156, cy: 20, r: 1, fill: '#c9a84c' },
  { cx: 144, cy: 50, r: 0.8, fill: '#c9a84c' },
  { cx: 118, cy: 58, r: 0.9, fill: '#c9a84c' },
  { cx: 90, cy: 70, r: 0.7, fill: '#c9a84c' },
  { cx: 66, cy: 90, r: 0.8, fill: '#c9a84c' },
  { cx: 44, cy: 100, r: 0.6, fill: '#c9a84c' },
]

function BotanicalCorner({ flip }: { flip?: boolean }) {
  return (
    <svg width="130" height="115" viewBox="0 0 160 140" fill="none">
      {/* rotate(180, 80, 70) = 180° around viewBox center — SVG-native, no CSS transform on the DOM node */}
      <g transform={flip ? 'rotate(180, 80, 70)' : undefined}>
        <path d="M155,5 Q100,15 55,75" stroke="#5c7a3c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M145,25 Q95,50 50,100" stroke="#5c7a3c" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M125,55 Q90,80 45,110" stroke="#5c7a3c" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {BOTANICAL_LEAVES.map((leaf, i) => (
          <ellipse
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            fill={leaf.fill}
            opacity={0.88}
            transform={`rotate(${leaf.rot}, ${leaf.cx}, ${leaf.cy})`}
          />
        ))}
        {BOTANICAL_DOTS.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.fill} />
        ))}
      </g>
    </svg>
  )
}
```

- [ ] **Step 2: Update the two corner-placement wrappers to the new SVG's larger footprint**

In `Landscape`, replace:
```tsx
      <div style={{ position: 'absolute', top: 0, right: 0 }}><BotanicalCorner /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}><BotanicalCorner flip /></div>
```
with:
```tsx
      <div style={{ position: 'absolute', top: 0, right: 0 }}><BotanicalCorner /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}><BotanicalCorner flip /></div>
```
(unchanged — the wrapping divs already use plain `top/right`/`bottom/left` offsets with no CSS transform, so they need no edit; only the SVG's own `width`/`height`/`viewBox` grew, which is self-contained).

In `Portrait`, the wrapping divs use `transform: 'scale(0.65)'` — leave that as-is (it's a `scale`, not `rotate`, so it doesn't trigger the known bug). No change needed there either.

- [ ] **Step 3: Swap the heading font to the project's Playfair Display variable**

In `Landscape` (around line 95), change:
```tsx
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
```
to:
```tsx
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
```

In `Portrait` (around line 141), change the matching `h1`'s `fontFamily: 'Georgia, serif'` to `fontFamily: 'var(--font-heading), Georgia, serif'` the same way.

- [ ] **Step 4: Verify — typecheck and build**

Run: `npm run build`
Expected: build completes with no TypeScript errors (this project has no unit test suite; `npm run build` is the verification gate per `CLAUDE.md`).

- [ ] **Step 5: Stop — do not commit**

Leave the change uncommitted. Do not run `git add` or `git commit`. The user reviews this visually via the Task 4 preview page before anything is committed.

---

### Task 2: Denser floral corner illustration (rose + eucalyptus bouquet)

**Files:**
- Modify: `components/table-card/card-floral.tsx:16-51` (the `FloralCorner` function)
- Modify: `components/table-card/card-floral.tsx:99` and `:146` (the `h1` `fontFamily` in `Landscape` and `Portrait`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `FloralCorner({ flip }: { flip?: boolean })` keeps the same signature and call sites (`<FloralCorner />` / `<FloralCorner flip />`) — no caller changes.

- [ ] **Step 1: Replace `FloralCorner` with a layered rose + eucalyptus bouquet**

Replace lines 15–51 (the whole `FloralCorner` function) with:

```tsx
// Layered rose + eucalyptus bouquet corner (160×140 viewBox), inspired by
// the dense wedding-stationery reference bouquet (Stitch-generated, floral-stitch-1.png)
function RoseBloom({ x, y, scale = 1, rotate = 0, petal = '#f4a0b0', petalDark = '#e07898', center = '#8B2252' }: {
  x: number; y: number; scale?: number; rotate?: number; petal?: string; petalDark?: string; center?: string
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0,0 c-6,-11 -17,-6 -17,6 c0,11 11,17 17,11 c6,6 17,0 17,-11 c0,-12 -11,-17 -17,-6" fill={petal} opacity="0.9" />
      <path d="M-9,2 c-6,-9 -14,-2 -11,6 c3,8 9,5 11,-6" fill={petalDark} opacity="0.7" />
      <path d="M9,2 c6,-9 14,-2 11,6 c-3,8 -9,5 -11,-6" fill={petalDark} opacity="0.7" />
      <path d="M0,-9 c-9,-6 -9,9 0,9 c9,0 9,-15 0,-9" fill={petalDark} opacity="0.8" />
      <path d="M-3,-2 c-2,-5 3,-7 3,-2 c1,-5 6,-2 3,2 c2,5 -3,7 -3,2 c-1,5 -6,2 -3,-2" fill={center} opacity="0.5" />
    </g>
  )
}

function RoseBud({ x, y, scale = 1, rotate = 0, petal = '#f9c0cc' }: {
  x: number; y: number; scale?: number; rotate?: number; petal?: string
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0,-6 q6,3 4,10 q-4,6 -8,0 q-2,-7 4,-10" fill={petal} opacity="0.9" />
    </g>
  )
}

function EucLeaf({ x, y, rx, ry, rot, fill }: { x: number; y: number; rx: number; ry: number; rot: number; fill: string }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill} opacity="0.82" transform={`rotate(${rot}, ${x}, ${y})`} />
}

const FLORAL_LEAVES: { x: number; y: number; rx: number; ry: number; rot: number; fill: string }[] = [
  { x: 150, y: 20, rx: 9, ry: 5, rot: -20, fill: '#9ec87e' },
  { x: 138, y: 12, rx: 8, ry: 4.5, rot: -40, fill: '#6a9a5a' },
  { x: 118, y: 22, rx: 10, ry: 5.5, rot: -15, fill: '#9ec87e' },
  { x: 100, y: 14, rx: 8, ry: 4.5, rot: -50, fill: '#6a9a5a' },
  { x: 140, y: 44, rx: 9, ry: 5, rot: -60, fill: '#6a9a5a' },
  { x: 120, y: 56, rx: 10, ry: 5.5, rot: -35, fill: '#9ec87e' },
  { x: 100, y: 66, rx: 8.5, ry: 5, rot: -65, fill: '#6a9a5a' },
  { x: 80, y: 74, rx: 9, ry: 5, rot: -45, fill: '#9ec87e' },
  { x: 60, y: 82, rx: 7.5, ry: 4.5, rot: -70, fill: '#6a9a5a' },
  { x: 108, y: 90, rx: 8, ry: 4.5, rot: 10, fill: '#9ec87e' },
  { x: 88, y: 100, rx: 8.5, ry: 5, rot: -10, fill: '#6a9a5a' },
  { x: 68, y: 108, rx: 7, ry: 4, rot: 15, fill: '#9ec87e' },
  { x: 46, y: 96, rx: 6.5, ry: 4, rot: -20, fill: '#6a9a5a' },
  { x: 36, y: 112, rx: 6, ry: 3.5, rot: 5, fill: '#9ec87e' },
]

function FloralCorner({ flip }: { flip?: boolean }) {
  return (
    <svg width="130" height="115" viewBox="0 0 160 140" fill="none">
      <g transform={flip ? 'rotate(180, 80, 70)' : undefined}>
        <path d="M150,10 Q95,35 50,95" stroke="#6a9a5a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M135,35 Q90,60 45,110" stroke="#6a9a5a" strokeWidth="1" fill="none" strokeLinecap="round" />
        {FLORAL_LEAVES.map((leaf, i) => <EucLeaf key={i} {...leaf} />)}
        <RoseBloom x={128} y={30} scale={1.15} rotate={0} />
        <RoseBloom x={92} y={54} scale={0.9} rotate={-25} petal="#f9c0cc" petalDark="#f4a0b0" />
        <RoseBloom x={68} y={86} scale={0.75} rotate={20} petal="#f4a0b0" petalDark="#e07898" />
        <RoseBud x={112} y={66} rotate={-15} />
        <RoseBud x={78} y={44} rotate={30} />
        <RoseBud x={50} y={68} rotate={-40} petal="#f4a0b0" />
      </g>
    </svg>
  )
}
```

- [ ] **Step 2: Update the two corner-placement wrappers**

No edit needed — same reasoning as Task 1 Step 2: the `Landscape` wrappers use plain top/right and bottom/left offsets, and the `Portrait` wrappers use `transform: 'scale(0.65)'`, neither of which needs to change for the new SVG's larger footprint.

- [ ] **Step 3: Swap the heading font to Playfair Display**

In `Landscape` (around line 99) and `Portrait` (around line 146), change the `h1`'s `fontFamily: 'Georgia, serif'` to `fontFamily: 'var(--font-heading), Georgia, serif'` — same edit as Task 1 Step 3.

- [ ] **Step 4: Verify — typecheck and build**

Run: `npm run build`
Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Stop — do not commit**

Leave the change uncommitted.

---

### Task 3: Minimal template — double-line frame + geometric corner marks

**Files:**
- Modify: `components/table-card/card-minimal.tsx:40-104` (`Landscape`) and `:107-159` (`Portrait`)

**Interfaces:**
- Consumes: nothing new.
- Produces: a new internal `CornerMark({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' })` component, used only within this file — no other file references it.

- [ ] **Step 1: Add a `CornerMark` component above `Landscape`**

Insert this above the `// ── LANDSCAPE` comment (after the existing `QRContent` function):

```tsx
// Minimal geometric corner motif — no botanical/floral shapes, keeps the "quiet luxury" identity
function CornerMark({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotation: Record<typeof corner, number> = { tl: 0, tr: 90, br: 180, bl: 270 }
  const position: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 14, left: 14 },
    tr: { top: 14, right: 14 },
    br: { bottom: 14, right: 14 },
    bl: { bottom: 14, left: 14 },
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', ...position[corner] }}>
      <g transform={`rotate(${rotation[corner]}, 11, 11)`}>
        <path d="M3,3 L3,11 M3,3 L11,3" stroke="#6D1A3E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <rect x="1.5" y="1.5" width="3" height="3" fill="none" stroke="#6D1A3E" strokeWidth="0.8" transform="rotate(45, 3, 3)" />
      </g>
    </svg>
  )
}
```

- [ ] **Step 2: Add the double-line frame and 4 corner marks to `Landscape`**

In the `Landscape` function's returned `<div>`, right after the two existing accent-bar `<div>`s (`top: 0` and `bottom: 0` bars), add:

```tsx
      {/* Double-line frame — thin inset border for a "quiet luxury" feel */}
      <div style={{ position: 'absolute', inset: 14, border: '1px solid #6D1A3E', opacity: 0.25, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 18, border: '1px solid #6D1A3E', opacity: 0.12, pointerEvents: 'none' }} />
      <CornerMark corner="tl" />
      <CornerMark corner="tr" />
      <CornerMark corner="bl" />
      <CornerMark corner="br" />
```

- [ ] **Step 3: Add the same frame and corner marks to `Portrait`**

In the `Portrait` function's returned `<div>`, right after the two existing accent-bar `<div>`s and the two side-accent-line `<div>`s, add the identical block from Step 2 (double-line frame + 4 `CornerMark`s).

- [ ] **Step 4: Swap the heading font to Playfair Display**

In both `Landscape` (around line 70) and `Portrait` (around line 128), change the `h1`'s `fontFamily: 'Georgia, serif'` to `fontFamily: 'var(--font-heading), Georgia, serif'`.

- [ ] **Step 5: Verify — typecheck and build**

Run: `npm run build`
Expected: build completes with no TypeScript errors. (`CornerMark`'s `Record<typeof corner, ...>` needs `React` types already imported by the `.tsx` JSX runtime — no new import required.)

- [ ] **Step 6: Stop — do not commit**

Leave the change uncommitted.

---

### Task 4: Dev-only "review all templates" preview page

**Files:**
- Create: `app/dev/masa-karti-preview/page.tsx`
- Create: `app/dev/masa-karti-preview/preview-client.tsx`

**Interfaces:**
- Consumes: `TableCard` (default export, props `{ templateId: TemplateId; title: string; eventType?: string; eventDate?: string; guestUrl: string; orientation?: 'landscape' | 'portrait'; scale?: number }`) from `components/table-card/table-card.tsx`; `DownloadPdfBtn` (default export, same prop shape plus required `orientation`) from `components/table-card/download-pdf-btn.tsx`; `TemplateId` type (`'floral' | 'botanical' | 'minimal'`) from `components/table-card/table-card.tsx`.
- Produces: route `/dev/masa-karti-preview`, reachable only when `NODE_ENV === 'development'`.

- [ ] **Step 1: Create the dev-only server component gate**

Create `app/dev/masa-karti-preview/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import PreviewClient from './preview-client'

export default function MasaKartiPreviewPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }
  return <PreviewClient />
}
```

- [ ] **Step 2: Create the client grid + "download all" component**

Create `app/dev/masa-karti-preview/preview-client.tsx`:

```tsx
'use client'

import { useState } from 'react'
import TableCard, { type TemplateId } from '@/components/table-card/table-card'
import DownloadPdfBtn from '@/components/table-card/download-pdf-btn'

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'botanical', label: 'Botanical' },
  { id: 'floral', label: 'Floral' },
  { id: 'minimal', label: 'Minimal' },
]

const ORIENTATIONS: ('landscape' | 'portrait')[] = ['landscape', 'portrait']

const SAMPLE = {
  title: 'Efe & Yasemin',
  eventType: 'Düğün',
  eventDate: '2026-09-12',
  guestUrl: 'https://www.anikare.net/e/efe-yasemin-abc123',
}

export default function PreviewClient() {
  const [downloadingAll, setDownloadingAll] = useState(false)

  async function downloadAll() {
    setDownloadingAll(true)
    // Sequential, not parallel — html2canvas renders one detached DOM node at a
    // time (see download-pdf-btn.tsx renderCardToCanvas); firing 6 in parallel
    // would race on that single hidden container.
    for (const t of TEMPLATES) {
      for (const o of ORIENTATIONS) {
        const btn = document.querySelector<HTMLButtonElement>(`[data-download="${t.id}-${o}"]`)
        btn?.click()
        await new Promise((r) => setTimeout(r, 1200))
      }
    }
    setDownloadingAll(false)
  }

  return (
    <div style={{ padding: 32, background: '#f5f5f0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Masa Kartı Önizleme (dev-only)</h1>
        <button
          onClick={downloadAll}
          disabled={downloadingAll}
          style={{ background: '#6D1A3E', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
        >
          {downloadingAll ? 'İndiriliyor...' : 'Tümünü İndir (6 PDF)'}
        </button>
      </div>
      {TEMPLATES.map(({ id, label }) => (
        <div key={id} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{label}</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {ORIENTATIONS.map((o) => (
              <div key={o} style={{ background: 'white', borderRadius: 16, padding: 16 }}>
                <TableCard templateId={id} orientation={o} scale={0.55} {...SAMPLE} />
                <div data-download={`${id}-${o}`} style={{ marginTop: 12 }}>
                  <DownloadPdfBtn templateId={id} orientation={o} {...SAMPLE} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify — typecheck and build**

Run: `npm run build`
Expected: build completes with no TypeScript errors, and the route `/dev/masa-karti-preview` appears in the build output route list.

- [ ] **Step 4: Verify the dev-only gate manually**

Run: `npm run dev` (in one terminal), then in another terminal:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dev/masa-karti-preview
```
Expected: `200`.

Then run a production build and start, and confirm the route 404s:
```bash
npm run build && npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dev/masa-karti-preview
```
Expected: `404`. Stop the `npm run start` process afterward.

- [ ] **Step 5: Stop — do not commit**

Leave the change uncommitted.

---

### Task 5: Full visual + PDF-corner regression check

**Files:** none created or modified — this task only exercises Tasks 1–4's output.

**Interfaces:** none.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Open the preview page and visually compare all 6 cards**

Navigate to `http://localhost:3000/dev/masa-karti-preview`. Confirm:
- Botanical and floral corners look layered/full (not sparse), matching the density of the competitor reference photos in `~/Downloads/WhatsApp Image 2026-07-19*.jpeg`.
- Minimal template shows the double-line frame and 4 corner marks without looking cluttered.
- All 3 templates' couple-name heading renders in Playfair Display (serif with high-contrast strokes, not the plain Georgia system font).

- [ ] **Step 3: Download all 6 PDFs and check corner alignment**

Click "Tümünü İndir (6 PDF)". Open each of the 6 downloaded PDFs and confirm the top-right and bottom-left corner illustrations sit flush against their corners with no visible seam, gap, or crooked/rotated appearance — this is the exact regression the "no CSS `transform: rotate()`" constraint exists to prevent.

- [ ] **Step 4: Report back**

Tell the user which of the 6 combinations look good and which (if any) need adjustment. Do not commit anything — wait for explicit approval.

---

## Self-Review Notes

- **Spec coverage:** Font (Task 1–3 Step 3/4), botanical richer illustration (Task 1), floral richer illustration (Task 2), minimal frame/corner improvement (Task 3), PDF corner-rotation constraint (Global Constraints + verified in Task 5), dev-only preview page (Task 4), no commit/push (Global Constraints, every task's last step) — all spec sections are covered.
- **Type consistency:** `TemplateId` is imported from `table-card.tsx` (its single source of truth) in `preview-client.tsx`, not redefined. `CardProps` is unchanged in all 3 template files, so `TableCard`'s existing prop-spreading (`{...cardProps}`) keeps working without modification.
- **No placeholders:** every SVG path/ellipse/component above has literal coordinates and colors — nothing marked TBD.
