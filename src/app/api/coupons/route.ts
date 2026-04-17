import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const coupon = await prisma.coupon.create({ data: body })
    return NextResponse.json({ coupon })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
