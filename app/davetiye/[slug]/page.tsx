import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, detectLocaleFromAcceptLanguage } from '@/lib/i18n'
import { normalizePrograms, directionsUrl, mapEmbedUrl } from '@/lib/programs'
import { TitleText } from '@/components/table-card/title-text'
import { SITE_URL } from '@/lib/config'
import type { Locale } from '@/types'

function dateLocaleTag(locale: Locale): string {
  return locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'tr-TR'
}

// 'YYYY-MM-DD' yerel saatte parse edilir (düz new Date() UTC'ye kaydırıp
// bazı saat dilimlerinde günü bir geri alır).
function formatDate(value: string, locale: Locale): string {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(dateLocaleTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, invitation_enabled')
    .eq('slug', slug)
    .single()

  if (!event || !event.invitation_enabled) {
    return { title: 'Davetiye', robots: { index: false, follow: false } }
  }

  const dateLabel = event.event_date ? formatDate(event.event_date, 'tr') : ''
  const description = dateLabel ? `${event.title} — ${dateLabel}` : event.title

  return {
    title: event.title,
    description,
    // Etkinlik detayları arama motorlarında listelenmesin (/e/ ve /sunum/ ile aynı
    // gizlilik duruşu). WhatsApp/iMessage önizlemeleri bundan etkilenmez.
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title: event.title,
      description,
      url: `${SITE_URL}/davetiye/${slug}`,
      siteName: 'AnıKare',
    },
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, invitation_enabled, programs')
    .eq('slug', slug)
    .single()

  // Paket kontrolü YOK — bu özellik tüm paketlerde açık.
  // Görünürlük yalnızca invitation_enabled ile kontrol edilir.
  if (!event || !event.invitation_enabled) notFound()

  const headersList = await headers()
  const locale = detectLocaleFromAcceptLanguage(headersList.get('accept-language') ?? 'tr')
  const dict = await getDictionary(locale)
  const inv = dict.invitation

  const programs = normalizePrograms(event.programs)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
  const heroDate = event.event_date ? formatDate(event.event_date, locale) : ''

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-xl">
        {/* Hero */}
        <header className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-[#9b4a6a]">
            {inv.eyebrow}
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#6D1A3E] leading-tight mt-4">
            <TitleText title={event.title} />
          </h1>
          {heroDate && <p className="text-sm text-[#7a6a5a] mt-4">{heroDate}</p>}
          <div className="w-16 h-px bg-[#e8ddd5] mx-auto mt-8" />
        </header>

        {/* Programlar — boşsa hiçbir şey render edilmez, sayfa yine geçerli */}
        {programs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase text-[#9b4a6a] mb-6">
              {inv.programTitle}
            </h2>

            <div className="space-y-6">
              {programs.map((item) => {
                const embed = mapEmbedUrl(item, apiKey)
                const directions = directionsUrl(item)
                const programDate = formatDate(item.date, locale)
                const whenParts = [programDate, item.time].filter(Boolean).join(' · ')

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#e8ddd5] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden"
                  >
                    <div className="p-6">
                      {item.name && (
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a]">
                          {item.name}
                        </h3>
                      )}
                      {whenParts && (
                        <p className="text-sm text-[#6D1A3E] font-medium mt-2">{whenParts}</p>
                      )}
                      {item.venueName && (
                        <p className="text-sm font-medium text-[#374151] mt-4">{item.venueName}</p>
                      )}
                      {item.address && (
                        <p className="text-sm text-[#7a6a5a] leading-relaxed mt-1">{item.address}</p>
                      )}
                    </div>

                    {embed ? (
                      <iframe
                        title={`${item.venueName || item.name} — ${item.address}`}
                        src={embed}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block w-full h-[220px] border-0"
                      />
                    ) : (
                      item.address && (
                        <div className="flex items-center justify-center h-[120px] bg-[#F0EBE3] text-xs text-[#9ca3af] px-6 text-center">
                          {inv.mapUnavailable}
                        </div>
                      )
                    )}

                    {directions && (
                      <div className="p-5 border-t border-[#e8ddd5]">
                        <a
                          href={directions}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full bg-[#6D1A3E] text-white rounded-full py-3 text-sm font-medium hover:bg-[#5a1533] transition-colors"
                        >
                          {inv.getDirections}
                        </a>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <p className="text-center text-sm text-[#7a6a5a] mt-12">{inv.seeYouThere}</p>
        <p className="text-center text-[11px] tracking-[0.2em] uppercase text-[#9ca3af] mt-10">
          AnıKare
        </p>
      </div>
    </main>
  )
}
