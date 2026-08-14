'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getDictionary } from '@/lib/i18n'
import { useLocale } from '@/components/providers/locale-provider'
import GuestHeader from '@/components/guest/guest-header'
import { TitleText } from '@/components/table-card/title-text'
import { DividerHeart } from '@/components/table-card/card-botanical'
import { directionsUrl, mapEmbedUrl } from '@/lib/programs'
import type { Dictionary, Locale, ProgramItem } from '@/types'

interface Props {
  title: string
  eventDate: string | null
  programs: ProgramItem[]
  apiKey?: string
  initialLocale: Locale
}

function dateLocaleTag(locale: Locale): string {
  return locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'tr-TR'
}

// 'YYYY-MM-DD' yerel saatte parse edilir (düz new Date() UTC'ye kaydırıp
// bazı saat dilimlerinde günü bir geri alır).
function formatDate(value: string, locale: Locale): string {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(dateLocaleTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// "Gamze & Akın" -> ["G", "A"]. Baş harfler zaten doğru büyük harfle geldiği
// için (kullanıcı girişi) herhangi bir case dönüşümü uygulanmıyor — Türkçe
// i/İ büyütme tuzağından böylece kaçınılıyor.
function getMonogramLetters(title: string): [string, string?] {
  const parts = title.split('&').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) return [parts[0][0] ?? '', parts[1][0] ?? '']
  const trimmed = title.trim()
  return [trimmed[0] ?? '', trimmed[1]]
}

// Program adına göre (kına/nikah/düğün) küçük bir tema ikonu seçilir —
// tanınmayan adlarda nötr bir yıldız ikonuna düşer.
function ProgramIcon({ name }: { name: string }) {
  const n = name.toLowerCase()
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (n.includes('kına') || n.includes('kina')) {
    return (
      <svg {...common}>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
      </svg>
    )
  }
  if (n.includes('nikah') || n.includes('nikâh')) {
    return (
      <svg {...common}>
        <circle cx="9" cy="13" r="5" />
        <circle cx="15" cy="13" r="5" />
      </svg>
    )
  }
  if (n.includes('düğün') || n.includes('dugun')) {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M12 20.3l-1.1-1C6.1 15.4 3 12.6 3 9.1 3 6.3 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.3 5 5.1 0 3.5-3.1 6.3-7.9 10.2l-1.1 1z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M12 3l2.4 5.5 6 .6-4.5 4 1.3 5.9L12 16l-5.2 3 1.3-5.9-4.5-4 6-.6z" />
    </svg>
  )
}

export default function InvitationView({ title, eventDate, programs, apiKey, initialLocale }: Props) {
  const { locale, setLocale } = useLocale()
  const [dict, setDict] = useState<Dictionary | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Kayıtlı bir tercih yoksa sunucunun Accept-Language tahminiyle tohumla —
  // guest-flow.tsx ile aynı desen.
  useEffect(() => {
    const stored = localStorage.getItem('anikare-locale')
    if (!stored && initialLocale !== 'tr') setLocale(initialLocale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getDictionary(locale).then(setDict)
  }, [locale])

  const inv = dict?.invitation ?? ({} as Dictionary['invitation'])
  const heroDate = eventDate ? formatDate(eventDate, locale) : ''
  const [monoFirst, monoSecond] = getMonogramLetters(title)

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <GuestHeader locale={locale} onLocaleChange={setLocale} />

      <main
        className="px-5 py-14 sm:py-20"
        style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(201,168,76,0.07), transparent 60%)' }}
      >
        <div className="mx-auto w-full max-w-xl lg:max-w-4xl">
          {/* Hero — davetiye kartı */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center bg-white rounded-[28px] border border-[#e8ddd5] px-8 py-12 sm:px-14 sm:py-16 overflow-hidden max-w-2xl mx-auto"
          >
            <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#e8ddd5]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/table-card/botanical-tr.png"
              alt=""
              width={140}
              height={140}
              className="pointer-events-none absolute -top-4 -right-4 w-32 h-32 sm:w-36 sm:h-36 opacity-40"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/table-card/botanical-bl.png"
              alt=""
              width={140}
              height={140}
              className="pointer-events-none absolute -bottom-4 -left-4 w-32 h-32 sm:w-36 sm:h-36 opacity-40"
            />

            <div className="relative">
              <div className="w-16 h-16 mx-auto rounded-full border border-[#c9a84c] flex items-center justify-center gap-0.5">
                <span className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a84c]">
                  {monoFirst}
                </span>
                <DividerHeart size={9} />
                <span className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a84c]">
                  {monoSecond}
                </span>
              </div>

              <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#9b4a6a] mt-6">
                {inv.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-6xl font-bold text-[#6D1A3E] leading-tight mt-3">
                <TitleText title={title} />
              </h1>
              {heroDate && <p className="text-sm text-[#7a6a5a] mt-4">{heroDate}</p>}
            </div>
          </motion.div>

          {/* Programlar — boşsa hiçbir şey render edilmez, sayfa yine geçerli */}
          {programs.length > 0 && (
            <section className="mt-4">
              <div className="flex items-center justify-center gap-3 my-10">
                <div className="h-px w-16 bg-[#e0c98a]" />
                <DividerHeart size={16} />
                <div className="h-px w-16 bg-[#e0c98a]" />
              </div>

              <h2 className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase text-[#9b4a6a] mb-6">
                {inv.programTitle}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((item, idx) => {
                  const embed = mapEmbedUrl(item, apiKey)
                  const directions = directionsUrl(item)
                  const programDate = formatDate(item.date, locale)
                  const whenParts = [programDate, item.time].filter(Boolean).join(' · ')

                  return (
                    <motion.article
                      key={item.id}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                      className="relative flex flex-col h-full bg-white rounded-3xl border border-[#e8ddd5] shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden"
                    >
                      <div className="pointer-events-none absolute top-0 right-0 w-20 h-20 bg-[#f5e6ed]/50 rounded-bl-[24px]" />

                      <div className="p-6 relative">
                        <div className="w-10 h-10 rounded-full bg-[#f5e6ed] text-[#6D1A3E] flex items-center justify-center mb-4">
                          <ProgramIcon name={item.name} />
                        </div>
                        {item.name && (
                          <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-[#6D1A3E] bg-[#f5e6ed] rounded-full px-3 py-1">
                            {item.name}
                          </span>
                        )}
                        {whenParts && (
                          <p className="text-sm text-[#6D1A3E] font-medium mt-3">{whenParts}</p>
                        )}
                        {item.venueName && (
                          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mt-2">
                            {item.venueName}
                          </h3>
                        )}
                        {item.address && (
                          <p className="text-sm text-[#7a6a5a] leading-relaxed mt-1">{item.address}</p>
                        )}
                      </div>

                      <div className="mt-auto">
                        {embed ? (
                          <iframe
                            title={`${item.venueName || item.name} — ${item.address}`}
                            src={embed}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="block w-full h-[180px] border-0"
                          />
                        ) : (
                          item.address && (
                            <div className="flex items-center justify-center h-[120px] bg-[#F0EBE3] text-xs text-[#9ca3af] px-6 text-center">
                              {inv.mapUnavailable}
                            </div>
                          )
                        )}

                        {directions && (
                          <div className="p-5 border-t border-[#e8ddd5]">
                            <a
                              href={directions}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-full bg-[#6D1A3E] text-white rounded-full py-3 text-sm font-medium hover:bg-[#5a1533] transition-colors"
                            >
                              {inv.getDirections}
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </section>
          )}

          <div className="flex flex-col items-center mt-14">
            <DividerHeart size={14} />
            <p className="text-center text-sm text-[#7a6a5a] mt-4">{inv.seeYouThere}</p>
            <p className="text-center text-[11px] tracking-[0.2em] uppercase text-[#9ca3af] mt-6">
              AnıKare
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
