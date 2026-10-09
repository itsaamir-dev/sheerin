import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { findOrderByCustomerInput, phonesMatch } from '@/lib/orders'
import { canAddItemsToOrder, deliveryFeeFor } from '@/lib/delivery'
import { priceCart, PricingError, toOrderItemData } from '@/lib/pricing'
import { notifyOrder } from '@/lib/push'

// Adds products to an order that hasn't gone into the oven yet.
// Allowed for the account that placed it, an admin, or a guest who confirms the order's phone number.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const order = await findOrderByCustomerInput(params.id, { items: true })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const user = await getAuthUser()
    const authorized =
      (user && (user.role === 'ADMIN' || user.id === order.userId)) ||
      (body.phone && phonesMatch(String(body.phone), order.customerPhone))
    if (!authorized)
      return NextResponse.json({ error: 'Please confirm the phone number used for this order', field: 'phone' }, { status: 403 })

    if (!canAddItemsToOrder(order))
      return NextResponse.json({ error: 'This order is already being prepared, so items can no longer be added. Please place a new order.' }, { status: 409 })

    const { lines, subtotal: added } = await priceCart(body.items)
    if (typeof body.expectedSubtotal === 'number' && Math.abs(body.expectedSubtotal - added) > 0.5) {
      return NextResponse.json(
        { error: 'Prices have changed since you added these items. Please review the updated amount.', repriced: lines },
        { status: 409 },
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Re-check inside the transaction so a concurrent status change can't slip through.
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } })
      if (!canAddItemsToOrder(current)) throw new PricingError('This order can no longer be changed')

      const subtotal = current.subtotal + added
      const deliveryFee = deliveryFeeFor(subtotal)
      // The coupon discount already granted stays as-is; extra items are charged at full price.
      const total = subtotal - current.discount + deliveryFee
      return tx.order.update({
        where: { id: order.id },
        data: {
          subtotal,
          deliveryFee,
          total,
          // An already-paid order now has a balance to collect.
          ...(current.paymentStatus === 'PAID' && { paymentStatus: 'PARTIAL' }),
          items: { create: lines.map((l) => toOrderItemData(l, true)) },
        },
        include: { items: true },
      })
    })

    await notifyOrder(updated.id, (no) => ({
      title: 'Items added to your order 🛍️',
      body: `${lines.reduce((s, l) => s + l.quantity, 0)} item(s) added to order ${no}. New total ₹${updated.total.toFixed(0)}.`,
    }))

    return NextResponse.json({ order: updated, amountAdded: updated.total - order.total })
  } catch (e: any) {
    if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('Add items error:', e)
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 })
  }
}
