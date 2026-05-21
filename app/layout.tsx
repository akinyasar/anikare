import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/lib/config'
import { LocaleProvider } from '@/components/providers/locale-provider'
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AnıKare — Düğün ve Etkinlik Fotoğraf Paylaşım Platformu',
    template: '%s | AnıKare',
  },
  description:
    'Misafirleriniz QR kodu okutarak anında fotoğraf paylaşır, siz her anı tek yerde toplarsınız. Düğün, doğum günü ve davetler için dijital anı defteri.',
  keywords: [
    'düğün fotoğraf paylaşım',
    'etkinlik qr kod fotoğraf',
    'dijital anı defteri',
    'düğün misafir fotoğrafı',
    'qr kodlu fotoğraf albümü',
    'düğün anı uygulaması',
    'anikare',
  ],
  authors: [{ name: 'AnıKare', url: SITE_URL }],
  creator: 'AnıKare',
  publisher: 'AnıKare',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'AnıKare',
    title: 'AnıKare — Düğün Anılarınızı Bir Arada Toplayın',
    description:
      'Misafirleriniz QR kodu okutarak anında fotoğraf paylaşır. Abonelik yok, tek etkinlik tek seferlik fiyat.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AnıKare — Dijital Anı Defteri' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnıKare — Düğün Anılarınızı Bir Arada Toplayın',
    description: 'Misafirleriniz QR kodu okutarak anında fotoğraf paylaşır.',
    images: ['/og-image.png'],
  },
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
      <body className="h-full">
        <LocaleProvider>
          {children}
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
