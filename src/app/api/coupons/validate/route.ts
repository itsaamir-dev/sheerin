import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase()
  const amount = parseFloat(searchParams.get('amount') || '0')

  if (!code) return NextResponse.json({ valid: false, message: 'No code provided' })

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return NextResponse.json({ valid: false, message: 'Invalid coupon code' })
  if (!coupon.active) return NextResponse.json({ valid: false, message: 'Coupon is inactive' })
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return NextResponse.json({ valid: false, message: 'Coupon has expired' })
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' })
  if (amount < coupon.minOrderValue)
    return NextResponse.json({ valid: false, message: `Minimum order of ₹${coupon.minOrderValue} required` })

  return NextResponse.json({ valid: true, coupon })
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
