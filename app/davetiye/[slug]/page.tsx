import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { detectLocaleFromAcceptLanguage } from '@/lib/i18n'
import { normalizePrograms } from '@/lib/programs'
import InvitationView from '@/components/davetiye/invitation-view'
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
  const programs = normalizePrograms(event.programs)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY

  return (
    <InvitationView
      title={event.title}
      eventDate={event.event_date}
      programs={programs}
      apiKey={apiKey}
      initialLocale={locale}
    />
  )
}
