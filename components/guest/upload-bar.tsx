'use client'

import { useRef } from 'react'

interface Props {
  dict: Record<string, string>
  disabled: boolean
  progress: number
  uploading: boolean
  error: string | null
  onFiles: (files: FileList) => void
}

export default function UploadBar({
  dict,
  disabled,
  progress,
  uploading,
  error,
  onFiles,
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) onFiles(e.target.files)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 safe-area-inset-bottom">
      {uploading && (
        <div className="mb-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1.5">
            {dict.uploading ?? 'Yükleniyor...'} {progress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center mb-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white rounded-2xl py-3.5 text-sm font-medium hover:bg-rose-600 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          📷 {dict.openCamera ?? 'Kamera Aç'}
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-2xl py-3.5 text-sm font-medium hover:bg-gray-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          🖼 {dict.selectFromGallery ?? 'Galeriden Seç'}
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
