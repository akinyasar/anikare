'use client'

import type { MediaItem } from '@/types'

interface Props {
  item: MediaItem
  onClick: () => void
  onToggleVisibility: (item: MediaItem) => void
  onDelete: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick, onToggleVisibility, onDelete }: Props) {
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
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.file_url}
          alt={item.guest_name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
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
          {item.is_visible ? '👁' : '🙈'}
        </button>
        <button
          onClick={() => onDelete(item)}
          title="Sil"
          className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-sm hover:bg-red-50"
        >
          🗑
        </button>
      </div>
    </div>
  )
}
