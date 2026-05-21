/** Force a Blob download. Uses octet-stream to prevent browser from opening
 *  the file inline (PDF viewer, media player, etc.). Works on Android/desktop;
 *  on iOS Safari the file opens in the viewer — that's a platform limitation. */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Fetch a (possibly cross-origin) URL as a blob and force-download it.
 *  Needed because the `download` attribute on <a> is ignored for cross-origin
 *  URLs in most browsers (e.g. presigned R2 / S3 URLs). */
export async function fetchAndDownload(url: string, filename: string) {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  triggerBlobDownload(new Blob([arrayBuffer], { type: 'application/octet-stream' }), filename)
}
