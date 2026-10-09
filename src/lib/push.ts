import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { displayOrderNumber } from '@/lib/order-number-format'

// Web Push (VAPID). Every send is best-effort: a notification failure must never fail
// the order/payment request that triggered it. Without VAPID keys this is a no-op.

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:support@sheerin.com'
export const pushConfigured = Boolean(publicKey && privateKey)
if (pushConfigured) webpush.setVapidDetails(subject, publicKey!, privateKey!)

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

type Sub = { id: string; endpoint: string; p256dh: string; auth: string }

async function sendToSubscriptions(subs: Sub[], payload: PushPayload) {
  if (!pushConfigured || subs.length === 0) return 0
  const body = JSON.stringify(payload)
  const results = await Promise.allSettled(
    subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 24 })),
  )
  // Browsers report unsubscribed/expired endpoints with 404/410 — prune them; log anything else.
  const gone: string[] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') return
    const code = (r.reason as any)?.statusCode
    if (code === 404 || code === 410) gone.push(subs[i].id)
    else console.error('Push failed:', code, (r.reason as any)?.body || r.reason)
  })
  if (gone.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } })
  return results.filter((r) => r.status === 'fulfilled').length
}

/** Notifies every device following an order: the customer's account devices + guest devices subscribed to it. */
export async function notifyOrder(orderId: string, build: (orderNo: string) => PushPayload) {
  try {
    if (!pushConfigured) return
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { orderNumber: true, userId: true } })
    if (!order) return
    const subs = await prisma.pushSubscription.findMany({
      where: { OR: [{ orders: { some: { id: orderId } } }, ...(order.userId ? [{ userId: order.userId }] : [])] },
    })
    const orderNo = displayOrderNumber(order.orderNumber)
    await sendToSubscriptions(subs, { url: `/track-order?id=${encodeURIComponent(order.orderNumber)}`, tag: `order-${order.orderNumber}`, ...build(orderNo) })
  } catch (e) {
    console.error('notifyOrder error:', e)
  }
}

export async function notifySubscription(sub: Sub, payload: PushPayload) {
  try { await sendToSubscriptions([sub], payload) } catch (e) { console.error('notifySubscription error:', e) }
}

export async function broadcastPromotion(payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { promotions: true } })
  return { sent: await sendToSubscriptions(subs, { tag: 'promo', ...payload }), total: subs.length }
}

export const ORDER_STATUS_PUSH: Record<string, (no: string) => PushPayload> = {
  PENDING:          (no) => ({ title: 'Order placed 🎂', body: `We've received order ${no}. We'll confirm it shortly.` }),
  CONFIRMED:        (no) => ({ title: 'Order confirmed ✅', body: `Order ${no} is confirmed and assigned to our baker.` }),
  PROCESSING:       (no) => ({ title: 'Baking in progress 👩‍🍳', body: `Your order ${no} is being freshly prepared.` }),
  OUT_FOR_DELIVERY: (no) => ({ title: 'Out for delivery 🚚', body: `Order ${no} is on its way to you!` }),
  DELIVERED:        (no) => ({ title: 'Delivered 🎉', body: `Order ${no} has been delivered. Enjoy!` }),
  CANCELLED:        (no) => ({ title: 'Order cancelled', body: `Order ${no} was cancelled. Contact us if this is unexpected.` }),
}

export const PAYMENT_STATUS_PUSH: Record<string, (no: string) => PushPayload> = {
  PAID:   (no) => ({ title: 'Payment received 💳', body: `Thanks! We've received your payment for order ${no}.` }),
  FAILED: (no) => ({ title: 'Payment failed', body: `Payment for order ${no} didn't go through. Please contact us.` }),
}
