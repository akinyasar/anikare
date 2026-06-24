'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LocaleSwitcher from '@/components/ui/locale-switcher'

export default function MobileHeader() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#e8ddd5] px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/brand/logo.svg" alt="AnıKare" width={28} height={30} />
        <span className="text-sm font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
      </Link>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <button
          onClick={handleLogout}
          className="p-1.5 text-[#9ca3af] hover:text-[#6D1A3E] transition-colors"
          aria-label="Çıkış Yap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  )
}
