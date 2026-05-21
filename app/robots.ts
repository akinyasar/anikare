import type { MetadataRoute } from 'next'

const SITE_URL = 'https://anikare.vercel.app' // TODO: anikare.co alındığında güncelle

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/etkinlik/',
          '/e/',
          '/sunum/',
          '/api/',
          '/giris',
          '/kayit',
          '/sifremi-unuttum',
          '/auth/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
