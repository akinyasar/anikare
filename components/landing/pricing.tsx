'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import type { Locale } from '@/types'

function getPlans(locale: Locale) {
  return [
    {
      name: t(locale, 'plan1Name'),
      price: t(locale, 'plan1Price'),
      sub: t(locale, 'plan1Sub'),
      badge: null,
      features: [
        t(locale, 'plan1F1'),
        t(locale, 'plan1F2'),
        t(locale, 'plan1F3'),
        t(locale, 'plan1F4'),
        t(locale, 'plan1F5'),
      ],
      cta: t(locale, 'plan1Cta'),
      highlight: false,
    },
    {
      name: t(locale, 'plan2Name'),
      price: t(locale, 'plan2Price'),
      sub: t(locale, 'plan2Sub'),
      badge: t(locale, 'plan2Badge'),
      features: [
        t(locale, 'plan2F1'),
        t(locale, 'plan2F2'),
        t(locale, 'plan2F3'),
        t(locale, 'plan2F4'),
        t(locale, 'plan2F5'),
      ],
      cta: t(locale, 'plan2Cta'),
      highlight: true,
    },
    {
      name: t(locale, 'plan3Name'),
      price: t(locale, 'plan3Price'),
      sub: t(locale, 'plan3Sub'),
      badge: null,
      features: [
        t(locale, 'plan3F1'),
        t(locale, 'plan3F2'),
        t(locale, 'plan3F3'),
        t(locale, 'plan3F4'),
        t(locale, 'plan3F5'),
      ],
      cta: t(locale, 'plan3Cta'),
      highlight: false,
    },
  ]
}

function PlanCard({ plan, index }: { plan: ReturnType<typeof getPlans>[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: plan.highlight ? 1.03 : 1 }}
      animate={inView ? { opacity: 1, y: 0, scale: plan.highlight ? 1.03 : 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-3xl p-8 flex flex-col ${
        plan.highlight
          ? 'bg-[#6D1A3E] text-white shadow-2xl shadow-[#6D1A3E]/30 z-10'
          : 'bg-white border border-[#e8ddd5] hover:border-[#6D1A3E]/25 hover:shadow-lg transition-[border-color,box-shadow]'
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
  const { locale } = useLocale()
  const plans = getPlans(locale)

  return (
    <section id="fiyatlar" className="py-16 px-6 md:py-24 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-3">{t(locale, 'pricingLabel')}</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
            {t(locale, 'pricingTitle')}
          </h2>
          <p className="text-[#7a6a5a]">{t(locale, 'pricingDesc')}</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 items-center">
          {plans.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
