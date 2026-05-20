# AnıKare UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tam UI yeniden tasarımı — Design System C (Bordo #6D1A3E + Krem #FAF7F2), PWA native hissi, bug düzeltmeleri ve yeni medya staging ekranı.

**Architecture:** Tailwind CSS v4 `@theme` ile design token'ları global CSS'e eklenir. Framer Motion sayfa geçişleri. Misafir akışı `stage` state machine'i `'welcome' | 'staging' | 'uploading' | 'thankyou'` olacak şekilde genişletilir. Bottom nav dashboard'da sidebar'ın yerini alır.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Framer Motion, Playfair Display + Inter (next/font), TypeScript

**Spec:** `docs/superpowers/specs/2026-05-20-ui-redesign.md`

---

## File Map

```
Modify:   app/globals.css
Modify:   app/layout.tsx
Modify:   app/(marketing)/layout.tsx
Modify:   app/(dashboard)/layout.tsx
Modify:   app/(auth)/layout.tsx
Modify:   app/(auth)/giris/page.tsx
Modify:   app/(marketing)/page.tsx
Modify:   app/api/upload/presign/route.ts          ← MIME bug fix

Create:   components/ui/button.tsx
Create:   components/ui/input.tsx
Create:   components/ui/card.tsx
Create:   components/ui/bottom-bar.tsx

Modify:   components/guest/pin-entry.tsx
Modify:   components/guest/welcome-screen.tsx
Modify:   components/guest/upload-bar.tsx           ← camera bug fix
Create:   components/guest/media-staging.tsx        ← NEW
Create:   components/guest/upload-progress.tsx      ← NEW
Modify:   components/guest/thank-you-screen.tsx
Modify:   components/guest/guest-flow.tsx           ← state machine + thank-you timing fix

Modify:   hooks/use-media-upload.ts                 ← batch upload support

Create:   components/dashboard/bottom-nav.tsx       ← NEW
Modify:   components/dashboard/sidebar.tsx          ← logo update
Modify:   components/dashboard/media-grid.tsx
Modify:   components/dashboard/media-card.tsx
Modify:   components/dashboard/media-modal.tsx
Modify:   components/dashboard/qr-download.tsx

Modify:   components/event/wizard.tsx               ← guest count bug fix
Modify:   components/event/steps/step-details.tsx   ← input redesign + guest count fix
Modify:   components/event/steps/step-package.tsx
Modify:   components/event/steps/step-template.tsx
Modify:   components/event/table-card-preview.tsx

Modify:   components/landing/hero.tsx
Modify:   components/landing/features.tsx
Modify:   components/landing/pricing.tsx

Create:   public/icons/icon-192.png  (manual step — generate from SVG)
Create:   public/icons/icon-512.png  (manual step)
```

---

## Task 1: Design System Foundation — globals.css + Fonts + Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update globals.css with design system tokens**

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Brand colors */
  --color-brand: #6D1A3E;
  --color-brand-light: #f5e6ed;
  --color-brand-muted: #9b4a6a;
  --color-cream: #FAF7F2;
  --color-cream-dark: #F0EBE3;
  --color-surface: #FFFFFF;

  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-muted: #7a6a5a;
  --color-text-subtle: #9ca3af;

  /* Fonts */
  --font-heading: var(--font-playfair);
  --font-sans: var(--font-inter);

  /* Background */
  --color-background: var(--color-cream);
}

/* PWA / app feel */
html {
  height: 100%;
  background-color: #FAF7F2;
}

body {
  height: 100%;
  background-color: #FAF7F2;
  color: #1a1a1a;
  font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}

/* Input contrast fix — global */
input, textarea, select {
  color: #1a1a1a;
}
input::placeholder,
textarea::placeholder {
  color: #9ca3af;
}

/* Safe area for iOS notch / bottom bar */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
```

- [ ] **Step 2: Update app/layout.tsx with Playfair Display + Inter**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AnıKare — Dijital Anı Defteri',
  description: 'Düğün ve davetleriniz için QR tabanlı fotoğraf paylaşım platformu',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AnıKare',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6D1A3E',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```
Expected: no TypeScript errors, `/` and other routes in output.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: design system tokens, Playfair+Inter fonts, PWA viewport"
```

---

## Task 2: Base UI Components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/bottom-bar.tsx`

- [ ] **Step 1: Create Button component**

```tsx
// components/ui/button.tsx
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed rounded-full'

    const variants = {
      primary: 'bg-[#6D1A3E] text-white hover:bg-[#5a1533] shadow-sm',
      secondary: 'border border-[#6D1A3E] text-[#6D1A3E] bg-transparent hover:bg-[#f5e6ed]',
      ghost: 'text-[#7a6a5a] hover:text-[#1a1a1a] hover:bg-[#F0EBE3]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-6 py-4 text-base w-full',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
```

- [ ] **Step 2: Create Input component**

```tsx
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
          {props.required && <span className="text-[#6D1A3E] ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] transition focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] ${
          error ? 'border-red-400' : 'border-[#e8ddd5]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-[#9ca3af]">{hint}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] transition focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] resize-none ${
          error ? 'border-red-400' : 'border-[#e8ddd5]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Create Card component**

```tsx
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div className={`bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create BottomBar component**

```tsx
// components/ui/bottom-bar.tsx
interface BottomBarProps {
  children: React.ReactNode
  className?: string
  blur?: boolean
}

export default function BottomBar({ children, className = '', blur = true }: BottomBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] border-t border-[#e8ddd5] ${
        blur ? 'bg-white/90 backdrop-blur-xl' : 'bg-white'
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```
Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add components/ui/
git commit -m "feat: base UI components (button, input, card, bottom-bar)"
```

---

## Task 3: Bug Fix — MIME Types in Presign Route

**Files:**
- Modify: `app/api/upload/presign/route.ts`

- [ ] **Step 1: Expand MIME type allowlist and fix schema regex**

```typescript
// app/api/upload/presign/route.ts
import { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2/client'
import { createServiceClient } from '@/lib/supabase/server'
import { PACKAGES } from '@/lib/packages'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import type { PresignResponse } from '@/types'

// Allow image/* and video/* but also application/octet-stream (some browsers)
const schema = z.object({
  eventId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  fileType: z.enum(['photo', 'video']),
})

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'application/octet-stream', // fallback for unknown types
])

// Derive file type from extension if MIME is octet-stream
const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', '3gp', 'avi'])

function resolveFileType(mimeType: string, fileName: string, claimed: 'photo' | 'video'): 'photo' | 'video' {
  if (mimeType === 'application/octet-stream') {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    if (PHOTO_EXTENSIONS.has(ext)) return 'photo'
    if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  }
  return claimed
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { eventId, fileName, mimeType, fileSize, fileType: claimedType } = parsed.data

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const fileType = resolveFileType(mimeType, fileName, claimedType)

  const supabase = await createServiceClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('id, package_type, is_upload_active, upload_expires_at, photo_count, video_count')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return Response.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.is_upload_active) {
    return Response.json({ error: 'Upload closed' }, { status: 403 })
  }

  if (event.upload_expires_at && new Date(event.upload_expires_at) < new Date()) {
    return Response.json({ error: 'Event expired' }, { status: 403 })
  }

  const pkg = PACKAGES[event.package_type as keyof typeof PACKAGES]

  if (fileType === 'photo' && event.photo_count >= pkg.maxPhotos) {
    return Response.json({ error: 'Photo limit reached' }, { status: 403 })
  }
  if (fileType === 'video' && event.video_count >= pkg.maxVideos) {
    return Response.json({ error: 'Video limit reached' }, { status: 403 })
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? (fileType === 'video' ? 'mp4' : 'jpg')
  const fileKey = `events/${eventId}/${fileType}s/${nanoid()}.${ext}`

  // Use a safe content type for octet-stream uploads
  const contentType = mimeType === 'application/octet-stream'
    ? (fileType === 'video' ? 'video/mp4' : 'image/jpeg')
    : mimeType

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: contentType,
    ContentLength: fileSize,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
  const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`

  return Response.json({ uploadUrl, fileKey, publicUrl } satisfies PresignResponse)
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "api/upload"
```
Expected: `ƒ /api/upload/presign`

- [ ] **Step 3: Commit**

```bash
git add app/api/upload/presign/route.ts
git commit -m "fix: expand MIME type allowlist, handle octet-stream and image/jpg"
```

---

## Task 4: Refactor useMediaUpload — Batch Upload Support

**Files:**
- Modify: `hooks/use-media-upload.ts`

The hook needs to support uploading an array of files and tracking progress across all of them, returning a callback for when ALL uploads complete.

- [ ] **Step 1: Rewrite hook**

```typescript
// hooks/use-media-upload.ts
'use client'

import { useState, useCallback } from 'react'
import { compressImage, isVideoFile } from '@/lib/media/compress'
import type { PackageType, FileType } from '@/types'

export interface UploadItem {
  file: File
  preview: string        // URL.createObjectURL()
  fileType: FileType
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface BatchUploadArgs {
  items: UploadItem[]
  eventId: string
  packageType: PackageType
  guestName: string
  guestNote?: string
  onProgress: (done: number, total: number) => void
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadBatch = useCallback(async ({
    items,
    eventId,
    packageType,
    guestName,
    guestNote,
    onProgress,
  }: BatchUploadArgs): Promise<boolean> => {
    setUploading(true)
    setError(null)
    let done = 0

    try {
      for (const item of items) {
        const fileType = item.fileType
        const processedFile = fileType === 'photo'
          ? await compressImage(item.file, packageType)
          : item.file

        const presignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            fileType,
            fileName: processedFile.name,
            mimeType: processedFile.type || 'application/octet-stream',
            fileSize: processedFile.size,
          }),
        })

        if (!presignRes.ok) {
          const err = await presignRes.json()
          throw new Error(err.error ?? 'Presign başarısız')
        }

        const { uploadUrl, fileKey, publicUrl } = await presignRes.json()

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: processedFile,
          headers: { 'Content-Type': processedFile.type || 'application/octet-stream' },
        })

        if (!uploadRes.ok) throw new Error('R2 yüklemesi başarısız')

        const confirmRes = await fetch('/api/upload/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            guestName,
            guestNote,
            fileKey,
            fileUrl: publicUrl,
            fileType,
            fileSize: processedFile.size,
            originalFilename: item.file.name,
          }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json()
          throw new Error(err.error ?? 'Kayıt başarısız')
        }

        done++
        onProgress(done, items.length)
      }

      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata')
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploadBatch, uploading, error, resetError: () => setError(null) }
}

export function createUploadItems(files: FileList): UploadItem[] {
  return Array.from(files).map(file => ({
    file,
    preview: URL.createObjectURL(file),
    fileType: file.type.startsWith('video/') ? 'video' : 'photo',
    status: 'pending' as const,
  }))
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|✓" | head -5
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add hooks/use-media-upload.ts
git commit -m "feat: refactor useMediaUpload to batch upload with progress tracking"
```

---

## Task 5: Guest Flow — PIN Entry Redesign

**Files:**
- Modify: `components/guest/pin-entry.tsx`

- [ ] **Step 1: Rewrite PIN entry with design system**

```tsx
// components/guest/pin-entry.tsx
'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/button'

interface Props {
  eventId: string
  dict: Record<string, string>
  onSuccess: () => void
}

export default function PinEntry({ eventId, dict, onSuccess }: Props) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[index] = value
    setPin(next)
    setError(false)
    if (value && index < 3) refs[index + 1].current?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  async function handleSubmit() {
    const code = pin.join('')
    if (code.length !== 4) return
    setLoading(true)
    setError(false)

    const res = await fetch('/api/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, pin: code }),
    })

    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      setError(true)
      setPin(['', '', '', ''])
      refs[0].current?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs text-center"
      >
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-2">
          {dict.pinTitle ?? 'Gizlilik Kodu'}
        </h1>
        <p className="text-sm text-[#7a6a5a] mb-8">
          {dict.pinDescription ?? 'Masa kartınızdaki 4 haneli kodu girin'}
        </p>

        {/* OTP boxes */}
        <div className="flex justify-center gap-3 mb-5">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                error
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : digit
                  ? 'border-[#6D1A3E] bg-[#f5e6ed] text-[#6D1A3E]'
                  : 'border-[#e8ddd5] bg-white text-[#1a1a1a] focus:border-[#6D1A3E]'
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-500 mb-4"
          >
            {dict.pinError ?? 'Hatalı kod, tekrar deneyin'}
          </motion.p>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={pin.join('').length !== 4}
          loading={loading}
        >
          {dict.confirm ?? 'Onayla'}
        </Button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/pin-entry.tsx
git commit -m "feat: redesign PIN entry screen with design system"
```

---

## Task 6: Guest Flow — Welcome Screen Redesign

**Files:**
- Modify: `components/guest/welcome-screen.tsx`

- [ ] **Step 1: Rewrite welcome screen (C variant layout)**

```tsx
// components/guest/welcome-screen.tsx
'use client'

import { motion } from 'framer-motion'
import Input, { Textarea } from '@/components/ui/input'
import Card from '@/components/ui/card'
import type { PublicEvent } from '@/types'

interface Props {
  event: PublicEvent
  dict: Record<string, string>
  guestName: string
  setGuestName: (v: string) => void
  guestNote: string
  setGuestNote: (v: string) => void
}

const EVENT_LABELS: Record<string, string> = {
  wedding: 'Düğün', birthday: 'Doğum Günü',
  graduation: 'Mezuniyet', engagement: 'Nişan', other: 'Etkinlik',
}

export default function WelcomeScreen({ event, dict, guestName, setGuestName, guestNote, setGuestNote }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col bg-[#FAF7F2] px-5 pt-12 pb-36"
    >
      {/* Event hero */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#9b4a6a] mb-3">
          {EVENT_LABELS[event.event_type] ?? 'Etkinlik'}
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-[2rem] font-bold text-[#1a1a1a] leading-tight mb-3">
          {event.title}
        </h1>

        {(event.event_date || event.cover_image_url) && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {event.event_date && (
              <span className="flex items-center gap-1.5 text-sm text-[#7a6a5a]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mt-5 mb-2 max-w-[200px] mx-auto">
          <div className="flex-1 h-px bg-[#d4c3b8]" />
          <svg className="w-4 h-4 text-[#6D1A3E] opacity-60" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2C8 2 5 5 5 8s3 6 3 6 3-3 3-6-3-6-3-6z"/>
          </svg>
          <div className="flex-1 h-px bg-[#d4c3b8]" />
        </div>
      </div>

      {/* Upload card */}
      <Card className="max-w-sm mx-auto w-full">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-1">
          Anılarını Paylaş
        </h2>
        <p className="text-sm text-[#7a6a5a] mb-5 leading-relaxed">
          {event.thank_you_message
            ? 'Fotoğraflarını yüklemek için adını gir.'
            : 'Bu özel günün bir parçası olduğun için teşekkürler 🤍'}
        </p>

        <div className="space-y-4">
          <Input
            label={dict.enterName ?? 'Adınız'}
            placeholder={dict.namePlaceholder ?? 'Örn: Mehmet Yılmaz'}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            autoComplete="name"
            required
          />
          <Textarea
            label={dict.noteOptional ?? 'Bir not bırakın (isteğe bağlı)'}
            placeholder="Dileklerinizi yazabilirsiniz..."
            value={guestNote}
            onChange={(e) => setGuestNote(e.target.value)}
            rows={2}
            maxLength={300}
          />
        </div>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/welcome-screen.tsx
git commit -m "feat: redesign welcome screen with C variant layout and design system"
```

---

## Task 7: Guest Flow — Upload Bar Redesign + Camera Bug Fix

**Files:**
- Modify: `components/guest/upload-bar.tsx`

The bug: both camera and gallery inputs had `multiple`, and `capture="environment"` with `multiple` causes iOS to ignore the capture attribute and open the media picker instead. Fix: camera input has NO `multiple`, gallery has `multiple`. Separate `onChange` handlers to reset input after use.

- [ ] **Step 1: Rewrite upload-bar**

```tsx
// components/guest/upload-bar.tsx
'use client'

import { useRef } from 'react'
import BottomBar from '@/components/ui/bottom-bar'
import Button from '@/components/ui/button'

interface Props {
  dict: Record<string, string>
  disabled: boolean
  onFiles: (files: FileList) => void
}

export default function UploadBar({ dict, disabled, onFiles }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      // Reset so same files can be selected again
      e.target.value = ''
    }
  }

  function handleCamera(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <BottomBar>
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full">
        <Button
          variant="primary"
          size="lg"
          disabled={disabled}
          onClick={() => galleryRef.current?.click()}
        >
          🖼 {dict.selectFromGallery ?? 'Galeriden Seç'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={disabled}
          onClick={() => cameraRef.current?.click()}
        >
          📷 {dict.openCamera ?? 'Kamera ile Çek'}
        </Button>
      </div>

      {/* Gallery: multiple files allowed */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleGallery}
      />
      {/* Camera: NO multiple — required for capture to work on iOS */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={handleCamera}
      />
    </BottomBar>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/upload-bar.tsx
git commit -m "fix: camera capture bug (remove multiple), redesign upload bar"
```

---

## Task 8: NEW — Media Staging Screen

**Files:**
- Create: `components/guest/media-staging.tsx`

This is the new screen between file selection and upload. Shows preview grid, package limits, total size, "Yükle →" CTA.

- [ ] **Step 1: Create media-staging.tsx**

```tsx
// components/guest/media-staging.tsx
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import BottomBar from '@/components/ui/bottom-bar'
import Button from '@/components/ui/button'
import type { UploadItem } from '@/hooks/use-media-upload'
import type { PackageType } from '@/types'
import { PACKAGES } from '@/lib/packages'

interface Props {
  items: UploadItem[]
  packageType: PackageType
  existingPhotoCount: number
  existingVideoCount: number
  onRemove: (index: number) => void
  onAddMore: () => void
  onUpload: () => void
  dict: Record<string, string>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaStaging({
  items, packageType, existingPhotoCount, existingVideoCount,
  onRemove, onAddMore, onUpload, dict,
}: Props) {
  const pkg = PACKAGES[packageType]
  const photoItems = items.filter(i => i.fileType === 'photo')
  const videoItems = items.filter(i => i.fileType === 'video')
  const totalSize = items.reduce((sum, i) => sum + i.file.size, 0)

  const totalPhotos = existingPhotoCount + photoItems.length
  const totalVideos = existingVideoCount + videoItems.length

  const photoLimit = pkg.maxPhotos === Infinity ? '∞' : String(pkg.maxPhotos)
  const videoLimit = pkg.maxVideos === Infinity ? '∞' : String(pkg.maxVideos)

  const overPhotoLimit = pkg.maxPhotos !== Infinity && totalPhotos > pkg.maxPhotos
  const overVideoLimit = pkg.maxVideos !== Infinity && totalVideos > pkg.maxVideos
  const canUpload = items.length > 0 && !overPhotoLimit && !overVideoLimit

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-[#FAF7F2] flex flex-col safe-top"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ddd5] bg-white">
        <h1 className="text-sm font-semibold text-[#1a1a1a]">
          {items.length} {items.length === 1 ? 'dosya seçildi' : 'dosya seçildi'}
        </h1>
        <span className="text-xs bg-[#f5e6ed] text-[#6D1A3E] font-semibold px-3 py-1 rounded-full">
          {packageType === 'eco' ? 'Eko' : packageType === 'standard' ? 'Standart' : 'Premium'} · {photoLimit} 📷 · {videoLimit} 🎬
        </span>
      </div>

      {/* Info bar */}
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-[#7a6a5a]">
          {formatBytes(totalSize)} · {photoItems.length} fotoğraf{videoItems.length > 0 ? `, ${videoItems.length} video` : ''}
        </span>
        <button
          onClick={onAddMore}
          className="text-sm font-medium text-[#6D1A3E] flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Daha Fazla
        </button>
      </div>

      {/* Limit warnings */}
      {overPhotoLimit && (
        <div className="mx-5 mb-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-sm text-red-600">
          ⚠️ Fotoğraf limiti aşıldı ({totalPhotos}/{pkg.maxPhotos})
        </div>
      )}
      {overVideoLimit && (
        <div className="mx-5 mb-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-sm text-red-600">
          ⚠️ Video limiti aşıldı ({totalVideos}/{pkg.maxVideos})
        </div>
      )}

      {/* Preview grid */}
      <div className="flex-1 px-5 pb-40 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {items.map((item, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a]">
              {item.fileType === 'photo' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                  <span className="text-xs text-white/60 truncate max-w-[80px] px-1">{item.file.name}</span>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
              {/* Size badge */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {formatBytes(item.file.size)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <BottomBar>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-[#7a6a5a]">
            📷 {totalPhotos}/{photoLimit} · 🎬 {totalVideos}/{videoLimit}
          </span>
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={!canUpload}
          onClick={onUpload}
        >
          Yükle → ({items.length} dosya)
        </Button>
      </BottomBar>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/media-staging.tsx
git commit -m "feat: new media staging screen with preview grid and package limits"
```

---

## Task 9: NEW — Upload Progress Screen

**Files:**
- Create: `components/guest/upload-progress.tsx`

- [ ] **Step 1: Create upload-progress.tsx**

```tsx
// components/guest/upload-progress.tsx
'use client'

import { motion } from 'framer-motion'

interface Props {
  done: number
  total: number
  error: string | null
}

export default function UploadProgress({ done, total, error }: Props) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs"
      >
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-2">
              Bir sorun oluştu
            </p>
            <p className="text-sm text-[#7a6a5a]">{error}</p>
          </>
        ) : (
          <>
            {/* Animated icon */}
            <div className="w-16 h-16 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-7 h-7 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </motion.div>
            </div>

            <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-1">
              Yükleniyor...
            </p>
            <p className="text-sm text-[#7a6a5a] mb-6">
              {done} / {total} dosya tamamlandı
            </p>

            {/* Progress bar */}
            <div className="h-2 bg-[#e8ddd5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#6D1A3E] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-[#9ca3af] mt-2">{pct}%</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/upload-progress.tsx
git commit -m "feat: upload progress screen with animated indicator"
```

---

## Task 10: Guest Flow — Thank You Redesign

**Files:**
- Modify: `components/guest/thank-you-screen.tsx`

- [ ] **Step 1: Rewrite thank-you screen**

```tsx
// components/guest/thank-you-screen.tsx
'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/button'

interface Props {
  message: string
  videoUrl: string | null
  uploadMoreLabel: string
  onUploadMore: () => void
}

export default function ThankYouScreen({ message, videoUrl, uploadMoreLabel, onUploadMore }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-8 text-center safe-top"
    >
      {/* Animated hearts */}
      <div className="relative mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-20, -60], scale: [0, 1.2, 0.8] }}
            transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="absolute text-2xl"
            style={{ left: `${20 + i * 30}%`, top: 0 }}
          >
            🤍
          </motion.div>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
          className="w-20 h-20 rounded-full bg-[#6D1A3E] flex items-center justify-center mx-auto"
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
          </svg>
        </motion.div>
      </div>

      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          playsInline
          className="w-full max-w-xs rounded-3xl mb-6 shadow-lg"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-3">
          Teşekkürler! 🤍
        </h1>
        <p className="text-base text-[#7a6a5a] max-w-xs leading-relaxed mb-10">
          {message}
        </p>

        <Button variant="primary" size="lg" onClick={onUploadMore} className="max-w-xs">
          {uploadMoreLabel ?? 'Başka Anı Ekle'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/guest/thank-you-screen.tsx
git commit -m "feat: redesign thank-you screen with animated heart"
```

---

## Task 11: Guest Flow — State Machine Overhaul (guest-flow.tsx)

**Files:**
- Modify: `components/guest/guest-flow.tsx`

This wires together all the new components. New stages: `'pin' | 'welcome' | 'staging' | 'uploading' | 'thankyou'`. Thank-you appears ONLY after all uploads complete.

- [ ] **Step 1: Rewrite guest-flow.tsx**

```tsx
// components/guest/guest-flow.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { detectLocale, getDictionary } from '@/lib/i18n'
import PinEntry from './pin-entry'
import WelcomeScreen from './welcome-screen'
import UploadBar from './upload-bar'
import MediaStaging from './media-staging'
import UploadProgress from './upload-progress'
import ThankYouScreen from './thank-you-screen'
import { useMediaUpload, createUploadItems, type UploadItem } from '@/hooks/use-media-upload'
import type { PublicEvent, Dictionary, PackageType } from '@/types'
import { PACKAGES } from '@/lib/packages'

type Stage = 'pin' | 'welcome' | 'staging' | 'uploading' | 'thankyou'

export default function GuestFlow({ event }: { event: PublicEvent }) {
  const [stage, setStage] = useState<Stage>(event.pin_enabled ? 'pin' : 'welcome')
  const [guestName, setGuestName] = useState('')
  const [guestNote, setGuestNote] = useState('')
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const { uploadBatch, error, resetError } = useMediaUpload()

  // Ref for "add more" from staging screen
  const addMoreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getDictionary(detectLocale()).then(setDict)
  }, [])

  const g = dict?.guest ?? ({} as Dictionary['guest'])
  const e = dict?.errors ?? ({} as Dictionary['errors'])

  if (!event.is_upload_active) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-4xl mb-4">📷</p>
          <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-2">
            Yükleme Kapalı
          </p>
          <p className="text-sm text-[#7a6a5a]">
            {e.eventClosed ?? 'Bu etkinlik için yükleme sona erdi.'}
          </p>
        </div>
      </div>
    )
  }

  function handleFilesSelected(files: FileList) {
    const newItems = createUploadItems(files)
    if (stage === 'staging') {
      setItems(prev => [...prev, ...newItems])
    } else {
      setItems(newItems)
      setStage('staging')
    }
  }

  function handleRemoveItem(index: number) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      // Revoke preview URL to avoid memory leak
      URL.revokeObjectURL(prev[index].preview)
      return next
    })
  }

  async function handleUpload() {
    setStage('uploading')
    setUploadProgress({ done: 0, total: items.length })

    const success = await uploadBatch({
      items,
      eventId: event.id,
      packageType: event.package_type as PackageType,
      guestName,
      guestNote: guestNote || undefined,
      onProgress: (done, total) => setUploadProgress({ done, total }),
    })

    // Revoke all preview URLs
    items.forEach(item => URL.revokeObjectURL(item.preview))
    setItems([])

    if (success) {
      setStage('thankyou')
    }
    // If error, stage stays 'uploading' and error is shown via UploadProgress
  }

  function handleUploadMore() {
    setGuestName('')
    setGuestNote('')
    setItems([])
    resetError()
    setStage('welcome')
  }

  const pkg = PACKAGES[event.package_type as PackageType] ?? PACKAGES.eco

  // PIN stage
  if (stage === 'pin') {
    return <PinEntry eventId={event.id} dict={g} onSuccess={() => setStage('welcome')} />
  }

  // Upload progress stage
  if (stage === 'uploading') {
    return (
      <UploadProgress
        done={uploadProgress.done}
        total={uploadProgress.total}
        error={error}
      />
    )
  }

  // Thank you stage
  if (stage === 'thankyou') {
    return (
      <ThankYouScreen
        message={event.thank_you_message ?? (g.thankYouDefault ?? 'Anılarınızı paylaştığınız için teşekkürler!')}
        videoUrl={event.thank_you_video_url}
        uploadMoreLabel={g.uploadMore ?? 'Başka Anı Ekle'}
        onUploadMore={handleUploadMore}
      />
    )
  }

  // Staging stage
  if (stage === 'staging') {
    return (
      <>
        <MediaStaging
          items={items}
          packageType={event.package_type as PackageType}
          existingPhotoCount={event.photo_count}
          existingVideoCount={event.video_count}
          onRemove={handleRemoveItem}
          onAddMore={() => addMoreRef.current?.click()}
          onUpload={handleUpload}
          dict={g}
        />
        {/* Hidden input for "add more" from staging */}
        <input
          ref={addMoreRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFilesSelected(e.target.files)
            e.target.value = ''
          }}
        />
      </>
    )
  }

  // Welcome stage
  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeScreen
        event={event}
        dict={g}
        guestName={guestName}
        setGuestName={setGuestName}
        guestNote={guestNote}
        setGuestNote={setGuestNote}
      />
      <UploadBar
        dict={g}
        disabled={!guestName.trim()}
        onFiles={handleFilesSelected}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|✓" | head -5
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add components/guest/guest-flow.tsx
git commit -m "feat: refactor guest flow state machine with staging + correct thank-you timing"
```

---

## Task 12: Dashboard — Bottom Nav + Layout Update

**Files:**
- Create: `components/dashboard/bottom-nav.tsx`
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/dashboard/sidebar.tsx`

- [ ] **Step 1: Create bottom-nav.tsx**

```tsx
// components/dashboard/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Anılar',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    href: '/etkinlik/yeni',
    label: 'Yeni',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Ayarlar',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#e8ddd5] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around px-4 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 min-w-[56px]"
            >
              {item.icon(active)}
              <span className={`text-[10px] font-medium ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update dashboard layout**

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/sidebar'
import BottomNav from '@/components/dashboard/bottom-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      {/* Desktop sidebar */}
      <Sidebar user={user} />
      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 lg:p-10 pb-24 lg:pb-10">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update sidebar with new logo and brand colors**

```tsx
// components/dashboard/sidebar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User
}

const navItems = [
  { href: '/dashboard', label: 'Etkinliklerim', icon: '🎉' },
  { href: '/etkinlik/yeni', label: 'Yeni Etkinlik', icon: '✨' },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/giris')
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-[#e8ddd5] h-screen sticky top-0">
      <div className="p-6 border-b border-[#e8ddd5]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/logo.svg" alt="AnıKare" width={28} height={36} />
          <span className="text-base font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-[#f5e6ed] text-[#6D1A3E]'
                : 'text-[#7a6a5a] hover:bg-[#FAF7F2] hover:text-[#1a1a1a]'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#e8ddd5]">
        <div className="flex items-center gap-3 mb-3">
          {user.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f5e6ed] flex items-center justify-center text-[#6D1A3E] text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <p className="text-sm font-medium text-[#1a1a1a] truncate min-w-0">
            {user.user_metadata?.full_name ?? user.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-[#9ca3af] hover:text-[#7a6a5a] transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | grep -E "dashboard|error|✓" | head -10
```
Expected: `ƒ /dashboard` visible, no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/bottom-nav.tsx app/\(dashboard\)/layout.tsx components/dashboard/sidebar.tsx
git commit -m "feat: bottom nav for mobile dashboard, sidebar logo update"
```

---

## Task 13: Event Wizard Redesign + Guest Count Bug Fix

**Files:**
- Modify: `components/event/steps/step-details.tsx`
- Modify: `components/event/wizard.tsx`

- [ ] **Step 1: Fix guest count state in wizard.tsx**

Open `components/event/wizard.tsx`. The `guestCountEstimate` field must use a string internally so that clearing the field shows empty string, not zero. Change the type in `WizardState`:

```typescript
// In components/event/wizard.tsx
// Change this interface field:
// guestCountEstimate: number
// TO:
// guestCountEstimate: string

interface WizardState {
  title: string
  eventType: EventType
  eventDate: string
  guestCountEstimate: string   // ← string, not number
  thankYouMessage: string
  pinEnabled: boolean
  pinCode: string
  packageType: PackageType
  templateId: string
}

const INITIAL_STATE: WizardState = {
  title: '',
  eventType: 'wedding',
  eventDate: '',
  guestCountEstimate: '50',   // ← string
  thankYouMessage: '',
  pinEnabled: false,
  pinCode: '',
  packageType: 'standard',
  templateId: 'classic',
}
```

In `handleSubmit`, convert to number before inserting:
```typescript
guest_count_estimate: state.guestCountEstimate ? Number(state.guestCountEstimate) : null,
```

- [ ] **Step 2: Rewrite step-details.tsx with new design**

```tsx
// components/event/steps/step-details.tsx
'use client'

import Input, { Textarea } from '@/components/ui/input'
import type { EventType } from '@/types'

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'wedding', label: 'Düğün', emoji: '💍' },
  { value: 'birthday', label: 'Doğum Günü', emoji: '🎂' },
  { value: 'graduation', label: 'Mezuniyet', emoji: '🎓' },
  { value: 'engagement', label: 'Nişan', emoji: '💒' },
  { value: 'other', label: 'Diğer', emoji: '🎉' },
]

interface StepDetailsState {
  title: string
  eventType: EventType
  eventDate: string
  guestCountEstimate: string
  thankYouMessage: string
  pinEnabled: boolean
  pinCode: string
}

interface Props {
  state: StepDetailsState
  update: (partial: Partial<StepDetailsState>) => void
}

export default function StepDetails({ state, update }: Props) {
  return (
    <div className="space-y-5">
      {/* Event type chips */}
      <div>
        <p className="text-sm font-medium text-[#374151] mb-3">Etkinlik Türü</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => update({ eventType: type.value })}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                state.eventType === type.value
                  ? 'border-[#6D1A3E] bg-[#f5e6ed] text-[#6D1A3E]'
                  : 'border-[#e8ddd5] bg-white text-[#7a6a5a] hover:border-[#6D1A3E]/30'
              }`}
            >
              <span className="text-xl">{type.emoji}</span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="İsimler / Başlık"
        placeholder="Örn: Ahmet & Ayşe"
        value={state.title}
        onChange={(e) => update({ title: e.target.value })}
        required
        hint={state.title
          ? `anikare.co/e/${state.title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}...`
          : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Etkinlik Tarihi"
          type="date"
          value={state.eventDate}
          onChange={(e) => update({ eventDate: e.target.value })}
        />
        <Input
          label="Tahmini Davetli"
          type="number"
          min={1}
          value={state.guestCountEstimate}
          onChange={(e) => update({ guestCountEstimate: e.target.value })}
          placeholder="50"
        />
      </div>

      <Textarea
        label="Teşekkür Mesajı"
        placeholder="Yükleme sonrası misafire gösterilecek mesaj..."
        value={state.thankYouMessage}
        onChange={(e) => update({ thankYouMessage: e.target.value })}
        rows={3}
      />

      {/* PIN toggle */}
      <div className="bg-white border border-[#e8ddd5] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[#374151]">PIN Koruması</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">Yükleme öncesi 4 haneli kod isteyin</p>
          </div>
          <button
            type="button"
            onClick={() => update({ pinEnabled: !state.pinEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              state.pinEnabled ? 'bg-[#6D1A3E]' : 'bg-[#e8ddd5]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                state.pinEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {state.pinEnabled && (
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={state.pinCode}
            onChange={(e) => update({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="4 haneli PIN"
            className="w-full bg-[#FAF7F2] border border-[#e8ddd5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition"
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | grep -E "etkinlik|error|✓" | head -5
```
Expected: `ƒ /etkinlik/yeni` visible, no errors.

- [ ] **Step 4: Commit**

```bash
git add components/event/steps/step-details.tsx components/event/wizard.tsx
git commit -m "fix: guest count string state bug; redesign wizard step-details"
```

---

## Task 14: Auth + Marketing Pages Update

**Files:**
- Modify: `app/(auth)/layout.tsx`
- Modify: `app/(auth)/giris/page.tsx`
- Modify: `app/(marketing)/layout.tsx`

- [ ] **Step 1: Update auth layout**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-5">
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Update login page with design system**

```tsx
// app/(auth)/giris/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(109,26,62,0.12)] p-10 w-full max-w-sm text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <Image src="/brand/logo.svg" alt="AnıKare" width={32} height={40} />
        <span className="text-lg font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
      </div>
      <p className="text-[#7a6a5a] text-sm mb-8">Düğününüzün dijital anı defteri</p>

      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white border border-[#e8ddd5] rounded-2xl px-6 py-4 text-sm font-medium text-[#1a1a1a] hover:bg-[#FAF7F2] active:scale-[0.98] transition-all"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Devam Et
      </button>

      <p className="text-xs text-[#9ca3af] mt-6">
        Giriş yaparak Kullanım Koşulları&apos;nı kabul etmiş olursunuz.
      </p>
    </motion.div>
  )
}
```

- [ ] **Step 3: Update marketing layout with logo**

```tsx
// app/(marketing)/layout.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#e8ddd5]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/brand/logo.svg" alt="AnıKare" width={22} height={28} />
            <span className="text-sm font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm text-[#7a6a5a] hover:text-[#1a1a1a] transition-colors">
              Giriş
            </Link>
            <Link
              href="/giris"
              className="bg-[#6D1A3E] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#5a1533] transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#e8ddd5] py-8 text-center text-sm text-[#9ca3af]">
        © {new Date().getFullYear()} AnıKare
      </footer>
    </>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | grep -E "error|✓" | head -5
```

- [ ] **Step 5: Commit**

```bash
git add app/\(auth\)/ app/\(marketing\)/layout.tsx
git commit -m "feat: update auth and marketing layouts with logo and design system"
```

---

## Task 15: PWA Icons — Generate from SVG

This is a manual step. The SVG logo at `public/brand/logo.svg` needs to be rasterized into PNG icons.

- [ ] **Step 1: Generate PNG icons**

Run in terminal:

```bash
# Option A: if you have Inkscape installed
inkscape public/brand/logo.svg --export-png=public/icons/icon-192.png --export-width=192
inkscape public/brand/logo.svg --export-png=public/icons/icon-512.png --export-width=512

# Option B: if you have ImageMagick
convert -background '#6D1A3E' -resize 192x192 public/brand/logo.svg public/icons/icon-192.png
convert -background '#6D1A3E' -resize 512x512 public/brand/logo.svg public/icons/icon-512.png

# Option C: use an online SVG-to-PNG converter and save to public/icons/
# Then verify files exist:
ls public/icons/
```

Expected: `icon-192.png` and `icon-512.png` in `public/icons/`.

- [ ] **Step 2: Update manifest**

```typescript
// app/manifest.ts — already correct from Task 1's layout.tsx viewport, but verify:
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AnıKare — Dijital Anı Defteri',
    short_name: 'AnıKare',
    description: 'Düğün ve davetleriniz için QR tabanlı fotoğraf paylaşım platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#6D1A3E',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/icons/ app/manifest.ts
git commit -m "feat: PWA icons and manifest theme color update"
```

---

## Task 16: Final Build Verification + Push

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected output — all routes present, zero TypeScript errors:
```
✓ Compiled successfully
Route (app)
├ ○ /
├ ○ /giris
├ ƒ /dashboard
├ ƒ /etkinlik/yeni
├ ƒ /etkinlik/[slug]
├ ƒ /e/[slug]
├ ƒ /sunum/[slug]
├ ƒ /api/upload/presign
├ ƒ /api/upload/confirm
├ ƒ /api/pin/verify
├ ƒ /api/media
├ ƒ /api/media/[id]
├ ƒ /api/cron/cleanup
├ ○ /manifest.webmanifest
```

- [ ] **Step 2: Update CLAUDE.md completed tasks**

In `CLAUDE.md`, update the completed tasks list to include all UI redesign tasks.

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ globals.css + PWA body styles → Task 1
- ✅ Playfair Display + Inter → Task 1
- ✅ Button, Input, Card, BottomBar components → Task 2
- ✅ MIME type fix (image/jpg, heic, octet-stream) → Task 3
- ✅ Batch upload hook → Task 4
- ✅ PIN entry redesign → Task 5
- ✅ Welcome screen redesign (C layout + desc) → Task 6
- ✅ Camera bug fix (no multiple on camera input) → Task 7
- ✅ Media staging screen → Task 8
- ✅ Upload progress screen → Task 9
- ✅ Thank-you redesign → Task 10
- ✅ Thank-you timing fix (after ALL uploads) → Task 11 (guest-flow.tsx)
- ✅ Input contrast (dark placeholder, labels above) → Task 2 (Input component) + Task 13
- ✅ Guest count string state bug fix → Task 13
- ✅ Bottom nav for mobile → Task 12
- ✅ Logo in header/sidebar/login → Tasks 12, 14
- ✅ PWA icons → Task 15
- ✅ Dashboard layout update → Task 12

**No placeholders found.**

**Type consistency:**
- `UploadItem` defined in `hooks/use-media-upload.ts`, imported in `media-staging.tsx` and `guest-flow.tsx` ✅
- `createUploadItems` exported from hook, used in `guest-flow.tsx` ✅
- `guestCountEstimate: string` in wizard state and step-details ✅
- `PACKAGES` imported from `@/lib/packages` in staging and upload-batch ✅
