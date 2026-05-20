'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Input, { Textarea } from '@/components/ui/input'
import Card from '@/components/ui/card'
import type { PublicEvent } from '@/types'

interface Props {
  event: PublicEvent
  dict: Record<string, string>
  guestName: string
  setGuestName: (v: string) => void
  guestNote: string
  setGuestNote: (v: string) => void
}

const EVENT_LABELS: Record<string, string> = {
  wedding: 'Düğün', birthday: 'Doğum Günü',
  graduation: 'Mezuniyet', engagement: 'Nişan', other: 'Etkinlik',
}

export default function WelcomeScreen({ event, dict, guestName, setGuestName, guestNote, setGuestNote }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col bg-[#FAF7F2] pb-36"
    >
      {/* Minimal brand header */}
      <header className="flex items-center justify-center py-3.5 border-b border-[#e8ddd5]/60">
        <div className="flex items-center gap-2">
          <Image src="/brand/logo.svg" alt="AnıKare" width={18} height={24} />
          <span className="text-[11px] font-bold text-[#6D1A3E] tracking-[0.22em] uppercase">AnıKare</span>
        </div>
      </header>

      {/* Event hero */}
      <div className="text-center px-5 pt-10 mb-8">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9b4a6a] mb-4">
          {EVENT_LABELS[event.event_type] ?? 'Etkinlik'}
        </p>

        <h1 className="font-[family-name:var(--font-playfair)] text-[2.25rem] font-bold text-[#1a1a1a] leading-[1.15] mb-4">
          {event.title}
        </h1>

        {event.event_date && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[#7a6a5a]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        )}

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mt-6 mb-1 max-w-[180px] mx-auto">
          <div className="flex-1 h-px bg-[#d4c3b8]" />
          <svg className="w-3 h-3 text-[#6D1A3E] opacity-50" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9l-3.75 3 1.5-4.5L0 4.5h4.5z"/>
          </svg>
          <div className="flex-1 h-px bg-[#d4c3b8]" />
        </div>
      </div>

      {/* Upload card */}
      <div className="px-5">
        <Card className="max-w-sm mx-auto w-full">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-1.5">
            Anılarını Paylaş
          </h2>
          <p className="text-sm text-[#7a6a5a] mb-5 leading-relaxed">
            Bu özel günün bir parçası olduğun için teşekkürler 🤍
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
