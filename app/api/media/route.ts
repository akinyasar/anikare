import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return Response.json({ error: 'Missing eventId' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('host_id', user.id)
    .single()

  if (!event) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .order('uploaded_at', { ascending: false })

  return Response.json({ media: media ?? [] })
}
