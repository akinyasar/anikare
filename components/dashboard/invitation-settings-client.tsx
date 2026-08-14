'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'
import ProgramsEditor from '@/components/event/programs-editor'
import { sanitizePrograms } from '@/lib/programs'
import type { ProgramItem } from '@/types'

interface Props {
  eventId: string
  eventTitle: string
  slug: string
  initialEnabled: boolean
  initialPrograms: ProgramItem[]
}

type SaveState = 'idle' | 'saving' | 'error'

export default function InvitationSettingsClient({
  eventId,
  eventTitle,
  slug,
  initialEnabled,
  initialPrograms,
}: Props) {
  const { locale } = useLocale()
  const [enabled, setEnabled] = useState(initialEnabled)
  // Yalnızca başarılı kaydetme sonrası güncellenir — DB'deki gerçek durumu
  // yansıtır. Yayınla anahtarı bunun aksine anlık/kaydedilmemiş yerel durum.
  const [publishedEnabled, setPublishedEnabled] = useState(initialEnabled)
  const [programs, setPrograms] = useState<ProgramItem[]>(initialPrograms)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const hasUnsavedChanges = enabled !== publishedEnabled

  async function handleSave() {
    setSaveState('saving')
    const cleaned = sanitizePrograms(programs)
    const supabase = createClient()
    const { error } = await supabase
      .from('events')
      .update({ programs: cleaned, invitation_enabled: enabled })
      .eq('id', eventId)

    if (error) {
      setSaveState('error')
      return
    }
    setPrograms(cleaned)
    setPublishedEnabled(enabled)
    setSaveState('idle')
    toast.success(t(locale, 'invitationSaved'))
  }

  // Yayınla anahtarı kendi başına kaydeder — ayrı bir "Kaydet" tıklaması
  // beklemez, programlardaki taslak değişikliklere dokunmaz.
  async function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('events')
      .update({ invitation_enabled: next })
      .eq('id', eventId)

    if (error) {
      setSaveState('error')
      return
    }
    setPublishedEnabled(next)
    setSaveState('idle')
    toast.success(t(locale, 'invitationSaved'))
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/etkinlik/${slug}`}
        className="text-sm text-[#7a6a5a] hover:text-[#6D1A3E] transition-colors"
      >
        {t(locale, 'invitationBackToEvent')}
      </Link>

      <div className="mt-4 mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#9b4a6a] mb-1">
          {eventTitle}
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{t(locale, 'invitationSettingsTitle')}</h1>
        <p className="text-[#9ca3af] text-sm mt-1">{t(locale, 'invitationSettingsDesc')}</p>
      </div>

      {/* Yayınlama anahtarı */}
      <div className="bg-white border border-[#e8ddd5] rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#374151]">{t(locale, 'invitationEnabledLabel')}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{t(locale, 'invitationEnabledHint')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={t(locale, 'invitationEnabledLabel')}
            onClick={handleToggle}
            disabled={saveState === 'saving'}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              enabled ? 'bg-[#6D1A3E]' : 'bg-[#e8ddd5]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {publishedEnabled && (
          <a
            href={`/davetiye/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[#6D1A3E] font-medium hover:text-[#5a1533]"
          >
            {t(locale, 'invitationPublicLink')}
          </a>
        )}

        {hasUnsavedChanges && (
          <p className="text-xs text-[#9b4a6a] mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9b4a6a] shrink-0" />
            {t(locale, 'invitationUnsavedHint')}
          </p>
        )}
      </div>

      <ProgramsEditor
        items={programs}
        onChange={(next) => {
          setPrograms(next)
          setSaveState('idle')
        }}
      />

      {saveState === 'error' && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          {t(locale, 'invitationSaveError')}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="w-full mt-6 bg-[#6D1A3E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5a1533] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saveState === 'saving' ? t(locale, 'invitationSaving') : t(locale, 'invitationSave')}
      </button>
    </div>
  )
}
