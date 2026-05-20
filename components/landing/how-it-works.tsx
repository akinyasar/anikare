'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    num: '1',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    title: 'Etkinlik Oluştur',
    desc: 'Tarih, mekan ve detayları girerek size özel dijital albümünüzü yaratın.',
  },
  {
    num: '2',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
      </svg>
    ),
    title: 'QR Kodu Paylaş',
    desc: 'Özel tasarımlı QR kodları masalara yerleştirin, davetiyelere ekleyin.',
  },
  {
    num: '3',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'Anıları Toplayın',
    desc: 'Misafirler kodları okutup fotoğraf yüklesin, anılar anında tek yerde biriksin.',
  },
]

function Step({ step, index }: { step: typeof STEPS[0], index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="flex flex-col items-center text-center group"
    >
      <div className="relative w-24 h-24 rounded-full bg-[#FAF7F2] border-2 border-[#e8ddd5] flex items-center justify-center mb-6 group-hover:bg-[#f5e6ed] group-hover:border-[#6D1A3E]/30 transition-all duration-300 text-[#6D1A3E]">
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6D1A3E] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
          {step.num}
        </div>
        {step.icon}
      </div>
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-3">
        {step.title}
      </h3>
      <p className="text-[#7a6a5a] text-sm leading-relaxed max-w-[220px]">{step.desc}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="nasil-calisir" className="py-24 px-6 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-3">Nasıl Çalışır?</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
            3 Adımda Başlayın
          </h2>
          <p className="text-[#7a6a5a] max-w-md mx-auto">
            Sade ve hızlı kurulum ile saniyeler içinde anıları toplamaya hazır olun.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Dashed connector line on desktop */}
          <div className="hidden md:block absolute top-11 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-[#e8ddd5] z-0" />
          {STEPS.map((step, i) => (
            <Step key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
