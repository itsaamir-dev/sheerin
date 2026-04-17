import { prisma } from '@/lib/prisma'
import { AdminCouponsClient } from './AdminCouponsClient'

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return <AdminCouponsClient coupons={coupons} />
}
