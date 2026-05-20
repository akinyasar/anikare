import { nanoid } from 'nanoid'
import type { EventType } from '@/types'

const SUFFIXES: Record<EventType, string> = {
  wedding: 'evleniyor',
  birthday: 'dogum-gunu',
  graduation: 'mezuniyet',
  engagement: 'nisan',
  other: 'etkinlik',
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateSlug(names: string, eventType: EventType): string {
  const safeName = toSlug(names)
  const suffix = SUFFIXES[eventType]
  const id = nanoid(6)
  return `${safeName}-${suffix}-${id}`
}
