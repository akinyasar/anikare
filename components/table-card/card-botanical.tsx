// Botanical table card — Stitch-generated eucalyptus SVG, portrait variant
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

// Stitch-generated botanical corner SVG paths (120×100 viewBox)
function BotanicalCorner({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="100" height="85"
      viewBox="0 0 120 100"
      fill="none"
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      {/* Main eucalyptus stem (Stitch) */}
      <path d="M110,10 Q80,20 40,70" stroke="#5c7a3c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Leaf pairs (Stitch) */}
      <ellipse cx="102" cy="18" rx="8" ry="5" fill="#7a9e6a" transform="rotate(-30, 102, 18)"/>
      <ellipse cx="108" cy="8" rx="7" ry="4" fill="#a8c896" transform="rotate(-15, 108, 8)"/>
      <ellipse cx="88" cy="28" rx="9" ry="6" fill="#a8c896" transform="rotate(-40, 88, 28)"/>
      <ellipse cx="82" cy="15" rx="8" ry="5" fill="#7a9e6a" transform="rotate(-20, 82, 15)"/>
      <ellipse cx="68" cy="42" rx="10" ry="6.5" fill="#7a9e6a" transform="rotate(-45, 68, 42)"/>
      <ellipse cx="60" cy="30" rx="9" ry="6" fill="#a8c896" transform="rotate(-30, 60, 30)"/>
      <ellipse cx="45" cy="65" rx="8" ry="5" fill="#a8c896" transform="rotate(-50, 45, 65)"/>
      {/* Side branch (Stitch) */}
      <path d="M85,22 Q95,45 80,85" stroke="#5c7a3c" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <ellipse cx="90" cy="35" rx="7" ry="4.5" fill="#7a9e6a" transform="rotate(10, 90, 35)"/>
      <ellipse cx="95" cy="48" rx="8" ry="5" fill="#a8c896" transform="rotate(20, 95, 48)"/>
      <ellipse cx="85" cy="70" rx="9" ry="6" fill="#7a9e6a" transform="rotate(30, 85, 70)"/>
      {/* Berry clusters (Stitch) */}
      <circle cx="95" cy="15" r="1.5" fill="#3d5c2d"/>
      <circle cx="98" cy="18" r="1.2" fill="#3d5c2d"/>
      <circle cx="93" cy="18" r="1.3" fill="#3d5c2d"/>
      <circle cx="75" cy="35" r="1.4" fill="#3d5c2d"/>
      <circle cx="78" cy="38" r="1.2" fill="#3d5c2d"/>
      <circle cx="72" cy="38" r="1.3" fill="#3d5c2d"/>
      {/* Gold sparkles (Stitch) */}
      <circle cx="115" cy="25" r="1" fill="#c9a84c"/>
      <circle cx="100" cy="50" r="0.7" fill="#c9a84c"/>
      <circle cx="60" cy="80" r="0.8" fill="#c9a84c"/>
      <circle cx="50" cy="20" r="0.6" fill="#c9a84c"/>
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
      overflow: 'hidden', border: '1.5px solid #c8dbb8', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}><BotanicalCorner /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}><BotanicalCorner flip /></div>

      {/* QR */}
      <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20 }}>
        <QRContent qrDataUrl={qrDataUrl} size={172} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#d0e4c0', margin: '50px 0' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 120, gap: 6 }}>
        <div style={{ fontSize: 14, color: '#c9a84c', marginBottom: 2 }}>♥</div>
        {eventType && (
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#7a9e6a', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
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
          <div style={{ height: 1, flex: 1, background: '#c9a84c' }} />
          <div style={{ width: 5, height: 5, background: '#c9a84c', transform: 'rotate(45deg)' }} />
          <div style={{ height: 1, flex: 1, background: '#c9a84c' }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 11, color: '#7a9e6a', fontFamily: 'Arial, sans-serif' }}>
          <span style={{ color: '#c9a84c' }}>♥</span> AnıKare
        </p>
      </div>
    </div>
  )
}

// ── PORTRAIT (480×580) ───────────────────────────────────────────────────────
function Portrait({ title, eventType, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 480, height: 580, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #c8dbb8', borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, transform: 'scale(0.65)', transformOrigin: 'top right' }}>
        <BotanicalCorner />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scale(0.65)', transformOrigin: 'bottom left' }}>
        <BotanicalCorner flip />
      </div>

      <div style={{ textAlign: 'center', paddingTop: 52, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, zIndex: 1 }}>
        <div style={{ fontSize: 16, color: '#c9a84c', marginBottom: 6 }}>♥</div>
        {eventType && (
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#7a9e6a', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px auto 0', width: 180 }}>
          <div style={{ flex: 1, height: 1, background: '#c9a84c' }} />
          <div style={{ width: 5, height: 5, background: '#c9a84c', transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: '#c9a84c' }} />
        </div>
      </div>

      <div style={{ margin: '20px 0', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={180} />
      </div>

      <div style={{ textAlign: 'center', paddingLeft: 40, paddingRight: 40, zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '14px 0 0', fontSize: 11, color: '#7a9e6a', fontFamily: 'Arial, sans-serif' }}>
          <span style={{ color: '#c9a84c' }}>♥</span> AnıKare
        </p>
      </div>
    </div>
  )
}

export default function CardBotanical(props: CardProps) {
  return props.orientation === 'portrait'
    ? <Portrait {...props} />
    : <Landscape {...props} />
}
