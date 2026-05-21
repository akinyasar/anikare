import { createClient } from '@/lib/supabase/server'
import EventListClient from '@/components/dashboard/event-list-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, event_date, event_type, package_type, photo_count, video_count, is_upload_active')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  return <EventListClient events={events} />
}
