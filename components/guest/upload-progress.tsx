'use client'

import { motion } from 'framer-motion'

interface Props {
  done: number
  total: number
  error: string | null
}

export default function UploadProgress({ done, total, error }: Props) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs"
      >
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-2">
              Bir sorun oluştu
            </p>
            <p className="text-sm text-[#7a6a5a]">{error}</p>
          </>
        ) : (
          <>
            {/* Animated icon */}
            <div className="w-16 h-16 rounded-full bg-[#f5e6ed] flex items-center justify-center mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-7 h-7 text-[#6D1A3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </motion.div>
            </div>

            <p className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#1a1a1a] mb-1">
              Yükleniyor...
            </p>
            <p className="text-sm text-[#7a6a5a] mb-6">
              {done} / {total} dosya tamamlandı
            </p>

            {/* Progress bar */}
            <div className="h-2 bg-[#e8ddd5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#6D1A3E] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-[#9ca3af] mt-2">{pct}%</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
