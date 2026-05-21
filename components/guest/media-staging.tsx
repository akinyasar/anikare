// components/guest/media-staging.tsx
'use client'

import { motion } from 'framer-motion'
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
  onBack: () => void
  dict: Record<string, string>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaStaging({
  items, packageType, existingPhotoCount, existingVideoCount,
  onRemove, onAddMore, onUpload, onBack, dict,
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
      className="min-h-screen bg-[#FAF7F2] safe-top"
    >
      <div className="max-w-2xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e8ddd5] bg-white sm:bg-transparent sm:border-0 sm:pt-6 sm:pb-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7a6a5a] hover:bg-[#f5e6ed] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#1a1a1a]">{items.length} dosya seçildi</p>
          <p className="text-[11px] text-[#7a6a5a]">{formatBytes(totalSize)}</p>
        </div>
        <span className="text-[11px] bg-[#f5e6ed] text-[#6D1A3E] font-semibold px-2.5 py-1 rounded-full">
          {packageType === 'eco' ? 'Ücretsiz' : packageType === 'standard' ? 'Standart' : 'Premium'}
        </span>
      </div>

      {/* Paket limitleri */}
      <div className="px-5 py-2.5 bg-white border-b border-[#e8ddd5] flex items-center justify-between">
        <span className="text-xs text-[#7a6a5a]">
          📷 {totalPhotos}/{photoLimit} &nbsp;·&nbsp; 🎬 {totalVideos}/{videoLimit}
        </span>
        <button
          onClick={onAddMore}
          className="text-xs font-semibold text-[#6D1A3E] flex items-center gap-1 py-1.5 px-3 rounded-full border border-[#6D1A3E]/30 hover:bg-[#f5e6ed] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Daha Fazla Ekle
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
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
      </div>
    </motion.div>
  )
}
