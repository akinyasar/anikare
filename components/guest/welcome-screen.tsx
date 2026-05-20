'use client'

import type { PublicEvent } from '@/types'

interface Props {
  event: PublicEvent
  dict: Record<string, string>
  guestName: string
  setGuestName: (v: string) => void
  guestNote: string
  setGuestNote: (v: string) => void
}

export default function WelcomeScreen({
  event,
  dict,
  guestName,
  setGuestName,
  guestNote,
  setGuestNote,
}: Props) {
  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-32">
      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="w-32 h-32 rounded-full object-cover shadow-lg mb-6 border-4 border-white"
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900 text-center">{event.title}</h1>
      {event.event_date && (
        <p className="text-gray-400 text-sm mt-1">
          {new Date(event.event_date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      <div className="w-full max-w-sm mt-8 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {dict.enterName ?? 'Adınızı girin'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={dict.namePlaceholder ?? 'Adınız ve soyadınız'}
            autoComplete="name"
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {dict.noteOptional ?? 'Bir not bırakın (isteğe bağlı)'}
          </label>
          <textarea
            value={guestNote}
            onChange={(e) => setGuestNote(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition resize-none"
          />
        </div>
      </div>
    </div>
  )
}
