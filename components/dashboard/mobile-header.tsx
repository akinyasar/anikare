'use client'

import Link from 'next/link'
import Image from 'next/image'
import LocaleSwitcher from '@/components/ui/locale-switcher'

export default function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#e8ddd5] px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/brand/logo.svg" alt="AnıKare" width={28} height={30} />
        <span className="text-sm font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
      </Link>
      <LocaleSwitcher />
    </header>
  )
}
