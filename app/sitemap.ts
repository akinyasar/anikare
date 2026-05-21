import type { MetadataRoute } from 'next'

const SITE_URL = 'https://anikare.vercel.app' // TODO: anikare.co alındığında güncelle

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
