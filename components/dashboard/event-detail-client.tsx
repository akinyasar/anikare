'use client'

import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import type { SiteKey } from '@/lib/i18n/site'
import MediaGrid from '@/components/dashboard/media-grid'
import QrDownload from '@/components/dashboard/qr-download'
import TableCardSection from '@/components/table-card/table-card-section'

const PACKAGE_LABELS: Record<string, string> = {
  eco: 'Ücretsiz',
  standard: 'Standart',
  premium: 'Premium',
}

const EVENT_TYPE_KEYS: Record<string, SiteKey> = {
  wedding: 'eventTypeWedding',
  birthday: 'eventTypeBirthday',
  graduation: 'eventTypeGraduation',
  engagement: 'eventTypeEngagement',
  other: 'eventTypeOther',
}

interface Props {
  event: {
    id: string
    title: string
    event_type: string
    event_date: string | null
    package_type: string
    template_id: string
    photo_count: number
    video_count: number
    guest_count_estimate: number | null
    is_upload_active: boolean
  }
  slug: string
}

export default function EventDetailClient({ event, slug }: Props) {
  const { locale } = useLocale()
  const eventTypeKey = EVENT_TYPE_KEYS[event.event_type]
  const eventTypeLabel = eventTypeKey ? t(locale, eventTypeKey) : t(locale, 'eventTypeOther')

  const dateLocale = locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'tr-TR'

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#9b4a6a] mb-1">
          {eventTypeLabel}
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{event.title}</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          {event.event_date
            ? new Date(event.event_date).toLocaleDateString(dateLocale, {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : t(locale, 'noDate')}{' '}
          · <span>{PACKAGE_LABELS[event.package_type] ?? event.package_type}</span>
        </p>
      </div>

      {/* Desktop: 2-column (content | QR) */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">

        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats */}
          <div className={`grid gap-3 ${event.guest_count_estimate ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <p className="text-2xl font-bold text-[#6D1A3E]">{event.photo_count}</p>
              <p className="text-xs text-[#9ca3af] mt-1">{t(locale, 'statPhotos')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <p className="text-2xl font-bold text-[#6D1A3E]">{event.video_count}</p>
              <p className="text-xs text-[#9ca3af] mt-1">{t(locale, 'statVideos')}</p>
            </div>
            {event.guest_count_estimate && (
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
                <p className="text-2xl font-bold text-[#6D1A3E]">{event.guest_count_estimate}</p>
                <p className="text-xs text-[#9ca3af] mt-1">{t(locale, 'statExpected')}</p>
              </div>
            )}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e8ddd5] text-center">
              <div className="flex items-center justify-center mt-0.5">
                {event.is_upload_active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {t(locale, 'uploadOpen')}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#9ca3af]">{t(locale, 'uploadClosed')}</span>
                )}
              </div>
              <p className="text-xs text-[#9ca3af] mt-1.5">{t(locale, 'statUpload')}</p>
            </div>
          </div>

          {event.package_type === 'premium' && (
            <a
              href={`/sunum/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
            >
              {t(locale, 'liveSlideshowLink')}
            </a>
          )}

          <TableCardSection
            templateId={event.template_id}
            title={event.title}
            eventType={eventTypeLabel}
            eventDate={event.event_date}
            slug={slug}
          />
        </div>

        {/* RIGHT — QR */}
        <div className="w-full lg:w-80 lg:shrink-0 lg:sticky lg:top-6">
          <QrDownload slug={slug} eventTitle={event.title} />
        </div>
      </div>

      <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">{t(locale, 'uploadedContent')}</h2>
      <MediaGrid eventId={event.id} count={event.photo_count + event.video_count} />
    </div>
  )
}
