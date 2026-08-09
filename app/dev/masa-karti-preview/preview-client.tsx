'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import TableCard, { type TemplateId } from '@/components/table-card/table-card'
import DownloadPdfBtn, { renderCardToCanvas } from '@/components/table-card/download-pdf-btn'
import { triggerBlobDownload } from '@/lib/download'

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'botanical', label: 'Botanical' },
  { id: 'floral', label: 'Floral' },
  { id: 'minimal', label: 'Minimal' },
]

const ORIENTATIONS: ('landscape' | 'portrait')[] = ['landscape', 'portrait']

const SAMPLE = {
  title: 'Gamze & Akın',
  eventType: 'Düğün',
  eventDate: '2026-09-12',
  guestUrl: 'https://www.anikare.net/e/gamze-akin-abc123',
}

const CARD_W_CM = 15
const CARD_H_CM = 8
const PORTRAIT_W_CM = 10
const PORTRAIT_H_CM = 12

export default function PreviewClient() {
  const [downloadingAll, setDownloadingAll] = useState(false)

  // Bundles all 6 combinations into a single .zip instead of firing 6 separate
  // browser downloads — Chrome blocks automatic multi-file downloads triggered
  // without a fresh user gesture per file, so 6 sequential programmatic clicks
  // only ever produced 1 actual download in testing.
  async function downloadAll() {
    setDownloadingAll(true)
    try {
      const { default: JSZip } = await import('jszip')
      const { jsPDF } = await import('jspdf')
      const zip = new JSZip()
      const qrDataUrl = await QRCode.toDataURL(SAMPLE.guestUrl, { width: 200, margin: 1 })

      for (const t of TEMPLATES) {
        for (const o of ORIENTATIONS) {
          const canvas = await renderCardToCanvas(
            t.id, SAMPLE.title, SAMPLE.eventType, SAMPLE.eventDate, SAMPLE.guestUrl, qrDataUrl, o,
          )
          const isPortrait = o === 'portrait'
          const pdfW = isPortrait ? PORTRAIT_W_CM : CARD_W_CM
          const pdfH = isPortrait ? PORTRAIT_H_CM : CARD_H_CM
          const pdf = new jsPDF({ orientation: isPortrait ? 'portrait' : 'landscape', unit: 'cm', format: [pdfW, pdfH] })
          pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfW, pdfH)
          zip.file(`${t.id}-${o}.pdf`, pdf.output('arraybuffer'))
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      triggerBlobDownload(zipBlob, 'masa-karti-onizleme.zip')
    } catch (e) {
      console.error('Batch download error:', e)
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <div style={{ padding: 32, background: '#f5f5f0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Masa Kartı Önizleme (dev-only)</h1>
        <button
          onClick={downloadAll}
          disabled={downloadingAll}
          style={{ background: '#6D1A3E', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
        >
          {downloadingAll ? 'Hazırlanıyor...' : 'Tümünü İndir (.zip, 6 PDF)'}
        </button>
      </div>
      {TEMPLATES.map(({ id, label }) => (
        <div key={id} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{label}</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {ORIENTATIONS.map((o) => (
              <div key={o} style={{ background: 'white', borderRadius: 16, padding: 16 }}>
                <TableCard templateId={id} orientation={o} scale={0.55} {...SAMPLE} />
                <div style={{ marginTop: 12 }}>
                  <DownloadPdfBtn templateId={id} orientation={o} {...SAMPLE} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
