'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { getDictionary } from '@/lib/i18n'
import { useLocale } from '@/components/providers/locale-provider'
import GuestHeader from '@/components/guest/guest-header'
import { TitleText } from '@/components/table-card/title-text'
import { DividerHeart } from '@/components/table-card/card-botanical'
import { directionsUrl, yandexDirectionsUrl, mapEmbedUrl } from '@/lib/programs'
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
  const [sheetItem, setSheetItem] = useState<ProgramItem | null>(null)

  // Tek seçenek varsa doğrudan aç, iki seçenek varsa alt sayfada seçtir.
  function handleDirectionsClick(item: ProgramItem) {
    const g = directionsUrl(item)
    const y = yandexDirectionsUrl(item)
    if (g && y) {
      setSheetItem(item)
      return
    }
    const only = g ?? y
    if (only) window.open(only, '_blank', 'noreferrer')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <GuestHeader locale={locale} onLocaleChange={setLocale} />

      <main
        className="px-5 py-14 sm:py-20"
        style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(201,168,76,0.07), transparent 60%)' }}
      >
        <div className="mx-auto w-full max-w-xl">
          {/* Hero — davetiye kartı */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center bg-white rounded-[28px] border border-[#e8ddd5] px-8 py-12 sm:px-14 sm:py-16 overflow-hidden"
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
              <div className="w-14 h-14 mx-auto rounded-full border border-[#c9a84c] flex items-center justify-center gap-1">
                <span className="font-[family-name:var(--font-playfair)] text-lg text-[#c9a84c]">
                  {monoFirst}
                </span>
                <DividerHeart size={9} />
                <span className="font-[family-name:var(--font-playfair)] text-lg text-[#c9a84c]">
                  {monoSecond}
                </span>
              </div>

              <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#9b4a6a] mt-6">
                {inv.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#6D1A3E] leading-tight mt-3">
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

              <div className="space-y-6">
                {programs.map((item, idx) => {
                  const embed = mapEmbedUrl(item, apiKey)
                  const directions = directionsUrl(item)
                  const yandexDirections = yandexDirectionsUrl(item)
                  const programDate = formatDate(item.date, locale)
                  const whenParts = [programDate, item.time].filter(Boolean).join(' · ')

                  return (
                    <motion.article
                      key={item.id}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className="bg-white rounded-3xl border border-[#e8ddd5] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden"
                    >
                      <div className="p-6">
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

                      {embed ? (
                        <iframe
                          title={`${item.venueName || item.name} — ${item.address}`}
                          src={embed}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          className="block w-full h-[220px]"
                          style={{ paddingInline: '10px', border: '1px solid #fff', borderRadius: '20px' }}
                        />
                      ) : (
                        item.address && (
                          <div className="flex items-center justify-center h-[120px] bg-[#F0EBE3] text-xs text-[#9ca3af] px-6 text-center">
                            {inv.mapUnavailable}
                          </div>
                        )
                      )}

                      {(directions || yandexDirections) && (
                        <div className="p-5">
                          <motion.button
                            type="button"
                            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                            onClick={() => handleDirectionsClick(item)}
                            className="flex items-center justify-center w-full bg-[#6D1A3E] text-white rounded-full py-3 text-sm font-medium hover:bg-[#5a1533] transition-colors"
                          >
                            {inv.getDirections}
                          </motion.button>
                        </div>
                      )}
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

      <AnimatePresence>
        {sheetItem && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetItem(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-xl bg-white rounded-t-[28px] px-6 pt-3 pb-6 safe-bottom"
            >
              <div className="w-10 h-1 rounded-full bg-[#e8ddd5] mx-auto mb-5" />
              <p className="text-center text-sm font-medium text-[#1a1a1a] mb-4">
                {inv.getDirections}
              </p>
              <div className="space-y-2">
                {directionsUrl(sheetItem) && (
                  <a
                    href={directionsUrl(sheetItem)!}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setSheetItem(null)}
                    className="block text-center py-3.5 rounded-2xl bg-[#F0EBE3] text-[#1a1a1a] font-medium hover:bg-[#e8ddd5] transition-colors"
                  >
                    Google Maps
                  </a>
                )}
                {yandexDirectionsUrl(sheetItem) && (
                  <a
                    href={yandexDirectionsUrl(sheetItem)!}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setSheetItem(null)}
                    className="block text-center py-3.5 rounded-2xl bg-[#F0EBE3] text-[#1a1a1a] font-medium hover:bg-[#e8ddd5] transition-colors"
                  >
                    Yandex Maps
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSheetItem(null)}
                className="w-full mt-2 py-3.5 text-sm text-[#9ca3af] font-medium"
              >
                {inv.cancel}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
