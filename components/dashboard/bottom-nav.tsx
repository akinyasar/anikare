'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Etkinliklerim',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
  },
  {
    href: '/etkinlik/yeni',
    label: 'Yeni Etkinlik',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#e8ddd5] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around px-4 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 min-w-[56px]"
            >
              {item.icon(active)}
              <span className={`text-[10px] font-medium ${active ? 'text-[#6D1A3E]' : 'text-[#9ca3af]'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
