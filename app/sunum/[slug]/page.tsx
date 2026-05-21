import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET } from '@/lib/r2/client'
import SlideshowView from '@/components/slideshow/slideshow-view'

export default async function SlideshowPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, package_type')
    .eq('slug', slug)
    .single()

  if (!event || event.package_type !== 'premium') notFound()

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', event.id)
    .eq('file_type', 'photo')
    .eq('is_visible', true)
    .order('uploaded_at', { ascending: false })
    .limit(100)

  const enriched = await Promise.all(
    (media ?? []).map(async (item) => {
      try {
        const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: item.file_key })
        const viewUrl = await getSignedUrl(r2, cmd, { expiresIn: 7200 })
        return { ...item, viewUrl }
      } catch {
        return item
      }
    })
  )

  return <SlideshowView event={event} initialMedia={enriched} />
}
