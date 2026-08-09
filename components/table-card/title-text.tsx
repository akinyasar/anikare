// Playfair Display's default "&" glyph is an ornate calligraphic swash that
// looks like it belongs to a different typeface next to the bold, upright
// letterforms around it. Rendering it in a plain italic serif instead keeps
// the ampersand elegant without the mismatch.
export function TitleText({ title }: { title: string }) {
  const parts = title.split(/(&)/g)
  return (
    <>
      {parts.map((part, i) =>
        part === '&' ? (
          <span key={i} style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 400, verticalAlign: '0.09em' }}>
            &amp;
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}
