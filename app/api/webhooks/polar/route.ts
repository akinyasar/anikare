import { Webhooks } from '@polar-sh/nextjs'
import { activatePackage } from '@/lib/payment/activate-package'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    const referenceId = String(payload.data.metadata?.referenceId ?? '')
    const parts = referenceId.split(':')
    if (parts.length !== 2) return

    const [eventId, packageType] = parts
    if (packageType !== 'standard' && packageType !== 'premium') return

    await activatePackage(eventId, packageType)
    console.log(`[Polar] Activated ${packageType} for event ${eventId}`)
  },
})
