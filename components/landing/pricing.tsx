'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const PLANS = [
  {
    name: 'Ücretsiz',
    price: 'Ücretsiz',
    sub: 'Akışı keşfetmek için',
    badge: null,
    features: [
      '10 fotoğraf',
      '2 video',
      'Temel QR kart',
      'Türkçe / İngilizce / Almanca',
      'Sınırsız süre',
    ],
    cta: 'Ücretsiz Başla',
    highlight: false,
  },
  {
    name: 'Standart',
    price: '₺1.000',
    sub: 'Tek etkinlik · tek seferlik',
    badge: 'En Popüler',
    features: [
      'Sınırsız fotoğraf',
      '20 video',
      '4K kalite',
      '3 masa kartı şablonu (indirilebilir PDF)',
      'Tüm diller',
    ],
    cta: 'Hemen Al',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₺1.399',
    sub: 'Tek etkinlik · tek seferlik',
    badge: null,
    features: [
      'Sınırsız fotoğraf & video',
      'Orijinal kalite (sıkıştırma yok)',
      '3 masa kartı şablonu (indirilebilir PDF)',
      'Canlı slayt gösterisi',
      'Tüm özellikler dahil',
    ],
    cta: 'Hemen Al',
    highlight: false,
  },
]

function PlanCard({ plan, index }: { plan: typeof PLANS[0], index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className={`relative rounded-3xl p-8 flex flex-col ${
        plan.highlight
          ? 'bg-[#6D1A3E] text-white shadow-2xl shadow-[#6D1A3E]/30 scale-[1.03] z-10'
          : 'bg-white border border-[#e8ddd5] hover:border-[#6D1A3E]/25 hover:shadow-lg transition-all'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-[#6D1A3E] text-xs font-bold px-4 py-1 rounded-full shadow-md border border-[#6D1A3E]/20 whitespace-nowrap">
          ✦ {plan.badge}
        </div>
      )}

      <div className="mb-7">
        <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${plan.highlight ? 'text-[#f5e6ed]' : 'text-[#9b4a6a]'}`}>
          {plan.name}
        </p>
        <p className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#1a1a1a]'}`}>
          {plan.price}
        </p>
        <p className={`text-xs mt-1 ${plan.highlight ? 'text-[#f5e6ed]/70' : 'text-[#9ca3af]'}`}>
          {plan.sub}
        </p>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className={`text-sm flex items-start gap-2.5 ${plan.highlight ? 'text-[#f5e6ed]' : 'text-[#7a6a5a]'}`}>
            <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-white' : 'text-[#6D1A3E]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/giris"
        className={`block text-center py-3.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97] ${
          plan.highlight
            ? 'bg-white text-[#6D1A3E] hover:bg-[#FAF7F2]'
            : 'bg-[#6D1A3E] text-white hover:bg-[#5a1533]'
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  )
}

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="fiyatlar" className="py-24 px-6 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-3">Fiyatlandırma</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
            Etkinlik başına tek seferlik
          </h2>
          <p className="text-[#7a6a5a]">Abonelik yok. Gizli ücret yok. Sadece etkinliğiniz için ödeyin.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 items-center">
          {PLANS.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
