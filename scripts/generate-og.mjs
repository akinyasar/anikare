// scripts/generate-og.mjs
// Run: node scripts/generate-og.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6D1A3E"/>
      <stop offset="100%" style="stop-color:#3d0e22"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle decorative circles -->
  <circle cx="1080" cy="90" r="220" fill="#ffffff" fill-opacity="0.04"/>
  <circle cx="120" cy="560" r="160" fill="#ffffff" fill-opacity="0.03"/>
  <circle cx="600" cy="700" r="300" fill="#f5e6ed" fill-opacity="0.05"/>

  <!-- Polaroid logo (scaled up) -->
  <g transform="translate(72, 170) scale(1.9)">
    <!-- Back frame -->
    <g transform="translate(50,44) rotate(8) translate(-26,-34)">
      <rect width="52" height="68" rx="4" fill="#f5e6ed" fill-opacity="0.25" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2.8"/>
    </g>
    <!-- Front frame -->
    <g transform="translate(4, 10)">
      <rect width="52" height="68" rx="4" fill="white" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.8"/>
      <line x1="3" y1="52" x2="49" y2="52" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
      <!-- Heart -->
      <path d="M26 42 C 26 42 4 29 4 15 C 4 6 11 2 17 2 C 21 2 24 5 26 8 C 28 5 31 2 35 2 C 41 2 48 6 48 15 C 48 29 26 42 26 42 Z" fill="#f5e6ed" fill-opacity="0.9"/>
    </g>
  </g>

  <!-- Brand name -->
  <text x="280" y="310" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="700" fill="white" letter-spacing="-2">AnıKare</text>

  <!-- Tagline -->
  <text x="284" y="378" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#f5e6ed" fill-opacity="0.85">Düğün anılarınızı bir arada toplayın</text>

  <!-- Features row -->
  <text x="284" y="430" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#f5e6ed" fill-opacity="0.6">QR kod ile fotoğraf paylaşımı  ·  Abonelik yok  ·  Anında kullanım</text>

  <!-- Bottom accent line -->
  <rect x="0" y="590" width="1200" height="40" fill="#ffffff" fill-opacity="0.07"/>
  <text x="600" y="617" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="white" fill-opacity="0.55" text-anchor="middle">anikare.vercel.app</text>
</svg>
`

await sharp(Buffer.from(svg))
  .png({ quality: 95 })
  .toFile(join(root, 'public', 'og-image.png'))

console.log('✓ public/og-image.png generated (1200×630)')
