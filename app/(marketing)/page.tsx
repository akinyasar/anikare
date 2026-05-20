import type { Metadata } from 'next'
import Hero from '@/components/landing/hero'
import HowItWorks from '@/components/landing/how-it-works'
import Features from '@/components/landing/features'
import Pricing from '@/components/landing/pricing'
import CtaBanner from '@/components/landing/cta-banner'

export const metadata: Metadata = {
  title: 'AnıKare — Düğününüzün Dijital Anı Defteri',
  description:
    'QR kod ile misafirlerinizin fotoğraflarını anında toplayın. Kurulum yok, uygulama indirme yok. Düğün, doğum günü ve davetleriniz için en kolay fotoğraf paylaşım platformu.',
  openGraph: {
    title: 'AnıKare',
    description: 'Düğün ve davetler için QR tabanlı dijital anı paylaşım platformu',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <CtaBanner />
    </>
  )
}
