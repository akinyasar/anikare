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
    .select('title, event_date, invitation_enabled')
    .eq('slug', slug)
    .single()

  // satori next/font'a erişemez — Playfair'i dosyadan yükle (woff destekleniyor).
  const playfair = await readFile(
    join(process.cwd(), 'public/fonts/PlayfairDisplay-Bold.woff')
  )

  // Davetiye kapalı/hiç açılmamışsa gerçek etkinlik bilgisini sızdırma —
  // sayfa nasılsa notFound() döner ama OG görseli ayrı bir route, o kontrolü paylaşmaz.
  const title: string = event?.invitation_enabled ? (event.title ?? 'AnıKare') : 'AnıKare'
  const dateLabel: string =
    event?.invitation_enabled && event.event_date
      ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : ''

  // "Gamze & Akın" -> ["G", "A"] — invitation-view.tsx'teki ile aynı mantık,
  // bu route kendi başına çalışan bir dosya olduğu için yerelde tutuluyor.
  const [monoFirst, monoSecond] = (() => {
    const parts = title.split('&').map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 2) return [parts[0][0] ?? '', parts[1][0] ?? '']
    return [title.trim()[0] ?? '', title.trim()[1] ?? '']
  })()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#FAF7F2',
          border: '18px solid #6D1A3E',
        }}
      >
        {/* Sol panel — davetiye kartındaki monogram motifi büyütülmüş halde */}
        <div
          style={{
            width: 440,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: 'linear-gradient(160deg, #6D1A3E 0%, #9b4a6a 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 230,
              height: 230,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex',
            }}
          />
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '3px solid #f7cac9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', fontFamily: 'Playfair', fontSize: 48, color: '#f7cac9' }}>
                {monoFirst}
              </span>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#c9a84c"
                />
              </svg>
              <span style={{ display: 'flex', fontFamily: 'Playfair', fontSize: 48, color: '#f7cac9' }}>
                {monoSecond}
              </span>
            </div>
          </div>
        </div>

        {/* Sağ panel — metin içeriği */}
        <div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 10,
              color: '#9b4a6a',
              marginBottom: 24,
            }}
          >
            DAVETİYE
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Playfair',
              fontSize: 76,
              fontWeight: 700,
              color: '#6D1A3E',
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {dateLabel ? (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 28 }}>
              <div style={{ display: 'flex', width: 44, height: 2, backgroundColor: '#c9a84c' }} />
              <div style={{ display: 'flex', fontSize: 30, color: '#7a6a5a', marginLeft: 18 }}>
                {dateLabel}
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              letterSpacing: 6,
              color: '#9ca3af',
              marginTop: 48,
            }}
          >
            ANIKARE.NET
          </div>
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
