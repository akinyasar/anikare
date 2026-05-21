'use client'

import type { PackageType } from '@/types'
import TableCard, { type TemplateId } from '@/components/table-card/table-card'

const TEMPLATES: Array<{ id: TemplateId; name: string; desc: string; minPackage: PackageType }> = [
  { id: 'minimal', name: 'Minimal', desc: 'Sade ve modern, marka renkleri', minPackage: 'eco' },
  { id: 'floral', name: 'Floral', desc: 'Pembe güller, romantik', minPackage: 'standard' },
  { id: 'botanical', name: 'Botanical', desc: 'Yeşil yapraklar, altın detaylar', minPackage: 'standard' },
]

const PACKAGE_ORDER: Record<PackageType, number> = { eco: 0, standard: 1, premium: 2 }

interface Props {
  state: { templateId: string; packageType: PackageType; title: string }
  update: (partial: { templateId: string }) => void
}

export default function StepTemplate({ state, update }: Props) {
  const userLevel = PACKAGE_ORDER[state.packageType] ?? 0
  const previewTitle = state.title || 'Ad Soyad'

  return (
    <div className="space-y-4">
      <div className="mb-5 p-3.5 bg-[#f5e6ed]/50 border border-[#e8ddd5] rounded-2xl">
        <p className="text-sm font-medium text-[#6D1A3E] mb-1">📄 Dijital Masa Kartı Şablonu</p>
        <p className="text-xs text-[#7a6a5a] leading-relaxed">
          Seçtiğiniz tasarım etkinliğinizin QR kodu ve bilgileriyle otomatik doldurulur.
          Etkinlik sayfasından <strong>yatay veya dikey PDF</strong> olarak indirip kendi tercih ettiğiniz baskı merkezinde yazdırabilirsiniz.
          Fiziksel kart gönderimi yapılmamaktadır.
        </p>
      </div>

      {TEMPLATES.map((tpl) => {
        const locked = PACKAGE_ORDER[tpl.minPackage] > userLevel
        const selected = state.templateId === tpl.id

        return (
          <button
            key={tpl.id}
            type="button"
            disabled={locked}
            onClick={() => !locked && update({ templateId: tpl.id })}
            className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${
              selected ? 'border-[#6D1A3E] shadow-[0_0_0_1px_#6D1A3E]'
                : locked ? 'border-[#e8ddd5] opacity-60 cursor-not-allowed'
                : 'border-[#e8ddd5] hover:border-[#6D1A3E]/40'
            }`}
          >
            {/* Card preview */}
            <div className="bg-[#f5f5f0] flex justify-center py-4 relative overflow-hidden">
              <div style={{ pointerEvents: 'none' }}>
                <TableCard templateId={tpl.id} title={previewTitle} guestUrl="" scale={0.38} />
              </div>
              {locked && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="text-xs font-semibold text-[#6D1A3E]">Standart Paket gerekli</span>
                  </div>
                </div>
              )}
              {selected && !locked && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#6D1A3E] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-4 py-3 bg-white flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{tpl.name}</p>
                <p className="text-xs text-[#9ca3af]">{tpl.desc}</p>
              </div>
              {!locked && (
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${selected ? 'border-[#6D1A3E] bg-[#6D1A3E]' : 'border-[#e8ddd5]'}`} />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
