'use client'

import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { TemplateId } from './table-card'
import { triggerBlobDownload } from '@/lib/download'

interface Props {
  templateId: TemplateId
  title: string
  eventType?: string
  eventDate?: string
  guestUrl: string
  orientation: 'landscape' | 'portrait'
}

const CARD_W_CM = 15
const CARD_H_CM = 8

async function renderCardToCanvas(
  templateId: TemplateId,
  title: string,
  eventType: string | undefined,
  eventDate: string | undefined,
  guestUrl: string,
  qrDataUrl: string,
  orientation: 'landscape' | 'portrait',
): Promise<HTMLCanvasElement> {
  const [{ default: html2canvas }] = await Promise.all([import('html2canvas')])
  const { createRoot } = await import('react-dom/client')
  const React = await import('react')

  const CardFloral = (await import('./card-floral')).default
  const CardBotanical = (await import('./card-botanical')).default
  const CardMinimal = (await import('./card-minimal')).default

  const cardProps = { title, eventType, eventDate, guestUrl, qrDataUrl, orientation }

  const isPortrait = orientation === 'portrait'
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:0;top:0;width:${isPortrait ? 480 : 756}px;height:${isPortrait ? 580 : 403}px;z-index:99999;opacity:0;pointer-events:none;`
  document.body.appendChild(container)

  const root = createRoot(container)
  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(
        'div',
        { style: { display: 'inline-block' } },
        templateId === 'floral'
          ? React.createElement(CardFloral, cardProps)
          : templateId === 'botanical'
          ? React.createElement(CardBotanical, cardProps)
          : React.createElement(CardMinimal, cardProps)
      )
    )
    // Give React a tick to flush + SVG/font rendering
    setTimeout(resolve, 200)
  })

  const cardEl = container.firstElementChild as HTMLElement
  const canvas = await html2canvas(cardEl, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: null,
    width: isPortrait ? 480 : 756,
    height: isPortrait ? 580 : 403,
    windowWidth: isPortrait ? 480 : 756,
    windowHeight: isPortrait ? 580 : 403,
    scrollX: 0,
    scrollY: 0,
  })

  root.unmount()
  document.body.removeChild(container)
  return canvas
}

// Portrait card: 480×580px → 10cm×12cm print size
const PORTRAIT_W_CM = 10
const PORTRAIT_H_CM = 12

export default function DownloadPdfBtn({ templateId, title, eventType, eventDate, guestUrl, orientation }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const qrDataUrl = await QRCode.toDataURL(guestUrl, { width: 200, margin: 1 })
      const canvas = await renderCardToCanvas(templateId, title, eventType, eventDate, guestUrl, qrDataUrl, orientation)

      const { jsPDF } = await import('jspdf')

      const isPortrait = orientation === 'portrait'
      const pdfW = isPortrait ? PORTRAIT_W_CM : CARD_W_CM
      const pdfH = isPortrait ? PORTRAIT_H_CM : CARD_H_CM

      const pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'cm',
        format: [pdfW, pdfH],
      })

      // Portrait card is a native layout (480×580), no rotation needed
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfW, pdfH)

      const safeName = title.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').trim()
      const filename = `${safeName}-masa-karti-${orientation}.pdf`
      // Use octet-stream so browsers download instead of opening the PDF viewer
      const pdfBytes = pdf.output('arraybuffer')
      const blob = new Blob([pdfBytes], { type: 'application/octet-stream' })
      triggerBlobDownload(blob, filename)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-[#6D1A3E] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5a1533] disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      )}
      {loading ? 'Hazırlanıyor...' : `PDF İndir (${orientation === 'landscape' ? 'Yatay' : 'Dikey'})`}
    </button>
  )
}
