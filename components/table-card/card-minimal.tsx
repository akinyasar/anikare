import { TitleText } from './title-text'

// Minimal table card — Cool Modern Gold: cool white background, bright solid
// gold accents, geometric (not curly) ornamentation. No bordo/purple.
//
// Solid gold only — no border-image, no SVG gradient fills/strokes. Both were
// tried first (a gradient look reads as more "parlak/shiny") but html2canvas
// does not reliably render border-image or SVG <linearGradient> referenced via
// url(#id): the exported PDF silently dropped the frame, corner marks, and
// seal icon entirely while the live browser preview looked correct. Solid
// gold renders identically in both.
interface CardProps {
  title: string
  eventType?: string
  eventDate?: string
  guestUrl: string
  qrDataUrl: string | null
  orientation?: 'landscape' | 'portrait'
}

const GOLD = '#C9A227'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CornerMark({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transform: Record<typeof corner, string> = {
    tl: 'none', tr: 'scaleX(-1)', br: 'scale(-1, -1)', bl: 'scaleY(-1)',
  }
  const position: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 8, left: 8 },
    tr: { top: 8, right: 8 },
    br: { bottom: 8, right: 8 },
    bl: { bottom: 8, left: 8 },
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', transform: transform[corner], ...position[corner] }}>
      <path d="M2,2 L2,10 M2,2 L10,2" stroke={GOLD} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <rect x="1" y="1" width="2.6" height="2.6" fill="none" stroke={GOLD} strokeWidth="0.8" transform="rotate(45, 2.3, 2.3)" />
    </svg>
  )
}

function SparkleSeal({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 2 L13.6 9.8 L21 12 L13.6 14.2 L12 22 L10.4 14.2 L3 12 L10.4 9.8 Z" fill="none" stroke={GOLD} strokeWidth="1.1" />
    </svg>
  )
}

function QRContent({ qrDataUrl, size, bordered }: { qrDataUrl: string | null; size: number; bordered?: boolean }) {
  const inner = qrDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qrDataUrl} alt="QR" width={size} height={size} style={{ display: 'block', borderRadius: 2 }} />
  ) : (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="5" y="5" width="30" height="30" fill="none" stroke="#1E1E1C" strokeWidth="4" opacity=".15"/>
      <rect x="13" y="13" width="14" height="14" fill="#1E1E1C" opacity=".12"/>
      <rect x="65" y="5" width="30" height="30" fill="none" stroke="#1E1E1C" strokeWidth="4" opacity=".15"/>
      <rect x="73" y="13" width="14" height="14" fill="#1E1E1C" opacity=".12"/>
      <rect x="5" y="65" width="30" height="30" fill="none" stroke="#1E1E1C" strokeWidth="4" opacity=".15"/>
      <rect x="13" y="73" width="14" height="14" fill="#1E1E1C" opacity=".12"/>
      {[38,45,52,60,67,74,82].map((x,i) => [38,45,52,60,67,74,82].map((y,j) =>
        (i+j) % 2 === 0 ? <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" fill="#1E1E1C" opacity=".1"/> : null
      ))}
    </svg>
  )
  if (!bordered) return inner
  return (
    <div style={{ border: '1.5px solid #E7E9E7', borderRadius: 6, padding: 8, background: '#fff' }}>
      {inner}
    </div>
  )
}

// ── LANDSCAPE (756×403) ──────────────────────────────────────────────────────
function Landscape({ title, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 756, height: 403, background: '#F7F8F7', position: 'relative',
      overflow: 'hidden', border: '1px solid #E7E9E7', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      <div style={{ position: 'absolute', inset: 16, border: `1.4px solid ${GOLD}`, opacity: 0.75, pointerEvents: 'none' }} />
      <CornerMark corner="tl" />
      <CornerMark corner="tr" />
      <CornerMark corner="bl" />
      <CornerMark corner="br" />

      {/* QR with border frame */}
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20, gap: 10, position: 'relative', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={158} bordered />
        <p style={{ margin: 0, fontSize: 10, color: '#B3AFA5', fontFamily: 'var(--font-sans), Arial, sans-serif', letterSpacing: 1 }}>
          anikare.co
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#E7E9E7', margin: '46px 0' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 60, gap: 8, position: 'relative', zIndex: 1, marginTop: -16 }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: '#1E1E1C', letterSpacing: '-0.01em', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
          <TitleText title={title} />
        </h1>
        {eventDate && (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
          <div style={{ height: 1.2, flex: 1, background: GOLD }} />
          <SparkleSeal size={14} />
          <div style={{ height: 1.2, flex: 1, background: GOLD }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#55554F', lineHeight: 1.7, fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          Sizden gelen her kare, bu günü daha özel kılıyor. QR kodu okutarak hatıralarınızı bizimle paylaşın.
        </p>
      </div>

      {/* Brand — bottom right */}
      <div style={{ position: 'absolute', bottom: 14, right: 20, textAlign: 'right', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 10, color: '#9C7A22', fontFamily: 'var(--font-sans), Arial, sans-serif', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          AnıKare
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 9, color: '#B3AFA5', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          www.anikare.net
        </p>
      </div>
    </div>
  )
}

// ── PORTRAIT (480×580) ───────────────────────────────────────────────────────
function Portrait({ title, eventDate, qrDataUrl }: CardProps) {
  return (
    <div style={{
      width: 480, height: 580, background: '#F7F8F7', position: 'relative',
      overflow: 'hidden', border: '1px solid #E7E9E7', borderRadius: 6,
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 16, border: `1.4px solid ${GOLD}`, opacity: 0.75, pointerEvents: 'none' }} />
      <CornerMark corner="tl" />
      <CornerMark corner="tr" />
      <CornerMark corner="bl" />
      <CornerMark corner="br" />

      {/* Header text */}
      <div style={{ textAlign: 'center', paddingTop: 46, paddingBottom: 6, paddingLeft: 50, paddingRight: 50, zIndex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: '#1E1E1C', letterSpacing: '-0.01em', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
          <TitleText title={title} />
        </h1>
        {eventDate && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px auto 0', width: 160 }}>
          <div style={{ flex: 1, height: 1.2, background: GOLD }} />
          <SparkleSeal size={14} />
          <div style={{ flex: 1, height: 1.2, background: GOLD }} />
        </div>
      </div>

      {/* QR code */}
      <div style={{ margin: '22px 0', zIndex: 1 }}>
        <QRContent qrDataUrl={qrDataUrl} size={176} bordered />
      </div>

      {/* Bottom content */}
      <div style={{ textAlign: 'center', paddingLeft: 40, paddingRight: 40, zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#55554F', lineHeight: 1.7, fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          Sizden gelen her kare, bu günü daha özel kılıyor. QR kodu okutarak hatıralarınızı bizimle paylaşın.
        </p>
      </div>

      {/* Brand — bottom right */}
      <div style={{ position: 'absolute', bottom: 14, right: 20, textAlign: 'right', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 10, color: '#9C7A22', fontFamily: 'var(--font-sans), Arial, sans-serif', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          AnıKare
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 9, color: '#B3AFA5', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          www.anikare.net
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
