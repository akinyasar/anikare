// Floral table card — pink roses, romantic white background
interface CardProps {
  title: string
  eventType?: string
  guestUrl: string
  qrDataUrl: string | null
}

function FloralCorner({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="110" height="90"
      viewBox="0 0 110 90"
      fill="none"
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      {/* Leaves */}
      <path d="M10 80 C 20 60 40 50 55 30 C 42 48 22 58 10 80Z" fill="#7db87d" opacity=".7"/>
      <path d="M5 70 C 18 52 38 45 50 25 C 38 43 18 52 5 70Z" fill="#5a9e5a" opacity=".55"/>
      <path d="M22 85 C 28 68 45 60 58 42 C 47 58 30 66 22 85Z" fill="#9ecf9e" opacity=".6"/>
      <path d="M35 88 C 38 72 52 65 62 50 C 52 64 38 71 35 88Z" fill="#7db87d" opacity=".5"/>
      {/* Roses */}
      <g transform="translate(62,22)">
        <circle r="12" fill="#f4a0b0" opacity=".9"/>
        <circle r="8" fill="#e8849a" opacity=".9"/>
        <circle r="4" fill="#d4607a"/>
      </g>
      <g transform="translate(40,40)">
        <circle r="10" fill="#f9c0cc" opacity=".85"/>
        <circle r="6.5" fill="#f0a0b8" opacity=".9"/>
        <circle r="3.5" fill="#e07898"/>
      </g>
      <g transform="translate(76,44)">
        <circle r="8" fill="#f9c0cc" opacity=".75"/>
        <circle r="5" fill="#f0a0b8" opacity=".85"/>
        <circle r="2.5" fill="#e07898"/>
      </g>
      {/* Small buds */}
      <circle cx="55" cy="60" r="5" fill="#f9c0cc" opacity=".6"/>
      <circle cx="88" cy="28" r="5" fill="#f9c0cc" opacity=".55"/>
    </svg>
  )
}

export default function CardFloral({ title, eventType, guestUrl, qrDataUrl }: CardProps) {
  return (
    <div
      style={{
        width: 756,
        height: 403,
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #f5d5dd',
        borderRadius: 4,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {/* Top-right corner decoration */}
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <FloralCorner />
      </div>
      {/* Bottom-left corner decoration */}
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <FloralCorner flip />
      </div>

      {/* Left: QR code */}
      <div style={{
        width: '42%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 40,
        paddingRight: 16,
      }}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR" width={160} height={160} style={{ borderRadius: 4 }} />
        ) : (
          <div style={{
            width: 160,
            height: 160,
            background: 'repeating-conic-gradient(#1a1a1a 0% 25%, #fff 0% 50%) 0 0 / 10px 10px',
            borderRadius: 4,
            opacity: 0.15,
          }} />
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#f5d5dd', margin: '48px 0' }} />

      {/* Right: Text */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 28,
        paddingRight: 40,
        gap: 8,
      }}>
        {eventType && (
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#c47a8a', fontFamily: 'Arial, sans-serif' }}>
            {eventType}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        <div style={{ width: 40, height: 1.5, background: '#e8849a', margin: '4px 0' }} />
        <p style={{ margin: 0, fontSize: 11.5, color: '#7a6a5a', lineHeight: 1.6, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 10, color: '#c47a8a', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🤍</span> AnıKare
        </p>
      </div>
    </div>
  )
}
