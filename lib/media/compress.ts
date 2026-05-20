import imageCompression from 'browser-image-compression'
import type { PackageType } from '@/types'
import { PACKAGES } from '@/lib/packages'

export async function compressImage(file: File, packageType: PackageType): Promise<File> {
  const pkg = PACKAGES[packageType]

  if (pkg.compressionTarget === null) return file

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: pkg.compressionTarget,
    initialQuality: pkg.compressionQuality,
    useWebWorker: true,
    fileType: file.type,
  })

  return new File([compressed], file.name, { type: file.type })
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}
