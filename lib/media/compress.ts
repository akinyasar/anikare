import imageCompression from 'browser-image-compression'
import type { PackageType } from '@/types'
import { PACKAGES } from '@/lib/packages'

export async function compressImage(file: File, packageType: PackageType): Promise<File> {
  const pkg = PACKAGES[packageType]

  if (pkg.compressionTarget === null) return file

  const lowerName = file.name.toLowerCase()
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
    lowerName.endsWith('.heic') || lowerName.endsWith('.heif')
  if (isHeic) return file

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: pkg.compressionTarget,
      initialQuality: pkg.compressionQuality,
      useWebWorker: false,
    })
    return new File([compressed], file.name, { type: file.type || compressed.type })
  } catch {
    return file
  }
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}
