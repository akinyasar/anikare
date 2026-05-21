import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/sidebar'
import BottomNav from '@/components/dashboard/bottom-nav'
import MobileHeader from '@/components/dashboard/mobile-header'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      {/* Desktop sidebar */}
      <Sidebar user={user} />
      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-5 lg:p-10 pb-24 lg:pb-10">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
