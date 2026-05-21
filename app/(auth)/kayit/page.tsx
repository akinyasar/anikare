'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const ERROR_MAP: Record<string, string> = {
  'User already registered': 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı.',
  'Unable to validate email address': 'Geçerli bir e-posta gir.',
  'signup_disabled': 'Kayıt şu an kapalı.',
}

function friendlyError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return val
  }
  return msg
}

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function signInWithApple() {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return }
    setLoading(true)
    setError('')

    const { error: err, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (err) { setError(friendlyError(err.message)); return }

    // If email confirmation is disabled, user is immediately logged in
    if (data.session) {
      router.push('/dashboard')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(109,26,62,0.12)] p-10 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-2">
          E-posta doğrulama gönderildi
        </h2>
        <p className="text-sm text-[#7a6a5a] leading-relaxed mb-6">
          <strong>{email}</strong> adresine bir doğrulama linki gönderdik. Gelen kutunu kontrol et.
        </p>
        <Link
          href="/giris"
          className="block w-full bg-[#6D1A3E] text-white py-3.5 rounded-full text-sm font-semibold text-center hover:bg-[#5a1533] transition-colors"
        >
          Giriş Sayfasına Dön
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(109,26,62,0.12)] p-8 w-full max-w-sm"
    >
      <div className="flex items-center justify-center gap-2.5 mb-1.5">
        <Image src="/brand/logo.svg" alt="AnıKare" width={36} height={39} />
        <span className="text-lg font-bold text-[#6D1A3E] tracking-widest uppercase">AnıKare</span>
      </div>
      <p className="text-[#7a6a5a] text-sm text-center mb-6">Hesap oluştur, ücretsiz başla</p>

      {/* Social signup */}
      <div className="space-y-2.5 mb-5">
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#e8ddd5] rounded-2xl px-5 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#FAF7F2] active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile Kayıt Ol
        </button>
        <button
          onClick={signInWithApple}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] rounded-2xl px-5 py-3 text-sm font-medium text-white hover:bg-black active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.29.07 2.19.73 2.94.77.78.04 2.24-.89 3.77-.77 1.44.12 2.5.63 3.2 1.6-3.28 1.97-2.74 6.32.74 7.52-.43 1.1-.93 2.17-2.65 3.76zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple ile Kayıt Ol
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[#e8ddd5]" />
        <span className="text-xs text-[#9ca3af] font-medium">veya e-posta ile</span>
        <div className="flex-1 h-px bg-[#e8ddd5]" />
      </div>

      {/* Email form */}
      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#374151]">Ad Soyad</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Mehmet Yılmaz"
            className="w-full bg-white border border-[#e8ddd5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition"
          />
        </div>
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#374151]">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="En az 6 karakter"
            className="w-full bg-white border border-[#e8ddd5] rounded-2xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#6D1A3E]/30 focus:border-[#6D1A3E] transition"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6D1A3E] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#5a1533] disabled:opacity-50 active:scale-[0.98] transition-all mt-1"
        >
          {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
        </button>
      </form>

      <p className="text-xs text-[#9ca3af] text-center mt-4">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="text-[#6D1A3E] font-medium hover:underline">
          Giriş yap
        </Link>
      </p>
    </motion.div>
  )
}
