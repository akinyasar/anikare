'use client'

import { useRef } from 'react'
import BottomBar from '@/components/ui/bottom-bar'
import Button from '@/components/ui/button'

interface Props {
  dict: Record<string, string>
  disabled: boolean
  onFiles: (files: FileList) => void
}

export default function UploadBar({ dict, disabled, onFiles }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      // Reset so same files can be selected again
      e.target.value = ''
    }
  }

  function handleCamera(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <BottomBar>
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full">
        <Button
          variant="primary"
          size="lg"
          disabled={disabled}
          onClick={() => galleryRef.current?.click()}
        >
          🖼 {dict.selectFromGallery ?? 'Galeriden Seç'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={disabled}
          onClick={() => cameraRef.current?.click()}
        >
          📷 {dict.openCamera ?? 'Kamera ile Çek'}
        </Button>
      </div>

      {/* Gallery: multiple files allowed */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleGallery}
      />
      {/* Camera: NO multiple — required for capture to work on iOS */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={handleCamera}
      />
    </BottomBar>
  )
}
