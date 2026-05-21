import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET } from '@/lib/r2/client'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return Response.json({ error: 'Missing eventId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

  if (!media?.length) return Response.json({ media: [] })

  // Generate presigned GET URLs (1 hour expiry) so images load without public bucket access
  const enriched = await Promise.all(
    media.map(async (item) => {
      try {
        const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: item.file_key })
        const viewUrl = await getSignedUrl(r2, cmd, { expiresIn: 3600 })
        return { ...item, viewUrl }
      } catch {
        return { ...item, viewUrl: item.file_url }
      }
    })
  )

  return new Response(JSON.stringify({ media: enriched }), {
    headers: {
      'Content-Type': 'application/json',
      // Cache presigned URLs for 30s — eliminates redundant calls on back-nav
      // Presigned URLs are valid 1hr so this is safe
      'Cache-Control': 'private, max-age=30',
    },
  })
}
