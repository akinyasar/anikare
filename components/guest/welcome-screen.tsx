'use client'

import { motion } from 'framer-motion'
import Input, { Textarea } from '@/components/ui/input'
import Card from '@/components/ui/card'
import type { PublicEvent } from '@/types'

interface Props {
  event: PublicEvent
  dict: Record<string, string>
  locale: string
  guestName: string
  setGuestName: (v: string) => void
  guestNote: string
  setGuestNote: (v: string) => void
}

const EVENT_LABELS: Record<string, Record<string, string>> = {
  tr: { wedding: 'Düğün', birthday: 'Doğum Günü', graduation: 'Mezuniyet', engagement: 'Nişan', other: 'Etkinlik' },
  en: { wedding: 'Wedding', birthday: 'Birthday', graduation: 'Graduation', engagement: 'Engagement', other: 'Event' },
  de: { wedding: 'Hochzeit', birthday: 'Geburtstag', graduation: 'Abschlussfeier', engagement: 'Verlobung', other: 'Veranstaltung' },
}

export default function WelcomeScreen({ event, dict, locale, guestName, setGuestName, guestNote, setGuestNote }: Props) {
  const eventLabel = EVENT_LABELS[locale]?.[event.event_type] ?? EVENT_LABELS.tr[event.event_type] ?? 'Etkinlik'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col bg-[#FAF7F2]"
    >
      {/* Event hero */}
      <div className="text-center px-5 pt-8 mb-6">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-3">
          {eventLabel}
        </p>

        <h1 className="font-[family-name:var(--font-playfair)] text-[2.1rem] font-bold text-[#1a1a1a] leading-[1.15] mb-3">
          {event.title}
        </h1>

        {event.event_date && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[#7a6a5a]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            {new Date(event.event_date).toLocaleDateString(
              locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : 'en-GB',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </span>
        )}

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mt-5 mb-1 max-w-[180px] mx-auto">
          <div className="flex-1 h-px bg-[#d4c3b8]" />
          <svg className="w-3 h-3 text-[#6D1A3E] opacity-50" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9l-3.75 3 1.5-4.5L0 4.5h4.5z"/>
          </svg>
          <div className="flex-1 h-px bg-[#d4c3b8]" />
        </div>
      </div>

      {/* Upload card */}
      <div className="px-5 pb-6">
        <Card className="max-w-sm mx-auto w-full">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-1.5 text-center">
            {dict.shareMemories ?? 'Anılarını Paylaş'}
          </h2>
          <p className="text-sm text-[#7a6a5a] mb-5 leading-relaxed text-center">
            {dict.shareMemoriesDesc ?? 'Bu özel günün bir parçası olduğun için teşekkürler 🤍'}
          </p>

          <div className="space-y-4">
            <Input
              label={dict.enterName ?? 'Adınız'}
              placeholder={dict.namePlaceholder ?? 'Örn: Mehmet Yılmaz'}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
              required
            />
            <Textarea
              label={dict.noteOptional ?? 'Bir not bırakın (isteğe bağlı)'}
              placeholder="Dileklerinizi yazabilirsiniz..."
              value={guestNote}
              onChange={(e) => setGuestNote(e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
