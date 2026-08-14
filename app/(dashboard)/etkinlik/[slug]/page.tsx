import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EventDetailClient from '@/components/dashboard/event-detail-client'

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_type, event_date, package_type, template_id, photo_count, video_count, guest_count_estimate, is_upload_active, invitation_enabled')
    .eq('slug', slug)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  return <EventDetailClient event={event} slug={slug} />
}
