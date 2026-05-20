import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AnıKare — Dijital Anı Defteri',
    short_name: 'AnıKare',
    description: 'Düğün ve davetleriniz için QR tabanlı fotoğraf paylaşım platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f43f5e',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
