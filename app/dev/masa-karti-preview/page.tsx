import { notFound } from 'next/navigation'
import PreviewClient from './preview-client'

export default function MasaKartiPreviewPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }
  return <PreviewClient />
}
