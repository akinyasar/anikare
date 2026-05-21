'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  slug: string
  eventTitle: string
}

export default function QrDownload({ slug, eventTitle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [guestUrl, setGuestUrl] = useState(`/e/${slug}`)

  useEffect(() => {
    setGuestUrl(`${window.location.origin}/e/${slug}`)
  }, [slug])

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

  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(guestUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#e8ddd5] shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col items-center gap-3 w-full sm:w-auto">
      <p className="text-xs font-semibold text-[#7a6a5a] tracking-wide uppercase">Misafir QR Kodu</p>
      <canvas ref={canvasRef} className="rounded-2xl" />
      <p className="text-[10px] text-[#9ca3af] text-center max-w-[180px] break-all">{guestUrl}</p>
      <div className="flex gap-2 w-full">
        <button
          onClick={downloadQR}
          className="flex-1 bg-[#6D1A3E] text-white text-xs py-2.5 rounded-xl font-medium hover:bg-[#5a1533] transition-colors"
        >
          ↓ QR İndir
        </button>
        <button
          onClick={copyLink}
          className="flex-1 bg-[#FAF7F2] text-[#6D1A3E] border border-[#e8ddd5] text-xs py-2.5 rounded-xl font-medium hover:bg-[#f5e6ed] transition-colors"
        >
          {copied ? '✓ Kopyalandı' : 'Linki Kopyala'}
        </button>
      </div>
      <a
        href={guestUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-white border border-[#e8ddd5] text-[#7a6a5a] text-xs py-2.5 rounded-xl font-medium hover:bg-[#FAF7F2] hover:text-[#6D1A3E] transition-colors flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Linki Aç
      </a>
    </div>
  )
}
