import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { broadcastPromotion, pushConfigured } from '@/lib/push'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!pushConfigured) return NextResponse.json({ error: 'Push notifications are not configured (VAPID keys missing)' }, { status: 503 })

  const { title, body, url } = await req.json()
  if (!title?.trim() || !body?.trim()) return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  const safeUrl = typeof url === 'string' && url.startsWith('/') ? url : '/'

  const result = await broadcastPromotion({ title: title.trim().slice(0, 80), body: body.trim().slice(0, 200), url: safeUrl })
  return NextResponse.json(result)
}
