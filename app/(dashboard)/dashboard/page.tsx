import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('events')
    .select(
      'id, title, slug, event_date, event_type, package_type, photo_count, video_count, is_upload_active'
    )
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Etkinliklerim</h1>
        <Link
          href="/etkinlik/yeni"
          className="bg-[#6D1A3E] text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-[#5a1533] transition-colors"
        >
          + Yeni Etkinlik
        </Link>
      </div>

      {!events?.length ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-[#7a6a5a] text-lg">Henüz etkinliğiniz yok.</p>
          <Link
            href="/etkinlik/yeni"
            className="text-[#6D1A3E] font-medium mt-2 inline-block hover:underline"
          >
            İlk etkinliğinizi oluşturun →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/etkinlik/${event.slug}`}
              className="bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#e8ddd5] hover:shadow-[0_4px_24px_rgba(109,26,62,0.12)] hover:border-[#6D1A3E]/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-[#1a1a1a] group-hover:text-[#6D1A3E] transition-colors line-clamp-1">
                  {event.title}
                </h2>
                <span
                  className={`shrink-0 ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    event.is_upload_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-[#F0EBE3] text-[#9ca3af]'
                  }`}
                >
                  {event.is_upload_active ? 'Aktif' : 'Kapalı'}
                </span>
              </div>

              <p className="text-sm text-[#9ca3af] mb-4">
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Tarih belirlenmedi'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-[#7a6a5a]">
                  <span>📷 {event.photo_count}</span>
                  <span>🎬 {event.video_count}</span>
                </div>
                <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider font-medium">
                  {event.package_type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
