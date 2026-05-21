'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/sifre-guncelle`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(109,26,62,0.12)] p-8 w-full max-w-sm"
    >
      <div className="flex items-center justify-center gap-2.5 mb-1.5">
        <Image src="/brand/logo.svg" alt="AnıKare" width={36} height={39} />
        <span className="text-lg font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
      </div>

      {sent ? (
        <div className="text-center mt-4">
          <div className="w-12 h-12 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm text-[#7a6a5a] mb-5">
            <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
          </p>
          <Link href="/giris" className="text-sm text-[#6D1A3E] font-medium hover:underline">
            ← Giriş sayfasına dön
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[#7a6a5a] text-sm text-center mb-6 mt-1">Şifreni sıfırlamak için e-postanı gir</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#374151]">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@gmail.com"
                className="w-full bg-white border border-[#e8ddd5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition"
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6D1A3E] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#5a1533] disabled:opacity-50 transition-all"
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>
          </form>
          <p className="text-xs text-[#9ca3af] text-center mt-4">
            <Link href="/giris" className="text-[#6D1A3E] font-medium hover:underline">
              ← Giriş sayfasına dön
            </Link>
          </p>
        </>
      )}
    </motion.div>
  )
}
