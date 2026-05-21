'use client'

import { useState } from 'react'
import type { MediaItem } from '@/types'

interface Props {
  item: MediaItem
  onClick: () => void
  onToggleVisibility: (item: MediaItem) => void
  onDelete: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick, onToggleVisibility, onDelete }: Props) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div
      className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-square bg-[#F0EBE3]"
      onClick={onClick}
    >
      {item.file_type === 'video' ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
          <svg className="w-8 h-8 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
          <span className="text-[10px] text-white/50">Video</span>
        </div>
      ) : imgError ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#F0EBE3]">
          <svg className="w-8 h-8 text-[#c4b5a5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-[10px] text-[#c4b5a5]">Görsel yüklenemedi</span>
        </div>
      ) : (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#F0EBE3] animate-pulse" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.file_url}
            alt={item.guest_name}
            className={`w-full h-full object-cover transition-all group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      )}

      {/* Hidden overlay — strong blur + dark tint */}
      {!item.is_visible && (
        <div className="absolute inset-0 backdrop-blur-md bg-black/50 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
          <span className="text-[10px] text-white/70 font-medium">Gizli</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-end p-2.5">
        <p className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium truncate w-full drop-shadow">
          {item.guest_name}
        </p>
      </div>

      {/* Action buttons */}
      <div
        className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleVisibility(item)}
          title={item.is_visible ? 'Gizle' : 'Göster'}
          className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-sm hover:bg-white"
        >
          {item.is_visible ? (
            <svg className="w-3.5 h-3.5 text-[#7a6a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-[#7a6a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          )}
        </button>
        <button
          onClick={() => onDelete(item)}
          title="Sil"
          className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-sm hover:bg-red-50"
        >
          <svg className="w-3.5 h-3.5 text-[#7a6a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
        </button>
      </div>
    </div>
  )
}
