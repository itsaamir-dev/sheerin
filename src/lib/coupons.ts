import type { Coupon } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type CouponResult = { coupon: Coupon; discount: number } | { error: string }

/** Validates a coupon for a subtotal; returns the coupon and discount, or a customer-facing error. */
export async function evaluateCoupon(code: string | null | undefined, subtotal: number): Promise<CouponResult> {
  const normalized = code?.trim().toUpperCase()
  if (!normalized) return { error: 'No code provided' }
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } })
  const error = couponError(coupon, subtotal)
  if (error || !coupon) return { error: error || 'Invalid coupon code' }
  const raw = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value
  return { coupon, discount: Math.min(subtotal, Math.round(raw * 100) / 100) }
}

export function couponError(coupon: Coupon | null, subtotal: number) {
  if (!coupon) return 'Invalid coupon code'
  if (!coupon.active) return 'Coupon is inactive'
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return 'Coupon has expired'
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return 'Coupon usage limit reached'
  if (subtotal < coupon.minOrderValue) return `Minimum order of ₹${coupon.minOrderValue} required`
  return null
}
