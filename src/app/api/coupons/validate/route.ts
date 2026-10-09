import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { evaluateCoupon } from '@/lib/coupons'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const amount = parseFloat(searchParams.get('amount') || '0')

  const result = await evaluateCoupon(searchParams.get('code'), amount)
  if (!('coupon' in result)) return NextResponse.json({ valid: false, message: result.error })

  return NextResponse.json({ valid: true, coupon: result.coupon, discount: result.discount })
}
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const coupon = await prisma.coupon.create({ data: body })
    return NextResponse.json({ coupon })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
