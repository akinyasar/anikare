import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  eventId: z.string().uuid(),
  guestName: z.string().min(1).max(100),
  guestNote: z.string().max(300).optional(),
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.enum(['photo', 'video']),
  fileSize: z.number().positive(),
  originalFilename: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const {
    eventId,
    guestName,
    guestNote,
    fileKey,
    fileUrl,
    fileType,
    fileSize,
    originalFilename,
  } = parsed.data

  const supabase = await createServiceClient()

  const { data: event } = await supabase
    .from('events')
    .select('pin_enabled, is_upload_active, upload_expires_at')
    .eq('id', eventId)
    .single()

  if (!event) {
    return Response.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.is_upload_active) {
    return Response.json({ error: 'Upload closed' }, { status: 403 })
  }

  if (
    event.upload_expires_at &&
    new Date(event.upload_expires_at) < new Date()
  ) {
    return Response.json({ error: 'Event expired' }, { status: 403 })
  }

  if (event.pin_enabled) {
    const cookieStore = await cookies()
    const pinCookie = cookieStore.get(`pin_verified_${eventId}`)?.value
    if (pinCookie !== `verified_${eventId}`) {
      return Response.json({ error: 'PIN required' }, { status: 403 })
    }
  }

  const { error } = await supabase.from('media').insert({
    event_id: eventId,
    guest_name: guestName,
    guest_note: guestNote ?? null,
    file_key: fileKey,
    file_url: fileUrl,
    file_type: fileType,
    file_size: fileSize,
    original_filename: originalFilename,
  })

  if (error) {
    console.error('[Confirm] Supabase insert error:', JSON.stringify(error))
    return Response.json({ error: `Failed to save media: ${error.message}` }, { status: 500 })
  }

  return Response.json({ success: true })
}
