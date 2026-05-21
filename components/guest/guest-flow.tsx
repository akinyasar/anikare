'use client'

import { useState, useEffect, useRef } from 'react'
import { getDictionary } from '@/lib/i18n'
import PinEntry from './pin-entry'
import WelcomeScreen from './welcome-screen'
import UploadBar from './upload-bar'
import MediaStaging from './media-staging'
import UploadProgress from './upload-progress'
import ThankYouScreen from './thank-you-screen'
import GuestHeader from './guest-header'
import { useMediaUpload, createUploadItems, type UploadItem } from '@/hooks/use-media-upload'
import { getStoredLocale, setStoredLocale } from '@/components/ui/locale-switcher'
import type { PublicEvent, Dictionary, PackageType, Locale } from '@/types'

type Stage = 'pin' | 'welcome' | 'staging' | 'uploading' | 'thankyou'

export default function GuestFlow({ event, locale: initialLocale = 'tr' }: { event: PublicEvent; locale?: Locale }) {
  const [stage, setStage] = useState<Stage>(event.pin_enabled ? 'pin' : 'welcome')
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [guestName, setGuestName] = useState('')
  const [guestNote, setGuestNote] = useState('')
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const { uploadBatch, error, resetError } = useMediaUpload()

  const addMoreRef = useRef<HTMLInputElement>(null)

  // Read localStorage locale preference on mount (overrides server-detected locale)
  useEffect(() => {
    const stored = getStoredLocale()
    if (stored !== initialLocale) setLocale(stored)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getDictionary(locale).then(setDict)
  }, [locale])

  function handleLocaleChange(l: Locale) {
    setLocale(l)
    setStoredLocale(l)
  }

  const g = dict?.guest ?? ({} as Dictionary['guest'])
  const e = dict?.errors ?? ({} as Dictionary['errors'])

  if (!event.is_upload_active) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-4xl mb-4">📷</p>
          <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-2">
            {g.uploadClosedTitle ?? 'Yükleme Kapalı'}
          </p>
          <p className="text-sm text-[#7a6a5a]">
            {e.eventClosed ?? g.uploadClosedDesc ?? 'Bu etkinlik için yükleme sona erdi.'}
          </p>
        </div>
      </div>
    )
  }

  function handleFilesSelected(files: FileList) {
    const newItems = createUploadItems(files)
    if (stage === 'staging') {
      setItems(prev => [...prev, ...newItems])
    } else {
      setItems(newItems)
      setStage('staging')
    }
  }

  function handleRemoveItem(index: number) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index].preview)
      return next
    })
  }

  async function handleUpload() {
    setStage('uploading')
    setUploadProgress({ done: 0, total: items.length })

    const success = await uploadBatch({
      items,
      eventId: event.id,
      packageType: event.package_type as PackageType,
      guestName,
      guestNote: guestNote || undefined,
      onProgress: (done, total) => setUploadProgress({ done, total }),
    })

    // Revoke all preview URLs
    items.forEach(item => URL.revokeObjectURL(item.preview))
    setItems([])

    if (success) {
      setStage('thankyou')
    }
    // If error, stage stays 'uploading' and error is shown via UploadProgress
  }

  function handleUploadMore() {
    setGuestName('')
    setGuestNote('')
    setItems([])
    resetError()
    setStage('welcome')
  }

  // PIN stage
  if (stage === 'pin') {
    return (
      <PinEntry
        eventId={event.id}
        dict={g}
        onSuccess={() => {
          window.scrollTo({ top: 0, behavior: 'instant' })
          setStage('welcome')
        }}
      />
    )
  }

  // Upload progress stage
  if (stage === 'uploading') {
    return (
      <UploadProgress
        done={uploadProgress.done}
        total={uploadProgress.total}
        error={error}
        uploadingLabel={g.uploading}
        countLabel={g.uploadingCount}
        errorLabel={g.uploadError}
      />
    )
  }

  // Thank you stage
  if (stage === 'thankyou') {
    return (
      <ThankYouScreen
        message={event.thank_you_message ?? (g.thankYouDefault ?? 'Anılarınızı paylaştığınız için teşekkürler!')}
        videoUrl={event.thank_you_video_url ?? null}
        uploadMoreLabel={g.uploadMore ?? 'Başka Anı Ekle'}
        onUploadMore={handleUploadMore}
      />
    )
  }

  // Staging stage
  if (stage === 'staging') {
    return (
      <>
        <MediaStaging
          items={items}
          packageType={event.package_type as PackageType}
          existingPhotoCount={event.photo_count}
          existingVideoCount={event.video_count}
          onRemove={handleRemoveItem}
          onAddMore={() => addMoreRef.current?.click()}
          onUpload={handleUpload}
          onBack={() => { items.forEach(i => URL.revokeObjectURL(i.preview)); setItems([]); setStage('welcome') }}
          dict={g}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
        {/* Hidden input for "add more" from staging */}
        <input
          ref={addMoreRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFilesSelected(e.target.files)
            e.target.value = ''
          }}
        />
      </>
    )
  }

  // Welcome stage — h-[100dvh] + inner scroll fixes iOS keyboard gap
  return (
    <div className="h-[100dvh] bg-[#FAF7F2] flex flex-col overflow-hidden">
      <GuestHeader locale={locale} onLocaleChange={handleLocaleChange} />
      <div className="flex-1 overflow-y-auto overscroll-none">
        <WelcomeScreen
          event={event}
          dict={g}
          locale={locale}
          guestName={guestName}
          setGuestName={setGuestName}
          guestNote={guestNote}
          setGuestNote={setGuestNote}
        />
      </div>
      <UploadBar
        dict={g}
        disabled={!guestName.trim()}
        onFiles={handleFilesSelected}
      />
    </div>
  )
}
