// Botanical table card — eucalyptus leaves, gold accents
interface CardProps {
  title: string
  eventType?: string
  guestUrl: string
  qrDataUrl: string | null
}

function BotanicalCorner({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="115" height="95"
      viewBox="0 0 115 95"
      fill="none"
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      {/* Main branch */}
      <path d="M10 85 Q 40 55 90 10" stroke="#7a9e6a" strokeWidth="1.5" fill="none" opacity=".6"/>
      {/* Leaves along branch */}
      <ellipse cx="30" cy="65" rx="13" ry="7" fill="#7a9e6a" opacity=".75" transform="rotate(-45 30 65)"/>
      <ellipse cx="45" cy="50" rx="13" ry="7" fill="#5c8550" opacity=".7" transform="rotate(-38 45 50)"/>
      <ellipse cx="60" cy="36" rx="12" ry="6" fill="#9bbf8a" opacity=".7" transform="rotate(-32 60 36)"/>
      <ellipse cx="74" cy="23" rx="11" ry="6" fill="#7a9e6a" opacity=".65" transform="rotate(-28 74 23)"/>
      <ellipse cx="88" cy="12" rx="9" ry="5" fill="#5c8550" opacity=".6" transform="rotate(-22 88 12)"/>
      {/* Secondary leaves */}
      <ellipse cx="22" cy="72" rx="10" ry="5" fill="#9bbf8a" opacity=".6" transform="rotate(-55 22 72)"/>
      <ellipse cx="52" cy="42" rx="10" ry="5" fill="#7a9e6a" opacity=".6" transform="rotate(-25 52 42)"/>
      <ellipse cx="68" cy="28" rx="9" ry="4.5" fill="#9bbf8a" opacity=".55" transform="rotate(-18 68 28)"/>
      {/* Gold dots */}
      <circle cx="35" cy="60" r="2.5" fill="#c9a84c" opacity=".7"/>
      <circle cx="55" cy="40" r="2" fill="#c9a84c" opacity=".65"/>
      <circle cx="75" cy="22" r="2" fill="#c9a84c" opacity=".6"/>
    </svg>
  )
}

export default function CardBotanical({ title, eventType, guestUrl, qrDataUrl }: CardProps) {
  return (
    <div
      style={{
        width: 756,
        height: 403,
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #c0d4b0',
        borderRadius: 4,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {/* Top-right corner */}
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <BotanicalCorner />
      </div>
      {/* Bottom-left corner */}
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <BotanicalCorner flip />
      </div>

      {/* Left: QR */}
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
      <div style={{ width: 1, background: '#d0e4c0', margin: '48px 0' }} />

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
        {/* Gold heart */}
        <div style={{ fontSize: 14, color: '#c9a84c' }}>♥</div>
        {eventType && (
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#7a9e6a', fontFamily: 'Arial, sans-serif' }}>
            {eventType}
          </p>
        )}
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, fontFamily: 'Georgia, serif' }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
          <div style={{ height: 1, width: 30, background: '#c9a84c' }} />
          <div style={{ width: 4, height: 4, background: '#c9a84c', transform: 'rotate(45deg)' }} />
          <div style={{ height: 1, width: 30, background: '#c9a84c' }} />
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: '#7a6a5a', lineHeight: 1.6, fontFamily: 'Arial, sans-serif' }}>
          QR kodu okutarak anılarınızı<br />bizimle paylaşın.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 10, color: '#7a9e6a', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#c9a84c' }}>♥</span> AnıKare
        </p>
      </div>
    </div>
  )
}
