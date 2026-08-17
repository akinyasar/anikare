import { nanoid } from 'nanoid'
import type { ProgramItem } from '@/types'

export function createProgramItem(): ProgramItem {
  return {
    id: nanoid(8),
    name: '',
    venueName: '',
    address: '',
    mapsUrl: '',
    date: '',
    time: '',
  }
}

// Kaydetmeden önce: tamamen boş satırları at, string'leri trim'le,
// boş opsiyonelleri undefined yap (JSON.stringify bunları tamamen düşürür).
export function sanitizePrograms(items: ProgramItem[]): ProgramItem[] {
  return items
    .filter((p) => p.name.trim() || p.venueName.trim() || p.address.trim())
    .map((p) => ({
      id: p.id,
      name: p.name.trim(),
      venueName: p.venueName.trim(),
      address: p.address.trim(),
      mapsUrl: (() => {
        const trimmed = p.mapsUrl?.trim()
        return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : undefined
      })(),
      date: p.date,
      time: p.time?.trim() ? p.time.trim() : undefined,
    }))
}

// JSONB kolonundan okurken: gelen değer her şey olabilir (null, obje, eski şema).
// Her zaman güvenli bir ProgramItem[] döndür.
export function normalizePrograms(value: unknown): ProgramItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((raw): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null)
    .map((raw) => ({
      id: typeof raw.id === 'string' && raw.id ? raw.id : nanoid(8),
      name: typeof raw.name === 'string' ? raw.name : '',
      venueName: typeof raw.venueName === 'string' ? raw.venueName : '',
      address: typeof raw.address === 'string' ? raw.address : '',
      mapsUrl: typeof raw.mapsUrl === 'string' && raw.mapsUrl ? raw.mapsUrl : undefined,
      date: typeof raw.date === 'string' ? raw.date : '',
      time: typeof raw.time === 'string' && raw.time ? raw.time : undefined,
    }))
}

// "Yol Tarifi Al" — host bir Maps linki yapıştırdıysa onu kullan, yoksa
// evrensel Google Maps URL'i üret. Bu URL iOS'ta Apple/Google Maps,
// Android'de Google Maps uygulamasını user-agent kontrolü olmadan açar.
export function directionsUrl(item: ProgramItem): string | null {
  const pasted = item.mapsUrl?.trim()
  if (pasted && /^https?:\/\//i.test(pasted)) return pasted
  const address = item.address.trim()
  if (!address) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

// Yandex Maps için konum linki — key gerekmez. rtext (rota) parametresi
// serbest metin adresi mobil uygulamada coğrafi kodlamıyor (yalnızca web
// sitesinin kendi JS'i bunu çözüyordu, uygulama boş açılıyordu) — bunun
// yerine hem web hem uygulamada güvenilir çalışan arama tabanlı link
// kullanılıyor; misafir uygulama içinde "yol tarifi"ne kendi dokunur.
// Mekan adı sorguya eklenir: Yandex'in Türkiye'deki işletme kapsamı zayıf,
// yalnızca adres (özellikle parantezli alternatif sokak adlarıyla) belirsiz
// eşleşmeler üretiyor — mekan adıyla birlikte doğrudan doğru işletmeyi buluyor.
export function yandexDirectionsUrl(item: ProgramItem): string | null {
  const address = item.address.trim()
  if (!address) return null
  const venueName = item.venueName.trim()
  const query = venueName ? `${venueName}, ${address}` : address
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`
}

// Google Maps Embed API (resmî, key'li endpoint).
// Key yoksa veya adres boşsa null döner — çağıran taraf fallback gösterir.
export function mapEmbedUrl(item: ProgramItem, apiKey: string | undefined): string | null {
  const address = item.address.trim()
  if (!apiKey || !address) return null
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(address)}`
}
