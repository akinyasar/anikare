'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-white"
    >
      <div className="w-full max-w-xs text-center">
        <div className="text-4xl mb-6">🔒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {dict.pinTitle ?? 'Gizlilik Kodu'}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {dict.pinDescription ?? 'Masa kartınızdaki 4 haneli kodu girin'}
        </p>

        <div className="flex justify-center gap-3 mb-6">
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
              className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-2xl focus:outline-none transition-all ${
                error
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : digit
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-gray-200 text-gray-900 focus:border-rose-400'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{dict.pinError ?? 'Hatalı kod, tekrar deneyin'}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={pin.join('').length !== 4 || loading}
          className="w-full bg-rose-500 text-white rounded-2xl py-4 font-medium text-sm hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : dict.confirm ?? 'Onayla'}
        </button>
      </div>
    </motion.div>
  )
}
