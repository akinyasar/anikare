import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET } from '@/lib/r2/client'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: expiredEvents } = await supabase
    .from('events')
    .select('id')
    .lt('media_retention_until', new Date().toISOString())

  if (!expiredEvents?.length) {
    return Response.json({ deleted: 0, message: 'No expired events' })
  }

  let deletedCount = 0

  for (const event of expiredEvents) {
    const prefix = `events/${event.id}/`

    let continuationToken: string | undefined
    do {
      const listed = await r2.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      )

      for (const obj of listed.Contents ?? []) {
        if (obj.Key) {
          await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: obj.Key }))
          deletedCount++
        }
      }

      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while (continuationToken)

    await supabase.from('media').delete().eq('event_id', event.id)
    await supabase
      .from('events')
      .update({ is_upload_active: false })
      .eq('id', event.id)
  }

  return Response.json({ deleted: deletedCount, events: expiredEvents.length })
}
