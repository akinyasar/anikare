// app/api/upload/presign/route.ts
import { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2/client'
import { createServiceClient } from '@/lib/supabase/server'
import { PACKAGES } from '@/lib/packages'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import type { PresignResponse } from '@/types'

// Allow image/* and video/* but also application/octet-stream (some browsers)
const schema = z.object({
  eventId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  fileType: z.enum(['photo', 'video']),
})

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'application/octet-stream', // fallback for unknown types
])

// Derive file type from extension if MIME is octet-stream
const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', '3gp', 'avi'])

function resolveFileType(mimeType: string, fileName: string, claimed: 'photo' | 'video'): 'photo' | 'video' {
  if (mimeType === 'application/octet-stream') {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    if (PHOTO_EXTENSIONS.has(ext)) return 'photo'
    if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  }
  return claimed
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { eventId, fileName, mimeType, fileSize, fileType: claimedType } = parsed.data

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const fileType = resolveFileType(mimeType, fileName, claimedType)

  const supabase = createServiceClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('id, package_type, is_upload_active, upload_expires_at, photo_count, video_count')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return Response.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.is_upload_active) {
    return Response.json({ error: 'Upload closed' }, { status: 403 })
  }

  if (event.upload_expires_at && new Date(event.upload_expires_at) < new Date()) {
    return Response.json({ error: 'Event expired' }, { status: 403 })
  }

  const pkg = PACKAGES[event.package_type as keyof typeof PACKAGES]

  if (fileType === 'photo' && event.photo_count >= pkg.maxPhotos) {
    return Response.json({ error: 'Photo limit reached' }, { status: 403 })
  }
  if (fileType === 'video' && event.video_count >= pkg.maxVideos) {
    return Response.json({ error: 'Video limit reached' }, { status: 403 })
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? (fileType === 'video' ? 'mp4' : 'jpg')
  const fileKey = `events/${eventId}/${fileType}s/${nanoid()}.${ext}`

  // Use a safe content type for octet-stream uploads
  const contentType = mimeType === 'application/octet-stream'
    ? (fileType === 'video' ? 'video/mp4' : 'image/jpeg')
    : mimeType

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: contentType,
    ContentLength: fileSize,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
  const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`

  return Response.json({ uploadUrl, fileKey, publicUrl, contentType } satisfies PresignResponse)
}
