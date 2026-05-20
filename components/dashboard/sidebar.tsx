'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User
}

const navItems = [
  { href: '/dashboard', label: 'Etkinliklerim', icon: '🎉' },
  { href: '/etkinlik/yeni', label: 'Yeni Etkinlik', icon: '✨' },
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/logo.svg" alt="AnıKare" width={28} height={36} />
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
            <span>{item.icon}</span>
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
        <button
          onClick={handleSignOut}
          className="text-xs text-[#9ca3af] hover:text-[#7a6a5a] transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
