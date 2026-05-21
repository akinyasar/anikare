// Minimal table card — brand colors, portrait variant
interface CardProps {
  title: string
  eventType?: string
  eventDate?: string
  guestUrl: string
  qrDataUrl: string | null
  orientation?: 'landscape' | 'portrait'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function QRContent({ qrDataUrl, size, bordered }: { qrDataUrl: string | null; size: number; bordered?: boolean }) {
  const inner = qrDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qrDataUrl} alt="QR" width={size} height={size} style={{ display: 'block', borderRadius: 2 }} />
  ) : (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="5" y="5" width="30" height="30" fill="none" stroke="#6D1A3E" strokeWidth="4" opacity=".2"/>
      <rect x="13" y="13" width="14" height="14" fill="#6D1A3E" opacity=".15"/>
      <rect x="65" y="5" width="30" height="30" fill="none" stroke="#6D1A3E" strokeWidth="4" opacity=".2"/>
      <rect x="73" y="13" width="14" height="14" fill="#6D1A3E" opacity=".15"/>
      <rect x="5" y="65" width="30" height="30" fill="none" stroke="#6D1A3E" strokeWidth="4" opacity=".2"/>
      <rect x="13" y="73" width="14" height="14" fill="#6D1A3E" opacity=".15"/>
      {[38,45,52,60,67,74,82].map((x,i) => [38,45,52,60,67,74,82].map((y,j) =>
        (i+j) % 2 === 0 ? <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" fill="#6D1A3E" opacity=".12"/> : null
      ))}
    </svg>
  )
  if (!bordered) return inner
  return (
    <div style={{ border: '2px solid #6D1A3E', borderRadius: 6, padding: 8, background: '#fff' }}>
      {inner}
    </div>
  )
}

// ── LANDSCAPE (756×403) ──────────────────────────────────────────────────────
function Landscape({ title, eventType, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 756, height: 403, background: '#FAF7F2', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #e8ddd5', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      {/* Accent bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: '#6D1A3E' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: '#6D1A3E' }} />

      {/* QR with border frame */}
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20, gap: 10 }}>
        <QRContent qrDataUrl={qrDataUrl} size={158} bordered />
        <p style={{ margin: 0, fontSize: 10, color: '#c4b5a5', fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>
          anikare.co
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#e8ddd5', margin: '46px 0' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 120, gap: 8 }}>
        {eventType && (
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#6D1A3E', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>
            {eventType}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        {eventDate && (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
          <div style={{ height: 1.5, flex: 1, background: '#6D1A3E' }} />
          <div style={{ width: 5, height: 5, background: '#6D1A3E', transform: 'rotate(45deg)' }} />
          <div style={{ height: 1.5, flex: 1, background: '#6D1A3E' }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        {/* Brand */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="15" viewBox="0 0 88 96" fill="none">
            <g transform="translate(50,44) rotate(8) translate(-26,-34)">
              <rect width="52" height="68" rx="4" fill="#f5e6ed" stroke="#6D1A3E" strokeWidth="3"/>
            </g>
            <g transform="translate(4, 10)">
              <rect width="52" height="68" rx="4" fill="white" stroke="#6D1A3E" strokeWidth="3"/>
              <path d="M26 37 C 26 37 10 27 10 17 C 10 10 15 7 19 7 C 22 7 25 9 26 12 C 28 9 30 7 33 7 C 37 7 43 10 43 17 C 43 27 26 37 26 37 Z" fill="#6D1A3E"/>
            </g>
          </svg>
          <span style={{ fontSize: 10, color: '#6D1A3E', fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
            AnıKare
          </span>
        </div>
      </div>
    </div>
  )
}

// ── PORTRAIT (480×580) ───────────────────────────────────────────────────────
function Portrait({ title, eventType, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 480, height: 580, background: '#FAF7F2', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #e8ddd5', borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
    }}>
      {/* Accent bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#6D1A3E' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#6D1A3E' }} />
      {/* Side accent lines */}
      <div style={{ position: 'absolute', left: 20, top: 30, bottom: 30, width: 1.5, background: '#6D1A3E', opacity: 0.15 }} />
      <div style={{ position: 'absolute', right: 20, top: 30, bottom: 30, width: 1.5, background: '#6D1A3E', opacity: 0.15 }} />

      {/* Header text */}
      <div style={{ textAlign: 'center', paddingTop: 50, paddingBottom: 6, paddingLeft: 50, paddingRight: 50, zIndex: 1 }}>
        {eventType && (
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#6D1A3E', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>
            {eventType}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        {eventDate && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#9ca3af', fontFamily: 'Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px auto 0', width: 160 }}>
          <div style={{ flex: 1, height: 1.5, background: '#6D1A3E' }} />
          <div style={{ width: 5, height: 5, background: '#6D1A3E', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1.5, background: '#6D1A3E' }} />
        </div>
      </div>

      {/* QR code */}
      <div style={{ margin: '22px 0', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={176} bordered />
      </div>

      {/* Bottom content */}
      <div style={{ textAlign: 'center', paddingLeft: 40, paddingRight: 40, zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '14px 0 0', fontSize: 10, color: '#6D1A3E', fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
          AnıKare
        </p>
      </div>
    </div>
  )
}

export default function CardMinimal(props: CardProps) {
  return props.orientation === 'portrait'
    ? <Portrait {...props} />
    : <Landscape {...props} />
}
