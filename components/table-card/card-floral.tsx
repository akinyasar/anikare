// Floral table card — Stitch-generated watercolor rose + eucalyptus garland corners
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

// Two distinct illustrations (not a mirrored duplicate) — each already drawn
// oriented for its own corner, so no CSS transform (rotate/scale/mirror) is
// needed to place them. This avoids the html2canvas corner-rotation bug class
// entirely: these <img> tags carry zero transform in the exported markup.
function FloralCorner({ corner, size }: { corner: 'tr' | 'bl'; size: number }) {
  const src = corner === 'tr' ? '/table-card/floral-tr.png' : '/table-card/floral-bl.png'
  const position = corner === 'tr'
    ? { top: -size * 0.03, right: -size * 0.03 }
    : { bottom: -size * 0.03, left: -size * 0.03 }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ position: 'absolute', width: size, height: size, ...position }}
    />
  )
}

// Rendered as SVG (not the 🤍 emoji glyph) so it sits pixel-perfect centered
// on the divider line — an emoji's baseline position inside its em-box varies
// by renderer, so flex alignItems:center never lined it up exactly against
// the line in html2canvas' export.
function DividerHeart({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#e8849a" strokeWidth="1.6" />
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
function Landscape({ title, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 756, height: 403, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #f0d4dc', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      <FloralCorner corner="tr" size={230} />
      <FloralCorner corner="bl" size={200} />

      {/* QR */}
      <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20 }}>
        <QRContent qrDataUrl={qrDataUrl} size={172} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#f5d5dd', margin: '50px 0' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 60, gap: 6, position: 'relative', zIndex: 1, marginTop: -16 }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
          {title}
        </h1>
        {eventDate && (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
          <div style={{ height: 1.5, flex: 1, background: '#e8849a' }} />
          <DividerHeart size={15} />
          <div style={{ height: 1.5, flex: 1, background: '#e8849a' }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          Sizden gelen her kare, bu günü daha özel kılıyor. QR kodu okutarak hatıralarınızı bizimle paylaşın.
        </p>
      </div>

      {/* Brand — bottom right */}
      <div style={{ position: 'absolute', bottom: 14, right: 20, textAlign: 'right', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#c47a8a', fontFamily: 'Arial, sans-serif' }}>
          🤍 AnıKare
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 9, color: '#c9b8ae', fontFamily: 'Arial, sans-serif' }}>
          www.anikare.net
        </p>
      </div>
    </div>
  )
}

// ── PORTRAIT (480×580) — independent layout ──────────────────────────────────
function Portrait({ title, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 480, height: 580, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #f0d4dc', borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
    }}>
      <FloralCorner corner="tr" size={180} />
      <FloralCorner corner="bl" size={160} />

      {/* Top content */}
      <div style={{ textAlign: 'center', paddingTop: 52, paddingBottom: 10, paddingLeft: 32, paddingRight: 32, zIndex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
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
          <DividerHeart size={16} />
          <div style={{ flex: 1, height: 1.5, background: '#e8849a' }} />
        </div>
      </div>

      {/* QR code — center */}
      <div style={{ margin: '20px 0', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={180} />
      </div>

      {/* Bottom content */}
      <div style={{ textAlign: 'center', paddingLeft: 40, paddingRight: 40, zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          Sizden gelen her kare, bu günü daha özel kılıyor. QR kodu okutarak hatıralarınızı bizimle paylaşın.
        </p>
      </div>

      {/* Brand — bottom right */}
      <div style={{ position: 'absolute', bottom: 14, right: 20, textAlign: 'right', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#c47a8a', fontFamily: 'Arial, sans-serif' }}>
          🤍 AnıKare
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 9, color: '#c9b8ae', fontFamily: 'Arial, sans-serif' }}>
          www.anikare.net
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
