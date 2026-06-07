'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { locale } = useLocale()

  useEffect(() => {
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('sb-'))
    setIsLoggedIn(hasCookie)
  }, [])

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#FAF7F2] pt-32 pb-20 px-6 md:px-10"
    >
      <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#6D1A3E]/5 blur-3xl hidden md:block" />
      <div className="pointer-events-none absolute top-60 right-0 w-[500px] h-[500px] rounded-full bg-[#9b4a6a]/5 blur-3xl hidden md:block" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-start gap-7"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#f5e6ed] border border-[#6D1A3E]/15 px-4 py-1.5 rounded-full"
          >
            <span className="text-sm">💍</span>
            <span className="text-xs font-semibold tracking-wide text-[#6D1A3E]">
              {t(locale, 'heroBadge')}
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-[family-name:var(--font-playfair)] text-[2.75rem] sm:text-[3.25rem] font-bold text-[#1a1a1a] leading-[1.1] tracking-tight">
            {t(locale, 'heroHeading1')}{' '}
            <span className="italic text-[#6D1A3E]">{t(locale, 'heroHeading2')}</span>
            <br />
            {t(locale, 'heroHeading3')}
          </h1>

          <p className="text-lg text-[#7a6a5a] leading-relaxed max-w-lg">
            {t(locale, 'heroDesc')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
            <Link
              href="/giris"
              className="inline-flex justify-center items-center bg-[#6D1A3E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#5a1533] active:scale-[0.97] transition-all shadow-lg shadow-[#6D1A3E]/20"
            >
              {isLoggedIn ? t(locale, 'heroCtaLoggedIn') : t(locale, 'heroCta')}
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex justify-center items-center gap-2 text-[#6D1A3E] border border-[#6D1A3E]/25 font-medium px-8 py-4 rounded-full hover:bg-[#f5e6ed] hover:border-[#6D1A3E]/50 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {t(locale, 'heroSecondaryCta')}
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#e8ddd5] w-full">
            <div className="flex -space-x-2.5">
              {['💑','👰','🤵'].map((e, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-[#f5e6ed] border-2 border-[#FAF7F2] flex items-center justify-center text-sm">
                  {e}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{t(locale, 'heroSocialProof')}</p>
              <p className="text-xs text-[#9ca3af] flex items-center gap-1">
                <span className="text-amber-400">★</span> {t(locale, 'heroRating')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative flex justify-center"
        >
          {/* Floating stat card — top left */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            className="absolute -left-6 top-10 bg-white rounded-2xl shadow-xl p-3 w-32 z-20 hidden lg:block border border-[#e8ddd5]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-[#f5e6ed] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-bold text-[#6D1A3E]">{t(locale, 'heroPhotoCount')}</p>
            </div>
            <p className="text-[9px] text-[#9ca3af] font-medium">{t(locale, 'heroPhotoUploaded')}</p>
          </motion.div>

          {/* Floating upload success card — bottom right */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8, repeatType: 'mirror' }}
            className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl px-3 py-2.5 z-20 hidden lg:flex items-center gap-2.5 border border-[#e8ddd5]"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#1a1a1a]">{t(locale, 'heroUploaded')}</p>
              <p className="text-[9px] text-[#9ca3af]">Ahmet · {t(locale, 'heroGuestFiles')}</p>
            </div>
          </motion.div>

          {/* Phone frame */}
          <div className="relative w-[260px] h-[540px] bg-white rounded-[36px] shadow-[0_24px_60px_rgba(109,26,62,0.18)] border-[6px] border-[#1a1a1a] overflow-hidden flex flex-col z-10">
            {/* Dynamic island */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-20 pt-2">
              <div className="w-24 h-5 bg-[#1a1a1a] rounded-full" />
            </div>

            {/* Screen */}
            <div className="flex-1 bg-[#FAF7F2] flex flex-col pt-8 overflow-hidden">
              {/* Header with locale switcher */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8ddd5]/60 bg-white/80">
                <div className="flex items-center gap-1">
                  <Image src="/brand/logo.svg" alt="AnıKare" width={13} height={14} />
                  <span className="text-[8px] font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
                </div>
                <div className="flex items-center gap-0.5 bg-[#F0EBE3] rounded-full px-1 py-0.5">
                  {['TR','EN'].map((l) => (
                    <span key={l} className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${l === 'TR' ? 'bg-[#6D1A3E] text-white' : 'text-[#9ca3af]'}`}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Event info */}
              <div className="px-4 pt-4 text-center">
                <p className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-1">Düğün</p>
                <h3 className="font-[family-name:var(--font-playfair)] text-[15px] font-bold text-[#1a1a1a] leading-tight">
                  Ayşe & Burak
                </h3>
                <p className="text-[8px] text-[#9ca3af] mt-0.5">12 Ağustos 2025</p>
                <div className="flex items-center gap-2 px-6 mt-3">
                  <div className="flex-1 h-px bg-[#e8ddd5]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8849a]" />
                  <div className="flex-1 h-px bg-[#e8ddd5]" />
                </div>
              </div>

              {/* Form inputs */}
              <div className="px-4 mt-3 space-y-1.5">
                <div className="bg-white rounded-xl px-3 py-2 border border-[#e8ddd5]">
                  <p className="text-[7.5px] text-[#9ca3af] font-medium mb-0.5">Adınız</p>
                  <p className="text-[9px] text-[#1a1a1a] font-medium">Mehmet Yılmaz</p>
                </div>
                <div className="bg-white rounded-xl px-3 py-2 border border-[#e8ddd5]">
                  <p className="text-[7.5px] text-[#9ca3af] font-medium mb-0.5">Bir not bırakın (isteğe bağlı)</p>
                  <p className="text-[8.5px] text-[#c4b5a5]">Dileklerinizi yazın...</p>
                </div>
              </div>

              {/* Upload button */}
              <div className="px-4 mt-4">
                <div className="bg-[#6D1A3E] text-white rounded-full py-3 flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v-4.5m0 0V12m0 2.25H9.75M12 14.25h2.25" />
                  </svg>
                  <span className="text-[9.5px] font-semibold">Anı Ekle</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
