import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'
import { findOrderByCustomerInput, maskPhone } from '@/lib/orders'
import { canAddItemsToOrder } from '@/lib/delivery'
import { notifyOrder, ORDER_STATUS_PUSH, PAYMENT_STATUS_PUSH } from '@/lib/push'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES = ['PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { status, paymentStatus } = await req.json()
  if (status !== undefined && !ORDER_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus))
    return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })

  const before = await prisma.order.findUnique({ where: { id: params.id }, select: { status: true, paymentStatus: true } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { ...(status !== undefined && { status }), ...(paymentStatus !== undefined && { paymentStatus }) },
  })

  if (status && status !== before.status && ORDER_STATUS_PUSH[status]) await notifyOrder(order.id, ORDER_STATUS_PUSH[status])
  if (paymentStatus && paymentStatus !== before.paymentStatus && PAYMENT_STATUS_PUSH[paymentStatus])
    await notifyOrder(order.id, PAYMENT_STATUS_PUSH[paymentStatus])

  return NextResponse.json({ order })
}

// Public tracking lookup. Order numbers are short enough to guess, so only the order's
// owner (or an admin) sees the full phone number and street address.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await findOrderByCustomerInput(params.id, { items: true })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await getAuthUser()
  const privileged = !!user && (user.role === 'ADMIN' || user.id === order.userId)

  return NextResponse.json({
    order: privileged
      ? order
      : { ...order, customerPhone: maskPhone(order.customerPhone), customerEmail: null, address: '', userId: null },
    canAddItems: canAddItemsToOrder(order),
    isOwner: privileged,
  })
}
