'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check auth cookie from supabase
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('sb-'))
    setIsLoggedIn(hasCookie)
  }, [])

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#FAF7F2] pt-32 pb-20 px-6 md:px-10"
    >
      {/* Soft radial glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#6D1A3E]/5 blur-3xl" />
      <div className="pointer-events-none absolute top-60 right-0 w-[500px] h-[500px] rounded-full bg-[#9b4a6a]/5 blur-3xl" />

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
              Düğün Fotoğrafları için #1 Platform
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-[family-name:var(--font-playfair)] text-[2.75rem] sm:text-[3.25rem] font-bold text-[#1a1a1a] leading-[1.1] tracking-tight">
            Misafirlerinizin{' '}
            <span className="italic text-[#6D1A3E]">anıları</span>
            <br />
            tek bir çatı altında.
          </h1>

          <p className="text-lg text-[#7a6a5a] leading-relaxed max-w-lg">
            Uygulama indirmeye gerek kalmadan, masalardaki QR kodu okutarak
            misafirlerinizin en güzel anlarını anında toplayın. Düğün albümünüz
            gerçek zamanlı biriksin.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
            <Link
              href="/giris"
              className="inline-flex justify-center items-center bg-[#6D1A3E] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#5a1533] active:scale-[0.97] transition-all shadow-lg shadow-[#6D1A3E]/20"
            >
              {isLoggedIn ? 'Panele Git →' : 'Ücretsiz Etkinlik Oluştur →'}
            </Link>
            <a
              href="#nasil-calisir"
              className="inline-flex justify-center items-center gap-2 text-[#6D1A3E] border border-[#6D1A3E]/25 font-medium px-8 py-4 rounded-full hover:bg-[#f5e6ed] hover:border-[#6D1A3E]/50 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Nasıl Çalışır?
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
              <p className="text-sm font-semibold text-[#1a1a1a]">500+ etkinlik</p>
              <p className="text-xs text-[#9ca3af] flex items-center gap-1">
                <span className="text-amber-400">★</span> 4.9/5 Ortalama Puan
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
          {/* Floating photo card — top left */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 top-8 bg-white rounded-2xl shadow-xl p-2 w-28 z-20 hidden sm:block"
          >
            <div className="w-full h-16 rounded-xl bg-gradient-to-br from-[#f5e6ed] to-[#FAF7F2] flex items-center justify-center text-2xl">📷</div>
            <p className="text-[10px] text-[#7a6a5a] mt-1.5 text-center font-medium">+2.4K fotoğraf</p>
          </motion.div>

          {/* Floating card — bottom right */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute -right-4 bottom-16 bg-white rounded-2xl shadow-xl px-3 py-2.5 z-20 hidden sm:flex items-center gap-2"
          >
            <span className="text-lg">🎉</span>
            <div>
              <p className="text-[10px] font-semibold text-[#1a1a1a]">Yükleme tamamlandı!</p>
              <p className="text-[9px] text-[#9ca3af]">Ahmet & Ayşe · 34 dosya</p>
            </div>
          </motion.div>

          {/* Phone frame */}
          <div className="relative w-[260px] h-[540px] bg-white rounded-[36px] shadow-[0_24px_60px_rgba(109,26,62,0.18)] border-[6px] border-[#e8ddd5] overflow-hidden flex flex-col z-10">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-20 pt-1.5">
              <div className="w-20 h-4 bg-[#e8ddd5] rounded-full" />
            </div>

            {/* Screen */}
            <div className="flex-1 bg-[#FAF7F2] flex flex-col pt-7">
              {/* Mini header */}
              <div className="flex items-center justify-center py-2 border-b border-[#e8ddd5]">
                <div className="flex items-center gap-1.5">
                  <Image src="/brand/logo.svg" alt="AnıKare" width={14} height={18} />
                  <span className="text-[9px] font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
                </div>
              </div>

              {/* Event info */}
              <div className="px-5 pt-5 text-center">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-[#9b4a6a] mb-1">Düğün</p>
                <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-[#1a1a1a]">
                  Ayşe & Burak
                </h3>
                <p className="text-[9px] text-[#9ca3af] mt-0.5">12 Ağustos 2025 · Çırağan Sarayı</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 px-8 my-3">
                <div className="flex-1 h-px bg-[#e8ddd5]" />
                <svg className="w-2.5 h-2.5 text-[#6D1A3E] opacity-50" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9l-3.75 3 1.5-4.5L0 4.5h4.5z"/>
                </svg>
                <div className="flex-1 h-px bg-[#e8ddd5]" />
              </div>

              {/* Form area */}
              <div className="px-4 space-y-2">
                <div className="bg-white rounded-xl px-3 py-2 border border-[#e8ddd5]">
                  <p className="text-[8px] text-[#374151] font-medium mb-0.5">Adınız</p>
                  <p className="text-[9px] text-[#9ca3af]">Örn: Mehmet Yılmaz</p>
                </div>
                <div className="bg-white rounded-xl px-3 py-2 border border-[#e8ddd5]">
                  <p className="text-[8px] text-[#374151] font-medium mb-0.5">Bir not bırakın</p>
                  <p className="text-[9px] text-[#9ca3af]">Dileklerinizi yazın...</p>
                </div>
              </div>

              {/* Upload buttons */}
              <div className="px-4 mt-3 space-y-2">
                <div className="bg-[#6D1A3E] text-white text-[9px] font-semibold py-2.5 rounded-full text-center">
                  🖼 Galeriden Seç
                </div>
                <div className="border border-[#6D1A3E] text-[#6D1A3E] text-[9px] font-semibold py-2.5 rounded-full text-center">
                  📷 Kamera ile Çek
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
