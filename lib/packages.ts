import type { PackageType } from '@/types'

export const PACKAGES: Record<
  PackageType,
  {
    maxPhotos: number
    maxVideos: number
    compressionTarget: number | null
    compressionQuality: number
    liveSlideshow: boolean
    premiumTemplates: boolean
  }
> = {
  eco: {
    // "Ücretsiz" — sadece akışı görmek için
    maxPhotos: 10,
    maxVideos: 2,
    compressionTarget: 720,
    compressionQuality: 0.7,
    liveSlideshow: false,
    premiumTemplates: false,
  },
  standard: {
    maxPhotos: Infinity,
    maxVideos: 20,
    compressionTarget: 1080,
    compressionQuality: 0.85,
    liveSlideshow: false,
    premiumTemplates: false,
  },
  premium: {
    maxPhotos: Infinity,
    maxVideos: Infinity,
    compressionTarget: null,
    compressionQuality: 1,
    liveSlideshow: true,
    premiumTemplates: true,
  },
}
