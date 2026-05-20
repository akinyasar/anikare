'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/button'

interface Props {
  message: string
  videoUrl: string | null
  uploadMoreLabel: string
  onUploadMore: () => void
}

export default function ThankYouScreen({ message, videoUrl, uploadMoreLabel, onUploadMore }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-8 text-center safe-top"
    >
      {/* Animated hearts */}
      <div className="relative mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-20, -60], scale: [0, 1.2, 0.8] }}
            transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="absolute text-2xl"
            style={{ left: `${20 + i * 30}%`, top: 0 }}
          >
            🤍
          </motion.div>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
          className="w-20 h-20 rounded-full bg-[#6D1A3E] flex items-center justify-center mx-auto"
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
          </svg>
        </motion.div>
      </div>

      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          playsInline
          className="w-full max-w-xs rounded-3xl mb-6 shadow-lg"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-3">
          Teşekkürler! 🤍
        </h1>
        <p className="text-base text-[#7a6a5a] max-w-xs leading-relaxed mb-10">
          {message}
        </p>

        <Button variant="primary" size="lg" onClick={onUploadMore} className="max-w-xs">
          {uploadMoreLabel ?? 'Başka Anı Ekle'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
