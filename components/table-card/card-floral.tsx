// Floral table card — Stitch-generated rose SVG, larger content, date, portrait variant
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

// Stitch-generated floral corner SVG paths (120×100 viewBox)
function FloralCorner({ flip }: { flip?: boolean }) {
  return (
    <svg width="100" height="85" viewBox="0 0 120 100" fill="none">
      <g transform={flip ? 'rotate(180, 60, 50)' : undefined}>
      {/* Rose 1 — center cluster (Stitch) */}
      <g transform="translate(95, 25)">
        <path d="M0,0 c-5,-10 -15,-5 -15,5 c0,10 10,15 15,10 c5,5 15,0 15,-10 c0,-10 -10,-15 -15,-5" fill="#f4a0b0" opacity="0.85"/>
        <path d="M-8,2 c-5,-8 -12,-2 -10,5 c2,7 8,5 10,-5" fill="#e07898" opacity="0.65"/>
        <path d="M8,2 c5,-8 12,-2 10,5 c-2,7 -8,5 -10,-5" fill="#e07898" opacity="0.65"/>
        <path d="M0,-8 c-8,-5 -8,8 0,8 c8,0 8,-13 0,-8" fill="#e07898" opacity="0.75"/>
        <path d="M-3,-2 c-2,-4 2,-6 3,-2 c1,-4 5,-2 3,2 c2,4 -2,6 -3,2 c-1,4 -5,2 -3,-2" fill="#8B2252" opacity="0.45"/>
      </g>
      {/* Rose 2 — top small (Stitch) */}
      <g transform="translate(110, 10) scale(0.72)">
        <path d="M0,0 c-5,-10 -15,-5 -15,5 c0,10 10,15 15,10 c5,5 15,0 15,-10 c0,-10 -10,-15 -15,-5" fill="#f9c0cc" opacity="0.85"/>
        <path d="M-5,0 c-4,-6 -10,-2 -8,4 c2,6 6,4 8,-4" fill="#e07898" opacity="0.55"/>
        <path d="M5,0 c4,-6 10,-2 8,4 c-2,6 -6,4 -8,-4" fill="#e07898" opacity="0.55"/>
      </g>
      {/* Rose 3 — side profile (Stitch) */}
      <g transform="translate(80, 45) rotate(45) scale(0.82)">
        <path d="M-10,0 q10,-15 20,0 t-20,0" fill="#f9c0cc" opacity="0.9"/>
        <path d="M-10,0 q10,10 20,0 t-20,0" fill="#e07898" opacity="0.72"/>
        <path d="M-5,-5 q5,-8 10,0" fill="#f4a0b0" opacity="0.65"/>
      </g>
      {/* Foliage & stems (Stitch) */}
      <path d="M90,30 Q60,50 30,85" stroke="#6a9a5a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M70,45 q-10,5 -15,-5 q5,-10 15,5" fill="#9ec87e" opacity="0.8"/>
      <path d="M75,42 q-5,-12 8,-10 q12,2 -8,10" fill="#6a9a5a" opacity="0.72"/>
      <path d="M50,65 q-12,8 -8,-5 q4,-13 8,5" fill="#9ec87e" opacity="0.8"/>
      <path d="M40,75 q-15,5 -8,-10 q7,-15 8,10" fill="#6a9a5a" opacity="0.65"/>
      <path d="M105,40 q5,10 12,0 q-7,-10 -12,0" fill="#9ec87e" opacity="0.72"/>
      <path d="M85,15 q-10,-5 -5,-15 q10,5 5,15" fill="#6a9a5a" opacity="0.55"/>
      </g>
    </svg>
  )
}

function QRContent({ qrDataUrl, size }: { qrDataUrl: string | null; size: number }) {
  if (qrDataUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={qrDataUrl} alt="QR" width={size} height={size} style={{ borderRadius: 4, display: 'block' }} />
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="5" y="5" width="30" height="30" fill="none" stroke="#1a1a1a" strokeWidth="4" opacity=".15"/>
      <rect x="13" y="13" width="14" height="14" fill="#1a1a1a" opacity=".12"/>
      <rect x="65" y="5" width="30" height="30" fill="none" stroke="#1a1a1a" strokeWidth="4" opacity=".15"/>
      <rect x="73" y="13" width="14" height="14" fill="#1a1a1a" opacity=".12"/>
      <rect x="5" y="65" width="30" height="30" fill="none" stroke="#1a1a1a" strokeWidth="4" opacity=".15"/>
      <rect x="13" y="73" width="14" height="14" fill="#1a1a1a" opacity=".12"/>
      {[38,45,52,60,67,74,82].map((x,i) => [38,45,52,60,67,74,82].map((y,j) =>
        (i+j) % 2 === 0 ? <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" fill="#1a1a1a" opacity=".1"/> : null
      ))}
    </svg>
  )
}

// ── LANDSCAPE (756×403) ──────────────────────────────────────────────────────
function Landscape({ title, eventType, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 756, height: 403, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #f0d4dc', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}><FloralCorner /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}><FloralCorner flip /></div>

      {/* QR */}
      <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20 }}>
        <QRContent qrDataUrl={qrDataUrl} size={172} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#f5d5dd', margin: '50px 0' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 120, gap: 6 }}>
        {eventType && (
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#c47a8a', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
            {eventType}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        {eventDate && (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
          <div style={{ height: 1.5, flex: 1, background: '#e8849a' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8849a' }} />
          <div style={{ height: 1.5, flex: 1, background: '#e8849a' }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#c47a8a', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
          🤍 AnıKare
        </p>
      </div>
    </div>
  )
}

// ── PORTRAIT (480×580) — independent layout ──────────────────────────────────
function Portrait({ title, eventType, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 480, height: 580, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #f0d4dc', borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
    }}>
      {/* Corners — scaled smaller for portrait */}
      <div style={{ position: 'absolute', top: 0, right: 0, transform: 'scale(0.65)', transformOrigin: 'top right' }}>
        <FloralCorner />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scale(0.65)', transformOrigin: 'bottom left' }}>
        <FloralCorner flip />
      </div>

      {/* Top content */}
      <div style={{ textAlign: 'center', paddingTop: 52, paddingBottom: 10, paddingLeft: 32, paddingRight: 32, zIndex: 1 }}>
        {eventType && (
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#c47a8a', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
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
        {/* Ornamental divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px auto 0', width: 180 }}>
          <div style={{ flex: 1, height: 1.5, background: '#e8849a' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8849a' }} />
          <div style={{ flex: 1, height: 1.5, background: '#e8849a' }} />
        </div>
      </div>

      {/* QR code — center */}
      <div style={{ margin: '20px 0', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={180} />
      </div>

      {/* Bottom content */}
      <div style={{ textAlign: 'center', paddingLeft: 40, paddingRight: 40, zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '14px 0 0', fontSize: 11, color: '#c47a8a', fontFamily: 'Arial, sans-serif' }}>
          🤍 AnıKare
        </p>
      </div>
    </div>
  )
}

export default function CardFloral(props: CardProps) {
  return props.orientation === 'portrait'
    ? <Portrait {...props} />
    : <Landscape {...props} />
}
