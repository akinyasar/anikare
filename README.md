# AnıKare — Digital Memory Sharing for Weddings & Events

> **Scan. Capture. Remember.**
> A QR-based photo sharing platform that turns every guest into a photographer — no app download required.

---

## What is AnıKare?

AnıKare (Turkish for *memory frame*) is a SaaS platform built for weddings, birthdays, and celebrations. Hosts place printed QR code cards on each table; guests scan, enter their name, and upload photos directly from their browser. The host collects every memory in one place and can project a live slideshow on the venue screen in real time.

---

## Features

### For Guests
- **Zero friction** — scan QR, upload photos. No account, no app install.
- **Multilingual** — auto-detects browser language (Turkish, English, German)
- **Privacy-protected** — optional 4-digit PIN per event keeps uploads private
- **Smart compression** — photos are compressed client-side based on the host's package before upload, saving bandwidth
- **Personalized thank-you** — custom message (or video) shown after each upload

### For Hosts
- **Event wizard** — create an event in minutes with cover photo, thank-you message, and optional PIN
- **Auto-generated slug** — SEO-friendly URLs like `/e/ahmet-ve-ayse-evleniyor-abc123`
- **Package tiers** — Eco, Standard, and Premium with different storage limits and quality settings
- **Live dashboard** — masonry media grid with real-time photo/video count
- **Moderation** — hide or delete inappropriate content with one click
- **Print-ready cards** — download QR code + table card as PDF/PNG
- **Live slideshow** *(Premium)* — a fullscreen auto-advancing presentation for the venue screen, updated in real time as guests upload

### Technical Highlights
- **Serverless** — no backend to maintain; built entirely on Next.js API routes
- **Zero egress storage** — Cloudflare R2 means no bandwidth costs on media delivery
- **Auto data lifecycle** — media deleted automatically after 90 days; upload links close 7 days after the event
- **Production-grade security** — Supabase RLS policies, bcrypt-hashed PINs, httpOnly session cookies, service-role API routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Auth & Database | Supabase (PostgreSQL + Google OAuth) |
| Storage | Cloudflare R2 |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── (marketing)/          # Public landing page
├── (auth)/               # Google OAuth login + callback
├── (dashboard)/          # Protected host dashboard
│   └── etkinlik/[slug]/  # Per-event management
├── e/[slug]/             # Guest upload flow (QR target)
├── sunum/[slug]/         # Live slideshow display (Premium)
└── api/                  # Serverless API routes
    ├── upload/           # Presigned URL + upload confirmation
    ├── pin/              # PIN verification
    ├── media/            # Media listing + moderation
    └── cron/             # Nightly cleanup job
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)
- A [Cloudflare](https://cloudflare.com) account with R2 enabled (free tier)

### Installation

```bash
git clone https://github.com/akinyasar/anikare.git
cd anikare
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase and R2 credentials (see `.env.example`).

### Database Setup

Run `supabase/schema.sql` in your Supabase project's **SQL Editor** to create all tables, triggers, and RLS policies.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See [`.env.example`](.env.example) for the full list of required variables.

> **Security note:** This is a public repository. Never commit `.env.local` or any file containing real credentials. All sensitive values are loaded exclusively from environment variables.

---

## Roadmap

- [x] Project setup & dependencies
- [x] TypeScript types
- [x] Supabase schema (tables, triggers, RLS)
- [ ] Cloudflare R2 storage setup
- [ ] Supabase clients + auth guard
- [ ] R2 upload API (presign + confirm)
- [ ] PIN verification + client-side compression
- [ ] Multilingual support (TR/EN/DE)
- [ ] Google OAuth flow
- [ ] Host dashboard
- [ ] Event creation wizard
- [ ] Guest upload flow
- [ ] Media moderation
- [ ] Premium live slideshow
- [ ] PWA support
- [ ] Vercel deployment + custom domain

---

## License

MIT
