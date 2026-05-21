'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/site'

type Tab = 'social' | 'email'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
  'Email not confirmed': 'E-postanı doğrulamanı bekliyoruz. Gelen kutunu kontrol et.',
  'Too many requests': 'Çok fazla deneme. Lütfen bekle.',
}

function friendlyError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return val
  }
  return msg
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { locale } = useLocale()
  const [tab, setTab] = useState<Tab>('social')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(friendlyError(err.message)); return }
    router.push('/dashboard')
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
      <p className="text-[#7a6a5a] text-sm text-center mb-6">{t(locale, 'authSubtitle')}</p>

      {/* Tabs */}
      <div className="flex bg-[#F0EBE3] rounded-full p-1 mb-6">
        {([['social', t(locale, 'authSocialTab')], ['email', t(locale, 'authEmailTab')]] as [Tab, string][]).map(([tabId, label]) => (
          <button
            key={tabId}
            onClick={() => { setTab(tabId); setError('') }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              tab === tabId ? 'bg-white text-[#6D1A3E] shadow-sm' : 'text-[#9ca3af] hover:text-[#7a6a5a]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'social' ? (
          <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#e8ddd5] rounded-2xl px-5 py-3.5 text-sm font-medium text-[#1a1a1a] hover:bg-[#FAF7F2] active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t(locale, 'authGoogleBtn')}
            </button>

            <p className="text-xs text-[#9ca3af] text-center pt-1">
              {t(locale, 'authNoAccount')}{' '}
              <Link href="/kayit" className="text-[#6D1A3E] font-medium hover:underline">
                {t(locale, 'authRegister')}
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">{t(locale, 'authEmailLabel')}</label>
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#374151]">{t(locale, 'authPasswordLabel')}</label>
                  <Link href="/sifremi-unuttum" className="text-xs text-[#6D1A3E] hover:underline">
                    {t(locale, 'authForgotPassword')}
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                className="w-full bg-[#6D1A3E] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#5a1533] disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {loading ? t(locale, 'authLoggingIn') : t(locale, 'authLoginBtn')}
              </button>
            </form>

            <p className="text-xs text-[#9ca3af] text-center mt-4">
              {t(locale, 'authNoAccount')}{' '}
              <Link href="/kayit" className="text-[#6D1A3E] font-medium hover:underline">
                {t(locale, 'authRegister')}
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-[#9ca3af] text-center mt-5">
        {t(locale, 'authTerms')}
      </p>
    </motion.div>
  )
}
