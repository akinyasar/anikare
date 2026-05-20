'use client'

import { useState, useEffect } from 'react'
import { detectLocale, getDictionary } from '@/lib/i18n'
import PinEntry from './pin-entry'
import WelcomeScreen from './welcome-screen'
import UploadBar from './upload-bar'
import ThankYouScreen from './thank-you-screen'
import { useMediaUpload } from '@/hooks/use-media-upload'
import type { PublicEvent, Dictionary } from '@/types'

type Stage = 'pin' | 'welcome' | 'thankyou'

export default function GuestFlow({ event }: { event: PublicEvent }) {
  const [stage, setStage] = useState<Stage>(event.pin_enabled ? 'pin' : 'welcome')
  const [guestName, setGuestName] = useState('')
  const [guestNote, setGuestNote] = useState('')
  const [dict, setDict] = useState<Dictionary | null>(null)
  const { upload, progress, uploading, error, resetError } = useMediaUpload()

  useEffect(() => {
    getDictionary(detectLocale()).then(setDict)
  }, [])

  const g = dict?.guest ?? ({} as Dictionary['guest'])
  const e = dict?.errors ?? ({} as Dictionary['errors'])

  if (!event.is_upload_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-400 text-base">{e.eventClosed ?? 'Bu etkinlik için yükleme sona erdi'}</p>
      </div>
    )
  }

  async function handleFiles(files: FileList) {
    resetError()
    for (const file of Array.from(files)) {
      await upload({
        file,
        eventId: event.id,
        packageType: event.package_type,
        guestName,
        guestNote: guestNote || undefined,
      })
    }
    setStage('thankyou')
  }

  if (stage === 'pin') {
    return (
      <PinEntry
        eventId={event.id}
        dict={g}
        onSuccess={() => setStage('welcome')}
      />
    )
  }

  if (stage === 'thankyou') {
    return (
      <ThankYouScreen
        message={event.thank_you_message ?? (g.thankYouDefault ?? 'Teşekkürler!')}
        videoUrl={event.thank_you_video_url}
        uploadMoreLabel={g.uploadMore ?? 'Başka anı ekle'}
        onUploadMore={() => setStage('welcome')}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <WelcomeScreen
        event={event}
        dict={g}
        guestName={guestName}
        setGuestName={setGuestName}
        guestNote={guestNote}
        setGuestNote={setGuestNote}
      />
      <UploadBar
        dict={g}
        disabled={!guestName.trim() || uploading}
        progress={progress}
        uploading={uploading}
        error={error}
        onFiles={handleFiles}
      />
    </div>
  )
}
