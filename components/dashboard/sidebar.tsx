'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import LocaleSwitcher from '@/components/ui/locale-switcher'

interface SidebarProps {
  user: User
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Etkinliklerim',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
  },
  {
    href: '/etkinlik/yeni',
    label: 'Yeni Etkinlik',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/giris')
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-[#e8ddd5] h-screen sticky top-0">
      <div className="p-6 border-b border-[#e8ddd5]">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/brand/logo.svg" alt="AnıKare" width={44} height={48} className="group-hover:scale-105 transition-transform" />
          <span className="text-base font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-[#f5e6ed] text-[#6D1A3E]'
                : 'text-[#7a6a5a] hover:bg-[#FAF7F2] hover:text-[#1a1a1a]'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#e8ddd5]">
        <div className="flex items-center gap-3 mb-3">
          {user.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f5e6ed] flex items-center justify-center text-[#6D1A3E] text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <p className="text-sm font-medium text-[#1a1a1a] truncate min-w-0">
            {user.user_metadata?.full_name ?? user.email}
          </p>
        </div>
        <div className="mb-3">
          <p className="text-[10px] text-[#c4b5a5] uppercase tracking-wide mb-1.5">Misafir Dili</p>
          <LocaleSwitcher />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs font-medium text-[#7a6a5a] hover:text-[#6D1A3E] hover:bg-[#f5e6ed] px-3 py-1.5 rounded-lg transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
