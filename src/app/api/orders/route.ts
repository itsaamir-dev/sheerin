import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'
import { priceCart, PricingError, toOrderItemData } from '@/lib/pricing'
import { evaluateCoupon } from '@/lib/coupons'
import { deliveryFeeFor, validateDelivery } from '@/lib/delivery'
import { createOrderWithNumber } from '@/lib/orders'
import { notifyOrder, ORDER_STATUS_PUSH } from '@/lib/push'

const PAYMENT_METHODS = ['COD', 'UPI', 'CARD']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getAuthUser()

    const required = ['customerName', 'customerPhone', 'address', 'city', 'pincode', 'deliveryDate', 'deliverySlot'] as const
    const missing = required.filter((k) => !String(body[k] ?? '').trim())
    if (missing.length) return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    if (!/^\d{10}$/.test(String(body.customerPhone).replace(/\D/g, '').slice(-10)))
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 })

    const pincode = String(body.pincode).trim()
    const deliveryError = validateDelivery({ deliveryDate: body.deliveryDate, deliverySlot: body.deliverySlot, pincode })
    if (deliveryError) return NextResponse.json({ error: deliveryError, field: 'delivery' }, { status: 400 })

    const { lines, subtotal } = await priceCart(body.items)

    let discount = 0
    let couponCode: string | null = null
    if (body.couponCode) {
      const result = await evaluateCoupon(body.couponCode, subtotal)
      if (!('coupon' in result)) return NextResponse.json({ error: result.error, field: 'coupon' }, { status: 400 })
      discount = result.discount
      couponCode = result.coupon.code
    }
    const deliveryFee = deliveryFeeFor(subtotal)
    const total = subtotal - discount + deliveryFee

    // The cart shows prices captured when items were added; if the catalogue changed since,
    // don't silently charge a different amount — send the fresh prices back for the customer to review.
    if (typeof body.total === 'number' && Math.abs(body.total - total) > 0.5) {
      return NextResponse.json(
        { error: 'Prices have changed since you added these items. Please review your updated total.', repriced: lines, total },
        { status: 409 },
      )
    }

    const order = await createOrderWithNumber(
      {
        customerName: String(body.customerName).trim(),
        customerPhone: String(body.customerPhone).trim(),
        customerEmail: body.customerEmail?.trim() || null,
        address: String(body.address).trim(),
        city: String(body.city).trim(),
        pincode,
        deliveryDate: body.deliveryDate,
        deliverySlot: body.deliverySlot,
        specialNote: body.specialNote?.trim() || null,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode,
        paymentMethod: PAYMENT_METHODS.includes(body.paymentMethod) ? body.paymentMethod : 'COD',
        userId: user?.id || null,
        items: { create: lines.map((l) => toOrderItemData(l)) },
      },
      { items: true },
    )

    if (couponCode) {
      await prisma.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } }).catch(() => {})
    }

    await notifyOrder(order.id, ORDER_STATUS_PUSH.PENDING)

    return NextResponse.json({ order })
  } catch (e: any) {
    if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('Order error:', e)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: status ? { status: status as any } : {},
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: status ? { status: status as any } : {} }),
    ])

    return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
}
