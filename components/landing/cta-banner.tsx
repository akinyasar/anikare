'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function CtaBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="px-6 md:px-10 py-10 bg-[#FAF7F2]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-5xl mx-auto bg-gradient-to-br from-[#6D1A3E] to-[#8B2252] rounded-3xl px-8 py-14 text-center relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <p className="text-[#f5e6ed]/70 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Hemen başlayın
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Bugün ücretsiz etkinlik oluşturun
          </h2>
          <p className="text-[#f5e6ed]/80 max-w-md mx-auto mb-8 leading-relaxed">
            Kredi kartı gerekmez. Dakikalar içinde kurulum yapın, misafirleriniz uygulama indirmeden fotoğraf yüklesin.
          </p>
          <Link
            href="/giris"
            className="inline-flex items-center gap-2 bg-white text-[#6D1A3E] font-semibold px-8 py-4 rounded-full hover:bg-[#FAF7F2] active:scale-[0.97] transition-all shadow-lg"
          >
            Ücretsiz Başla →
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
