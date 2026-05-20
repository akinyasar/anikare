'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/button'

interface Props {
  eventId: string
  dict: Record<string, string>
  onSuccess: () => void
}

export default function PinEntry({ eventId, dict, onSuccess }: Props) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[index] = value
    setPin(next)
    setError(false)
    if (value && index < 3) refs[index + 1].current?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  async function handleSubmit() {
    const code = pin.join('')
    if (code.length !== 4) return
    setLoading(true)
    setError(false)

    const res = await fetch('/api/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, pin: code }),
    })

    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      setError(true)
      setPin(['', '', '', ''])
      refs[0].current?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs text-center"
      >
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-2">
          {dict.pinTitle ?? 'Gizlilik Kodu'}
        </h1>
        <p className="text-sm text-[#7a6a5a] mb-8">
          {dict.pinDescription ?? 'Masa kartınızdaki 4 haneli kodu girin'}
        </p>

        {/* OTP boxes */}
        <div className="flex justify-center gap-3 mb-5">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                error
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : digit
                  ? 'border-[#6D1A3E] bg-[#f5e6ed] text-[#6D1A3E]'
                  : 'border-[#e8ddd5] bg-white text-[#1a1a1a] focus:border-[#6D1A3E]'
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-500 mb-4"
          >
            {dict.pinError ?? 'Hatalı kod, tekrar deneyin'}
          </motion.p>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={pin.join('').length !== 4}
          loading={loading}
        >
          {dict.confirm ?? 'Onayla'}
        </Button>
      </motion.div>
    </div>
  )
}
