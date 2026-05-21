'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import CardFloral from './card-floral'
import CardBotanical from './card-botanical'
import CardMinimal from './card-minimal'

export type TemplateId = 'floral' | 'botanical' | 'minimal'

interface Props {
  templateId: TemplateId
  title: string
  eventType?: string
  eventDate?: string
  guestUrl: string
  orientation?: 'landscape' | 'portrait'
  /** Scale for preview display. 1 = full size. Default: 0.55 */
  scale?: number
}

const DIMS = {
  landscape: { w: 756, h: 403 },
  portrait:  { w: 480, h: 580 },
}

export default function TableCard({
  templateId, title, eventType, eventDate, guestUrl,
  orientation = 'landscape', scale = 0.55,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!guestUrl) return
    QRCode.toDataURL(guestUrl, {
      width: 200, margin: 1, color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [guestUrl])

  const { w, h } = DIMS[orientation]
  const displayW = w * scale
  const displayH = h * scale

  const cardProps = { title, eventType, eventDate, guestUrl, qrDataUrl, orientation }

  return (
    <div style={{ width: displayW, height: displayH, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <div style={{
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        width: w, height: h,
        position: 'absolute', top: 0, left: 0,
      }}>
        {templateId === 'floral'     && <CardFloral    {...cardProps} />}
        {templateId === 'botanical'  && <CardBotanical {...cardProps} />}
        {templateId === 'minimal'    && <CardMinimal   {...cardProps} />}
      </div>
    </div>
  )
}
