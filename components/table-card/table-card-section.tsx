'use client'

import { useState } from 'react'
import TableCard, { type TemplateId } from './table-card'
import DownloadPdfBtn from './download-pdf-btn'
import { SITE_URL } from '@/lib/config'

const VALID_TEMPLATES: TemplateId[] = ['floral', 'botanical', 'minimal']

function resolveTemplate(id: string): TemplateId {
  if (VALID_TEMPLATES.includes(id as TemplateId)) return id as TemplateId
  return 'minimal' // fallback for old template IDs (classic, golden, etc.)
}

interface Props {
  templateId: string
  title: string
  eventType: string
  slug: string
}

export default function TableCardSection({ templateId, title, eventType, slug }: Props) {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const template = resolveTemplate(templateId)
  const guestUrl = `${SITE_URL}/e/${slug}`

  return (
    <div className="bg-white rounded-3xl border border-[#e8ddd5] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] mb-8">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Masa Kartı Şablonu</h2>
          <span className="text-[10px] bg-[#f5e6ed] text-[#6D1A3E] font-semibold px-2.5 py-1 rounded-full">
            Dijital PDF
          </span>
        </div>
        <p className="text-xs text-[#9ca3af]">
          QR kodunuz otomatik eklenir — indirip istediğiniz baskı merkezinde yazdırın
        </p>
      </div>

      {/* Orientation toggle + preview */}
      <div className="mb-5">
        <div className="flex items-center gap-1 bg-[#F0EBE3] rounded-full p-0.5 w-fit mb-4">
          {(['landscape', 'portrait'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrientation(o)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
                orientation === o
                  ? 'bg-white text-[#6D1A3E] shadow-sm'
                  : 'text-[#9ca3af] hover:text-[#6D1A3E]'
              }`}
            >
              {o === 'landscape' ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="6" y="2" width="12" height="20" rx="2"/>
                </svg>
              )}
              {o === 'landscape' ? 'Yatay (15×8 cm)' : 'Dikey (8×15 cm)'}
            </button>
          ))}
        </div>

        <div className="bg-[#f5f5f0] rounded-2xl p-6 flex justify-center items-center overflow-hidden">
          <TableCard
            templateId={template}
            title={title}
            eventType={eventType}
            guestUrl={guestUrl}
            orientation={orientation}
            scale={0.62}
          />
        </div>
      </div>

      {/* Download — both orientations always visible */}
      <div className="border-t border-[#e8ddd5] pt-4">
        <p className="text-xs text-[#9ca3af] mb-3">Her iki boyutu da indirebilirsiniz:</p>
        <div className="flex flex-wrap gap-3">
          <DownloadPdfBtn
            templateId={template}
            title={title}
            eventType={eventType}
            guestUrl={guestUrl}
            orientation="landscape"
          />
          <DownloadPdfBtn
            templateId={template}
            title={title}
            eventType={eventType}
            guestUrl={guestUrl}
            orientation="portrait"
          />
        </div>
      </div>
    </div>
  )
}
