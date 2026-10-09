import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { findOrderByCustomerInput } from '@/lib/orders'
import { notifySubscription, pushConfigured } from '@/lib/push'
import { displayOrderNumber } from '@/lib/order-number-format'

// Saves a browser push subscription. Signed-in customers get updates for all their orders;
// guests follow the specific order they subscribed from.
export async function POST(req: NextRequest) {
  if (!pushConfigured) return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 })

  const { subscription, orderNumber, promotions } = await req.json()
  const endpoint = subscription?.endpoint
  const p256dh = subscription?.keys?.p256dh
  const auth = subscription?.keys?.auth
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || !p256dh || !auth)
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

  const user = await getAuthUser()
  const order = orderNumber ? await findOrderByCustomerInput(String(orderNumber), {}) : null

  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint, p256dh, auth,
      userId: user?.id ?? null,
      promotions: promotions !== false,
      ...(order && { orders: { connect: { id: order.id } } }),
    },
    update: {
      p256dh, auth,
      ...(user && { userId: user.id }),
      ...(typeof promotions === 'boolean' && { promotions }),
      ...(order && { orders: { connect: { id: order.id } } }),
    },
  })

  await notifySubscription(sub, order
    ? { title: 'Updates switched on 🔔', body: `We'll notify you as order ${displayOrderNumber(order.orderNumber)} progresses.`, url: `/track-order?id=${encodeURIComponent(order.orderNumber)}`, tag: `order-${order.orderNumber}` }
    : { title: 'Notifications switched on 🔔', body: "We'll let you know about your orders and special offers." })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json().catch(() => ({}))
  if (typeof endpoint === 'string') await prisma.pushSubscription.deleteMany({ where: { endpoint } })
  return NextResponse.json({ ok: true })
}
