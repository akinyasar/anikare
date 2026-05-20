'use client'

import type { EventType, PackageType } from '@/types'

interface PreviewState {
  title: string
  eventType: EventType
  eventDate: string
  packageType: PackageType
  templateId: string
}

const BG: Record<string, string> = {
  classic: 'bg-white border border-gray-200',
  floral: 'bg-pink-50 border border-pink-200',
  minimal: 'bg-gray-900 text-white border border-gray-800',
  golden: 'bg-amber-50 border border-amber-300',
  rustic: 'bg-orange-50 border border-orange-200',
  modern: 'bg-violet-50 border border-violet-200',
}

const TEXT: Record<string, string> = {
  classic: 'text-gray-800',
  floral: 'text-pink-800',
  minimal: 'text-white',
  golden: 'text-amber-900',
  rustic: 'text-orange-900',
  modern: 'text-violet-900',
}

const EVENT_LABELS: Record<EventType, string> = {
  wedding: 'Düğün',
  birthday: 'Doğum Günü',
  graduation: 'Mezuniyet',
  engagement: 'Nişan',
  other: 'Etkinlik',
}

export default function TableCardPreview({ state }: { state: PreviewState }) {
  const bg = BG[state.templateId] ?? BG.classic
  const text = TEXT[state.templateId] ?? TEXT.classic

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Canlı Önizleme
      </p>
      <div
        className={`rounded-2xl p-6 shadow-lg flex flex-col items-center text-center gap-4 min-h-[320px] ${bg}`}
      >
        <div className={`text-xs uppercase tracking-widest font-medium opacity-60 ${text}`}>
          {EVENT_LABELS[state.eventType]}
        </div>

        <div>
          <h2 className={`text-xl font-bold leading-tight ${text}`}>
            {state.title || 'Adınız Burada'}
          </h2>
          {state.eventDate && (
            <p className={`text-sm mt-1 opacity-70 ${text}`}>
              {new Date(state.eventDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* QR placeholder */}
        <div
          className={`w-24 h-24 rounded-xl flex items-center justify-center border-2 ${
            state.templateId === 'minimal'
              ? 'border-white/30 bg-white/10'
              : 'border-current/20 bg-current/5 border-gray-200 bg-gray-50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-12 h-12 opacity-30" fill="currentColor">
            <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v-2h-2v2zm-4 0h2v-2h-2v2z" />
          </svg>
        </div>

        <p className={`text-xs opacity-50 ${text}`}>Anı paylaşmak için QR okut</p>
      </div>
    </div>
  )
}
