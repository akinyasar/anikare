import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@/lib/supabase/server'

export const alt = 'AnıKare Davetiye'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, event_date')
    .eq('slug', slug)
    .single()

  // satori next/font'a erişemez — Playfair'i dosyadan yükle (woff destekleniyor).
  const playfair = await readFile(
    join(process.cwd(), 'public/fonts/PlayfairDisplay-Bold.woff')
  )

  const title: string = event?.title ?? 'AnıKare'
  const dateLabel: string = event?.event_date
    ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          border: '18px solid #6D1A3E',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 12,
            color: '#9b4a6a',
            marginBottom: 32,
          }}
        >
          DAVETİYE
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Playfair',
            fontSize: 92,
            fontWeight: 700,
            color: '#6D1A3E',
            textAlign: 'center',
            padding: '0 90px',
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {dateLabel ? (
          <div style={{ display: 'flex', fontSize: 34, color: '#7a6a5a', marginTop: 36 }}>
            {dateLabel}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 6,
            color: '#9ca3af',
            marginTop: 56,
          }}
        >
          ANIKARE.NET
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair',
          data: playfair,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
