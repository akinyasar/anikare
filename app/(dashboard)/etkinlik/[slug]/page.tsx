import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MediaGrid from '@/components/dashboard/media-grid'
import QrDownload from '@/components/dashboard/qr-download'
import TableCardSection from '@/components/table-card/table-card-section'

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

  const EVENT_LABELS: Record<string, string> = {
    wedding: 'Düğün', birthday: 'Doğum Günü',
    graduation: 'Mezuniyet', engagement: 'Nişan', other: 'Etkinlik',
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#9b4a6a] mb-1">
          {EVENT_LABELS[event.event_type] ?? 'Etkinlik'}
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{event.title}</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          {event.event_date
            ? new Date(event.event_date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Tarih belirlenmedi'}{' '}
          · <span className="capitalize">{event.package_type}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
        <div className="flex-1">
          {/* Stats */}
          <div className={`grid gap-3 ${event.guest_count_estimate ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <p className="text-2xl font-bold text-[#6D1A3E]">{event.photo_count}</p>
              <p className="text-xs text-[#9ca3af] mt-1">Fotoğraf</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <p className="text-2xl font-bold text-[#6D1A3E]">{event.video_count}</p>
              <p className="text-xs text-[#9ca3af] mt-1">Video</p>
            </div>
            {event.guest_count_estimate && (
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
                <p className="text-2xl font-bold text-[#6D1A3E]">{event.guest_count_estimate}</p>
                <p className="text-xs text-[#9ca3af] mt-1">Beklenen</p>
              </div>
            )}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <div className="flex items-center justify-center mt-0.5">
                {event.is_upload_active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Açık
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#9ca3af]">Kapalı</span>
                )}
              </div>
              <p className="text-xs text-[#9ca3af] mt-1.5">Yükleme</p>
            </div>
          </div>

          {event.package_type === 'premium' && (
            <a
              href={`/sunum/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
            >
              ✨ Canlı Slayt Gösterisini Aç →
            </a>
          )}
        </div>

        <QrDownload slug={slug} eventTitle={event.title} />
      </div>

      {/* Masa kartı */}
      <TableCardSection
        templateId={event.template_id}
        title={event.title}
        eventType={EVENT_LABELS[event.event_type] ?? 'Etkinlik'}
        slug={slug}
      />

      <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">Yüklenen İçerikler</h2>
      <MediaGrid eventId={event.id} />
    </div>
  )
}
