'use client'

import { useState, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
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

  async function handleBulkDownload() {
    const photos = filtered.filter(m => m.file_type === 'photo')
    if (!photos.length) return
    const zip = new JSZip()
    await Promise.all(
      photos.map(async (item, i) => {
        try {
          const res = await fetch(item.file_url)
          const blob = await res.blob()
          const ext = item.file_url.split('.').pop()?.split('?')[0] ?? 'jpg'
          zip.file(`${item.guest_name.replace(/\s+/g, '_')}_${i + 1}.${ext}`, blob)
        } catch { /* skip failed */ }
      })
    )
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'anikare-fotograflar.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

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
      {/* Filter bar + bulk download */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
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
        {filtered.filter(m => m.file_type === 'photo').length > 0 && (
          <button
            onClick={handleBulkDownload}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-[#e8ddd5] text-[#6D1A3E] hover:bg-[#f5e6ed] hover:border-[#6D1A3E]/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Tümünü İndir
          </button>
        )}
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
