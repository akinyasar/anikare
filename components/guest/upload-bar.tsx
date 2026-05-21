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
          <span className="flex items-center justify-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 000-1.5.75.75 0 000 1.5zM12 14.25v-3m0 0v-1.5M12 11.25H9.75m2.25 0h2.25" />
            </svg>
            {dict.selectFromGallery ?? 'Anı Ekle'}
          </span>
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
