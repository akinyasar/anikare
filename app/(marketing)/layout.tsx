import Link from 'next/link'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-rose-500 tracking-tight">
            AnıKare
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/giris"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Giriş
            </Link>
            <Link
              href="/giris"
              className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AnıKare. Tüm hakları saklıdır.
      </footer>
    </>
  )
}
