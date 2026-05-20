'use client'

import Link from 'next/link'
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
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="text-xl font-bold text-rose-500 tracking-tight">
          AnıKare
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          {user.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.user_metadata?.full_name ?? user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
