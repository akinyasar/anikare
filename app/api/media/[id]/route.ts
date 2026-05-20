import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET } from '@/lib/r2/client'

async function getVerifiedMedia(id: string, userId: string) {
  const supabase = await createServiceClient()
  const { data: media } = await supabase
    .from('media')
    .select('id, event_id, file_key, file_type')
    .eq('id', id)
    .single()
  if (!media) return null

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', media.event_id)
    .eq('host_id', userId)
    .single()
  if (!event) return null

  return media
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { is_visible } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const media = await getVerifiedMedia(id, user.id)
  if (!media) return Response.json({ error: 'Not found or forbidden' }, { status: 404 })

  const supa = await createServiceClient()
  await supa.from('media').update({ is_visible }).eq('id', id)

  return Response.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const media = await getVerifiedMedia(id, user.id)
  if (!media) return Response.json({ error: 'Not found or forbidden' }, { status: 404 })

  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: media.file_key }))

  const supa = await createServiceClient()
  await supa.from('media').delete().eq('id', id)

  return Response.json({ success: true })
}
