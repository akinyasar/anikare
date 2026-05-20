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
        <h1 className="text-2xl font-bold text-gray-900">Etkinliklerim</h1>
        <Link
          href="/etkinlik/yeni"
          className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors"
        >
          + Yeni Etkinlik
        </Link>
      </div>

      {!events?.length ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-gray-500 text-lg">Henüz etkinliğiniz yok.</p>
          <Link
            href="/etkinlik/yeni"
            className="text-rose-500 font-medium mt-2 inline-block hover:underline"
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
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-1">
                  {event.title}
                </h2>
                <span
                  className={`shrink-0 ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                    event.is_upload_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {event.is_upload_active ? 'Aktif' : 'Kapalı'}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Tarih belirlenmedi'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>📷 {event.photo_count}</span>
                  <span>🎬 {event.video_count}</span>
                </div>
                <span className="text-xs text-gray-300 uppercase tracking-wide">
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
