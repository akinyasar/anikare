import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InvitationSettingsClient from '@/components/dashboard/invitation-settings-client'
import { normalizePrograms } from '@/lib/programs'

export default async function InvitationSettingsPage({
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
    .select('id, title, invitation_enabled, programs')
    .eq('slug', slug)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  return (
    <InvitationSettingsClient
      eventId={event.id}
      eventTitle={event.title}
      slug={slug}
      initialEnabled={event.invitation_enabled ?? false}
      initialPrograms={normalizePrograms(event.programs)}
    />
  )
}
