'use client'

import type { EventType, PackageType } from '@/types'

interface PreviewState {
  title: string
  eventType: EventType
  eventDate: string
  packageType: PackageType
  templateId: string
}

const EVENT_LABELS: Record<EventType, string> = {
  wedding: 'Düğün', birthday: 'Doğum Günü',
  graduation: 'Mezuniyet', engagement: 'Nişan', other: 'Etkinlik',
}

export default function TableCardPreview({ state }: { state: PreviewState }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-3">Canlı Önizleme</p>
      <div className="rounded-2xl bg-white border border-[#e8ddd5] p-5 flex flex-col items-center text-center gap-3 min-h-[300px] shadow-sm">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#9b4a6a]">
          {EVENT_LABELS[state.eventType]}
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#1a1a1a] leading-tight">
          {state.title || 'Adınız Burada'}
        </h2>
        {state.eventDate && (
          <p className="text-xs text-[#9ca3af]">
            {new Date(state.eventDate).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
        <div className="w-20 h-px bg-[#e8ddd5]" />
        {/* QR placeholder */}
        <div className="w-20 h-20 bg-[#F0EBE3] rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#6D1A3E] opacity-40" fill="currentColor">
            <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v-2h-2v2zm-4 0h2v-2h-2v2z"/>
          </svg>
        </div>
        <p className="text-[10px] text-[#c4b5a5]">QR kodu burada görünür</p>
        <p className="text-[9px] font-semibold text-[#6D1A3E] tracking-widest uppercase mt-auto">AnıKare</p>
      </div>
    </div>
  )
}
