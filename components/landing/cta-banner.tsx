'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'

export default function CtaBanner() {
  const { locale } = useLocale()

  return (
    <section className="px-6 md:px-10 py-8 md:py-10 bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#6D1A3E] to-[#8B2252] rounded-3xl px-6 py-10 md:px-8 md:py-14 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <p className="text-[#f5e6ed]/70 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            {t(locale, 'ctaLabel')}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {t(locale, 'ctaTitle')}
          </h2>
          <p className="text-[#f5e6ed]/80 max-w-md mx-auto mb-8 leading-relaxed">
            {t(locale, 'ctaDesc')}
          </p>
          <Link
            href="/giris"
            className="inline-flex items-center gap-2 bg-white text-[#6D1A3E] font-semibold px-8 py-4 rounded-full hover:bg-[#FAF7F2] active:scale-[0.97] transition-all shadow-lg"
          >
            {t(locale, 'ctaCta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
