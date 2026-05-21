'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Auto-advance
  useEffect(() => {
    if (media.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % media.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [media.length, isPaused])

  // Jump to newest on new photo
  useEffect(() => {
    if (media.length > 0) setCurrentIndex(0)
  }, [media.length])

  // Track fullscreen state
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Hide controls after 3s of no mouse movement
  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  useEffect(() => {
    showControls()
    return () => clearTimeout(hideTimer.current)
  }, [showControls])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  function prev() {
    setCurrentIndex((i) => (i - 1 + media.length) % media.length)
    setIsPaused(true)
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % media.length)
    setIsPaused(true)
  }

  const current = media[currentIndex]

  if (media.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-6xl mb-6">📸</p>
        <h1 className="text-2xl font-light">{event.title}</h1>
        <p className="text-gray-500 mt-3 text-sm">Misafirler fotoğraf yükledikçe burada görünecek...</p>
        <button
          onClick={toggleFullscreen}
          className="mt-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm transition-colors"
        >
          <FullscreenIcon /> Tam Ekran
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black overflow-hidden"
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* Photo */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.viewUrl ?? current.file_url}
              alt={current.guest_name}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* ── Controls (fade out when idle) ──────────────────── */}
      <motion.div
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 pointer-events-auto">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {media.slice(0, Math.min(media.length, 20)).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setIsPaused(true) }}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-white w-5 h-2'
                    : 'bg-white/35 w-2 h-2 hover:bg-white/60'
                }`}
              />
            ))}
            {media.length > 20 && (
              <span className="text-white/40 text-xs ml-1">+{media.length - 20}</span>
            )}
          </div>

          {/* Right: pause + fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(p => !p)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white transition-colors"
              title={isPaused ? 'Devam Et' : 'Duraklat'}
            >
              {isPaused
                ? <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                : <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              }
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur flex items-center justify-center text-white transition-colors"
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur flex items-center justify-center text-white transition-all hover:scale-110 pointer-events-auto"
          title="Önceki"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur flex items-center justify-center text-white transition-all hover:scale-110 pointer-events-auto"
          title="Sonraki"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pointer-events-auto">
          <motion.div
            key={current?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-end justify-between"
          >
            <div>
              <p className="text-white font-semibold text-lg drop-shadow">{current?.guest_name}</p>
              {current?.guest_note && (
                <p className="text-gray-300 text-sm mt-1 drop-shadow">{current.guest_note}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl drop-shadow">{event.title}</p>
              <p className="text-gray-400 text-sm">{currentIndex + 1} / {media.length}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function FullscreenIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
    </svg>
  )
}
