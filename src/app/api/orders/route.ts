import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getAuthUser()

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail || null,
        address: body.address,
        city: body.city,
        pincode: body.pincode,
        deliveryDate: body.deliveryDate,
        deliverySlot: body.deliverySlot,
        specialNote: body.specialNote || null,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        deliveryFee: body.deliveryFee || 0,
        total: body.total,
        couponCode: body.couponCode || null,
        paymentMethod: body.paymentMethod || 'COD',
        userId: user?.id || null,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName || null,
            options: item.options ? JSON.stringify(item.options) : null,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    })

    // Increment coupon usage
    if (body.couponCode) {
      await prisma.coupon.update({
        where: { code: body.couponCode },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {})
    }

    return NextResponse.json({ order })
  } catch (e: any) {
    console.error('Order error:', e)
    return NextResponse.json({ error: e.message || 'Failed to create order' }, { status: 500 })
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
