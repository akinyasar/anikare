// hooks/use-media-upload.ts
'use client'

import { useState, useCallback } from 'react'
import { compressImage } from '@/lib/media/compress'
import type { PackageType, FileType } from '@/types'

export interface UploadItem {
  file: File
  preview: string        // URL.createObjectURL()
  fileType: FileType
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface BatchUploadArgs {
  items: UploadItem[]
  eventId: string
  packageType: PackageType
  guestName: string
  guestNote?: string
  onProgress: (done: number, total: number) => void
}

const LIMIT_ERRORS = new Set(['Photo limit reached', 'Video limit reached'])

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  const uploadBatch = useCallback(async ({
    items,
    eventId,
    packageType,
    guestName,
    guestNote,
    onProgress,
  }: BatchUploadArgs): Promise<boolean> => {
    setUploading(true)
    setError(null)
    setLimitReached(false)
    let done = 0

    try {
      for (const item of items) {
        const fileType = item.fileType
        const processedFile = fileType === 'photo'
          ? await compressImage(item.file, packageType)
          : item.file

        const presignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            fileType,
            fileName: processedFile.name,
            mimeType: processedFile.type || 'application/octet-stream',
            fileSize: processedFile.size,
          }),
        })

        if (!presignRes.ok) {
          const err = await presignRes.json()
          const msg: string = err.error ?? 'Presign başarısız'
          if (LIMIT_ERRORS.has(msg)) {
            setLimitReached(true)
            return true
          }
          throw new Error(msg)
        }

        const { uploadUrl, fileKey, publicUrl, contentType } = await presignRes.json()

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: processedFile,
          headers: { 'Content-Type': contentType },
        })

        if (!uploadRes.ok) throw new Error('R2 yüklemesi başarısız')

        const confirmRes = await fetch('/api/upload/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            guestName,
            guestNote,
            fileKey,
            fileUrl: publicUrl,
            fileType,
            fileSize: processedFile.size,
            originalFilename: item.file.name,
          }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json()
          throw new Error(err.error ?? 'Kayıt başarısız')
        }

        done++
        onProgress(done, items.length)
      }

      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata')
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploadBatch, uploading, error, limitReached, resetError: () => { setError(null); setLimitReached(false) } }
}

export function createUploadItems(files: FileList): UploadItem[] {
  return Array.from(files).map(file => ({
    file,
    preview: URL.createObjectURL(file),
    fileType: file.type.startsWith('video/') ? 'video' : 'photo',
    status: 'pending' as const,
  }))
}
