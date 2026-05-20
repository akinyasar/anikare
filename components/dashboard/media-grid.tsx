'use client'

import { useState, useEffect, useCallback } from 'react'
import MediaCard from './media-card'
import MediaModal from './media-modal'
import type { MediaItem } from '@/types'

interface Props {
  eventId: string
}

type Filter = 'all' | 'photo' | 'video'

export default function MediaGrid({ eventId }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<MediaItem | null>(null)

  const fetchMedia = useCallback(async () => {
    const res = await fetch(`/api/media?eventId=${eventId}`)
    const { media: items } = await res.json()
    setMedia(items ?? [])
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  async function handleToggleVisibility(item: MediaItem) {
    await fetch(`/api/media/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !item.is_visible }),
    })
    setMedia((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, is_visible: !m.is_visible } : m))
    )
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm('Bu içeriği kalıcı olarak silmek istiyor musunuz?')) return
    await fetch(`/api/media/${item.id}`, { method: 'DELETE' })
    setMedia((prev) => prev.filter((m) => m.id !== item.id))
    if (selected?.id === item.id) setSelected(null)
  }

  const filtered = filter === 'all' ? media : media.filter((m) => m.file_type === filter)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#F0EBE3] rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-5">
        {(['all', 'photo', 'video'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#6D1A3E] text-white'
                : 'bg-white border border-[#e8ddd5] text-[#7a6a5a] hover:border-[#6D1A3E]/40'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'photo' ? '📷 Fotoğraflar' : '🎬 Videolar'}
            <span className="ml-1 opacity-60 text-xs">
              ({f === 'all' ? media.length : media.filter((m) => m.file_type === f).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <p className="text-3xl mb-3">📸</p>
          <p className="text-sm">Henüz içerik yüklenmedi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {selected && (
        <MediaModal
          item={selected}
          onClose={() => setSelected(null)}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
