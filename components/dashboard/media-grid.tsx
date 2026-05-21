'use client'

import { useState, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import MediaCard from './media-card'
import MediaModal from './media-modal'
import type { MediaItem } from '@/types'

interface Props {
  eventId: string
  /** Known item count for correct skeleton count while loading */
  count?: number
}

type Filter = 'all' | 'photo' | 'video'

export default function MediaGrid({ eventId, count = 8 }: Props) {
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
          const res = await fetch(item.viewUrl ?? item.file_url)
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
    const skeletonCount = Math.max(count, 4)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#F0EBE3] to-[#e8ddd5] animate-pulse" />
          </div>
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
            <span className="flex items-center gap-1.5">
              {f === 'photo' && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              )}
              {f === 'video' && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              )}
              {f === 'all' ? 'Tümü' : f === 'photo' ? 'Fotoğraflar' : 'Videolar'}
            </span>
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
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms`, animationFillMode: 'both' }}
            >
              <MediaCard
                item={item}
                onClick={() => setSelected(item)}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            </div>
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
