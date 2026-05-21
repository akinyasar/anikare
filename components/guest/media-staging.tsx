'use client'

import { motion } from 'framer-motion'
import BottomBar from '@/components/ui/bottom-bar'
import Button from '@/components/ui/button'
import GuestHeader from './guest-header'
import type { UploadItem } from '@/hooks/use-media-upload'
import type { PackageType, Locale } from '@/types'
import { PACKAGES } from '@/lib/packages'

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

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
  locale: string
  onLocaleChange: (l: Locale) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function PlayIcon() {
  return (
    <svg className="w-8 h-8 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
    </svg>
  )
}

function GridItem({ item, index, onRemove }: { item: UploadItem; index: number; onRemove: (i: number) => void }) {
  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a]">
      {item.fileType === 'photo' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <PlayIcon />
          <span className="text-xs text-white/60 truncate max-w-[80px] px-1">{item.file.name}</span>
        </div>
      )}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
      >
        ✕
      </button>
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
        {formatBytes(item.file.size)}
      </div>
    </div>
  )
}

export default function MediaStaging({
  items, packageType, existingPhotoCount, existingVideoCount,
  onRemove, onAddMore, onUpload, onBack, dict, locale, onLocaleChange,
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

  const packageLabel = packageType === 'eco' ? 'Ücretsiz' : packageType === 'standard' ? 'Standart' : 'Premium'

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

      {/* ── MOBILE LAYOUT (< md) ─────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-[#FAF7F2] flex flex-col safe-top">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e8ddd5] bg-white">
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
            {packageLabel}
          </span>
        </div>

        {/* Limits bar */}
        <div className="px-5 py-2.5 bg-white border-b border-[#e8ddd5] flex items-center justify-between">
          <span className="text-xs text-[#7a6a5a]">
            <span className="inline-flex items-center gap-1"><CameraIcon className="w-3.5 h-3.5"/>{totalPhotos}/{photoLimit}</span>
            <span className="text-[#c4b5a5]">·</span>
            <span className="inline-flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5"/>{totalVideos}/{videoLimit}</span>
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

        {/* Warnings */}
        {overPhotoLimit && (
          <div className="mx-5 mt-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-sm text-red-600">
            Fotoğraf limiti aşıldı ({totalPhotos}/{pkg.maxPhotos})
          </div>
        )}
        {overVideoLimit && (
          <div className="mx-5 mt-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-sm text-red-600">
            Video limiti aşıldı ({totalVideos}/{pkg.maxVideos})
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 px-5 pb-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mt-2">
            {items.map((item, i) => (
              <GridItem key={i} item={item} index={i} onRemove={onRemove} />
            ))}
          </div>
        </div>

        {/* Fixed bottom bar */}
        <BottomBar>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs text-[#7a6a5a]">
              📷 {totalPhotos}/{photoLimit} · 🎬 {totalVideos}/{videoLimit}
            </span>
          </div>
          <Button variant="primary" size="lg" disabled={!canUpload} onClick={onUpload}>
            Yükle → ({items.length} dosya)
          </Button>
        </BottomBar>
      </div>

      {/* ── DESKTOP LAYOUT (md+) ─────────────────────────────────── */}
      <div className="hidden md:flex flex-col min-h-screen bg-[#FAF7F2]">
        <GuestHeader locale={locale} onLocaleChange={onLocaleChange} />
        <div className="max-w-5xl mx-auto px-8 py-10 w-full">

          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-[#7a6a5a] hover:text-[#6D1A3E] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Geri
            </button>
            <div className="h-4 w-px bg-[#e8ddd5]" />
            <h1 className="text-lg font-semibold text-[#1a1a1a]">
              {items.length} dosya seçildi
            </h1>
            <span className="text-sm text-[#9ca3af]">· {formatBytes(totalSize)}</span>
          </div>

          {/* Two-column */}
          <div className="flex gap-8 items-start">

            {/* Left: image grid */}
            <div className="flex-1">
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item, i) => (
                  <GridItem key={i} item={item} index={i} onRemove={onRemove} />
                ))}
              </div>
            </div>

            {/* Right: sticky summary panel — top accounts for GuestHeader height (~50px) */}
            <div className="w-72 shrink-0 sticky top-20">
              <div className="bg-white rounded-3xl border border-[#e8ddd5] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 space-y-5">

                {/* Package */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#7a6a5a]">Paket</span>
                  <span className="text-sm font-semibold text-[#6D1A3E] bg-[#f5e6ed] px-3 py-1 rounded-full">
                    {packageLabel}
                  </span>
                </div>

                {/* Counts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7a6a5a] flex items-center gap-1"><CameraIcon className="w-3.5 h-3.5"/>Fotoğraf</span>
                    <span className={`font-semibold ${overPhotoLimit ? 'text-red-500' : 'text-[#1a1a1a]'}`}>
                      {totalPhotos} / {photoLimit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7a6a5a] flex items-center gap-1"><VideoIcon className="w-3.5 h-3.5"/>Video</span>
                    <span className={`font-semibold ${overVideoLimit ? 'text-red-500' : 'text-[#1a1a1a]'}`}>
                      {totalVideos} / {videoLimit}
                    </span>
                  </div>
                </div>

                {/* Warnings */}
                {overPhotoLimit && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    Fotoğraf limiti aşıldı
                  </p>
                )}
                {overVideoLimit && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    Video limiti aşıldı
                  </p>
                )}

                <div className="border-t border-[#e8ddd5]" />

                {/* Add more */}
                <button
                  onClick={onAddMore}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#6D1A3E]/30 text-sm font-semibold text-[#6D1A3E] hover:bg-[#f5e6ed] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Daha Fazla Ekle
                </button>

                {/* Upload button */}
                <Button variant="primary" size="lg" disabled={!canUpload} onClick={onUpload} className="w-full">
                  Yükle ({items.length} dosya)
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </motion.div>
  )
}
