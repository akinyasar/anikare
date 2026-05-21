'use client'

import { useLocale } from '@/components/providers/locale-provider'
import type { Locale } from '@/types'

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

// Legacy helpers for guest flow (reads/writes localStorage directly without context)
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'tr'
  const v = localStorage.getItem('anikare-locale')
  return (v === 'en' || v === 'de') ? v : 'tr'
}

export function setStoredLocale(l: Locale) {
  if (typeof window !== 'undefined') localStorage.setItem('anikare-locale', l)
}

interface Props {
  className?: string
}

export default function LocaleSwitcher({ className }: Props) {
  const { locale, setLocale } = useLocale()

  return (
    <div className={`flex items-center gap-0.5 bg-[#F0EBE3] rounded-full p-0.5 ${className ?? ''}`}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
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
  )
}
