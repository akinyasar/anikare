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
import { useLocale } from '@/components/providers/locale-provider'
import type { PublicEvent, Dictionary, PackageType, Locale } from '@/types'

type Stage = 'pin' | 'welcome' | 'staging' | 'uploading' | 'thankyou'

export default function GuestFlow({ event, locale: initialLocale = 'tr' }: { event: PublicEvent; locale?: Locale }) {
  const [stage, setStage] = useState<Stage>(event.pin_enabled ? 'pin' : 'welcome')
  const { locale, setLocale } = useLocale()
  const [guestName, setGuestName] = useState('')
  const [guestNote, setGuestNote] = useState('')
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [limitInfo, setLimitInfo] = useState<{ uploaded: number; total: number } | null>(null)
  // Successes carried over across retries of the same batch, so a partial
  // failure only re-sends the items that were never confirmed — resending a
  // succeeded item would create a duplicate media row.
  const [completedCount, setCompletedCount] = useState(0)
  const { uploadBatch, error, limitReached, resetError } = useMediaUpload()

  const addMoreRef = useRef<HTMLInputElement>(null)

  // If no locale stored yet, seed from server-detected Accept-Language
  useEffect(() => {
    const stored = localStorage.getItem('anikare-locale')
    if (!stored && initialLocale !== 'tr') setLocale(initialLocale)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getDictionary(locale).then(setDict)
  }, [locale])

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
    const batchTotal = completedCount + items.length
    setUploadProgress({ done: completedCount, total: batchTotal })

    const result = await uploadBatch({
      items,
      eventId: event.id,
      packageType: event.package_type as PackageType,
      guestName,
      guestNote: guestNote || undefined,
      onProgress: (done) => setUploadProgress({ done: completedCount + done, total: batchTotal }),
    })

    if (result.success) {
      if (limitReached) {
        setLimitInfo({ uploaded: completedCount + result.completed, total: batchTotal })
      }
      items.forEach(item => URL.revokeObjectURL(item.preview))
      setItems([])
      setCompletedCount(0)
      setStage('thankyou')
      return
    }

    // Partial failure: drop the confirmed items so a retry doesn't
    // re-upload (and duplicate) them, keep the rest staged for retry.
    setCompletedCount(prev => prev + result.completed)
    setItems(prev => prev.slice(result.completed))
    // stage stays 'uploading', UploadProgress shows the error + retry actions
  }

  function handleRetryUpload() {
    resetError()
    handleUpload()
  }

  function handleBackToStagingFromError() {
    resetError()
    setStage('staging')
  }

  function handleUploadMore() {
    setGuestName('')
    setGuestNote('')
    setItems([])
    setLimitInfo(null)
    setCompletedCount(0)
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
        onRetry={handleRetryUpload}
        onBack={handleBackToStagingFromError}
        retryLabel={g.retryUpload}
        backLabel={g.backToList}
      />
    )
  }

  // Thank you stage
  if (stage === 'thankyou') {
    return (
      <ThankYouScreen
        title={g.thankYouTitle ?? 'Teşekkürler! 🤍'}
        message={event.thank_you_message ?? (g.thankYouDefault ?? 'Anılarınızı paylaştığınız için teşekkürler!')}
        videoUrl={event.thank_you_video_url ?? null}
        uploadMoreLabel={g.uploadMore ?? 'Başka Anı Ekle'}
        onUploadMore={handleUploadMore}
        limitReached={limitReached}
        uploadedCount={limitInfo?.uploaded}
        totalCount={limitInfo?.total}
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
          onLocaleChange={setLocale}
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
      <GuestHeader locale={locale} onLocaleChange={setLocale} />
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
