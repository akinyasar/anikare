'use client'

import Input, { Textarea } from '@/components/ui/input'
import type { EventType } from '@/types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function maxDateStr() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 10)
  return d.toISOString().split('T')[0]
}

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
  guestCountEstimate: string
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
      {/* Event type chips */}
      <div>
        <p className="text-sm font-medium text-[#374151] mb-3">Etkinlik Türü</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => update({ eventType: type.value })}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                state.eventType === type.value
                  ? 'border-[#6D1A3E] bg-[#f5e6ed] text-[#6D1A3E]'
                  : 'border-[#e8ddd5] bg-white text-[#7a6a5a] hover:border-[#6D1A3E]/30'
              }`}
            >
              <span className="text-xl">{type.emoji}</span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="İsimler / Başlık"
        placeholder="Örn: Ahmet & Ayşe"
        value={state.title}
        onChange={(e) => update({ title: e.target.value })}
        required
        hint={state.title
          ? `anikare.co/e/${state.title.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}...`
          : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Etkinlik Tarihi"
          type="date"
          min={todayStr()}
          max={maxDateStr()}
          value={state.eventDate}
          onChange={(e) => {
            const val = e.target.value
            if (!val) { update({ eventDate: '' }); return }
            const min = todayStr()
            const max = maxDateStr()
            const clamped = val < min ? min : val > max ? max : val
            update({ eventDate: clamped })
          }}
        />
        <Input
          label="Tahmini Davetli"
          type="number"
          min={1}
          value={state.guestCountEstimate}
          onChange={(e) => update({ guestCountEstimate: e.target.value })}
          placeholder="50"
        />
      </div>

      <Textarea
        label="Teşekkür Mesajı"
        placeholder="Yükleme sonrası misafire gösterilecek mesaj..."
        value={state.thankYouMessage}
        onChange={(e) => update({ thankYouMessage: e.target.value })}
        rows={3}
      />

      {/* PIN toggle */}
      <div className="bg-white border border-[#e8ddd5] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[#374151]">PIN Koruması</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">Yükleme öncesi 4 haneli kod isteyin</p>
          </div>
          <button
            type="button"
            onClick={() => update({ pinEnabled: !state.pinEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              state.pinEnabled ? 'bg-[#6D1A3E]' : 'bg-[#e8ddd5]'
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
            className="w-full bg-[#FAF7F2] border border-[#e8ddd5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition"
          />
        )}
      </div>
    </div>
  )
}
