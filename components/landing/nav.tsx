'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LocaleSwitcher from '@/components/ui/locale-switcher'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const { locale } = useLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
  }, [])

  const NAV_LINKS = [
    { href: '#ozellikler', label: t(locale, 'features') },
    { href: '#nasil-calisir', label: t(locale, 'howItWorks') },
    { href: '#fiyatlar', label: t(locale, 'pricing') },
  ]

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith('#')) return
    e.preventDefault()
    const id = href.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(109,26,62,0.07)] border-b border-[#e8ddd5]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/brand/logo.svg"
            alt="AnıKare"
            width={32}
            height={35}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-sm font-bold text-[#6D1A3E] tracking-[0.2em] uppercase">
            AnıKare
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => smoothScroll(e, link.href)}
              className="text-sm text-[#7a6a5a] hover:text-[#6D1A3E] transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <LocaleSwitcher />
          {user ? (
            <Link
              href="/dashboard"
              className="bg-[#6D1A3E] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5a1533] transition-colors"
            >
              {t(locale, 'goToDashboard')}
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="text-sm text-[#7a6a5a] hover:text-[#1a1a1a] transition-colors font-medium px-4 py-2"
              >
                {t(locale, 'signIn')}
              </Link>
              <Link
                href="/giris"
                className="bg-[#6D1A3E] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5a1533] transition-colors"
              >
                {t(locale, 'startFree')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          <span className={`w-5 h-0.5 bg-[#6D1A3E] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-[#6D1A3E] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-[#6D1A3E] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#e8ddd5] px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => smoothScroll(e, link.href)}
              className="text-sm font-medium text-[#7a6a5a] hover:text-[#6D1A3E] transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[#e8ddd5] flex flex-col gap-2">
            <LocaleSwitcher className="self-start" />
            {user ? (
              <Link href="/dashboard" className="bg-[#6D1A3E] text-white text-center py-3 rounded-full text-sm font-semibold">
                {t(locale, 'goToDashboard')}
              </Link>
            ) : (
              <>
                <Link href="/giris" className="text-center text-sm text-[#7a6a5a] py-2.5 font-medium">{t(locale, 'signIn')}</Link>
                <Link href="/giris" className="bg-[#6D1A3E] text-white text-center py-3 rounded-full text-sm font-semibold">
                  {t(locale, 'startFree')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
