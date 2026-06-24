'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/slug'
import { hashPin } from '@/lib/pin'
import StepDetails from './steps/step-details'
import StepPackage from './steps/step-package'
import StepTemplate from './steps/step-template'
import TableCardPreview from './table-card-preview'
import type { EventType, PackageType } from '@/types'

interface WizardState {
  title: string
  eventType: EventType
  eventDate: string
  guestCountEstimate: string
  thankYouMessage: string
  pinEnabled: boolean
  pinCode: string
  packageType: PackageType
  templateId: string
}

const INITIAL_STATE: WizardState = {
  title: '',
  eventType: 'wedding',
  eventDate: '',
  guestCountEstimate: '50',
  thankYouMessage: '',
  pinEnabled: false,
  pinCode: '',
  packageType: 'standard',
  templateId: 'minimal',
}

const STEPS = ['Detaylar', 'Paket', 'Tasarım']

export default function EventWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function update(partial: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  function goToStep(next: number) {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function canProceed() {
    if (step === 0) {
      if (!state.title.trim()) return false
      if (state.pinEnabled && state.pinCode.length !== 4) return false
      return true
    }
    if (step === 2) {
      return ['minimal', 'floral', 'botanical'].includes(state.templateId)
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const slug = generateSlug(state.title, state.eventType)
      const pinHash =
        state.pinEnabled && state.pinCode ? await hashPin(state.pinCode) : null

      const eventDate = state.eventDate ? new Date(state.eventDate) : new Date()
      const uploadBase = new Date(Math.max(eventDate.getTime(), Date.now()))
      const uploadExpiresAt = new Date(uploadBase.getTime() + 30 * 24 * 60 * 60 * 1000)
      const mediaRetentionUntil = new Date(uploadBase.getTime() + 90 * 24 * 60 * 60 * 1000)

      // Event her zaman eco oluşturulur — OSB onayından sonra aktive edilir
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          host_id: user.id,
          title: state.title,
          event_type: state.eventType,
          slug,
          event_date: state.eventDate || null,
          thank_you_message: state.thankYouMessage || null,
          pin_enabled: state.pinEnabled,
          pin_code_hash: pinHash,
          package_type: 'eco',
          template_id: state.templateId,
          guest_count_estimate: state.guestCountEstimate
            ? Number(state.guestCountEstimate)
            : null,
          upload_expires_at: uploadExpiresAt.toISOString(),
          media_retention_until: mediaRetentionUntil.toISOString(),
        })
        .select('id, slug')
        .single()

      if (insertError) throw new Error(insertError.message)

      // Ücretli paket seçildiyse Polar ödeme sayfasına yönlendir
      if (state.packageType === 'standard' || state.packageType === 'premium') {
        const res = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: data!.id, packageType: state.packageType }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Ödeme başlatılamadı')
        window.location.href = json.url
        return
      }

      router.push(`/etkinlik/${data!.slug}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-10 items-start">
      <div className="flex-1 max-w-lg">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-[#6D1A3E]' : 'bg-gray-200'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  i === step ? 'text-[#6D1A3E]' : i < step ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && <StepDetails state={state} update={update} />}
        {step === 1 && <StepPackage state={state} update={update} />}
        {step === 2 && <StepTemplate state={state} update={update} />}

        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Geri
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-[#6D1A3E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5a1533] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Devam
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#6D1A3E] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#5a1533] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? 'İşleniyor...'
                : state.packageType === 'eco'
                  ? 'Etkinliği Oluştur ✨'
                  : 'Etkinliği Oluştur & Ödemeye Geç →'}
            </button>
          )}
        </div>
      </div>

      {/* Live preview — hidden on template step (card previews shown inline there) */}
      <div className={`hidden lg:block w-72 sticky top-6 space-y-4 ${step === 2 ? 'invisible' : ''}`}>
        <TableCardPreview state={state} />
        {state.thankYouMessage && (
          <div className="bg-[#f5e6ed] rounded-2xl p-4 text-sm">
            <p className="text-xs font-semibold text-[#6D1A3E] uppercase tracking-wide mb-2">
              Misafir yükleme sonrası şunu görecek:
            </p>
            <p className="text-[#7a6a5a] italic leading-relaxed">{state.thankYouMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
