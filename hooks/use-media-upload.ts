'use client'

import { useState } from 'react'
import { compressImage, isVideoFile } from '@/lib/media/compress'
import type { PackageType, FileType } from '@/types'

interface UploadArgs {
  file: File
  eventId: string
  packageType: PackageType
  guestName: string
  guestNote?: string
}

export function useMediaUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload({ file, eventId, packageType, guestName, guestNote }: UploadArgs) {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const fileType: FileType = isVideoFile(file) ? 'video' : 'photo'
      const processedFile = fileType === 'photo' ? await compressImage(file, packageType) : file
      setProgress(20)

      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          fileType,
          fileName: processedFile.name,
          mimeType: processedFile.type,
          fileSize: processedFile.size,
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error ?? 'Presign başarısız')
      }

      const { uploadUrl, fileKey, publicUrl } = await presignRes.json()
      setProgress(40)

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: processedFile,
        headers: { 'Content-Type': processedFile.type },
      })

      if (!uploadRes.ok) throw new Error('R2 yüklemesi başarısız')
      setProgress(80)

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
          originalFilename: file.name,
        }),
      })

      if (!confirmRes.ok) {
        const err = await confirmRes.json()
        throw new Error(err.error ?? 'Kayıt başarısız')
      }

      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata')
    } finally {
      setUploading(false)
    }
  }

  return { upload, progress, uploading, error, resetError: () => setError(null) }
}
