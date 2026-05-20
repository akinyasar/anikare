'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventRealtime } from '@/hooks/use-event-realtime'
import type { MediaItem } from '@/types'

interface Props {
  event: { id: string; title: string }
  initialMedia: MediaItem[]
}

export default function SlideshowView({ event, initialMedia }: Props) {
  const media = useEventRealtime(event.id, initialMedia)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (media.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % media.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [media.length, isPaused])

  // Jump to newest when a new photo arrives
  useEffect(() => {
    if (media.length > 0) setCurrentIndex(0)
  }, [media.length])

  const current = media[currentIndex]

  if (media.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-6xl mb-6">📸</p>
        <h1 className="text-2xl font-light">{event.title}</h1>
        <p className="text-gray-500 mt-3 text-sm">Misafirler fotoğraf yükledikçe burada görünecek...</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onClick={() => setIsPaused((p) => !p)}
    >
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.file_url}
              alt={current.guest_name}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-white font-semibold text-lg">{current?.guest_name}</p>
            {current?.guest_note && (
              <p className="text-gray-300 text-sm mt-1">{current.guest_note}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{event.title}</p>
            <p className="text-gray-400 text-sm">
              {currentIndex + 1} / {media.length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
          ⏸ Duraklatıldı
        </div>
      )}

      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {media.slice(0, Math.min(media.length, 15)).map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex(i)
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-4' : 'bg-white/40'
            }`}
          />
        ))}
        {media.length > 15 && (
          <span className="text-white/40 text-xs">+{media.length - 15}</span>
        )}
      </div>
    </div>
  )
}
