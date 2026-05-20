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
  guestCountEstimate: number
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
  guestCountEstimate: 50,
  thankYouMessage: '',
  pinEnabled: false,
  pinCode: '',
  packageType: 'standard',
  templateId: 'classic',
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

  function canProceed() {
    if (step === 0) return state.title.trim().length > 0
    if (step === 1 && state.pinEnabled) return state.pinCode.length === 4
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const slug = generateSlug(state.title, state.eventType)
      const pinHash =
        state.pinEnabled && state.pinCode ? await hashPin(state.pinCode) : null

      const eventDate = state.eventDate ? new Date(state.eventDate) : new Date()
      const uploadExpiresAt = new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const mediaRetentionUntil = new Date(eventDate.getTime() + 90 * 24 * 60 * 60 * 1000)

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
          package_type: state.packageType,
          template_id: state.templateId,
          guest_count_estimate: state.guestCountEstimate,
          upload_expires_at: uploadExpiresAt.toISOString(),
          media_retention_until: mediaRetentionUntil.toISOString(),
        })
        .select('slug')
        .single()

      if (insertError) throw new Error(insertError.message)
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
                    i <= step ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  i === step ? 'text-rose-500' : i < step ? 'text-gray-400' : 'text-gray-300'
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
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Geri
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-rose-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Devam
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-rose-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur ✨'}
            </button>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="hidden lg:block w-72 sticky top-6">
        <TableCardPreview state={state} />
      </div>
    </div>
  )
}
