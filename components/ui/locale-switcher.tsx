'use client'

import { useState, useEffect } from 'react'

type Locale = 'tr' | 'en' | 'de'
const LOCALES: { code: Locale; label: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

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
  const [locale, setLocale] = useState<Locale>('tr')

  useEffect(() => {
    setLocale(getStoredLocale())
  }, [])

  function handleChange(code: Locale) {
    setLocale(code)
    setStoredLocale(code)
  }

  return (
    <div className={`flex items-center gap-0.5 bg-[#F0EBE3] rounded-full p-0.5 ${className ?? ''}`}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
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
