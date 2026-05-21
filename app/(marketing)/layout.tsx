import type { Metadata } from 'next'
import MarketingNav from '@/components/landing/nav'
import ScrollToTop from '@/components/landing/scroll-to-top'
import JsonLd from '@/components/landing/json-ld'
import Footer from '@/components/landing/footer'
import { SITE_URL } from '@/lib/config'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd />
      <ScrollToTop />
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
