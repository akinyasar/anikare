// Dev-only exploration: a duplicate of card-botanical.tsx's Landscape layout
// with a thinner single-branch leaf+gold-fleck corner illustration instead of
// the denser eucalyptus garland. Demo-only — not wired into any real card
// flow. Delete (or fold into card-botanical.tsx) once a style is picked.
import { DividerHeart, QRContent } from './card-botanical'
import { TitleText } from './title-text'

interface Props {
  title: string
  eventDate?: string
  qrDataUrl: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function LeafCorner({ corner, size }: { corner: 'tr' | 'bl'; size: number }) {
  const src = corner === 'tr' ? '/table-card/leaf-tr.png' : '/table-card/leaf-bl.png'
  const position = corner === 'tr'
    ? { top: -size * 0.03, right: -size * 0.03 }
    : { bottom: -size * 0.03, left: -size * 0.03 }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} style={{ position: 'absolute', width: size, height: size, ...position }} />
  )
}

export default function CardBotanicalLeafVariant({ title, eventDate, qrDataUrl }: Props) {
  return (
    <div style={{
      width: 756, height: 403, background: '#ffffff', position: 'relative',
      overflow: 'hidden', border: '1.5px solid #c8dbb8', borderRadius: 6,
      display: 'flex', flexShrink: 0, paddingTop: 48, paddingBottom: 48,
    }}>
      <LeafCorner corner="tr" size={220} />
      <LeafCorner corner="bl" size={190} />

      <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 48, paddingRight: 20 }}>
        <QRContent qrDataUrl={qrDataUrl} size={172} />
      </div>

      <div style={{ width: 1, background: '#d0e4c0', margin: '50px 0' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, paddingRight: 60, gap: 6, position: 'relative', zIndex: 1, marginTop: -16 }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#2B3B2C', lineHeight: 1.15, fontFamily: 'var(--font-heading), Georgia, serif' }}>
          <TitleText title={title} />
        </h1>
        {eventDate && (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
            {formatDate(eventDate)}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
          <div style={{ height: 1, flex: 1, background: '#c9a84c' }} />
          <DividerHeart size={15} />
          <div style={{ height: 1, flex: 1, background: '#c9a84c' }} />
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#7a6a5a', lineHeight: 1.7, fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          Sizden gelen her kare, bu günü daha özel kılıyor. QR kodu okutarak hatıralarınızı bizimle paylaşın.
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: 14, right: 20, textAlign: 'right', zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#7a9e6a', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          <span style={{ color: '#c9a84c' }}>♥</span> AnıKare
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 9, color: '#b9b2a6', fontFamily: 'var(--font-sans), Arial, sans-serif' }}>
          www.anikare.net
        </p>
      </div>
    </div>
  )
}
