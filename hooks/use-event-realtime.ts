'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem } from '@/types'

export function useEventRealtime(eventId: string, initialMedia: MediaItem[]) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newItem = payload.new as MediaItem
          if (newItem.is_visible && newItem.file_type === 'photo') {
            setMedia((prev) => [newItem, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return media
}
