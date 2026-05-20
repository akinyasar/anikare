import MarketingNav from '@/components/landing/nav'
import ScrollToTop from '@/components/landing/scroll-to-top'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <MarketingNav />
      <main>{children}</main>
      <footer className="bg-[#FAF7F2] border-t border-[#e8ddd5] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</p>
          <div className="flex items-center gap-6 text-sm text-[#9ca3af]">
            <a href="#" className="hover:text-[#6D1A3E] transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-[#6D1A3E] transition-colors">Kullanım Koşulları</a>
            <a href="#" className="hover:text-[#6D1A3E] transition-colors">İletişim</a>
          </div>
          <p className="text-xs text-[#9ca3af]">© 2026 AnıKare</p>
        </div>
      </footer>
    </>
  )
}
