'use client'

import Input from '@/components/ui/input'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import { createProgramItem } from '@/lib/programs'
import type { ProgramItem } from '@/types'

interface Props {
  items: ProgramItem[]
  onChange: (items: ProgramItem[]) => void
}

export default function ProgramsEditor({ items, onChange }: Props) {
  const { locale } = useLocale()

  function updateItem(id: string, partial: Partial<ProgramItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#374151]">{t(locale, 'programsTitle')}</p>
        <p className="text-xs text-[#9ca3af] mt-0.5">{t(locale, 'programsDesc')}</p>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[#9ca3af] bg-white border border-dashed border-[#e8ddd5] rounded-2xl px-4 py-8 text-center">
          {t(locale, 'programEmpty')}
        </p>
      )}

      {items.map((item, index) => (
        <div key={item.id} className="bg-white border border-[#e8ddd5] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#6D1A3E] bg-[#f5e6ed] px-2.5 py-1 rounded-full truncate">
              {item.name.trim() || `${t(locale, 'programUntitled')} ${index + 1}`}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label={t(locale, 'programMoveUp')}
                title={t(locale, 'programMoveUp')}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="w-7 h-7 rounded-full border border-[#e8ddd5] text-[#7a6a5a] text-xs hover:bg-[#F0EBE3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={t(locale, 'programMoveDown')}
                title={t(locale, 'programMoveDown')}
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="w-7 h-7 rounded-full border border-[#e8ddd5] text-[#7a6a5a] text-xs hover:bg-[#F0EBE3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-[#9ca3af] hover:text-red-500 px-2 py-1 rounded-full transition-colors"
              >
                {t(locale, 'programRemove')}
              </button>
            </div>
          </div>

          <Input
            id={`program-${item.id}-name`}
            label={t(locale, 'programNameLabel')}
            placeholder={t(locale, 'programNamePlaceholder')}
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
          />

          <Input
            id={`program-${item.id}-venue`}
            label={t(locale, 'programVenueLabel')}
            placeholder={t(locale, 'programVenuePlaceholder')}
            value={item.venueName}
            onChange={(e) => updateItem(item.id, { venueName: e.target.value })}
          />

          <Input
            id={`program-${item.id}-address`}
            label={t(locale, 'programAddressLabel')}
            placeholder={t(locale, 'programAddressPlaceholder')}
            value={item.address}
            onChange={(e) => updateItem(item.id, { address: e.target.value })}
          />

          <Input
            id={`program-${item.id}-maps-url`}
            label={t(locale, 'programMapsUrlLabel')}
            placeholder={t(locale, 'programMapsUrlPlaceholder')}
            type="url"
            value={item.mapsUrl ?? ''}
            onChange={(e) => updateItem(item.id, { mapsUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id={`program-${item.id}-date`}
              label={t(locale, 'programDateLabel')}
              type="date"
              value={item.date}
              onChange={(e) => updateItem(item.id, { date: e.target.value })}
            />
            <Input
              id={`program-${item.id}-time`}
              label={t(locale, 'programTimeLabel')}
              type="time"
              value={item.time ?? ''}
              onChange={(e) => updateItem(item.id, { time: e.target.value })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, createProgramItem()])}
        className="w-full border-2 border-dashed border-[#e8ddd5] rounded-2xl py-3 text-sm font-medium text-[#6D1A3E] hover:border-[#6D1A3E]/40 hover:bg-[#f5e6ed] transition-colors"
      >
        {t(locale, 'programAdd')}
      </button>
    </div>
  )
}
