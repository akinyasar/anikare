'use client'

import { motion } from 'framer-motion'

interface Props {
  message: string
  videoUrl: string | null
  uploadMoreLabel: string
  onUploadMore: () => void
}

export default function ThankYouScreen({
  message,
  videoUrl,
  uploadMoreLabel,
  onUploadMore,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="text-6xl mb-6"
      >
        🎉
      </motion.div>

      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          playsInline
          muted={false}
          className="w-full max-w-xs rounded-2xl mb-6 shadow-lg"
        />
      ) : null}

      <p className="text-lg font-medium text-gray-800 max-w-xs leading-relaxed mb-8">
        {message}
      </p>

      <button
        onClick={onUploadMore}
        className="bg-rose-500 text-white rounded-2xl px-8 py-4 font-medium text-sm hover:bg-rose-600 active:scale-[0.97] transition-all"
      >
        {uploadMoreLabel ?? 'Başka anı ekle'}
      </button>
    </motion.div>
  )
}
