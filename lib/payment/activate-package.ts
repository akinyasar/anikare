import { createServiceClient } from '@/lib/supabase/server'
import type { PackageType } from '@/types'

export async function activatePackage(
  eventId: string,
  packageType: 'standard' | 'premium'
): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('events')
    .update({ package_type: packageType as PackageType })
    .eq('id', eventId)
  if (error) throw new Error(`Package activation failed: ${error.message}`)
}
