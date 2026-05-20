import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MediaGrid from '@/components/dashboard/media-grid'
import QrDownload from '@/components/dashboard/qr-download'

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">
            {event.event_date
              ? new Date(event.event_date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Tarih belirlenmedi'}{' '}
            · {event.package_type}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-rose-500">{event.photo_count}</p>
              <p className="text-xs text-gray-400 mt-1">Fotoğraf</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-rose-500">{event.video_count}</p>
              <p className="text-xs text-gray-400 mt-1">Video</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-semibold mt-1">
                {event.is_upload_active ? (
                  <span className="text-green-600">Açık</span>
                ) : (
                  <span className="text-gray-400">Kapalı</span>
                )}
              </p>
              <p className="text-xs text-gray-400">Yükleme</p>
            </div>
          </div>

          {event.package_type === 'premium' && (
            <a
              href={`/sunum/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-violet-600 font-medium hover:text-violet-700"
            >
              ✨ Canlı Slayt Gösterisini Aç →
            </a>
          )}
        </div>

        <QrDownload slug={slug} eventTitle={event.title} />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Yüklenen İçerikler</h2>
      <MediaGrid eventId={event.id} />
    </div>
  )
}
