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
      className={`relative group rounded-2xl overflow-hidden cursor-pointer aspect-square bg-[#F0EBE3] ${
        !item.is_visible ? 'opacity-50' : ''
      }`}
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
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full">
          <p className="text-white text-xs font-medium truncate">{item.guest_name}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleVisibility(item)}
          title={item.is_visible ? 'Gizle' : 'Göster'}
          className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-sm hover:bg-gray-50"
        >
          {item.is_visible ? '👁' : '🙈'}
        </button>
        <button
          onClick={() => onDelete(item)}
          title="Sil"
          className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-sm hover:bg-red-50"
        >
          🗑
        </button>
      </div>
    </div>
  )
}
