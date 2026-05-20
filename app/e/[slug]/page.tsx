import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GuestFlow from '@/components/guest/guest-flow'

export default async function GuestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // pin_code_hash kasıtlı olarak seçilmiyor
  const { data: event } = await supabase
    .from('events')
    .select(
      'id, host_id, title, event_type, slug, event_date, cover_image_key, cover_image_url, thank_you_message, thank_you_video_url, pin_enabled, package_type, template_id, guest_count_estimate, is_upload_active, upload_expires_at, media_retention_until, photo_count, video_count, created_at, updated_at'
    )
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  return <GuestFlow event={event} />
}
