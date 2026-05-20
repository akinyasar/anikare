'use client'

import type { EventType } from '@/types'

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'wedding', label: 'Düğün', emoji: '💍' },
  { value: 'birthday', label: 'Doğum Günü', emoji: '🎂' },
  { value: 'graduation', label: 'Mezuniyet', emoji: '🎓' },
  { value: 'engagement', label: 'Nişan', emoji: '💒' },
  { value: 'other', label: 'Diğer', emoji: '🎉' },
]

interface StepDetailsState {
  title: string
  eventType: EventType
  eventDate: string
  guestCountEstimate: number
  thankYouMessage: string
  pinEnabled: boolean
  pinCode: string
}

interface Props {
  state: StepDetailsState
  update: (partial: Partial<StepDetailsState>) => void
}

export default function StepDetails({ state, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etkinlik Türü
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => update({ eventType: type.value })}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                state.eventType === type.value
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          İsimler / Başlık <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Örn: Ahmet & Ayşe"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          Link: /e/{state.title ? state.title.toLowerCase().replace(/\s+/g, '-').slice(0, 20) + '-...' : 'isim-evleniyor-xxxxx'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Etkinlik Tarihi
          </label>
          <input
            type="date"
            value={state.eventDate}
            onChange={(e) => update({ eventDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tahmini Davetli
          </label>
          <input
            type="number"
            min={1}
            value={state.guestCountEstimate}
            onChange={(e) => update({ guestCountEstimate: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Teşekkür Mesajı
        </label>
        <textarea
          value={state.thankYouMessage}
          onChange={(e) => update({ thankYouMessage: e.target.value })}
          placeholder="Yükleme sonrası misafire gösterilecek mesaj..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition resize-none"
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">PIN Koruması</p>
            <p className="text-xs text-gray-400">Yükleme öncesi 4 haneli kod isteyin</p>
          </div>
          <button
            type="button"
            onClick={() => update({ pinEnabled: !state.pinEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              state.pinEnabled ? 'bg-rose-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                state.pinEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {state.pinEnabled && (
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={state.pinCode}
            onChange={(e) => update({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="4 haneli PIN"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
          />
        )}
      </div>
    </div>
  )
}
