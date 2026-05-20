'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  slug: string
  eventTitle: string
}

export default function QrDownload({ slug, eventTitle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guestUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/e/${slug}`
      : `/e/${slug}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, guestUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' },
      })
    }
  }, [guestUrl])

  function downloadQR() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${eventTitle}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  function copyLink() {
    navigator.clipboard.writeText(guestUrl)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-xl" />
      <p className="text-xs text-gray-400 text-center max-w-[180px] break-all">{guestUrl}</p>
      <div className="flex gap-2 w-full">
        <button
          onClick={downloadQR}
          className="flex-1 bg-rose-500 text-white text-xs py-2.5 rounded-xl font-medium hover:bg-rose-600 transition-colors"
        >
          ↓ QR İndir
        </button>
        <button
          onClick={copyLink}
          className="flex-1 bg-gray-100 text-gray-600 text-xs py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Linki Kopyala
        </button>
      </div>
    </div>
  )
}
