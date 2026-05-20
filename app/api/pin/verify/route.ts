import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPin } from '@/lib/pin'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  eventId: z.string().uuid(),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { eventId, pin } = parsed.data

  const supabase = await createServiceClient()
  const { data: event } = await supabase
    .from('events')
    .select('pin_enabled, pin_code_hash')
    .eq('id', eventId)
    .single()

  if (!event || !event.pin_enabled || !event.pin_code_hash) {
    return Response.json({ error: 'No PIN required for this event' }, { status: 400 })
  }

  const valid = await verifyPin(pin, event.pin_code_hash)
  if (!valid) {
    return Response.json({ error: 'Wrong PIN' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(`pin_verified_${eventId}`, `verified_${eventId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return Response.json({ success: true })
}
