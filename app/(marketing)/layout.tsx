// app/(marketing)/layout.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#e8ddd5]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/brand/logo.svg" alt="AnıKare" width={22} height={28} />
            <span className="text-sm font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm text-[#7a6a5a] hover:text-[#1a1a1a] transition-colors">
              Giriş
            </Link>
            <Link
              href="/giris"
              className="bg-[#6D1A3E] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#5a1533] transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#e8ddd5] py-8 text-center text-sm text-[#9ca3af]">
        © {new Date().getFullYear()} AnıKare
      </footer>
    </>
  )
}
