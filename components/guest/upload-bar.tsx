'use client'

import { useRef } from 'react'
import Button from '@/components/ui/button'

interface Props {
  dict: Record<string, string>
  disabled: boolean
  onFiles: (files: FileList) => void
}

export default function UploadBar({ dict, disabled, onFiles }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] border-t border-[#e8ddd5]/60 bg-[#FAF7F2]">
      <div className="max-w-sm mx-auto">
        <Button
          variant="primary"
          size="lg"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          📸 {dict.selectFromGallery ?? 'Fotoğraf / Video Ekle'}
        </Button>
      </div>
      {/*
        Tek input — iOS bu noktada native action sheet gösterir:
        "Fotoğraf veya Video Çek / Fotoğraf Kitaplığı / Dosyalara Göz At"
        capture attribute'u YOK — kullanıcı seçsin.
        multiple: birden fazla dosya seçilebilir.
      */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
