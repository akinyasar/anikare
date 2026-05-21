'use client'

import Image from 'next/image'
import type { Locale } from '@/types'

const LOCALES = [
  { code: 'tr' as const, label: 'TR' },
  { code: 'en' as const, label: 'EN' },
  { code: 'de' as const, label: 'DE' },
]

interface Props {
  locale: string
  onLocaleChange: (l: Locale) => void
}

export default function GuestHeader({ locale, onLocaleChange }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#e8ddd5]/60 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <a href="/" className="flex items-center gap-2 group">
        <Image
          src="/brand/logo.svg"
          alt="AnıKare"
          width={24}
          height={26}
          className="group-hover:scale-105 transition-transform"
        />
        <span className="text-[11px] font-bold text-[#6D1A3E] tracking-[0.22em] uppercase">AnıKare</span>
      </a>
      <div className="flex items-center gap-0.5 bg-[#F0EBE3] rounded-full p-0.5">
        {LOCALES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => onLocaleChange(code)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
              locale === code
                ? 'bg-[#6D1A3E] text-white shadow-sm'
                : 'text-[#9ca3af] hover:text-[#6D1A3E]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}
