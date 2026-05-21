// Minimal table card — brand colors, clean typography
interface CardProps {
  title: string
  eventType?: string
  guestUrl: string
  qrDataUrl: string | null
}

export default function CardMinimal({ title, eventType, guestUrl, qrDataUrl }: CardProps) {
  return (
    <div
      style={{
        width: 756,
        height: 403,
        background: '#FAF7F2',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e8ddd5',
        borderRadius: 4,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {/* Top burgundy accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: '#6D1A3E',
      }} />

      {/* Bottom burgundy accent bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: '#6D1A3E',
      }} />

      {/* Left: QR code */}
      <div style={{
        width: '42%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 40,
        paddingRight: 16,
        gap: 10,
      }}>
        <div style={{
          border: '2px solid #6D1A3E',
          borderRadius: 6,
          padding: 8,
          background: '#fff',
        }}>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR" width={140} height={140} />
          ) : (
            <div style={{
              width: 140,
              height: 140,
              background: 'repeating-conic-gradient(#1a1a1a 0% 25%, #fff 0% 50%) 0 0 / 10px 10px',
              opacity: 0.15,
            }} />
          )}
        </div>
        <p style={{ margin: 0, fontSize: 9, color: '#9ca3af', fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>
          anikare.co
        </p>
      </div>

      {/* Vertical divider */}
      <div style={{ width: 1, background: '#e8ddd5', margin: '40px 0' }} />

      {/* Right: Text */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 32,
        paddingRight: 48,
        gap: 10,
      }}>
        {eventType && (
          <p style={{
            margin: 0,
            fontSize: 9,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#6D1A3E',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}>
            {eventType}
          </p>
        )}
        <h1 style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          color: '#1a1a1a',
          lineHeight: 1.2,
          fontFamily: 'Georgia, serif',
        }}>
          {title}
        </h1>
        {/* Decorative line with diamond */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <div style={{ height: 1, width: 32, background: '#6D1A3E' }} />
          <div style={{
            width: 5, height: 5,
            background: '#6D1A3E',
            transform: 'rotate(45deg)',
          }} />
          <div style={{ height: 1, width: 32, background: '#6D1A3E' }} />
        </div>
        <p style={{
          margin: '4px 0 0',
          fontSize: 11.5,
          color: '#7a6a5a',
          lineHeight: 1.65,
          fontFamily: 'Arial, sans-serif',
        }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        {/* Brand footer */}
        <div style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 88 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(50,44) rotate(8) translate(-26,-34)">
              <rect width="52" height="68" rx="4" fill="#f5e6ed" stroke="#6D1A3E" strokeWidth="3"/>
            </g>
            <g transform="translate(4, 10)">
              <rect width="52" height="68" rx="4" fill="white" stroke="#6D1A3E" strokeWidth="3"/>
              <path d="M26 42 C 26 42 4 29 4 15 C 4 6 11 2 17 2 C 21 2 24 5 26 8 C 28 5 31 2 35 2 C 41 2 48 6 48 15 C 48 29 26 42 26 42 Z" fill="#6D1A3E"/>
            </g>
          </svg>
          <span style={{ fontSize: 10, color: '#6D1A3E', fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 2 }}>
            ANI KARE
          </span>
        </div>
      </div>
    </div>
  )
}
