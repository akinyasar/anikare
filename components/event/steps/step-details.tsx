'use client'

import { useMemo } from 'react'
import Input, { Textarea } from '@/components/ui/input'
import type { EventType } from '@/types'

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function parseDateStr(str: string): { d: string; m: string; y: string } {
  if (!str) return { d: '', m: '', y: '' }
  const [y, m, d] = str.split('-')
  return { d: String(parseInt(d || '0')), m: String(parseInt(m || '0')), y: y || '' }
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const years = useMemo(() => Array.from({ length: 11 }, (_, i) => currentYear + i), [currentYear])

  const { d, m, y } = parseDateStr(value)
  const selYear  = parseInt(y) || 0
  const selMonth = parseInt(m) || 0
  const maxDay   = selYear && selMonth ? daysInMonth(selYear, selMonth) : 31
  const days     = Array.from({ length: maxDay }, (_, i) => i + 1)

  function emit(nextD: string, nextM: string, nextY: string) {
    const nd = parseInt(nextD), nm = parseInt(nextM), ny = parseInt(nextY)
    if (!nd || !nm || !ny) { onChange(''); return }
    const max = daysInMonth(ny, nm)
    const safeDay = Math.min(nd, max)
    onChange(`${ny}-${String(nm).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`)
  }

  const selectCls = "flex-1 bg-white border border-[#e8ddd5] rounded-2xl px-3 py-3.5 text-sm text-[#1a1a1a] appearance-none focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition cursor-pointer"

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#374151]">Etkinlik Tarihi</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select className={selectCls} value={d} onChange={e => emit(e.target.value, m, y)}>
            <option value="">Gün</option>
            {days.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown />
        </div>
        <div className="relative flex-[1.6]">
          <select className={selectCls} value={m} onChange={e => emit(d, e.target.value, y)}>
            <option value="">Ay</option>
            {MONTHS.map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
          </select>
          <ChevronDown />
        </div>
        <div className="relative flex-[1.3]">
          <select className={selectCls} value={y} onChange={e => emit(d, m, e.target.value)}>
            <option value="">Yıl</option>
            {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
          </select>
          <ChevronDown />
        </div>
      </div>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
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
        <DatePicker
          value={state.eventDate}
          onChange={(v) => update({ eventDate: v })}
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
