'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import CardFloral from './card-floral'
import CardBotanical from './card-botanical'
import CardMinimal from './card-minimal'

export type TemplateId = 'floral' | 'botanical' | 'minimal'

interface Props {
  templateId: TemplateId
  title: string
  eventType?: string
  guestUrl: string
  orientation?: 'landscape' | 'portrait'
  /** Scale for preview display. 1 = full size (756×403). Default: 0.55 */
  scale?: number
  /** Forward ref for PDF capture */
  cardRef?: React.RefObject<HTMLDivElement | null>
}

const CARD_W = 756
const CARD_H = 403

export default function TableCard({
  templateId, title, eventType, guestUrl,
  orientation = 'landscape', scale = 0.55, cardRef,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!guestUrl) return
    QRCode.toDataURL(guestUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(setQrDataUrl)
  }, [guestUrl])

  const cardProps = { title, eventType, guestUrl, qrDataUrl }

  // Portrait = rotate 90° and swap dimensions visually
  const isPortrait = orientation === 'portrait'
  const displayW = isPortrait ? CARD_H * scale : CARD_W * scale
  const displayH = isPortrait ? CARD_W * scale : CARD_H * scale

  return (
    <div style={{ width: displayW, height: displayH, overflow: 'hidden', position: 'relative' }}>
      <div
        ref={cardRef}
        style={{
          transformOrigin: 'top left',
          transform: isPortrait
            ? `rotate(90deg) translateY(-${CARD_H * scale}px) scale(${scale})`
            : `scale(${scale})`,
          width: CARD_W,
          height: CARD_H,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {templateId === 'floral' && <CardFloral {...cardProps} />}
        {templateId === 'botanical' && <CardBotanical {...cardProps} />}
        {templateId === 'minimal' && <CardMinimal {...cardProps} />}
      </div>
    </div>
  )
}
