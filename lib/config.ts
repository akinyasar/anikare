// Domain değişince sadece NEXT_PUBLIC_SITE_URL env var'ını güncelle
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anikare.vercel.app'
