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
    maxPhotos: 150,
    maxVideos: 10,
    compressionTarget: 1080,
    compressionQuality: 0.75,
    liveSlideshow: false,
    premiumTemplates: false,
  },
  standard: {
    maxPhotos: Infinity,
    maxVideos: 30,
    compressionTarget: 2160,
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
