import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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

  return <SlideshowView event={event} initialMedia={media ?? []} />
}
